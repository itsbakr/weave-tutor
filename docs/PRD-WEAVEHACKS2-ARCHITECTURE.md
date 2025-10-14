# PRD: TutorPilot for WaveHacks 2 - Best Self-Improving Agent

**Event**: WaveHacks 2 Hackathon 2025  
**Track**: Best Self-Improving Agent  
**Timeline**: 30 hours  
**Tech Stack**: FastAPI + Next.js + Supabase + Weave + Daytona

---

## Executive Summary

TutorPilot is a **self-improving AI tutoring platform** that generates personalized educational content through a **hierarchical agent handoff flow** and **learns from tutor edits** to improve over time.

### Agent Workflow (Hierarchical Handoff):
1. **Strategy Planner** → Generates 4-week learning strategy based on student/tutor memory
2. **Lesson Creator** → Tutor selects a week from strategy (or creates standalone) → Generates 5E lesson
3. **Activity Creator** → Tutor selects from lesson (or standalone) → Generates interactive React code

### Self-Improvement Mechanisms:
1. **Agentic Memory System**: Learns from every interaction
2. **Self-Evaluation**: Agents rate their own outputs and learn from failures
3. **Collaborative Editing**: Tutors refine AI output → Edits feed into learning insights
4. **Version History**: Google Doc-like versioning reveals what tutors commonly fix
5. **Auto-Debugging**: Activity Creator debugs its own React code when deployment fails

**Key Innovation**: Agents don't just generate content - they learn from **tutor refinements** through version history analysis, creating a continuous improvement loop where human edits directly inform future generations.

---

## Why This Wins the Self-Improving Agent Track

### 1. ✅ Memory System (Already Built)
- `platform_memory`: Student-specific learning patterns
- `cross_agent_learning`: System-wide pattern recognition
- `learning_insights`: Automated insight extraction

### 2. 🆕 Self-Evaluation (New - 4 hours to implement)
- After generating content, agent evaluates its own quality (1-10)
- Stores evaluation in `agent_performance_metrics`
- Uses past failures to improve future prompts

### 3. 🆕 Reflection Loop (New - 3 hours to implement)
- Agent analyzes low-scoring outputs
- Identifies common failure patterns
- Adjusts generation strategy automatically

### 4. 🆕 Interactive Code Sandboxes with Auto-Fix (New - 8 hours to implement)
- Activity Creator generates React code for interactive educational games/simulations
- Uses **Qwen3 Coder 480B** (hosted on Weave) for code generation
- Deploys to **Daytona sandbox** for safe execution
- **Auto-debugs**: Gets error logs from sandbox and fixes code automatically (up to 3 attempts)
- Examples: Chemistry molecule builder game, physics playground, interactive timelines

### 5. 🆕 Weave Integration (New - 2 hours to implement)
- Trace all agent decisions with Weave
- Visualize self-improvement over time
- Debug agent reasoning in real-time

---

## Architecture: FastAPI Backend

### Core Components

```
Weave-Tutor/
├── backend/                    # FastAPI backend
│   ├── agents/
│   │   ├── strategy_planner.py       # 2-layer architecture
│   │   ├── lesson_creator.py         # 5E lesson structure
│   │   ├── activity_creator.py       # NEW: Code generation + Daytona
│   │   └── evaluator.py              # NEW: Self-evaluation agent
│   ├── services/
│   │   ├── knowledge_service.py      # Layer 1: Query generation + Perplexity
│   │   ├── memory_service.py         # Agentic memory CRUD
│   │   ├── weave_service.py          # NEW: Weave tracing
│   │   ├── daytona_service.py        # NEW: Sandbox management
│   │   └── ai_service.py             # LearnLM + Perplexity + Qwen3
│   ├── models/                       # Pydantic models
│   ├── db/                           # Supabase client
│   └── main.py                       # FastAPI app
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── strategy/page.tsx
│   │   ├── lesson/page.tsx
│   │   └── activity/page.tsx
│   └── components/
│       ├── StreamingProgress.tsx     # Real-time generation UI
│       └── SandboxPreview.tsx        # NEW: Live sandbox iframe
├── schema.sql                  # Supabase schema (minimal tables)
├── requirements.txt
└── package.json
```

---

## Agent Handoff Flow (Critical for Real-World Use)

### Overview: Hierarchical Content Creation

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. STRATEGY PLANNER                                             │
│    Input: Student + Tutor memories                              │
│    Output: 4-week strategy with weekly topics                   │
│    Tutor Action: Review, Edit (Google Doc-like), Approve        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Context Handoff
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. LESSON CREATOR                                               │
│    Options:                                                     │
│    A) Select Week from Strategy → Auto-loads week context      │
│    B) Create Standalone Lesson → Manual topic input            │
│    Input: Student + Tutor memories + Strategy context (if A)   │
│    Output: 5E lesson plan                                       │
│    Tutor Action: Review, Edit (Google Doc-like), Approve        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Context Handoff
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ACTIVITY CREATOR                                             │
│    Options:                                                     │
│    A) Select from Lesson Phases → Auto-loads lesson context    │
│    B) Create Standalone Activity → Manual description input    │
│    Input: Student + Tutor memories + Lesson context (if A)     │
│    Output: Interactive React code in Daytona sandbox           │
│    Tutor Action: Chat-based iterations ("Make it harder",      │
│                  "Add sound effects", "Fix the bug")           │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Matters for Hackathon Judges:

1. **Real-World Workflow**: Tutors naturally work top-down (strategy → lesson → activity), not in isolation
2. **Context Propagation**: Each agent inherits context from parent (strategy week informs lesson topic)
3. **Flexible Creation**: Can create at any level (standalone lesson without strategy)
4. **Agent Communication**: Explicit handoff mechanism shows agents working together

### API Endpoints Reflecting Handoff:

```python
# 1. Create Strategy (always first step)
POST /api/v1/agents/strategy
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "subject": "Physics",
  "weeks": 4
}
Response: { "strategy_id": "uuid", "weeks": [...] }

# 2. Create Lesson FROM Strategy Week
POST /api/v1/agents/lesson
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "strategy_id": "uuid",           # OPTIONAL: If selected from strategy
  "strategy_week_number": 2,       # Which week (1-4)
  "topic": null,                   # Auto-filled from strategy week
  "duration": 60
}

# OR Create Standalone Lesson
POST /api/v1/agents/lesson
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "strategy_id": null,             # Standalone
  "topic": "Newton's Laws",        # Manual input
  "duration": 60
}

# 3. Create Activity FROM Lesson
POST /api/v1/agents/activity
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "lesson_id": "uuid",             # OPTIONAL: If selected from lesson
  "activity_description": null,    # Auto-suggested from lesson phase
  "duration": 20
}

# OR Create Standalone Activity
POST /api/v1/agents/activity
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "lesson_id": null,               # Standalone
  "activity_description": "Chemistry bonding game",  # Manual input
  "duration": 20
}
```

---

## Collaborative Editing System

### For Strategies & Lessons: Google Doc-Like Experience

**Problem**: AI generates 80% good content, but tutors need to refine the remaining 20% to match their teaching style.

**Solution**: Rich text editor with version history that **feeds self-improvement**.

#### Features:

1. **Real-Time Editing**:
   - Rich text editor (TipTap or similar)
   - Tutors directly edit AI-generated content
   - Autosave every 5 seconds

2. **Version History** (Google Docs-like):
   ```
   Version 1 (AI Generated) - 2025-10-11 10:23 AM
   Version 2 (Tutor Edit) - 2025-10-11 10:35 AM - "Added more visual activities to Week 2"
   Version 3 (AI Iteration) - 2025-10-11 10:40 AM - "Regenerated Week 2 with tutor notes"
   ```

3. **Learning from Edits**:
   - System analyzes edit patterns: What do tutors commonly change?
   - Creates `learning_insights`: "Tutors frequently add visual elements to physics strategies"
   - Future generations incorporate these patterns

#### Database Schema:

```sql
-- content_versions table (see schema-updates-collaborative.sql)
CREATE TABLE content_versions (
  id uuid PRIMARY KEY,
  content_type text,  -- 'strategy' or 'lesson'
  content_id uuid,
  version_number integer,
  content jsonb,
  changes_summary text,  -- "Tutor added kinaesthetic activities"
  edited_by uuid,
  edit_type text,  -- 'ai_generated', 'manual_edit', 'ai_iteration'
  edit_notes text,  -- WHY tutor edited (feeds learning insights)
  created_at timestamptz
);
```

#### API Endpoints:

```python
# Save edited content (creates new version)
PUT /api/v1/strategies/{strategy_id}/content
{
  "content": { ... },  # Full updated content
  "changes_summary": "Added more hands-on experiments to Week 3",
  "edit_notes": "AI version was too theoretical, students need practical work"
}

# Get version history
GET /api/v1/strategies/{strategy_id}/versions
Response: [
  { "version": 1, "edit_type": "ai_generated", "created_at": "...", ... },
  { "version": 2, "edit_type": "manual_edit", "changes_summary": "...", ... }
]

# Rollback to previous version
POST /api/v1/strategies/{strategy_id}/versions/{version_number}/restore
```

### For Activities: Chat-Based Iterative Editing

**Problem**: Tutors don't want to edit code directly - they want to tell the AI what to change.

**Solution**: Conversational interface where tutors chat with Activity Creator agent.

#### Features:

1. **Chat Interface** (like ChatGPT):
   ```
   Tutor: "Make the molecules bigger and add sound effects when they bond"
   Agent: "I'll increase molecule size by 50% and add bonding sound. Regenerating..."
   [Code regenerates, redeploys to Daytona]
   Agent: "Done! New version is live at [sandbox URL]"
   ```

2. **Context Preservation**:
   - Each message includes previous code state
   - Agent understands iterative refinements
   - "Make it harder" → Agent knows current difficulty level

3. **Auto-Redeploy**:
   - Every code change triggers Daytona redeploy
   - Includes auto-fix loop if new errors
   - Chat shows deployment status

#### Database Schema:

```sql
-- activity_chat_history table
CREATE TABLE activity_chat_history (
  id uuid PRIMARY KEY,
  activity_id uuid,
  tutor_id uuid,
  message_type text,  -- 'tutor_request', 'agent_response', 'agent_action'
  message_content text,
  code_snapshot text,  -- Code at this message
  sandbox_url text,    -- New URL if redeployed
  created_at timestamptz
);
```

#### API Endpoints:

```python
# Send message to activity agent
POST /api/v1/activities/{activity_id}/chat
{
  "message": "Make the molecules bigger and add sound effects"
}
Response: {
  "agent_response": "I'll increase molecule size and add bonding sound...",
  "code_changed": true,
  "new_sandbox_url": "https://sandbox.daytona.io/abc123",
  "deployment_status": "success"
}

# Get chat history
GET /api/v1/activities/{activity_id}/chat
Response: [
  { "type": "tutor_request", "content": "Make it harder", ... },
  { "type": "agent_response", "content": "I'll add a timer...", ... },
  { "type": "agent_action", "content": "Code updated, redeploying...", ... }
]
```

---

## 2-Layer Agent Architecture (Adapted for FastAPI)

### Layer 1: Knowledge Service

**Purpose**: Generate queries + explain topics (universal, non-personalized)

**Endpoint**: `POST /api/v1/knowledge/explain`

**Input**:
```python
{
  "topics": ["Forces & Motion", "Energy Systems"],  # 1-4 topics
  "grade_level": "10th grade",
  "subject": "Physics"
}
```

**Process**:
1. Generate 2-3 search queries per topic (Google LearnLM)
2. **Parallel calls** to Perplexity Sonar API for explanations
3. Return comprehensive explanations + source URLs

**Output**:
```python
{
  "topics": [
    {
      "topic": "Forces & Motion",
      "queries": ["Newton's laws practical applications", "friction real world examples"],
      "explanation": "...",  # 2000+ chars
      "sources": [
        {"title": "...", "url": "...", "credibility_score": 0.9}
      ]
    }
  ],
  "duration_ms": 12000
}
```

**Performance**: ~15s for 4 topics (parallel execution)

---

### Layer 2: Content Generators

#### Strategy Planner

**Endpoint**: `POST /api/v1/agents/strategy`

**Flow**:
1. Load student memories from Supabase
2. Determine 4-week topics based on curriculum
3. **Call Layer 1 once** (4 topics in parallel internally)
4. Generate 4-week strategy with personalization
5. **NEW: Self-evaluate** strategy quality
6. Store strategy + evaluation in DB

**Self-Evaluation** (NEW):
```python
# After generating strategy
evaluation = await self_evaluate_strategy(strategy, student_context)
# Returns:
{
  "overall_score": 8.5,  # 1-10
  "criteria": {
    "pedagogical_soundness": 9,
    "cultural_appropriateness": 8,
    "engagement_potential": 8,
    "clarity": 9
  },
  "identified_weaknesses": ["Week 3 activities too abstract for grade level"],
  "improvement_suggestions": ["Add more visual aids in Week 3"]
}

# Store in agent_performance_metrics
await store_performance_metric(
    agent_type="strategy_planner",
    success_rate=evaluation.overall_score / 10,
    confidence_scores=[evaluation.criteria.values()],
    session_context=strategy
)
```

**Reflection Loop** (runs asynchronously):
```python
# Analyze recent low-scoring outputs
if evaluation.overall_score < 7:
    pattern = await identify_failure_pattern(agent_type="strategy_planner")
    # e.g., "Frequently rates low on 'engagement_potential' for 9th grade science"
    
    await store_learning_insight(
        insight_type="optimization_opportunity",
        description=f"Strategy Planner: {pattern}",
        supporting_evidence=[recent_evaluations],
        applicability={"grade_levels": ["9"], "subjects": ["science"]}
    )
    
    # Next generation will load this insight and adjust prompt
```

---

#### Lesson Creator

**Endpoint**: `POST /api/v1/agents/lesson`

**Flow**:
1. Load student memories
2. Call Layer 1 (single topic)
3. Generate 5E lesson structure
4. **Self-evaluate** lesson quality
5. Store lesson + evaluation

**Performance**: ~30s total

---

#### Activity Creator (NEW: React Code Generation with Auto-Fix Loop)

**Endpoint**: `POST /api/v1/agents/activity`

**Input**:
```python
{
  "student_id": "uuid",
  "activity_type": "interactive",  # NEW: Always generates React code
  "topic": "Chemical Bonding Visualization",
  "activity_description": "Build molecules by combining atoms",
  "duration": 20
}
```

**Flow with Self-Debugging**:
1. Load student memories and insights
2. Call Layer 1 (topic explanation)
3. **Generate React activity code**:
   - Call **Qwen3 Coder 480B** (via Weave) to generate interactive React component
   - Focus on gamification and active learning (not rigid structure)
   - Generate complete, self-contained component
4. **Deploy & Check Loop** (up to 3 attempts):
   ```python
   for attempt in range(1, 4):
       # Deploy to Daytona sandbox
       sandbox = await daytona.create_sandbox(code)
       
       # Wait for initialization
       await asyncio.sleep(5)
       
       # Get error logs
       logs = await daytona.get_sandbox_logs(sandbox.id)
       
       if no_errors(logs):
           break  # Success!
       
       # Fix errors automatically
       code = await qwen3_fix_code(code, logs, attempt)
       await daytona.delete_sandbox(sandbox.id)
   ```
5. **Self-evaluate** activity quality (educational value, engagement, code quality)
6. Store activity + evaluation + sandbox URL (or error status)

**Code Generation Prompt** (using Qwen3 Coder):
```python
code_prompt = f"""Generate a complete, interactive React web page for an educational activity.

Topic: {topic}
Student Grade: {student.grade}
Student Interests: {student.interests}
Activity Description: {activity_description}

Educational Context:
{layer1_explanation}

DESIGN PHILOSOPHY:
Create an engaging, interactive experience that feels like a game or simulation - NOT a worksheet.
Focus on intrinsic motivation: curiosity, discovery, meaningful choices.
Include gamification elements that enhance fun (not just arbitrary points).

ACTIVITY TYPES (choose what fits):
- Interactive simulations (physics, chemistry, biology)
- Educational games (puzzles, strategy, building)
- Role-playing scenarios (historical, scientific)
- Interactive laboratories (experiments, data analysis)
- Story-driven explorations (narrative with choices)

Make it FUN, then ensure learning happens naturally through play!

Requirements:
- Modern React with hooks (useState, useEffect, etc.)
- Beautiful UI with Tailwind CSS
- Rich interactivity (drag-drop, animations, visual feedback)
- NO LINE LIMIT - build something comprehensive
- Self-contained (no external API calls)
- Safe for sandbox deployment

Generate ONLY the complete React component code.
"""

code = await call_qwen3_coder(code_prompt)  # Via Weave inference - traced
```

**Daytona Sandbox Deployment with Error Checking**:
```python
# Deploy with automatic error fixing (up to 3 attempts)
async def deploy_with_error_fix(code, topic, student_id, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        # Deploy to Daytona
        sandbox = await daytona_service.create_sandbox(
            language="javascript",  # React
            code=code,
            dependencies=["react", "react-dom"],
            student_id=student_id
        )
        
        # Wait for sandbox initialization
        await asyncio.sleep(5)
        
        # Get error logs from sandbox
        error_logs = await daytona_service.get_sandbox_logs(sandbox['sandbox_id'])
        
        # Check for compilation/runtime errors
        if not has_errors(error_logs):
            print(f"✅ Deployed successfully on attempt {attempt}")
            return {
                "sandbox_id": sandbox['sandbox_id'],
                "url": f"https://sandbox.daytona.io/{sandbox['sandbox_id']}",
                "status": "success",
                "attempts": attempt,
                "code": code
            }
        
        # If errors found and we have attempts left, fix them
        if attempt < max_attempts:
            print(f"⚠️ Errors detected on attempt {attempt}. Auto-fixing...")
            
            # Use Qwen3 to fix the errors
            fixed_code = await call_qwen3_coder(
                build_code_fix_prompt(code, error_logs, topic, attempt)
            )
            
            # Store fix attempt for learning
            await store_code_fix_attempt(code, fixed_code, error_logs, attempt)
            
            code = fixed_code
            
            # Delete failed sandbox
            await daytona_service.delete_sandbox(sandbox['sandbox_id'])
        else:
            print(f"❌ Failed after {max_attempts} attempts")
            return {
                "sandbox_id": None,
                "url": None,
                "status": "failed",
                "attempts": attempt,
                "error_logs": error_logs,
                "code": code  # Return last attempted code
            }

# Usage
deployment = await deploy_with_error_fix(code, topic, student_id)
```

**Self-Evaluation** (including code quality):
```python
# Evaluate the final activity (after successful deployment or max attempts)
activity_evaluation = await evaluate_activity(
    code=deployment['code'],
    sandbox_url=deployment['url'],
    topic=topic,
    student_grade=student.grade,
    deployment_status=deployment['status']
)

# Returns:
{
  "overall_score": 8.5,
  "criteria": {
    "educational_value": {"score": 9, "reasoning": "Clear learning objectives..."},
    "engagement": {"score": 8, "reasoning": "Good gamification elements..."},
    "code_quality": {"score": 8, "reasoning": "Clean React code, minor issues..."},
    "interactivity": {"score": 9, "reasoning": "Rich user interactions..."},
    "creativity": {"score": 8, "reasoning": "Novel approach to topic..."}
  },
  "deployment_success": True,
  "attempts_needed": 1,
  "weaknesses": ["Could add more hints for younger students"],
  "improvements": ["Consider adding sound effects for feedback"]
}
```

---

## Self-Improvement Mechanisms (Detailed)

### 1. Immediate Self-Evaluation (After Every Generation)

**Evaluator Agent** (`agents/evaluator.py`):

```python
class SelfEvaluator:
    """Agent that evaluates its own outputs"""
    
    async def evaluate_strategy(self, strategy: Strategy, student: Student) -> Evaluation:
        """Self-evaluate strategy quality"""
        
        evaluation_prompt = f"""You are a pedagogical expert evaluating an AI-generated learning strategy.

STRATEGY TO EVALUATE:
{strategy.content}

STUDENT CONTEXT:
- Grade: {student.grade}
- Learning Style: {student.learning_style}
- Cultural Background: {student.nationality}

EVALUATION CRITERIA (rate 1-10):
1. Pedagogical Soundness: Follows learning science principles (scaffolding, spacing, etc.)
2. Cultural Appropriateness: Respects student's cultural context
3. Engagement Potential: Likely to maintain student interest
4. Clarity: Clear learning objectives and outcomes
5. Feasibility: Realistic within time constraints

For each criterion:
- Give a score (1-10)
- Explain your reasoning in 1-2 sentences
- Identify specific weaknesses if score < 8

Also identify:
- 2-3 specific weaknesses in the strategy
- 2-3 concrete improvement suggestions

Return JSON format.
"""
        
        response = await call_google_learnlm(evaluation_prompt)
        evaluation = parse_evaluation(response)
        
        # Store in agent_performance_metrics
        await self.store_performance(evaluation, strategy.id)
        
        return evaluation
```

### 2. Pattern Recognition (Runs Every Hour)

**Background Task** (`services/learning_service.py`):

```python
async def identify_improvement_patterns():
    """Analyze recent agent performance to identify patterns"""
    
    # Get low-scoring outputs from last 24 hours
    low_performers = await db.query("""
        SELECT agent_type, session_id, confidence_scores, last_error
        FROM agent_performance_metrics
        WHERE success_rate < 0.7
        AND created_at > NOW() - INTERVAL '24 hours'
    """)
    
    # Group by failure type
    patterns = analyze_failure_patterns(low_performers)
    # e.g., "Strategy Planner scores low on 'engagement' for 9th grade STEM"
    
    # Store as learning insight
    for pattern in patterns:
        await db.insert('learning_insights', {
            'insight_type': 'optimization_opportunity',
            'description': pattern.description,
            'supporting_evidence': pattern.evidence,
            'applicability': pattern.context,
            'validation_required': False  # Auto-validated
        })
```

### 3. Prompt Adaptation (Before Every Generation)

```python
async def generate_strategy(student_id: str, weeks: int):
    """Generate strategy with adaptive prompting"""
    
    # Load relevant learning insights
    insights = await db.query("""
        SELECT description, supporting_evidence
        FROM learning_insights
        WHERE status = 'validated'
        AND applicability->>'grade_levels' @> :grade
        AND applicability->>'subjects' @> :subject
        ORDER BY created_at DESC
        LIMIT 5
    """, grade=student.grade, subject="Physics")
    
    # Adapt base prompt with insights
    adapted_prompt = f"""
    {base_strategy_prompt}
    
    IMPORTANT LEARNINGS FROM PAST GENERATIONS:
    {format_insights(insights)}
    
    Based on these insights, ensure your strategy addresses the identified weaknesses.
    """
    
    # Generate with adapted prompt
    strategy = await call_google_learnlm(adapted_prompt)
    
    return strategy
```

### 4. Cross-Agent Learning

```python
async def propagate_learning_across_agents():
    """Share successful patterns between agents"""
    
    # Find high-performing patterns
    successful_patterns = await db.query("""
        SELECT memory_key, memory_value, confidence_score
        FROM platform_memory
        WHERE entity_type = 'content'
        AND memory_category = 'effectiveness'
        AND confidence_score > 0.8
    """)
    
    # Store in cross_agent_learning
    for pattern in successful_patterns:
        await db.insert('cross_agent_learning', {
            'pattern_detected': pattern.description,
            'contributing_agents': ['strategy_planner', 'lesson_creator'],
            'confidence_score': pattern.confidence_score,
            'propagation_status': 'validated'
        })
```

---

## Database Schema (Minimal Tables for Hackathon)

**Keep Only Essential Tables**:

```sql
-- Core entities
CREATE TABLE tutors (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  teaching_style text,
  education_system text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE students (
  id uuid PRIMARY KEY,
  tutor_id uuid REFERENCES tutors(id),
  name text NOT NULL,
  grade text,
  subject text,
  learning_style text,
  nationality text,
  languages jsonb DEFAULT '[]',
  interests jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Self-improving memory system
CREATE TABLE platform_memory (
  id uuid PRIMARY KEY,
  entity_type varchar NOT NULL,  -- 'student', 'session', 'content'
  entity_id uuid NOT NULL,
  memory_category varchar NOT NULL,
  memory_key varchar NOT NULL,
  memory_value jsonb NOT NULL,
  confidence_score numeric DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  update_count integer DEFAULT 1
);

-- Agent performance tracking (for self-evaluation)
CREATE TABLE agent_performance_metrics (
  id uuid PRIMARY KEY,
  agent_type varchar NOT NULL,  -- 'strategy_planner', 'lesson_creator', 'activity_creator'
  agent_id varchar NOT NULL,
  session_id uuid,
  success_rate numeric DEFAULT 1.0 CHECK (success_rate >= 0 AND success_rate <= 1),
  confidence_scores jsonb DEFAULT '[]',
  error_count integer DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Cross-agent learning insights
CREATE TABLE cross_agent_learning (
  id uuid PRIMARY KEY,
  pattern_detected varchar NOT NULL,
  contributing_agents text[] NOT NULL,
  confidence_score numeric DEFAULT 0.5,
  applications jsonb DEFAULT '[]',
  propagation_status varchar DEFAULT 'identified',
  created_at timestamptz DEFAULT now(),
  usage_count integer DEFAULT 0,
  success_rate numeric DEFAULT 0.0
);

-- Learning insights (optimization opportunities)
CREATE TABLE learning_insights (
  id uuid PRIMARY KEY,
  insight_type varchar NOT NULL,  -- 'pattern_recognition', 'optimization_opportunity'
  description text NOT NULL,
  supporting_evidence jsonb DEFAULT '[]',
  applicability jsonb NOT NULL,
  status varchar DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  applied_at timestamptz
);

-- Generated content
CREATE TABLE strategies (
  id uuid PRIMARY KEY,
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  title text NOT NULL,
  description text,
  content jsonb,  -- Full strategy with weeks
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now()
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY,
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  strategy_id uuid REFERENCES strategies(id),
  title text NOT NULL,
  content jsonb,  -- 5E structure
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now()
);

CREATE TABLE activities (
  id uuid PRIMARY KEY,
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  lesson_id uuid REFERENCES lessons(id),
  title text NOT NULL,
  type text NOT NULL,  -- 'traditional' or 'simulation'
  content jsonb,
  code text,  -- NEW: Generated code for simulations
  sandbox_url text,  -- NEW: Daytona sandbox URL
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now()
);
```

**Total Tables**: 9 (minimal, focused)

---

## Implementation Timeline (30 Hours)

### Phase 1: Backend Core (8 hours)
- [x] FastAPI project setup
- [x] Supabase client integration
- [x] Pydantic models
- [x] Knowledge Service (Layer 1)
- [x] AI service (LearnLM + Perplexity)

### Phase 2: Agents (10 hours)
- [x] Strategy Planner (with self-evaluation)
- [x] Lesson Creator (with self-evaluation)
- [x] Activity Creator (traditional)
- [x] Self-Evaluator agent
- [x] Memory service integration

### Phase 3: NEW Features (8 hours)
- [x] Qwen3 Coder integration (via Weave)
- [x] Daytona sandbox service
- [x] Activity Creator code generation
- [x] Weave tracing integration

### Phase 4: Frontend (3 hours)
- [x] Next.js basic UI
- [x] Streaming progress display
- [x] Sandbox iframe preview

### Phase 5: Demo & Polish (1 hour)
- [x] Demo video recording
- [x] README with self-improvement examples
- [x] Deployment to Vercel/Railway

---

## Demo Script (For Judges)

### Part 1: Agent Handoff Flow (6 min)

**Show:** Strategy → Lesson → Activity hierarchy

1. **Create Strategy** (2 min):
   - Open Strategy Creator
   - Input: Student "Alex Chen" (from demo data)
   - Click "Generate 4-Week Physics Strategy"
   - Show: AI generates strategy with 4 weekly topics
   - Point out: Self-evaluation scores (e.g., 7.8/10)

2. **Create Lesson FROM Strategy** (2 min):
   - Open Lesson Creator
   - Show: Dropdown with strategy weeks
   - Select: "Week 2 - Newton's Laws"
   - Show: Topic auto-fills from strategy context
   - Click "Generate Lesson"
   - Show: 5E lesson plan with strategy context integrated

3. **Create Activity FROM Lesson** (2 min):
   - Open Activity Creator
   - Show: Dropdown with lesson phases
   - Select: "Explore Phase - Forces experiment"
   - Show: Activity description auto-suggests from lesson
   - Click "Generate Activity"
   - Show: React code generating → Daytona deploy → Live sandbox

**Key Message**: "Agents hand off context hierarchically - not working in isolation"

---

### Part 2: Collaborative Editing (5 min)

**Show:** Tutors refine AI output, system learns from edits

1. **Edit Strategy** (2 min):
   - Open generated strategy in editor
   - Show: Google Doc-like interface
   - Make edit: "Change Week 3 from theory to hands-on experiments"
   - Click Save
   - Show: Version history dropdown (Version 1: AI, Version 2: Tutor Edit)
   - Show: Edit notes field: "Alex needs more kinesthetic activities"

2. **Learning from Edits** (2 min):
   - Open Supabase dashboard
   - Query: `SELECT * FROM content_versions WHERE edit_type = 'manual_edit'`
   - Show: Pattern analysis view
   - Point out: "System detects tutors frequently add hands-on activities"
   - Query: `SELECT * FROM learning_insights WHERE insight_type = 'edit_pattern'`
   - Show: "Physics tutors add 30% more kinesthetic activities to AI strategies"

3. **Next Generation Uses Learnings** (1 min):
   - Generate NEW strategy for different student
   - Show: Prompt now includes: "Based on past patterns, include hands-on activities"
   - Show: New strategy has more kinesthetic elements in initial generation
   - Point out: "Agent learned from tutor edits!"

**Key Message**: "Human edits directly inform future AI generations - true collaborative intelligence"

---

### Part 3: Chat-Based Activity Editing (4 min)

**Show:** Conversational refinement of React activities

1. **Initial Activity** (1 min):
   - Show generated molecular bonding game
   - Tutor feedback: "Good, but molecules are too small"

2. **Chat Iteration #1** (1 min):
   - Type in chat: "Make molecules 50% bigger"
   - Show: Agent response: "Increasing molecule size and redeploying..."
   - Show: Code regenerates → Auto-redeploys
   - Show: New sandbox with bigger molecules

3. **Chat Iteration #2** (1 min):
   - Type: "Add sound effects when atoms bond"
   - Show: Agent adds audio feedback
   - Show: Redeploy (with auto-fix if needed)

4. **Chat History** (1 min):
   - Show: Full conversation history
   - Show: Each code snapshot preserved
   - Show: Can rollback to previous version

**Key Message**: "Tutors don't code - they chat with the AI to refine activities"

---

### Part 4: Auto-Debugging in Action (3 min)

**Show:** Agent fixes its own code errors

1. **Intentional Error** (1 min):
   - Request complex activity that might have bugs
   - Show: First deployment attempt fails
   - Show: Error logs displayed

2. **Auto-Fix Loop** (2 min):
   - Show: Agent analyzes error logs
   - Show: Qwen3 regenerates fixed code
   - Show: Second deployment succeeds
   - Show: Activity now works
   - Point out: "Agent debugged itself without human intervention!"

**Key Message**: "Self-healing code generation - agents don't just try once"

---

### Part 5: Weave Tracing Dashboard (2 min)

**Show:** Full observability of agent decisions

1. **Open Weave Dashboard**:
   - Show: All AI calls traced
   - Show: Strategy generation → Lesson generation → Activity generation chain
   - Show: Self-evaluation reasoning
   - Show: Code fix attempts
   - Show: Token usage and timing

2. **Drill into Evaluation**:
   - Click on evaluation trace
   - Show: Exact prompt sent to LearnLM
   - Show: Evaluation criteria and scores
   - Show: Why agent gave certain scores

**Key Message**: "Complete transparency - see exactly how agents make decisions"

---

**Total Demo Time**: 20 minutes  
**Core Innovation Shown**: 
1. ✅ Agent handoff with context propagation
2. ✅ Collaborative editing with version history
3. ✅ Learning from human edits
4. ✅ Chat-based activity refinement
5. ✅ Auto-debugging loop
6. ✅ Full Weave tracing

---

## Sponsor Tool Integration

### Weave (Primary)
- **Tracing**: All agent calls traced with `@weave.op()`
- **Evaluation**: Store self-evaluations in Weave datasets
- **Inference**: Qwen3 Coder 480B inference

### Daytona (Primary)
- **Sandboxes**: Deploy generated code
- **Isolation**: Safe execution of AI-generated code

### Google Cloud (Optional)
- **LearnLM**: Main educational content generation
- **Vertex AI**: Optional for scaling

### Tavily (Optional)
- **Web Search**: Alternative to Perplexity for recent info

---

## Success Metrics

**Self-Improvement Proof**:
1. Show agent performance improving over 10 generations
2. Graph: Success rate vs. generation number (upward trend)
3. Table: Number of learning insights accumulated over time
4. Demo: Same prompt, different quality before/after learning

**Innovation**:
1. Code sandbox activities (unique among competitors)
2. Self-evaluation with reasoning (not just metrics)
3. Cross-agent learning (patterns shared across agents)

---

## Why This Wins

### Strengths:
1. ✅ **Explicit Self-Improvement**: Not just memory, but active self-critique
2. ✅ **Multiple Improvement Loops**: Immediate evaluation + pattern recognition + cross-agent learning
3. ✅ **Innovative Feature**: Code sandboxes for STEM subjects
4. ✅ **Sponsor Integration**: Weave (tracing + inference) + Daytona (sandboxes)
5. ✅ **Demonstrable**: Can show improvement in 30-hour hackathon timeframe

### Differentiation:
- Most teams will focus on **retrieval augmentation** (basic memory)
- You have **active learning** (agents improve strategies, not just recall facts)
- Code generation feature is **unique** and showcases Weave + Daytona

---

## Open Questions

1. **Evaluation Criteria**: Should agents use Google LearnLM or a smaller model for self-evaluation? (Recommendation: LearnLM for quality)
2. **Sandbox Limits**: How many Daytona sandboxes can we create per hour? (Check Daytona docs)
3. **Weave Tracing**: Does tracing add significant latency? (Test early)

---

**Status**: Ready for Implementation  
**Next Step**: Set up FastAPI project structure + Supabase connection

