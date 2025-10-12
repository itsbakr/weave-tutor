# WaveHacks 2 Implementation Tasks (30-Hour Sprint)

**Track**: Best Self-Improving Agent  
**Total Time**: 30 hours  
**Team Size**: 1-2 developers (assumed)  
**Status**: ✅ Backend Complete (Phase 1-3) | ⏳ Frontend Next (Phase 4)

---

## ✅ COMPLETED: Backend Implementation (Phases 1-3)

### **What's Working:**
- ✅ Python 3.12 with FastAPI backend
- ✅ Strategy Planner Agent (7.83/10 avg, 163 sources)
- ✅ Lesson Creator Agent (7.0/10 avg, agent handoff from strategy)
- ✅ Activity Creator Agent (7.0/10 avg, React code gen, auto-fix loop)
- ✅ Self-evaluation for all agents
- ✅ Agent handoff chain: Strategy → Lesson → Activity
- ✅ Collaborative editing: Version history + Activity chat
- ✅ Weave tracing for all AI calls
- ✅ Perplexity, LearnLM, Qwen3 Coder integration
- ✅ Daytona SDK integration (needs API key for deployment)
- ✅ 13 API endpoints with full documentation
- ✅ Database schema applied with demo data
- ✅ Integration tests passing

**See**: `IMPLEMENTATION-SUMMARY.md` for full details

---

## 📍 CURRENT STATUS & NEXT STEPS

### **Completed Tasks (Phases 1-3):**

#### ✅ Phase 1: Backend Foundation (Hours 0-8)
- [x] Project setup with Python 3.12 virtual environment
- [x] FastAPI main.py with 13 endpoints
- [x] Environment variables configured (`.env` with all API keys)
- [x] Database schema applied (`schema-minimal.sql` + `schema-updates-collaborative.sql`)
- [x] Supabase client initialized
- [x] Pydantic models created (student, strategy, lesson, activity)

#### ✅ Phase 2: Core Agents with Self-Evaluation (Hours 8-18)
- [x] **AI Service Layer** (`services/ai_service.py`):
  - Google Gemini Flash Lite integration with retry logic
  - Perplexity Sonar API with citation extraction
  - Qwen3 Coder 480B via W&B Inference
  - All models traced with Weave
- [x] **Knowledge Service** (`services/knowledge_service.py`):
  - Layer 1 knowledge retrieval
  - Topic explanation with 150+ sources
- [x] **Strategy Planner Agent** (`agents/strategy_planner.py`):
  - Rich markdown format (not rigid JSON)
  - Pedagogical depth with philosophy sections
  - Self-evaluation: 7.83/10 average
  - **Agent handoff**: Provides week topics for lessons
- [x] **Lesson Creator Agent** (`agents/lesson_creator.py`):
  - 5E framework implementation
  - Self-evaluation: 7.0/10 average
  - **Agent handoff**: Accepts strategy_id + week_number
  - Provides phase activities for activities agent
- [x] **Self-Evaluator** (`agents/evaluator.py`):
  - 5 criteria evaluation system
  - Identifies weaknesses and improvements
  - Stores in `agent_performance_metrics`
- [x] **Memory Service** (`services/memory_service.py`):
  - Platform memory queries
  - Learning insights ready for reflection loop

#### ✅ Phase 3: Advanced Features (Hours 18-26)
- [x] **Weave Integration**:
  - All AI calls decorated with `@weave.op()`
  - Full execution traces visible in W&B
- [x] **Qwen3 Coder Integration**:
  - React code generation (15-20KB per activity)
  - W&B Inference API configured
- [x] **Daytona Service** (`services/daytona_service.py`):
  - Official Python SDK integrated
  - Sandbox creation and deployment functions
  - Environment variables configured (`DAYTONA_API_KEY`, `DAYTONA_BASE_URL`)
  - ⚠️ Needs API key to test actual deployments
- [x] **Activity Creator Agent** (`agents/activity_creator.py`):
  - React activity generation
  - **Auto-fix loop**: 3 attempts with error detection
  - **Agent handoff**: Accepts lesson_id + lesson_phase
  - **Chat iteration**: `iterate_activity_from_chat()` function
  - Self-evaluation: 7.0/10 average
- [x] **Collaborative Editing APIs** (`main.py`):
  - Version history: `/api/v1/content/save-version`, `/api/v1/content/versions/{type}/{id}`
  - Activity chat: `/api/v1/activity/chat`, `/api/v1/activity/chat/{activity_id}`
  - Captures "why" tutors edit (edit_notes field)
- [x] **Integration Testing**:
  - `test_agent_handoff.py` - Full chain test passing
  - All agents traced in Weave
  - Database storage verified

---

### **⏳ NEXT: Phase 4 - Frontend & Demo (Hours 26-30)**

#### Hour 26-27: Next.js Setup
- [ ] Create `Weave-Tutor/frontend/` directory
- [ ] Initialize Next.js with TypeScript + Tailwind:
  ```bash
  cd Weave-Tutor
  npx create-next-app@latest frontend --typescript --tailwind --app
  ```
- [ ] Install dependencies:
  ```bash
  cd frontend
  npm install axios react-markdown
  ```
- [ ] Create `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

#### Hour 27-28: Core UI Pages
- [ ] **Strategy Page** (`app/strategy/page.tsx`):
  - Form: student_id, subject, weeks
  - Display generated markdown strategy
  - Show self-evaluation scores (5 criteria + overall)
  - Show weaknesses & improvements
  - **NEW**: Version history viewer
  - **NEW**: Rich text editor for manual edits with edit_notes field
- [ ] **Lesson Page** (`app/lesson/page.tsx`):
  - Form: student_id, topic, duration
  - **NEW**: Strategy week selector (dropdown of strategy weeks)
  - Display 5E lesson structure
  - Show self-evaluation
  - **NEW**: Version history viewer
- [ ] **Activity Page** (`app/activity/page.tsx`):
  - Form: student_id, topic, activity_description
  - **NEW**: Lesson phase selector (dropdown from selected lesson)
  - Display generated React code
  - **NEW**: Sandbox iframe preview
  - **NEW**: Chat interface for iteration
  - Show self-evaluation
- [ ] **Home Page** (`app/page.tsx`):
  - Navigation links to all agents
  - Brief explanation of agent handoff
  - Weave tracing dashboard link

#### Hour 28-29: Key Components
- [ ] **`components/SandboxPreview.tsx`**:
  - Side-by-side: code + iframe
  - Auto-refresh on new deployment
- [ ] **`components/VersionHistory.tsx`**:
  - List of versions with timestamps
  - Show edit_notes (why edited)
  - Diff viewer (optional)
- [ ] **`components/ActivityChat.tsx`**:
  - Chat interface with message history
  - Send modification requests
  - Display agent responses
  - Show new sandbox URLs on redeploy
- [ ] **`components/SelfEvaluationCard.tsx`**:
  - Display 5 criteria scores
  - Show weaknesses & improvements
  - Visual score bars
- [ ] **`components/AgentHandoffFlow.tsx`**:
  - Visual diagram of context flow
  - Highlight current agent in chain

#### Hour 29-30: Demo Preparation
- [ ] **Demo Script** (`DEMO-SCRIPT.md`):
  1. Show agent handoff (5 min)
  2. Show self-evaluation (2 min)
  3. Show collaborative editing with edit_notes (3 min)
  4. Show Weave tracing (2 min)
  5. Show activity chat iteration (3 min)
- [ ] **Demo Video** (2 minutes):
  - Record full agent handoff flow
  - Highlight self-improvement features
  - Show Weave dashboard
- [ ] **Production Deployment**:
  - Deploy backend to Railway or Render
  - Deploy frontend to Vercel
  - Test production endpoints
- [ ] **Final Testing**:
  - Test Daytona with actual API key
  - Verify all sponsor tool integrations
  - Run full end-to-end test

---

### **Priority Tasks for Demo:**

#### 🔥 Critical (Must Have):
1. **Strategy page with self-evaluation display** - Shows core self-improvement
2. **Lesson page with strategy week selector** - Shows agent handoff
3. **Activity page with sandbox preview** - Shows code generation
4. **Activity chat interface** - Shows conversational iteration
5. **Demo video (2 min)** - For judges to quickly understand

#### ⚡ Important (Should Have):
6. **Version history viewer** - Shows learning from tutor edits
7. **Weave dashboard link** - Shows comprehensive tracing
8. **Home page with navigation** - Professional presentation
9. **Production deployment** - Live demo reliability

#### 💡 Nice to Have (If Time):
10. **Visual agent handoff diagram** - Better understanding
11. **Score trend graph** - Show improvement over time
12. **Diff viewer for versions** - Detailed edit analysis

---

### **Time Estimate Remaining:**
- **Frontend UI**: 3-4 hours
- **Demo prep**: 1 hour
- **Deployment**: 30 minutes
- **Testing & Polish**: 30 minutes
- **Total**: ~5-6 hours

---

## Time Allocation Philosophy

- ⚡ **Speed over perfection**: MVP that demonstrates self-improvement clearly
- 🎯 **Focus on demo**: Every feature must be showable to judges
- 🔄 **Reuse existing prompts**: Copy from existing agents, don't reinvent
- 🚫 **No gold-plating**: Minimal UI, no authentication, hardcoded test data is fine
- 🔗 **Agent Handoff**: Implement strategy → lesson → activity context propagation
- 📝 **Collaborative Editing**: Version history for strategies/lessons, chat for activities

---

## Phase 1: Backend Foundation (8 hours) ✅ COMPLETE

### Hour 0-2: Project Setup ✅
- [x] 1.1 Create `Weave-Tutor/backend/` directory
- [x] 1.2 Initialize FastAPI project (Python 3.12 venv)
  ```bash
  cd Weave-Tutor/backend
  python -m venv venv
  source venv/bin/activate
  pip install fastapi uvicorn supabase python-dotenv pydantic weave-python
  ```
- [ ] 1.3 Create `main.py` with basic FastAPI app
- [ ] 1.4 Create `.env` with API keys:
  ```
  SUPABASE_URL=...
  SUPABASE_KEY=...
  GOOGLE_LEARNLM_API_KEY=...
  PERPLEXITY_API_KEY=...
  WEAVE_PROJECT_NAME=tutorpilot-weavehacks
  DAYTONA_API_KEY=...
  ```
- [ ] 1.5 Create `requirements.txt`:
  ```
  fastapi==0.104.1
  uvicorn==0.24.0
  supabase==2.3.0
  python-dotenv==1.0.0
  pydantic==2.5.0
  httpx==0.25.2
  weave==0.50.0
  ```

### Hour 2-4: Database & Models
- [ ] 2.1 Create `backend/db/supabase_client.py`
  ```python
  from supabase import create_client
  import os
  
  supabase = create_client(
      os.getenv("SUPABASE_URL"),
      os.getenv("SUPABASE_KEY")
  )
  ```
- [ ] 2.2 Run schema.sql (only essential tables) in Supabase dashboard
- [ ] 2.3 Create `backend/models/` with Pydantic models:
  - `student.py`: Student model
  - `strategy.py`: Strategy, StrategyWeek
  - `lesson.py`: Lesson, LessonPhase
  - `activity.py`: Activity
  - `evaluation.py`: SelfEvaluation, PerformanceMetric
- [ ] 2.4 Test database connection: Insert/fetch test student

### Hour 4-6: AI Service Layer
- [ ] 3.1 Create `backend/services/ai_service.py`
- [ ] 3.2 Implement `call_google_learnlm(prompt: str) -> str`
  - Copy from existing `lesson-creator/index.ts` (lines 276-336)
  - Adapt retry logic to Python
- [ ] 3.3 Implement `call_perplexity(prompt: str) -> str`
  - Copy from existing `lesson-creator/index.ts` (lines 337-412)
  - Adapt to Python with `httpx`
- [ ] 3.4 Test both functions with sample prompts

### Hour 6-8: Knowledge Service (Layer 1)
- [ ] 4.1 Create `backend/services/knowledge_service.py`
- [ ] 4.2 Implement `generate_queries(topic: str, grade: str) -> List[str]`
  - Use LearnLM to generate 2-3 search queries
  - Copy prompt logic from existing agents
- [ ] 4.3 Implement `explain_topic_with_sources(queries: List[str]) -> dict`
  - Call Perplexity for each query
  - Use `asyncio.gather()` for parallel execution
  - Parse and return explanations + sources
- [ ] 4.4 Create endpoint: `POST /api/v1/knowledge/explain`
  ```python
  @app.post("/api/v1/knowledge/explain")
  async def explain_topics(request: KnowledgeRequest):
      # Generate queries for each topic
      # Explain in parallel
      # Return structured response
  ```
- [ ] 4.5 Test with Postman/curl

**Checkpoint**: You should have a working Knowledge Service that returns explanations + sources in ~15 seconds

---

## Phase 2: Core Agents with Self-Evaluation (10 hours)

### Hour 8-11: Self-Evaluator Agent (CRITICAL)
- [ ] 5.1 Create `backend/agents/evaluator.py`
- [ ] 5.2 Implement `evaluate_strategy(strategy: dict, student: dict) -> Evaluation`
  ```python
  async def evaluate_strategy(strategy: dict, student: dict) -> Evaluation:
      """Self-evaluate strategy quality using LearnLM"""
      
      eval_prompt = f"""You are a pedagogical expert evaluating an AI-generated learning strategy.

  STRATEGY TO EVALUATE:
  {json.dumps(strategy, indent=2)}

  STUDENT CONTEXT:
  - Grade: {student['grade']}
  - Learning Style: {student.get('learning_style', 'Mixed')}
  - Interests: {student.get('interests', [])}

  EVALUATION CRITERIA (rate each 1-10):
  1. **Pedagogical Soundness**: Follows learning science (scaffolding, spacing, active recall)
  2. **Cultural Appropriateness**: Respects student's background
  3. **Engagement Potential**: Likely to maintain interest
  4. **Clarity**: Clear objectives and outcomes
  5. **Feasibility**: Realistic within constraints

  For EACH criterion:
  - Give a numeric score (1-10)
  - Provide 1-2 sentence reasoning

  Also identify:
  - 3 specific weaknesses (be critical!)
  - 3 concrete improvements

  Return ONLY valid JSON:
  {{
    "overall_score": 8.5,
    "criteria": {{
      "pedagogical_soundness": {{"score": 9, "reasoning": "..."}},
      "cultural_appropriateness": {{"score": 8, "reasoning": "..."}},
      "engagement_potential": {{"score": 8, "reasoning": "..."}},
      "clarity": {{"score": 9, "reasoning": "..."}},
      "feasibility": {{"score": 8, "reasoning": "..."}}
    }},
    "weaknesses": ["...", "...", "..."],
    "improvements": ["...", "...", "..."]
  }}
  """
      
      response = await call_google_learnlm(eval_prompt)
      evaluation = json.loads(response)
      return Evaluation(**evaluation)
  ```
- [ ] 5.3 Implement `evaluate_lesson()` (similar structure)
- [ ] 5.4 Implement `evaluate_activity()` (similar structure)
- [ ] 5.5 Create `backend/services/memory_service.py`
- [ ] 5.6 Implement `store_performance_metric(agent_type, evaluation, context)`
  ```python
  async def store_performance_metric(agent_type: str, evaluation: Evaluation, session_id: str):
      """Store evaluation in agent_performance_metrics table"""
      
      supabase.table('agent_performance_metrics').insert({
          'agent_type': agent_type,
          'agent_id': f'{agent_type}_{datetime.now().isoformat()}',
          'session_id': session_id,
          'success_rate': evaluation.overall_score / 10,
          'confidence_scores': [c['score'] for c in evaluation.criteria.values()],
          'error_count': 0 if evaluation.overall_score >= 7 else 1,
          'last_error': json.dumps(evaluation.weaknesses) if evaluation.overall_score < 7 else None,
          'created_at': datetime.now().isoformat()
      }).execute()
  ```
- [ ] 5.7 Test evaluator with sample strategy

### Hour 11-14: Strategy Planner Agent
- [ ] 6.1 Create `backend/agents/strategy_planner.py`
- [ ] 6.2 Implement `load_student_memories(student_id: str) -> dict`
  ```python
  async def load_student_memories(student_id: str):
      response = supabase.table('platform_memory') \
          .select('*') \
          .eq('entity_type', 'student') \
          .eq('entity_id', student_id) \
          .gte('confidence_score', 0.3) \
          .limit(10) \
          .execute()
      return response.data
  ```
- [ ] 6.3 Implement `load_learning_insights(grade: str, subject: str) -> List[dict]`
  ```python
  async def load_learning_insights(grade: str, subject: str):
      """Load relevant insights to adapt prompts"""
      response = supabase.table('learning_insights') \
          .select('*') \
          .eq('status', 'validated') \
          .filter('applicability->>grade_levels', 'cs', f'{grade}') \
          .limit(5) \
          .execute()
      return response.data
  ```
- [ ] 6.4 Implement main `generate_strategy()` function
  - **COPY PROMPT** from `strategy-planner/index.ts` (use existing prompt engineering!)
  - Add insights adaptation section:
    ```python
    insights_section = ""
    if insights:
        insights_section = f"""
    IMPORTANT LEARNINGS FROM PREVIOUS GENERATIONS:
    {format_insights(insights)}
    
    Based on these patterns, ensure your strategy avoids the identified weaknesses.
    """
    
    full_prompt = base_prompt + insights_section
    ```
- [ ] 6.5 Generate strategy with LearnLM
- [ ] 6.6 **Call evaluator**: `evaluation = await evaluator.evaluate_strategy(strategy, student)`
- [ ] 6.7 Store strategy + evaluation in DB
- [ ] 6.8 Create endpoint: `POST /api/v1/agents/strategy`

### Hour 14-17: Lesson Creator Agent
- [ ] 7.1 Create `backend/agents/lesson_creator.py`
- [ ] 7.2 **COPY PROMPT** from `lesson-creator/index.ts` (lines 497-683)
  - Adapt to Python f-strings
  - Keep the 5E structure intact
- [ ] 7.3 Implement `generate_lesson()` with insights adaptation
- [ ] 7.4 Call Layer 1 for topic explanation
- [ ] 7.5 Generate lesson with LearnLM
- [ ] 7.6 **Call evaluator**: `evaluation = await evaluator.evaluate_lesson(lesson, student)`
- [ ] 7.7 Store lesson + evaluation
- [ ] 7.8 Create endpoint: `POST /api/v1/agents/lesson`

### Hour 17-18: Reflection Loop (Background Task)
- [ ] 8.1 Create `backend/services/learning_service.py`
- [ ] 8.2 Implement `identify_improvement_patterns()` (runs every 10 minutes)
  ```python
  async def identify_improvement_patterns():
      """Analyze recent low-scoring outputs"""
      
      # Get evaluations from last hour with score < 7
      low_scores = supabase.table('agent_performance_metrics') \
          .select('*') \
          .lt('success_rate', 0.7) \
          .gte('created_at', (datetime.now() - timedelta(hours=1)).isoformat()) \
          .execute()
      
      if len(low_scores.data) < 3:
          return  # Not enough data
      
      # Group by agent_type and find common patterns
      patterns = analyze_common_failures(low_scores.data)
      
      # Store as learning insights
      for pattern in patterns:
          supabase.table('learning_insights').insert({
              'insight_type': 'optimization_opportunity',
              'description': pattern['description'],
              'supporting_evidence': pattern['evidence'],
              'applicability': pattern['context'],
              'status': 'validated',  # Auto-validate for hackathon
              'created_at': datetime.now().isoformat()
          }).execute()
  ```
- [ ] 8.3 Add background task to FastAPI:
  ```python
  @app.on_event("startup")
  async def startup_event():
      asyncio.create_task(periodic_reflection_loop())
  
  async def periodic_reflection_loop():
      while True:
          await asyncio.sleep(600)  # Every 10 minutes
          await identify_improvement_patterns()
  ```

**Checkpoint**: You should have Strategy + Lesson agents that self-evaluate and store insights

---

## Phase 3: NEW Features - Code Sandboxes (8 hours)

### Hour 18-20: Weave Integration
- [ ] 9.1 Initialize Weave in `main.py`:
  ```python
  import weave
  
  weave.init("tutorpilot-weavehacks")
  
  @weave.op()
  async def call_google_learnlm(prompt: str) -> str:
      # Existing implementation
      pass
  ```
- [ ] 9.2 Add `@weave.op()` decorator to all AI calls
- [ ] 9.3 Add `@weave.op()` to evaluator functions
- [ ] 9.4 Test: Generate strategy and check Weave dashboard for traces

### Hour 20-22: Qwen3 Coder Integration
- [ ] 10.1 Create `backend/services/code_generation_service.py`
- [ ] 10.2 Implement Qwen3 Coder API call (via Weave inference):
  ```python
  import weave
  
  @weave.op()
  async def generate_simulation_code(
      topic: str,
      grade: str,
      explanation: str,
      language: str = "python"
  ) -> str:
      """Generate interactive simulation code using Qwen3 Coder 480B"""
      
      code_prompt = f"""Generate a complete, runnable {language} script for an educational simulation.

  TOPIC: {topic}
  STUDENT GRADE: {grade}

  EDUCATIONAL CONTEXT:
  {explanation}

  REQUIREMENTS:
  1. Create an interactive visualization using matplotlib or plotly
  2. Include sliders/buttons for parameter adjustment (use ipywidgets if Python)
  3. Add educational annotations explaining the science
  4. Keep code under 200 lines
  5. Use clear variable names and extensive comments
  6. Include a main() function that runs the simulation

  EXAMPLE STRUCTURE (Python):
  ```python
  import matplotlib.pyplot as plt
  import numpy as np
  from matplotlib.widgets import Slider
  
  def main():
      # Setup figure
      fig, ax = plt.subplots()
      
      # Create interactive elements
      # ... simulation logic ...
      
      plt.show()
  
  if __name__ == "__main__":
      main()
  ```

  Generate ONLY the complete, runnable code with imports. No explanations.
  """
      
      # Call Qwen3 via Weave (update with actual Weave API)
      response = await call_qwen3_coder(code_prompt)
      
      # Extract code from response
      code = extract_code_block(response)
      return code
  
  async def call_qwen3_coder(prompt: str) -> str:
      """Call Qwen3 Coder 480B via Weave inference"""
      # TODO: Replace with actual Weave inference API
      # For hackathon, can use OpenAI's GPT-4 as fallback if Weave setup is complex
      import httpx
      
      async with httpx.AsyncClient() as client:
          response = await client.post(
              "https://api.weave.ai/v1/inference",  # Placeholder URL
              headers={"Authorization": f"Bearer {os.getenv('WEAVE_API_KEY')}"},
              json={
                  "model": "qwen3-coder-480b",
                  "prompt": prompt,
                  "max_tokens": 2048,
                  "temperature": 0.2
              }
          )
          return response.json()['output']
  ```
- [ ] 10.3 Test code generation with chemistry example

### Hour 22-25: Daytona Sandbox Service
- [ ] 11.1 Create `backend/services/daytona_service.py`
- [ ] 11.2 Research Daytona API documentation (15 min)
- [ ] 11.3 Implement sandbox creation:
  ```python
  import httpx
  
  class DaytonaService:
      def __init__(self):
          self.api_key = os.getenv("DAYTONA_API_KEY")
          self.base_url = "https://api.daytona.io/v1"  # Placeholder
      
      async def create_sandbox(
          self,
          code: str,
          language: str,
          dependencies: List[str],
          student_id: str
      ) -> dict:
          """Create a new Daytona sandbox and deploy code"""
          
          async with httpx.AsyncClient() as client:
              # Create sandbox
              sandbox_response = await client.post(
                  f"{self.base_url}/sandboxes",
                  headers={"Authorization": f"Bearer {self.api_key}"},
                  json={
                      "language": language,
                      "resources": {
                          "cpu": "1",
                          "memory": "512Mi",
                          "timeout": "30m"
                      },
                      "metadata": {
                          "student_id": student_id,
                          "created_at": datetime.now().isoformat()
                      }
                  }
              )
              
              sandbox = sandbox_response.json()
              sandbox_id = sandbox['id']
              
              # Deploy code
              await client.post(
                  f"{self.base_url}/sandboxes/{sandbox_id}/deploy",
                  headers={"Authorization": f"Bearer {self.api_key}"},
                  json={
                      "code": code,
                      "dependencies": dependencies,
                      "entry_point": "main.py"
                  }
              )
              
              # Return sandbox URL
              return {
                  "sandbox_id": sandbox_id,
                  "url": f"https://sandbox.daytona.io/{sandbox_id}",
                  "status": "running",
                  "expires_at": (datetime.now() + timedelta(hours=2)).isoformat()
              }
      
      async def get_sandbox_status(self, sandbox_id: str) -> dict:
          """Get sandbox status"""
          async with httpx.AsyncClient() as client:
              response = await client.get(
                  f"{self.base_url}/sandboxes/{sandbox_id}",
                  headers={"Authorization": f"Bearer {self.api_key}"}
              )
              return response.json()
  ```
- [ ] 11.4 Test sandbox creation (might need to adjust based on actual API)

### Hour 25-26: Activity Creator with React Code Generation + Auto-Fix Loop
- [ ] 12.1 Create `backend/agents/activity_creator.py`
- [ ] 12.2 Implement `generate_activity()` with error-fixing loop:
  ```python
  async def generate_activity(
      student_id: str,
      topic: str,
      activity_description: str,
      duration: int,
      max_attempts: int = 3
  ) -> dict:
      """Generate React activity with automatic error fixing"""
      
      student = await get_student(student_id)
      
      # Load memories and insights
      memories = await load_student_memories(student_id)
      insights = await load_learning_insights(student['grade'], topic)
      
      # Call Layer 1 for topic explanation
      knowledge = await knowledge_service.explain_topic(topic, student['grade'])
      
      # Generate React code using Qwen3 (from PROMPT-REFERENCE.md)
      code = await code_generation_service.generate_react_activity(
          topic=topic,
          grade=student['grade'],
          activity_description=activity_description,
          knowledge_context=knowledge,
          student=student
      )
      
      # Deploy with automatic error fixing
      deployment = await deploy_with_error_fix(
          code=code,
          topic=topic,
          student_id=student_id,
          max_attempts=max_attempts
      )
      
      activity = {
          "type": "interactive",
          "title": f"Interactive {topic} Activity",
          "description": activity_description,
          "code": deployment['code'],
          "sandbox_url": deployment['url'],
          "sandbox_id": deployment['sandbox_id'],
          "status": deployment['status'],
          "attempts": deployment['attempts']
      }
      
      # Self-evaluate (includes code quality if successful)
      evaluation = await evaluator.evaluate_activity(activity, student)
      
      # Store
      await store_activity(activity, evaluation)
      
      return activity
  
  async def deploy_with_error_fix(code, topic, student_id, max_attempts=3):
      """Deploy to Daytona with automatic error fixing"""
      for attempt in range(1, max_attempts + 1):
          # Deploy to Daytona
          sandbox = await daytona_service.create_sandbox(
              code=code,
              language="javascript",
              dependencies=["react", "react-dom"],
              student_id=student_id
          )
          
          # Wait for initialization
          await asyncio.sleep(5)
          
          # Check for errors
          error_logs = await daytona_service.get_sandbox_logs(sandbox['sandbox_id'])
          
          if not has_errors(error_logs):
              return {
                  "sandbox_id": sandbox['sandbox_id'],
                  "url": f"https://sandbox.daytona.io/{sandbox['sandbox_id']}",
                  "status": "success",
                  "attempts": attempt,
                  "code": code
              }
          
          # Fix errors if attempts left
          if attempt < max_attempts:
              print(f"⚠️ Errors on attempt {attempt}, fixing...")
              code = await fix_code_errors(code, error_logs, topic, attempt)
              await daytona_service.delete_sandbox(sandbox['sandbox_id'])
          else:
              return {"status": "failed", "error_logs": error_logs, "code": code}
  ```
- [ ] 12.3 Implement `fix_code_errors()` using Qwen3 (from PROMPT-REFERENCE.md)
- [ ] 12.4 Add `has_errors()` helper to detect error indicators in logs
- [ ] 12.5 Add `store_code_fix_attempt()` to save fixes for learning
- [ ] 12.6 Create endpoint: `POST /api/v1/agents/activity`
- [ ] 12.7 Test with chemistry activity request (verify error-fixing works!)

**Checkpoint**: You should be able to generate a React activity, and if it has errors, watch it auto-fix and redeploy

---

## Phase 4: Frontend (3 hours)

### Hour 26-27: Next.js Setup
- [ ] 13.1 Create `Weave-Tutor/frontend/` directory
- [ ] 13.2 Initialize Next.js:
  ```bash
  cd Weave-Tutor/frontend
  npx create-next-app@latest . --typescript --tailwind --app
  ```
- [ ] 13.3 Create `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```
- [ ] 13.4 Install dependencies:
  ```bash
  npm install axios
  ```

### Hour 27-28: Basic UI Pages
- [ ] 14.1 Create `app/strategy/page.tsx`:
  ```tsx
  'use client';
  
  import { useState } from 'react';
  import axios from 'axios';
  
  export default function StrategyPage() {
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    
    const generateStrategy = async () => {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agents/strategy`, {
        student_id: "test-student-id",  // Hardcoded for demo
        weeks: 4,
        subject: "Physics"
      });
      setStrategy(response.data.strategy);
      setEvaluation(response.data.evaluation);
      setLoading(false);
    };
    
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Strategy Planner</h1>
        <button 
          onClick={generateStrategy}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating...' : 'Generate 4-Week Strategy'}
        </button>
        
        {strategy && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Generated Strategy</h2>
            <pre className="bg-gray-100 p-4 mt-2 rounded overflow-auto">
              {JSON.stringify(strategy, null, 2)}
            </pre>
            
            <h2 className="text-2xl font-bold mt-4">Self-Evaluation</h2>
            <div className="bg-yellow-50 p-4 mt-2 rounded">
              <p className="text-xl">Overall Score: {evaluation.overall_score}/10</p>
              <div className="mt-2">
                {Object.entries(evaluation.criteria).map(([key, val]) => (
                  <div key={key} className="mb-2">
                    <strong>{key}:</strong> {val.score}/10 - {val.reasoning}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <strong>Weaknesses:</strong>
                <ul className="list-disc ml-6">
                  {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```
- [ ] 14.2 Create `app/activity/page.tsx` (similar structure, with iframe for sandbox)
- [ ] 14.3 Create `app/page.tsx` (home page with links to strategy/activity)

### Hour 28-29: Sandbox Preview Component
- [ ] 15.1 Create `components/SandboxPreview.tsx`:
  ```tsx
  interface Props {
    sandboxUrl: string;
    code: string;
  }
  
  export function SandboxPreview({ sandboxUrl, code }: Props) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Live Simulation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Generated Code</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto h-96">
              {code}
            </pre>
          </div>
          <div>
            <h3 className="font-bold mb-2">Running Simulation</h3>
            <iframe 
              src={sandboxUrl}
              className="w-full h-96 border rounded"
              title="Simulation Sandbox"
            />
          </div>
        </div>
      </div>
    );
  }
  ```
- [ ] 15.2 Integrate into activity page

**Checkpoint**: You should have a working UI that can trigger agents and display results

---

## Phase 5: Demo Preparation & Polish (1 hour)

### Hour 29-30: Demo Assets
- [ ] 16.1 Seed database with test student:
  ```sql
  INSERT INTO students (id, name, grade, subject, learning_style, nationality, interests)
  VALUES (
    'demo-student-123',
    'Alex Chen',
    '10',
    'Physics',
    'Visual',
    'Singapore',
    '["space exploration", "robotics"]'
  );
  ```
- [ ] 16.2 Pre-generate 5 strategies to show improvement:
  ```python
  # Run script to generate 5 strategies for same student
  for i in range(5):
      strategy = await generate_strategy("demo-student-123", 4, "Physics")
      # Wait for reflection loop to process
      await asyncio.sleep(60)
  ```
- [ ] 16.3 Query learning insights table to show accumulated learnings
- [ ] 16.4 Create demo script markdown:
  ```markdown
  # TutorPilot Demo Script
  
  ## 1. Self-Improvement Loop (5 min)
  - Open strategy page
  - Generate strategy #1 → Show score: 7.5/10
  - Show identified weaknesses
  - Generate strategy #2 (after reflection) → Show score: 8.5/10
  - Compare improvements
  
  ## 2. Learning Insights (2 min)
  - Open Supabase dashboard
  - Query: SELECT * FROM learning_insights ORDER BY created_at DESC
  - Show accumulated patterns
  
  ## 3. Code Sandbox (4 min)
  - Open activity page
  - Request: "Chemical bonding visualization"
  - Show Qwen3 generating code
  - Show Daytona sandbox with live simulation
  
  ## 4. Weave Tracing (2 min)
  - Open Weave dashboard
  - Show agent decision trace
  - Show evaluation reasoning
  ```
- [ ] 16.5 Record 2-minute video demo
- [ ] 16.6 Create README.md with:
  - Project description
  - Self-improvement explanation
  - Setup instructions
  - Demo video embed
- [ ] 16.7 Deploy backend to Railway/Render
- [ ] 16.8 Deploy frontend to Vercel

---

## Critical Success Factors

### Must-Have for Winning
1. ✅ **Self-evaluation works** and is visible in UI
2. ✅ **Reflection loop runs** and creates learning insights
3. ✅ **Prompt adaptation** loads insights and improves next generation
4. ✅ **Code sandbox** generates + deploys at least one working simulation
5. ✅ **Demo video** clearly shows improvement over multiple generations

### Nice-to-Have (if time permits)
- [ ] Streaming progress with Server-Sent Events
- [ ] Graph showing success_rate over time
- [ ] Cross-agent learning visualization
- [ ] Multiple sandbox examples (chemistry, physics, biology)

### Can Skip
- [ ] Authentication system
- [ ] Pretty UI design (basic Tailwind is fine)
- [ ] Error handling for all edge cases
- [ ] Unit tests (demo-driven development!)

---

## Risk Mitigation

### Risk 1: Daytona API is complex
**Mitigation**: Use Docker containers as fallback for local sandboxes
**Time**: Save 2 hours by using simple subprocess execution

### Risk 2: Qwen3 Coder via Weave is slow
**Mitigation**: Use GPT-4 as fallback for code generation
**Time**: Save 1 hour by using familiar API

### Risk 3: Reflection loop doesn't show improvement in 30 hours
**Mitigation**: Manually inject learning insights for demo
**Time**: Save 1 hour by pre-seeding insights

---

## Timeline Checkpoints

**Hour 8**: Knowledge Service working  
**Hour 14**: Strategy Planner with self-evaluation working  
**Hour 18**: Reflection loop running  
**Hour 22**: Qwen3 code generation working  
**Hour 26**: Activity Creator with sandbox working  
**Hour 29**: Basic UI functional  
**Hour 30**: Demo ready!

---

## Post-Hackathon TODOs (Don't Do These Now!)

- [ ] Add authentication
- [ ] Improve UI design
- [ ] Add comprehensive error handling
- [ ] Write unit tests
- [ ] Add rate limiting
- [ ] Implement streaming responses
- [ ] Add user feedback collection
- [ ] Scale Daytona sandbox management

---

**Status**: Ready to Start Implementation  
**First Task**: Phase 1, Hour 0-2 (Project Setup)  
**Success Metric**: Working demo in 30 hours that clearly shows self-improvement

