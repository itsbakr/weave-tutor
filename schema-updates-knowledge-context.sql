-- Schema updates to store knowledge context for efficient agent handoff
-- This allows Activity Creator to reuse research from Lessons/Strategies
-- instead of making redundant API calls!

-- Add knowledge_context to lessons (stores sources + explanation)
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS knowledge_context jsonb;

COMMENT ON COLUMN lessons.knowledge_context IS 'Stores Perplexity sources and explanation so Activity Creator can reuse research';

-- Add knowledge_contexts to strategies (stores research for all weeks)
ALTER TABLE strategies 
ADD COLUMN IF NOT EXISTS knowledge_contexts jsonb;

COMMENT ON COLUMN strategies.knowledge_contexts IS 'Stores Perplexity research for all strategy weeks for reuse by Lesson Creator';

-- Add version tracking to lessons (for collaborative editing)
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_latest boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS strategy_week_number integer;

COMMENT ON COLUMN lessons.current_version IS 'Current version number for version history';
COMMENT ON COLUMN lessons.is_latest IS 'Flag to quickly query latest version';
COMMENT ON COLUMN lessons.strategy_week_number IS 'Which week of strategy this lesson is for (agent handoff)';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_lessons_strategy_week ON lessons(strategy_id, strategy_week_number);
CREATE INDEX IF NOT EXISTS idx_lessons_latest ON lessons(is_latest) WHERE is_latest = true;

-- Show summary
SELECT 
    'Schema updated!' as status,
    'Lessons now store knowledge_context for efficient Activity Creator handoff' as note;

