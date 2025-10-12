# TutorPilot - WaveHacks 2 2025 Submission

**Track**: Best Self-Improving Agent  
**Tech Stack**: FastAPI + Next.js + Supabase + Weave + Daytona  
**Timeline**: 30 hours

---

## 🎯 Project Overview

TutorPilot is a **self-improving AI tutoring platform** that generates personalized educational content (strategies, lessons, activities) and **actively improves itself** through:

1. **Self-Evaluation**: Agents critique their own outputs after every generation
2. **Reflection Loop**: System identifies patterns in failures and successes
3. **Adaptive Prompting**: Future generations incorporate learned insights
4. **Cross-Agent Learning**: Successful patterns propagate across all agents
5. **Code Sandboxes** (NEW): Generates interactive React activities using Daytona
6. **Auto-Debugging** (NEW): Agent fixes its own code errors automatically (up to 3 attempts)

### Why This Wins "Best Self-Improving Agent"

✅ **Explicit Self-Improvement**: Not just memory retrieval, but active self-critique  
✅ **Multiple Improvement Loops**: Immediate + periodic + cross-agent learning  
✅ **Demonstrable Progress**: Can show improvement over 10 generations in 30 hours  
✅ **Innovative Feature**: Code generation + sandboxes for STEM simulations  
✅ **Sponsor Integration**: Weave (tracing + inference) + Daytona (sandboxes) + Google Cloud (LearnLM)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                         │
│  Strategy Page  │  Lesson Page  │  Activity Page (with sandbox) │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              LAYER 2: Content Generators                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │  Strategy   │  │   Lesson    │  │    Activity     │  │  │
│  │  │  Planner    │  │  Creator    │  │    Creator      │  │  │
│  │  │             │  │             │  │  (+ Qwen3 code) │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │  │
│  │         │                │                   │            │  │
│  │         └────────────────┴───────────────────┘            │  │
│  │                          │                                │  │
│  │                          ▼                                │  │
│  │                 ┌─────────────────┐                       │  │
│  │                 │ Self-Evaluator  │  ◄── LearnLM         │  │
│  │                 └────────┬────────┘                       │  │
│  │                          │                                │  │
│  │                          ▼                                │  │
│  │            ┌──────────────────────────┐                   │  │
│  │            │ agent_performance_metrics │                  │  │
│  │            └────────────┬─────────────┘                   │  │
│  └─────────────────────────┼──────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            SELF-IMPROVEMENT LOOP                          │  │
│  │                                                            │  │
│  │  Every 10 min: Analyze low-scoring outputs               │  │
│  │  ├─→ Identify failure patterns                            │  │
│  │  ├─→ Store in learning_insights table                     │  │
│  │  └─→ Next generation loads insights & adapts prompts      │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              LAYER 1: Knowledge Service                   │  │
│  │  ┌────────────────┐        ┌─────────────────┐           │  │
│  │  │  Query Gen     │ ──────►│   Perplexity    │           │  │
│  │  │  (LearnLM)     │        │  (Parallel)     │           │  │
│  │  └────────────────┘        └─────────────────┘           │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │     SUPABASE DATABASE        │
         │  (9 essential tables)        │
         └──────────────────────────────┘

         ┌──────────────────────────────┐
         │     WEAVE (Tracing)          │
         │  + Qwen3 Coder Inference     │
         └──────────────────────────────┘

         ┌──────────────────────────────┐
         │  DAYTONA (Code Sandboxes)    │
         │  for simulations             │
         └──────────────────────────────┘
```

---

## 📊 Self-Improvement Flow (Detailed)

### 1. Generation with Self-Evaluation
```
User requests strategy
    ↓
Strategy Planner generates content
    ↓
Self-Evaluator critiques the strategy
    - Pedagogical soundness: 8/10
    - Cultural appropriateness: 7/10
    - Engagement potential: 6/10 ⚠️
    - Clarity: 9/10
    - Feasibility: 8/10
    → Overall: 7.6/10
    ↓
Store in agent_performance_metrics
    - success_rate: 0.76
    - weaknesses: ["Limited engagement hooks for visual learners", ...]
    - improvements: ["Add more interactive elements", ...]
```

### 2. Reflection Loop (Background Task)
```
Every 10 minutes:
    ↓
Query recent low-scoring outputs (score < 7)
    ↓
Analyze common patterns:
    "Strategy Planner consistently scores low on 'engagement' 
     for 9th grade STEM students"
    ↓
Store as learning_insight:
    {
      "insight_type": "optimization_opportunity",
      "description": "9th grade STEM strategies need more interactive elements",
      "applicability": {"grades": ["9"], "subjects": ["Physics", "Chemistry"]},
      "status": "validated"
    }
```

### 3. Adaptive Prompting (Next Generation)
```
User requests another 9th grade Physics strategy
    ↓
Strategy Planner loads relevant insights
    → Found: "9th grade STEM strategies need more interactive elements"
    ↓
Adapt base prompt:
    "IMPORTANT LEARNINGS FROM PAST GENERATIONS:
     - Previous strategies for this grade/subject scored low on engagement
     - Include at least 3 interactive/hands-on activities per week
     - Use technology-enhanced learning when possible"
    ↓
Generate with adapted prompt
    ↓
Self-evaluate: 8.5/10 (improved!)
```

### 4. Demonstrable Improvement
```
Generation 1: 7.2/10
Generation 2: 7.8/10
Generation 3: 8.1/10
Generation 4: 8.6/10
Generation 5: 8.8/10
    ↓
Graph shows clear upward trend
    ↓
Query learning_insights table shows accumulated knowledge
```

---

## 🚀 Quick Start (30-Hour Timeline)

### Prerequisites
```bash
# Backend
python 3.11+
pip

# Frontend
node 18+
npm

# Accounts needed
- Supabase account (free tier)
- Google AI Studio (for LearnLM API key)
- Perplexity API key
- Weave account
- Daytona account
```

### Setup (Hour 0-2)

1. **Clone and setup backend**:
```bash
cd Weave-Tutor/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your keys:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GOOGLE_LEARNLM_API_KEY=your-key
PERPLEXITY_API_KEY=your-key
WEAVE_PROJECT_NAME=tutorpilot-weavehacks
DAYTONA_API_KEY=your-key
```

3. **Setup database**:
```bash
# Go to Supabase dashboard
# SQL Editor → New Query → Paste schema-minimal.sql → Run
```

4. **Test backend**:
```bash
uvicorn main:app --reload
# Open http://localhost:8000/docs
```

5. **Setup frontend**:
```bash
cd ../frontend
npm install
# Edit .env.local with API_URL
npm run dev
# Open http://localhost:3000
```

---

## 📂 Project Structure

```
Weave-Tutor/
├── backend/
│   ├── agents/
│   │   ├── strategy_planner.py      # 4-week strategy generation
│   │   ├── lesson_creator.py        # 5E lesson structure
│   │   ├── activity_creator.py      # Traditional + code generation
│   │   └── evaluator.py             # Self-evaluation logic
│   ├── services/
│   │   ├── knowledge_service.py     # Layer 1: Query gen + Perplexity
│   │   ├── memory_service.py        # Supabase memory operations
│   │   ├── learning_service.py      # Reflection loop
│   │   ├── code_generation_service.py  # Qwen3 integration
│   │   ├── daytona_service.py       # Sandbox management
│   │   ├── weave_service.py         # Weave tracing
│   │   └── ai_service.py            # LearnLM + Perplexity clients
│   ├── models/
│   │   ├── student.py
│   │   ├── strategy.py
│   │   ├── lesson.py
│   │   ├── activity.py
│   │   └── evaluation.py
│   ├── db/
│   │   └── supabase_client.py
│   ├── main.py                      # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Home
│   │   ├── strategy/page.tsx        # Strategy generator UI
│   │   ├── lesson/page.tsx          # Lesson generator UI
│   │   └── activity/page.tsx        # Activity generator + sandbox
│   ├── components/
│   │   ├── StreamingProgress.tsx   # Real-time progress
│   │   └── SandboxPreview.tsx      # Iframe for Daytona
│   └── package.json
├── schema-minimal.sql               # 9 essential tables
├── PRD-WEAVEHACKS2-ARCHITECTURE.md  # Full product requirements
├── TASKS-WEAVEHACKS2-30HOURS.md     # Hour-by-hour task breakdown
├── PROMPT-REFERENCE.md              # Copy-paste prompts from old agents
└── README.md                        # This file
```

---

## 🎬 Demo Script (for Judges)

### Part 1: Self-Improvement Loop (5 min)

1. **Show Initial Generation**:
   - Generate strategy for "Alex Chen, 10th grade Physics"
   - Show self-evaluation: 7.5/10
   - Point out weaknesses: "Limited engagement for visual learners"

2. **Trigger Reflection**:
   - Wait 30 seconds (or manually trigger)
   - Show learning_insights table in Supabase
   - New insight created: "10th grade Physics needs more visuals"

3. **Show Improved Generation**:
   - Generate SAME request again
   - Show adapted prompt (includes insights)
   - Show evaluation: 8.5/10 (improved!)
   - Point out: More visual activities added automatically

### Part 2: Cross-Agent Learning (2 min)

- Show that Lesson Creator uses insights from Strategy Planner
- Query `cross_agent_learning` table
- Demonstrate pattern propagation

### Part 3: Code Sandbox with Auto-Debugging (5 min)

1. **Request activity**:
   - "Generate an interactive molecule builder for 9th grade chemistry"
   
2. **Show generation**:
   - Qwen3 Coder generates React code
   - Code appears in left panel
   
3. **Show deployment with auto-fix**:
   - First deploy attempt to Daytona sandbox
   - **If errors occur**: Show error logs retrieved from sandbox
   - **Show auto-fix**: Qwen3 analyzes errors and generates fixed code
   - **Show redeploy**: Fixed code deploys successfully
   - Highlight: "Agent debugged its own code automatically!"
   
4. **Interact with live activity**:
   - Show the game-like interface in iframe
   - Build molecules, watch animations
   - Demonstrate educational and engagement value

### Part 4: Weave Tracing (2 min)

- Open Weave dashboard
- Show agent decision trace
- Show evaluation reasoning captured

**Total**: 13 minutes

---

## 🛠️ Sponsor Tool Integration

### Weave
- **Tracing**: All agent calls wrapped with `@weave.op()`
- **Datasets**: Store evaluations for analysis
- **Inference**: Qwen3 Coder 480B for code generation

### Daytona
- **Sandboxes**: Deploy generated simulation code
- **Isolation**: Safe execution of AI code
- **Resource Limits**: Prevent abuse

### Google Cloud
- **LearnLM**: Primary educational content generation
- **Expertise**: Specialized for pedagogy

### Perplexity
- **Research**: Real-time web knowledge
- **Sources**: Credible URLs for content

---

## 📈 Success Metrics

### Quantitative
- Average evaluation score increases from 7.2 → 8.8 over 10 generations
- 20+ learning insights accumulated in 24 hours
- 5+ successful code sandbox deployments
- < 30s total generation time (Layer 1 + Layer 2)

### Qualitative
- Clear demonstration of self-critique and improvement
- Novel code sandbox feature for STEM education
- Comprehensive integration of sponsor tools
- Production-ready architecture (FastAPI + Next.js)

---

## ⚠️ Known Limitations (Address in Q&A)

1. **30-hour timeframe**: Some features simplified for demo
2. **No authentication**: Hardcoded test users for hackathon
3. **Limited error handling**: Focus on happy path
4. **Sandbox quotas**: May need fallback for Daytona limits
5. **Evaluation subjectivity**: AI self-evaluation may be lenient

**Mitigation**: These are expected for hackathon MVP. Production version would address all.

---

## 🏆 Competitive Advantages

1. **Only project with code generation + sandboxes + auto-debugging** (unique!)
2. **Agent that debugs its own code** (true self-improvement in real-time)
3. **Multiple self-improvement loops** (evaluation + reflection + code fixing)
4. **Demonstrable improvement in 30 hours** (not theoretical)
5. **Real educational use case** (solves actual tutor pain points)
6. **Strong sponsor integration** (Weave + Daytona + Google)

---

## 📚 Additional Resources

- [PRD Document](./PRD-WEAVEHACKS2-ARCHITECTURE.md): Full architecture
- [Task Breakdown](./TASKS-WEAVEHACKS2-30HOURS.md): Hour-by-hour plan
- [Prompt Reference](./PROMPT-REFERENCE.md): Copy-paste prompts
- [Minimal Schema](./schema-minimal.sql): Database setup

---

## 🤝 Team

- **Developer**: [Your Name]
- **Role**: Full-stack + AI integration
- **Track**: Best Self-Improving Agent

---

## 📞 Support During Hackathon

If you get stuck:

1. **Backend not starting**: Check .env file has all keys
2. **Database errors**: Re-run schema-minimal.sql
3. **Evaluation too slow**: Reduce retry attempts in ai_service.py
4. **Sandbox not working**: Use local subprocess as fallback
5. **Out of time**: Focus on Strategy Planner only, skip Activity Creator

---

## 🎯 Minimum Viable Demo (if running out of time)

Must-have:
- ✅ Strategy Planner with self-evaluation
- ✅ One clear example of improvement (7.2 → 8.5)
- ✅ Learning insights visible in database
- ✅ Basic UI that shows evaluations

Nice-to-have:
- Lesson Creator
- Activity Creator (traditional)
- Code sandbox feature
- Weave tracing

---

**Good luck! Build something amazing! 🚀**

*Last updated: Ready for WaveHacks 2 2025*

