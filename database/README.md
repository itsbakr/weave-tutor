# TutorPilot Database Schema

PostgreSQL schema for the self-improving educational agent system.

## 🚀 Quick Setup

### Using Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste contents of `complete-schema.sql`
4. Click "Run"

### Using Local PostgreSQL

```bash
psql -U postgres -d tutorpilot -f complete-schema.sql
```

## 📊 Schema Overview

### Core Tables (4)

| Table | Purpose |
|-------|---------|
| `tutors` | Tutors who use the platform |
| `students` | Students with learning profiles |
| `strategies` | 4-week learning plans |
| `lessons` | Comprehensive lesson plans |
| `activities` | Interactive React activities |

### Self-Improvement Tables (4)

| Table | Purpose |
|-------|---------|
| `agent_performance_metrics` | Self-evaluation scores |
| `learning_insights` | Reflection loop outputs |
| `platform_memory` | Agentic memory for personalization |
| `cross_agent_learning` | Pattern propagation across agents |

### Collaborative Editing Tables (2)

| Table | Purpose |
|-------|---------|
| `content_versions` | Version history for strategies/lessons |
| `activity_chat_history` | Chat-based activity editing |

## 🔗 Agent Handoff Architecture

The schema enables efficient context passing:

```
Strategy (Week 2)
  ↓ [stores knowledge_contexts]
Lesson (auto-fills topic, reuses research)
  ↓ [stores knowledge_context]
Activity (reuses lesson sources, no redundant API calls)
```

### Key Columns

- `strategies.knowledge_contexts`: Research for all 4 weeks
- `lessons.knowledge_context`: Sources + explanations for this lesson
- `lessons.strategy_week_number`: Links to parent strategy week
- `activities.lesson_id`: Links to parent lesson

## 🧠 Self-Improvement Flow

1. **Generation**: Agent creates content, self-evaluates → stores in `agent_performance_metrics`
2. **Reflection**: Background service analyzes low scores → generates `learning_insights`
3. **Adaptation**: Future generations load `learning_insights` → adapt prompts

## ✏️ Collaborative Editing

### Strategies & Lessons (Version History)

```sql
-- Tutor edits strategy
INSERT INTO content_versions (
  content_type, content_id, version_number, content,
  edited_by, edit_type, edit_notes
) VALUES (
  'strategy', '...', 2, '{...}',
  'tutor-id', 'manual_edit', 
  'Added more visual examples for kinaesthetic learners'
);

-- View all versions
SELECT * FROM content_versions
WHERE content_type = 'strategy' AND content_id = '...'
ORDER BY version_number DESC;
```

### Activities (Chat-Based)

```sql
-- Tutor requests change
INSERT INTO activity_chat_history (
  activity_id, tutor_id, message_type, message_content
) VALUES (
  'activity-id', 'tutor-id', 'tutor_request',
  'Make the molecules bigger and add sound effects'
);

-- Agent responds with modified code
INSERT INTO activity_chat_history (
  activity_id, message_type, message_content, code_snapshot
) VALUES (
  'activity-id', 'agent_response',
  'Increased molecule size by 50% and added audio on bond formation',
  '{... new code ...}'
);
```

## 📈 Analytics Views

### Agent Improvement Over Time
```sql
SELECT * FROM agent_improvement_over_time;
-- Shows avg success_rate per agent per day
```

### Tutor Edit Patterns
```sql
SELECT * FROM tutor_edit_patterns;
-- Shows what tutors commonly edit (helps identify AI weaknesses)
```

### Activity Iteration Stats
```sql
SELECT * FROM activity_iteration_stats;
-- Shows how many chat iterations needed per activity
```

## 🎯 Demo Data

The schema includes seed data for demo:

**Tutors (3):**
- Dr. Sarah Johnson (IGCSE)
- Prof. Michael Chen (IB)
- Ms. Aisha Patel (CBSE)

**Students (3):**
- Alex Chen (Physics, Visual, Singapore)
- Emma Rodriguez (Chemistry, Kinesthetic, USA)
- Yuki Tanaka (Biology, Auditory, Japan)

## 🔧 Maintenance

### Add New Demo Student

```sql
INSERT INTO students (
  tutor_id, name, grade, subject, learning_style,
  nationality, languages, interests
) VALUES (
  'tutor-id', 'Student Name', '10', 'Math', 'Visual',
  'Country', '["English"]', '["interest1", "interest2"]'
);
```

### Query Low-Scoring Outputs

```sql
SELECT 
  agent_type,
  evaluation_details->>'overall_score' as score,
  session_id
FROM agent_performance_metrics
WHERE (evaluation_details->>'overall_score')::numeric < 7.0
ORDER BY created_at DESC;
```

### Get Learning Insights for Strategy Agent

```sql
SELECT 
  description,
  applicability,
  status
FROM learning_insights
WHERE status = 'validated'
  AND applicability @> '{"grades": ["10"]}'::jsonb
ORDER BY priority DESC;
```

## 📝 Schema Versioning

Version: 1.0.0 (WaveHacks 2 2025)

**Includes:**
- Core tables for content generation
- Self-improvement system
- Collaborative editing with version history
- Agent handoff optimizations
- Demo seed data

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Main README](../README.md)

