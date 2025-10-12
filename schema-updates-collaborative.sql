-- Schema Updates for Collaborative Editing & Agent Handoff
-- Run these ALTER statements after running schema-minimal.sql

-- 1. Add version tracking to strategies
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 1;
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT true;

-- 2. Add strategy week linking to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS strategy_week_number integer;
COMMENT ON COLUMN lessons.strategy_week_number IS 'Which week from parent strategy (1-4), NULL if standalone lesson';

-- 3. Add version tracking to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 1;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT true;

-- 4. Add deployment tracking to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deployment_status text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deployment_attempts integer DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS error_logs text;

-- 5. Content Version History (for collaborative editing & learning from edits)
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('strategy', 'lesson')),
  content_id uuid NOT NULL, -- ID of strategy or lesson
  version_number integer NOT NULL,
  content jsonb NOT NULL, -- Full content snapshot at this version
  changes_summary text, -- What changed from previous version (diff summary)
  edited_by uuid REFERENCES tutors(id), -- Who made the edit
  edit_type text NOT NULL CHECK (edit_type IN ('ai_generated', 'manual_edit', 'ai_iteration', 'tutor_refinement')),
  edit_notes text, -- Tutor's notes about why they edited (for learning insights)
  self_evaluation_delta jsonb, -- How scores changed after edit (if re-evaluated)
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_versions_lookup ON content_versions(content_type, content_id, version_number DESC);
-- Can't use subquery in index predicate, so just index all versions
CREATE INDEX IF NOT EXISTS idx_content_versions_by_content ON content_versions(content_type, content_id);

COMMENT ON TABLE content_versions IS 'Version history for strategies and lessons (Google Doc-like versioning)';
COMMENT ON COLUMN content_versions.changes_summary IS 'Human-readable summary of changes, e.g., "Tutor added more visual activities to Week 2"';
COMMENT ON COLUMN content_versions.edit_notes IS 'Tutors notes feed into learning_insights - what didnt work about AI version';

-- 6. Activity Chat History (conversational editing for activities)
CREATE TABLE IF NOT EXISTS activity_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  tutor_id uuid REFERENCES tutors(id),
  message_type text NOT NULL CHECK (message_type IN ('tutor_request', 'agent_response', 'agent_action', 'system_message')),
  message_content text NOT NULL,
  code_snapshot text, -- Code state at this point (if applicable)
  sandbox_url text, -- New sandbox URL if redeployed
  deployment_result jsonb, -- Deployment success/failure details
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_chat_lookup ON activity_chat_history(activity_id, created_at);

COMMENT ON TABLE activity_chat_history IS 'Chat-based conversational editing for activities (tutor asks for changes, agent responds)';
COMMENT ON COLUMN activity_chat_history.message_type IS 'tutor_request = tutor asks for change; agent_response = AI explains change; agent_action = code modified; system_message = status updates';

-- 7. Helper function to create a new version
CREATE OR REPLACE FUNCTION create_content_version(
  p_content_type text,
  p_content_id uuid,
  p_new_content jsonb,
  p_edited_by uuid,
  p_edit_type text,
  p_edit_notes text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_new_version_number integer;
  v_version_id uuid;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_new_version_number
  FROM content_versions
  WHERE content_type = p_content_type AND content_id = p_content_id;
  
  -- Insert new version
  INSERT INTO content_versions (
    content_type, content_id, version_number, content,
    edited_by, edit_type, edit_notes
  ) VALUES (
    p_content_type, p_content_id, v_new_version_number, p_new_content,
    p_edited_by, p_edit_type, p_edit_notes
  ) RETURNING id INTO v_version_id;
  
  -- Update parent table with new version number
  IF p_content_type = 'strategy' THEN
    UPDATE strategies 
    SET current_version = v_new_version_number, updated_at = now()
    WHERE id = p_content_id;
  ELSIF p_content_type = 'lesson' THEN
    UPDATE lessons 
    SET current_version = v_new_version_number, updated_at = now()
    WHERE id = p_content_id;
  END IF;
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_content_version IS 'Helper to create new version and update parent table atomically';

-- 8. Function to get version diff summary
CREATE OR REPLACE FUNCTION get_version_diff_summary(
  p_content_type text,
  p_content_id uuid,
  p_version_from integer,
  p_version_to integer
) RETURNS TABLE (
  version_number integer,
  edit_type text,
  edited_by_name text,
  changes_summary text,
  edit_notes text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.version_number,
    cv.edit_type,
    t.name AS edited_by_name,
    cv.changes_summary,
    cv.edit_notes,
    cv.created_at
  FROM content_versions cv
  LEFT JOIN tutors t ON cv.edited_by = t.id
  WHERE cv.content_type = p_content_type
    AND cv.content_id = p_content_id
    AND cv.version_number BETWEEN p_version_from AND p_version_to
  ORDER BY cv.version_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_version_diff_summary IS 'Get human-readable summary of changes between versions';

-- 9. Demo: Initial versions for existing strategies/lessons
-- Create version 1 (AI-generated) for any existing content
INSERT INTO content_versions (content_type, content_id, version_number, content, edited_by, edit_type, edit_notes)
SELECT 
  'strategy' AS content_type,
  id AS content_id,
  1 AS version_number,
  content,
  tutor_id AS edited_by,
  'ai_generated' AS edit_type,
  'Initial AI-generated strategy' AS edit_notes
FROM strategies
WHERE NOT EXISTS (
  SELECT 1 FROM content_versions cv 
  WHERE cv.content_type = 'strategy' AND cv.content_id = strategies.id
);

INSERT INTO content_versions (content_type, content_id, version_number, content, edited_by, edit_type, edit_notes)
SELECT 
  'lesson' AS content_type,
  id AS content_id,
  1 AS version_number,
  content,
  tutor_id AS edited_by,
  'ai_generated' AS edit_type,
  'Initial AI-generated lesson' AS edit_notes
FROM lessons
WHERE NOT EXISTS (
  SELECT 1 FROM content_versions cv 
  WHERE cv.content_type = 'lesson' AND cv.content_id = lessons.id
);

-- 10. Analytics views for self-improvement insights
CREATE OR REPLACE VIEW tutor_edit_patterns AS
SELECT 
  cv.content_type,
  cv.edit_type,
  t.name AS tutor_name,
  COUNT(*) AS edit_count,
  AVG(LENGTH(cv.changes_summary)) AS avg_change_length,
  STRING_AGG(DISTINCT cv.edit_notes, ' | ' ORDER BY cv.edit_notes) AS common_edit_reasons
FROM content_versions cv
JOIN tutors t ON cv.edited_by = t.id
WHERE cv.edit_type IN ('manual_edit', 'tutor_refinement')
GROUP BY cv.content_type, cv.edit_type, t.name;

COMMENT ON VIEW tutor_edit_patterns IS 'What tutors commonly edit helps identify AI weaknesses';

CREATE OR REPLACE VIEW activity_iteration_stats AS
SELECT 
  a.id AS activity_id,
  a.title,
  a.deployment_status,
  a.deployment_attempts,
  COUNT(ach.id) AS chat_messages,
  COUNT(ach.id) FILTER (WHERE ach.message_type = 'tutor_request') AS tutor_requests,
  COUNT(ach.id) FILTER (WHERE ach.message_type = 'agent_action') AS code_iterations,
  MAX(ach.created_at) AS last_interaction
FROM activities a
LEFT JOIN activity_chat_history ach ON a.id = ach.activity_id
GROUP BY a.id, a.title, a.deployment_status, a.deployment_attempts;

COMMENT ON VIEW activity_iteration_stats IS 'How many iterations activities need reveals complexity and agent capability';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Collaborative editing schema updates applied successfully!';
  RAISE NOTICE '📝 New tables: content_versions, activity_chat_history';
  RAISE NOTICE '🔗 New columns: strategy_week_number (lessons), current_version (strategies/lessons), deployment_status (activities)';
  RAISE NOTICE '🛠️  New functions: create_content_version(), get_version_diff_summary()';
  RAISE NOTICE '📊 New views: tutor_edit_patterns, activity_iteration_stats';
END $$;

