# 🧠 Self-Improving Agent System - Demo Guide

## The Complete Self-Improvement Loop

This document shows how TutorPilot agents learn from their own evaluations and tutor feedback to continuously improve.

---

## 📊 The 4-Stage Self-Improvement Cycle

```
Stage 1: GENERATION + SELF-EVALUATION
↓
Stage 2: TUTOR FEEDBACK (Version Edits)
↓
Stage 3: REFLECTION (Pattern Analysis)
↓
Stage 4: ADAPTIVE PROMPTING (Use Insights)
```

---

## Stage 1: Generation + Self-Evaluation

### What Happens:
When an agent generates content (strategy/lesson/activity), it immediately evaluates itself on 6 criteria.

### Example - Activity Creator Self-Evaluation:
```json
{
  "overall_score": 7.5,
  "criteria": {
    "educational_value": {"score": 8.0, "reasoning": "Clear learning objectives aligned with curriculum"},
    "engagement": {"score": 7.0, "reasoning": "Interactive but could use more gamification"},
    "interactivity": {"score": 8.5, "reasoning": "Multiple interaction points with immediate feedback"},
    "creativity": {"score": 6.5, "reasoning": "Conventional quiz format, not highly innovative"},
    "code_quality": {"score": 8.0, "reasoning": "Clean React code, responsive design"},
    "feasibility": {"score": 7.5, "reasoning": "Appropriate for grade level and time constraints"}
  },
  "weaknesses": [
    "Activity uses quiz format which is less engaging than simulations",
    "No connection to student's stated interests (robotics, space exploration)",
    "Cultural context not considered for international student"
  ],
  "improvements": [
    "Convert to interactive simulation instead of quiz",
    "Incorporate space/robotics theme mentioned in student profile",
    "Add culturally-neutral or culturally-adaptive examples"
  ]
}
```

### Storage:
This evaluation is stored in `agent_performance_metrics` table for later analysis.

---

## Stage 2: Tutor Feedback (Version Edits)

### What Happens:
Tutors edit AI-generated content using the collaborative editor. **Critically**, they provide "edit notes" explaining WHY they made changes.

### Example - Tutor Editing a Lesson:

**Original AI Output:**
```
Class Activity: Photosynthesis Quiz (15 minutes)
Students complete a 10-question multiple choice quiz on photosynthesis.
```

**Tutor's Edit:**
```
Class Activity: Build-A-Plant Simulation (15 minutes)
Students use an interactive simulation to design a plant, choosing leaf size, 
root depth, and stem thickness. They test their design in different environments 
(desert, rainforest, tundra) and observe which traits help survival.
```

**Edit Notes (The Critical Part):**
```
WHY: Quiz format is passive. This student (Amira) has kinesthetic learning style 
and loves hands-on activities. Simulation allows experimentation and immediate 
visual feedback, which is more aligned with her learning preferences.
```

### Storage:
```json
{
  "content_type": "lesson",
  "content_id": "abc-123",
  "version_number": 2,
  "edit_type": "manual_edit",
  "edit_notes": "Quiz format is passive. Student needs kinesthetic, hands-on activities...",
  "changes_summary": "Converted quiz to interactive simulation",
  "edited_by": "tutor-456"
}
```

Stored in `content_versions` table.

---

## Stage 3: Reflection (Pattern Analysis)

### What Happens:
The Reflection Service analyzes patterns in:
1. **Agent Performance Metrics** (self-evaluations)
2. **Tutor Edit Patterns** (version history + edit notes)

### How to Trigger Reflection:

#### Option 1: API Call (Manual)
```bash
# Analyze all agents
POST http://localhost:8000/api/v1/reflection/analyze

# Analyze specific agent
POST http://localhost:8000/api/v1/reflection/analyze?agent_type=activity_creator
```

#### Option 2: Background Task (Automatic)
```python
# In main.py, add a background scheduler (FastAPI-Utils or APScheduler)
from fastapi_utils.tasks import repeat_every

@app.on_event("startup")
@repeat_every(seconds=60 * 60 * 6)  # Every 6 hours
async def run_reflection():
    from agents.reflection_service import run_reflection_analysis
    await run_reflection_analysis()
```

### What Gets Analyzed:

**Input Data:**
- Last 20 performance metrics (7 days)
- Last 10 tutor edits (7 days)

**LLM Prompt:**
```
Analyze patterns:
1. What criteria consistently score low?
2. What do tutors frequently edit?
3. Why do some generations score higher?
4. Cultural/contextual issues?
5. Structural improvements?

Provide 3-5 SPECIFIC, ACTIONABLE insights.
```

### Example Output (Learning Insights):

```json
{
  "insights": [
    {
      "type": "tutor_preference",
      "insight": "Tutors replace quiz-style activities with simulations 8 out of 10 times",
      "evidence": "8 of 10 manual edits converted passive quizzes to interactive simulations",
      "confidence": 0.90,
      "action": "Default to simulations/games instead of quizzes for all activities"
    },
    {
      "type": "success_pattern",
      "insight": "Activities that reference student interests score 1.8 points higher on engagement",
      "evidence": "6 of 7 activities mentioning student interests scored ≥8.5 vs 6.7 average",
      "confidence": 0.85,
      "action": "Always connect topic to at least one stated student interest in first paragraph"
    },
    {
      "type": "weakness_pattern",
      "insight": "Cultural appropriateness consistently scores below 7.0",
      "evidence": "12 of 15 generations scored <7 on cultural appropriateness; tutors added cultural context in 70% of edits",
      "confidence": 0.88,
      "action": "Proactively include examples from student's cultural background (check nationality field)"
    }
  ]
}
```

### Storage:
These insights are stored in `cross_agent_learning` table.

---

## Stage 4: Adaptive Prompting (Use Insights)

### What Happens:
When generating new content, the agent retrieves relevant learning insights and prepends them to the prompt.

### Implementation Example:

**Before (Without Insights):**
```python
prompt = f"""Generate an educational activity for {topic}
Student: {student_name}, Grade {grade}
..."""
```

**After (With Adaptive Prompting):**
```python
# Retrieve insights
from agents.reflection_service import reflection_service, format_insights_for_prompt

insights = await reflection_service.get_relevant_insights('activity_creator', max_insights=5)
insights_text = format_insights_for_prompt(insights)

prompt = f"""{insights_text}

Generate an educational activity for {topic}
Student: {student_name}, Grade {grade}
..."""
```

### What The Agent Sees:

```
🎓 LEARNING INSIGHTS FROM PREVIOUS GENERATIONS:
(The AI has learned these patterns from tutor feedback and self-evaluation)

1. 🟢 Tutors replace quiz-style activities with simulations 8 out of 10 times
   → ACTION: Default to simulations/games instead of quizzes for all activities

2. 🟢 Activities that reference student interests score 1.8 points higher on engagement
   → ACTION: Always connect topic to at least one stated student interest in first paragraph

3. 🟢 Cultural appropriateness consistently scores below 7.0
   → ACTION: Proactively include examples from student's cultural background

4. 🟡 Activities with visual feedback score 1.2 points higher on interactivity
   → ACTION: Include visual state changes for every user action

5. 🟡 Tutors add time estimates that AI omits
   → ACTION: Always specify duration for each activity component

---

Generate an educational activity for Photosynthesis
Student: Amira Hassan, Grade 9
Interests: Drawing, Gardening, Science Experiments
Nationality: Egypt
Learning Style: Kinesthetic
...
```

### Result:
The agent NOW generates:
- ✅ **Simulation** (not quiz) - learned from tutor edits
- ✅ **References gardening interest** - learned from success patterns
- ✅ **Culturally-appropriate examples** (uses Egyptian crops) - learned from weakness patterns
- ✅ **Visual feedback** - learned from high-scoring activities

**Score Improvement: 7.5 → 8.8** 🎉

---

## 📈 Measuring Improvement Over Time

### API to View Insights:
```bash
GET http://localhost:8000/api/v1/reflection/insights/activity_creator
```

### Response:
```json
{
  "success": true,
  "agent_type": "activity_creator",
  "insights": [
    {
      "id": "insight-1",
      "type": "success_pattern",
      "insight": "Activities with simulations score 2pts higher...",
      "confidence": 0.90,
      "created_at": "2025-01-15T10:30:00"
    }
  ]
}
```

### Performance Trends:
Query `agent_performance_metrics` to show score improvement:

```sql
SELECT 
  DATE(created_at) as date,
  AVG(evaluation->>'overall_score'::float) as avg_score
FROM agent_performance_metrics
WHERE agent_type = 'activity_creator'
GROUP BY DATE(created_at)
ORDER BY date;
```

**Example Trend:**
```
Day 1: 6.8
Day 2: 7.1  (+0.3)
Day 3: 7.5  (+0.4)
Day 4: 7.9  (+0.4)
Day 5: 8.2  (+0.3)
```

---

## 🎬 Demo Script for Judges

### Step 1: Show Initial Generation (5 min)
1. Generate an activity WITHOUT insights
2. Point out self-evaluation scores (e.g., engagement: 6.5)
3. Point out weaknesses identified

### Step 2: Show Tutor Feedback Loop (3 min)
1. Tutor edits the activity in the collaborative editor
2. **Emphasize the "edit notes" field** - this is the key!
3. Save version with notes: "Changed to simulation because student is kinesthetic learner"

### Step 3: Trigger Reflection (3 min)
1. Call reflection API: `POST /api/v1/reflection/analyze?agent_type=activity_creator`
2. Show generated insights in response
3. Open database to show insights stored in `cross_agent_learning` table

### Step 4: Generate with Insights (5 min)
1. Generate a NEW activity (same student, different topic)
2. Show that insights are prepended to prompt (check backend logs)
3. Show improved self-evaluation scores (e.g., engagement: 8.5)
4. Highlight specific improvements that match the insights

### Step 5: Show the Data (2 min)
1. Open Weave dashboard - show trace with insights in prompt
2. Show performance metrics table - demonstrate score trend
3. Show content_versions table - demonstrate edit notes feeding insights

---

## 🏆 Why This Wins "Best Self-Improving Agent"

### 1. **Multiple Feedback Loops**
- ✅ Self-evaluation (agent critiques itself)
- ✅ Tutor feedback (humans provide context)
- ✅ Performance tracking (quantitative improvement)
- ✅ Reflection analysis (pattern identification)
- ✅ Adaptive prompting (insights → better prompts)

### 2. **Measurable Improvement**
- Scores improve over time (demonstrable in metrics)
- Specific patterns identified and acted upon
- A/B comparison: with insights vs without

### 3. **Learning from WHY, not just WHAT**
- Most systems track WHAT tutors change
- We track **WHY** tutors change it (edit_notes)
- This provides rich semantic context for learning

### 4. **Cross-Agent Learning**
- Insights from one agent can inform others
- E.g., "simulations work better" applies to all agents
- Stored in `cross_agent_learning` with source/target agents

### 5. **Sponsor Integration**
- Weave: Traces show insights in prompts
- Daytona: Sandbox errors feed back into code quality insights
- Perplexity: Research quality affects self-evaluation

---

## 🔧 Technical Implementation Checklist

- [x] Self-evaluation after every generation
- [x] Performance metrics stored in database
- [x] Version history with edit_notes field
- [x] Reflection service with LLM-based pattern analysis
- [x] Learning insights stored in cross_agent_learning
- [x] Retrieval of insights in generation functions
- [x] Format insights for prompt inclusion
- [x] API endpoints to trigger reflection and view insights
- [ ] Background scheduler for automatic reflection (30 min to add)
- [ ] Frontend page to view insights (1 hour to add)

---

## 🎯 Next Steps (Post-Hackathon)

1. **A/B Testing**: Compare outputs with vs without insights
2. **Fine-tuning**: Use collected data to fine-tune Qwen3 Coder
3. **Student Feedback Loop**: Add student ratings to improve engagement scoring
4. **Multi-modal Insights**: Analyze code patterns, not just text
5. **Confidence Decay**: Reduce confidence of old insights over time

---

**Demo this system to judges and you'll win the Self-Improving Agent track!** 🏆

