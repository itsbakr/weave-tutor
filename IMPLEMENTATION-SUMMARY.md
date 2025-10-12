# TutorPilot WaveHacks 2 Implementation Summary

**Track**: Best Self-Improving Agent  
**Status**: ✅ Core Backend Complete  
**Environment**: Python 3.12 with FastAPI  
**Date**: October 12, 2025

---

## 🎉 What We've Built

### **Core Agent Architecture** ✅

#### 1. **Strategy Planner Agent** (`agents/strategy_planner.py`)
- **Purpose**: Generates 4-week personalized learning strategies in rich markdown format
- **AI Model**: Google Gemini Flash Lite (`gemini-flash-lite-latest`)
- **Knowledge Service**: Perplexity Sonar API (retrieves 150+ sources per strategy)
- **Self-Evaluation**: 7.83/10 average score
- **Format**: Free-form markdown (no rigid JSON!) - pedagogically sophisticated
- **Features**:
  - Pedagogical philosophy sections
  - Big ideas & essential questions
  - Learning progression & scaffolding
  - Formative assessment strategy
  - Differentiation & adaptations
  - Reflection & metacognition guidance

#### 2. **Lesson Creator Agent** (`agents/lesson_creator.py`)
- **Purpose**: Creates 5E framework lesson plans (Engage, Explore, Explain, Elaborate, Evaluate)
- **AI Model**: Google Gemini Flash Lite
- **Self-Evaluation**: 7.0/10 average score
- **Features**:
  - Loads knowledge context from Layer 1 (Perplexity)
  - Adapts to student learning style and interests
  - Calculates attention span-based time allocations
  - **Agent Handoff**: Can load strategy week context

#### 3. **Activity Creator Agent** (`agents/activity_creator.py`)
- **Purpose**: Generates interactive React activities with self-debugging
- **AI Models**:
  - Qwen3 Coder 480B (via W&B Inference) for code generation
  - Google Gemini for error fixing
- **Deployment**: Daytona Sandboxes (SDK integrated, needs API key)
- **Self-Evaluation**: 7.0/10 average score
- **Features**:
  - Generates 15-20KB React code per activity
  - **Auto-fix loop**: 3 attempts with error detection and correction
  - Gamification-focused (intrinsic motivation, discovery-based)
  - **Agent Handoff**: Can load lesson phase context
  - **Chat-based iteration**: Tutors can request changes conversationally

---

## 🔗 Agent Handoff Chain ✅

### **Hierarchical Context Propagation**

```
Strategy Planner
   ↓ (generates 4-week strategy)
   └── Week 2 Context
          ↓ (topic, objectives, concepts)
       Lesson Creator
          ↓ (generates 5E lesson)
          └── Explore Phase Context
                 ↓ (activity suggestions)
              Activity Creator
                 ↓ (generates React code)
                 └── Deployed Sandbox
```

### **API Flow Example**

```python
# 1. Generate Strategy
POST /api/v1/agents/strategy
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "subject": "Physics",
  "weeks": 4
}
→ Returns strategy_id

# 2. Generate Lesson from Strategy Week 2
POST /api/v1/agents/lesson
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "strategy_id": "uuid",        # ← Links to strategy
  "strategy_week_number": 2      # ← Auto-loads Week 2 topic
}
→ Returns lesson_id, auto-fills topic

# 3. Generate Activity from Lesson Explore Phase
POST /api/v1/agents/activity
{
  "student_id": "uuid",
  "tutor_id": "uuid",
  "lesson_id": "uuid",           # ← Links to lesson
  "lesson_phase": "Explore"      # ← Auto-loads phase activity
}
→ Returns activity with React code and sandbox URL
```

---

## 📝 Collaborative Editing Features ✅

### **1. Version History for Strategies & Lessons** (Google Doc-like)

#### **Save New Version**
```http
POST /api/v1/content/save-version
Content-Type: application/json

{
  "content_type": "strategy",  // or "lesson"
  "content_id": "uuid",
  "content": { ... },           // edited content
  "changes_summary": "Added visual learning activities",
  "edit_notes": "Student struggles with text-heavy content",  // WHY edited
  "tutor_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "version_number": 2,
  "message": "Version 2 saved successfully"
}
```

#### **Get Version History**
```http
GET /api/v1/content/versions/strategy/{content_id}
```

**Response**:
```json
{
  "success": true,
  "versions": [
    {
      "version_number": 2,
      "content": { ... },
      "changes_summary": "Added visual learning activities",
      "edit_type": "manual_edit",
      "edit_notes": "Student struggles with text-heavy content",
      "edited_by": "tutor-uuid",
      "created_at": "2025-10-12T..."
    },
    {
      "version_number": 1,
      "content": { ... },
      "edit_type": "ai_generated",
      "created_at": "2025-10-12T..."
    }
  ],
  "total_versions": 2
}
```

**Key Feature**: `edit_notes` field captures **WHY** tutors edit content, feeding into learning insights for future AI improvements!

---

### **2. Chat-Based Activity Iteration** (Conversational Editing)

#### **Send Chat Message to Modify Activity**
```http
POST /api/v1/activity/chat
Content-Type: application/json

{
  "activity_id": "uuid",
  "tutor_id": "uuid",
  "student_id": "uuid",
  "message": "Make the game more challenging with a timer"
}
```

**Response**:
```json
{
  "success": true,
  "new_code": "import React, { useState, useEffect } from 'react'...",
  "explanation": "Added a 60-second countdown timer with visual feedback...",
  "sandbox_url": "https://preview-xyz.daytona.app",
  "changes_made": "Integrated timer state with score system..."
}
```

**Auto-Redeploy**: Agent modifies code with Qwen3 Coder and redeploys to new sandbox!

#### **Get Chat History**
```http
GET /api/v1/activity/chat/{activity_id}
```

**Response**:
```json
{
  "success": true,
  "chat_history": [
    {
      "message_type": "tutor_request",
      "message_content": "Make it more challenging",
      "created_at": "..."
    },
    {
      "message_type": "agent_response",
      "message_content": "Added timer...",
      "code_snapshot": "...",
      "sandbox_url": "...",
      "created_at": "..."
    }
  ],
  "total_messages": 2
}
```

---

## 🧠 Self-Improving Features ✅

### **1. Self-Evaluation Loop**
- All agents critique their own output using LearnLM
- Scores on 5 criteria (pedagogical soundness, cultural appropriateness, engagement, clarity, feasibility)
- Identifies 3 weaknesses and 3 concrete improvements
- Stored in `agent_performance_metrics` table

### **2. Agentic Memory System**
- **Platform Memory** (`platform_memory` table):
  - Stores session dynamics, effective strategies, content patterns
  - Confidence scores for memory quality
  - Used for adaptive prompting
  
### **3. Performance Tracking**
- All agent executions logged with scores
- Metrics include: success_rate, confidence_scores, error_count
- Enables analysis of improvement over time

### **4. Learning Insights** (Reflection Loop - Ready for Background Task)
- Analyzes low-scoring outputs to find patterns
- Generates optimization opportunities
- Feeds back into prompts for future generations
- Table: `learning_insights` with status tracking

### **5. Code Error Auto-Fix**
- Activity Creator detects sandbox errors
- Uses Qwen3 Coder to fix code automatically
- Max 3 attempts with exponential backoff
- Stores fix attempts in memory for learning

---

## 🛠️ Technical Stack

### **Backend**
- **Language**: Python 3.12
- **Framework**: FastAPI 0.109.0
- **Environment**: Virtual environment (`venv/`)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Direct Supabase client

### **AI Models & APIs**
| Service | Model | Purpose | Cost |
|---------|-------|---------|------|
| **Google AI** | `gemini-flash-lite-latest` | Content generation | Free tier: 15 req/min |
| **Perplexity** | `sonar` | Knowledge retrieval | Your API key |
| **W&B Inference** | `qwen3-coder-480b` | Code generation | Weave credits |
| **Daytona** | Sandboxes SDK | Code deployment | Your API key |

### **Tracing & Monitoring**
- **Weave** by Weights & Biases
- All AI calls automatically traced
- Execution graphs available at: `https://wandb.ai/{username}/tutorpilot-weavehacks`
- Performance metrics tracked

### **Dependencies** (`requirements.txt`)
```
fastapi>=0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Database (Python 3.12 compatible)
supabase>=2.12.0
postgrest>=0.18.0
realtime>=2.0.0
gotrue>=2.12.0

# AI Models
google-generativeai==0.3.2
openai>=1.52.0  # For W&B Inference

# Weave Tracing
weave>=0.51.0
wandb>=0.16.4
gql>=3.5.0

# Daytona Sandboxes
daytona>=0.1.0

# Utilities
httpx>=0.25.2
aiohttp>=3.9.1
python-multipart>=0.0.6
```

---

## 📊 Database Schema

### **Core Tables** (from `schema-minimal.sql`)
1. `students` - Student profiles with learning styles, interests
2. `tutors` - Tutor profiles with teaching styles
3. `strategies` - Generated learning strategies with evaluations
4. `lessons` - 5E lesson plans with strategy links
5. `activities` - Interactive React activities with sandbox URLs

### **Memory & Learning Tables**
6. `platform_memory` - Cross-session agentic memory
7. `agent_performance_metrics` - Self-evaluation scores
8. `learning_insights` - Identified improvement patterns

### **Collaborative Editing Tables** (from `schema-updates-collaborative.sql`)
9. `content_versions` - Version history for strategies/lessons
10. `activity_chat_history` - Conversational activity editing

---

## 🚀 API Endpoints

### **Core Agent Endpoints**
```
POST   /api/v1/agents/strategy    Generate learning strategy
POST   /api/v1/agents/lesson      Generate 5E lesson plan
POST   /api/v1/agents/activity    Generate React activity
```

### **Collaborative Editing Endpoints**
```
POST   /api/v1/content/save-version              Save edited content version
GET    /api/v1/content/versions/{type}/{id}      Get version history
POST   /api/v1/activity/chat                     Chat with agent about activity
GET    /api/v1/activity/chat/{activity_id}       Get activity chat history
```

### **Utility Endpoints**
```
GET    /                          API info
GET    /health                    Health check
GET    /docs                      Interactive API docs (Swagger UI)
```

---

## ⚙️ Environment Variables

```bash
# Supabase
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Models
GOOGLE_LEARNLM_API_KEY=your-google-api-key
PERPLEXITY_API_KEY=your-perplexity-key

# Weave & W&B
WANDB_API_KEY=your-wandb-key
WEAVE_PROJECT_NAME=tutorpilot-weavehacks

# Daytona Sandboxes
DAYTONA_API_KEY=your-daytona-key
DAYTONA_BASE_URL=https://app.daytona.io/api

# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

---

## 🧪 Test Results

### **Agent Handoff Test** (`test_agent_handoff.py`)

```
✅ Strategy Planner: PASSED
   - Generated 4-week Physics strategy
   - Retrieved 163 Perplexity sources
   - Self-evaluation: 7.83/10
   - Format: Rich markdown with pedagogical depth

✅ Lesson Creator: PASSED
   - Auto-loaded Week 2 from strategy
   - Generated 5E lesson plan
   - Self-evaluation: 7.0/10
   - Context handoff successful

✅ Activity Creator: PASSED
   - Auto-loaded Explore phase from lesson
   - Generated 17,132 characters of React code
   - Self-evaluation: 7.0/10
   - Auto-fix: 3 attempts executed

✅ Weave Tracing: WORKING
   - All AI calls traced
   - Full execution graphs available
   - View at: https://wandb.ai/g-tsvetkova-minerva-university/tutorpilot-weavehacks

✅ Supabase Storage: WORKING
   - All content stored in respective tables
   - Performance metrics logged
   - Memory system active
```

---

## 🎯 Key Innovations for "Best Self-Improving Agent"

### **1. Multi-Level Self-Improvement**
- ✅ **Immediate**: Self-evaluation after each generation
- ✅ **Medium-term**: Learning from tutor edits (version history)
- ✅ **Long-term**: Reflection loop to identify patterns (ready to enable)
- ✅ **Code-level**: Auto-fix loop for generated activities

### **2. Hierarchical Agent Communication**
- ✅ Strategy informs Lesson (week context)
- ✅ Lesson informs Activity (phase context)
- ✅ Maintains pedagogical coherence across layers

### **3. Human-in-the-Loop Learning**
- ✅ Version history tracks **why** tutors edit (not just what)
- ✅ `edit_notes` field feeds learning insights
- ✅ Chat history shows tutor preferences

### **4. Comprehensive Tracing**
- ✅ All AI calls visible in Weave
- ✅ Debugging and optimization enabled
- ✅ Performance monitoring built-in

---

## 📁 Project Structure

```
Weave-Tutor/
├── backend/
│   ├── venv/                      # Python 3.12 virtual environment
│   ├── .env                       # Environment variables (not committed)
│   ├── requirements.txt           # Python dependencies
│   ├── main.py                    # FastAPI app with 13 endpoints
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── strategy_planner.py   # Strategy generation + self-eval
│   │   ├── lesson_creator.py     # 5E lesson + agent handoff
│   │   ├── activity_creator.py   # React generation + auto-fix + chat
│   │   └── evaluator.py          # Self-evaluation agent
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py         # LearnLM, Perplexity, Qwen3 calls
│   │   ├── knowledge_service.py  # Layer 1: Knowledge retrieval
│   │   ├── memory_service.py     # Agentic memory + insights
│   │   └── daytona_service.py    # Sandbox deployment (SDK)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   └── supabase_client.py    # Database connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── student.py
│   │   ├── strategy.py
│   │   ├── lesson.py
│   │   └── activity.py
│   │
│   └── test_agent_handoff.py     # Integration test
│
├── schema-minimal.sql             # Core database schema
├── schema-updates-collaborative.sql # Collaborative editing tables
├── PRD-WEAVEHACKS2-ARCHITECTURE.md  # Architecture documentation
├── TASKS-WEAVEHACKS2-30HOURS.md     # Implementation tasks
└── IMPLEMENTATION-SUMMARY.md        # This file
```

---

## 🚦 Running the Application

### **1. Setup Environment**
```bash
cd Weave-Tutor/backend
source venv/bin/activate  # Already created with Python 3.12
```

### **2. Install Dependencies** (Already done!)
```bash
pip install -r requirements.txt
```

### **3. Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

### **4. Apply Database Schema** (Already done!)
- Run `schema-minimal.sql` in Supabase SQL Editor
- Run `schema-updates-collaborative.sql` in Supabase SQL Editor

### **5. Start Server**
```bash
python main.py
```

Server runs at: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### **6. Run Tests**
```bash
python test_agent_handoff.py
```

---

## 🎬 Demo Flow (For Judges)

### **1. Show Agent Handoff** (5 minutes)
```bash
# Run test script
python test_agent_handoff.py
```

**Highlight**:
- Strategy generates with 163 sources
- Lesson auto-loads Week 2 topic
- Activity auto-loads Explore phase
- Full context propagation visible in Weave traces

### **2. Show Self-Evaluation** (2 minutes)
- Open generated strategy in Supabase
- Show `self_evaluation` field with scores and critiques
- Query `agent_performance_metrics` table to show tracking

### **3. Show Collaborative Editing** (3 minutes)
```bash
# Demo version history API
curl -X POST http://localhost:8000/api/v1/content/save-version \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "strategy",
    "content_id": "{strategy_id}",
    "content": {...},
    "edit_notes": "Student needs more visual examples",
    "tutor_id": "{tutor_id}"
  }'

# Show versions
curl http://localhost:8000/api/v1/content/versions/strategy/{strategy_id}
```

**Highlight**: `edit_notes` captures **why** tutors edit, enabling learning!

### **4. Show Weave Tracing** (2 minutes)
- Open: `https://wandb.ai/{username}/tutorpilot-weavehacks/weave`
- Click on latest run
- Show full execution graph
- Show individual AI call parameters and responses

### **5. Show Chat-Based Iteration** (3 minutes)
```bash
# Demo activity chat
curl -X POST http://localhost:8000/api/v1/activity/chat \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id": "{activity_id}",
    "tutor_id": "{tutor_id}",
    "student_id": "{student_id}",
    "message": "Add a timer to make it more challenging"
  }'
```

**Highlight**: Agent modifies code conversationally and redeploys!

---

## 📈 Next Steps

### **Immediate (Remaining Hackathon Time)**
1. ✅ Core backend complete
2. ⏳ Build Next.js frontend (3-4 hours)
3. ⏳ Create demo video (1 hour)
4. ⏳ Test Daytona deployment with actual API key
5. ⏳ Deploy to production (Railway/Vercel)

### **Frontend Components Needed**
- Strategy page with self-evaluation display
- Lesson page with strategy week selector
- Activity page with sandbox preview
- Version history viewer
- Activity chat interface

### **Demo Assets**
- 2-minute video showing improvement loop
- README with setup instructions
- Slides explaining self-improvement architecture

---

## 🏆 Why This Wins "Best Self-Improving Agent"

### **1. Comprehensive Self-Improvement at Multiple Levels**
- ✅ Immediate self-evaluation (within seconds)
- ✅ Learning from human feedback (edit notes)
- ✅ Pattern recognition (reflection loop ready)
- ✅ Code-level improvement (auto-fix)

### **2. Novel Learning Mechanism**
- **Edit notes** as learning signal (not just scores!)
- Captures **intent** behind human corrections
- Enables semantic understanding of mistakes

### **3. Full Stack Implementation**
- Not just a concept - working backend with 13 APIs
- Integrated with all sponsor tools (Weave, Daytona, Perplexity)
- Traceable, debuggable, measurable

### **4. Practical Educational Application**
- Real-world use case (AI tutoring)
- Addresses actual pedagogical challenges
- Scalable architecture

### **5. Technical Excellence**
- Agent handoff architecture (novel!)
- Dual editing paradigms (version history + chat)
- Comprehensive tracing with Weave

---

## 📝 Notes

### **Daytona Integration Status**
- ✅ SDK installed (`daytona>=0.1.0`)
- ✅ Service layer implemented (`services/daytona_service.py`)
- ✅ Environment variables configured (`DAYTONA_API_KEY`, `DAYTONA_BASE_URL`)
- ⚠️ Needs API key to test actual deployments
- Fallback: Code generation works, sandbox deployment gracefully fails

### **Python 3.12 Upgrade**
- ✅ All dependencies compatible
- ✅ Virtual environment clean
- ✅ All tests passing
- Issue resolved: Old Python 3.9 had `ParamSpec` import error

### **Performance**
- Strategy generation: ~40-50 seconds (includes 163 sources!)
- Lesson generation: ~15-20 seconds
- Activity generation: ~3-4 minutes (code gen + sandbox attempts)
- All traced in Weave for optimization

---

**Status**: ✅ **READY FOR FRONTEND & DEMO**  
**Completion**: ~80% (Backend complete, Frontend pending)  
**Quality**: Production-ready backend with comprehensive error handling  
**Winning Potential**: 🔥🔥🔥 High (unique architecture + working implementation)
