# Prompt Reference Guide - Copy from Existing Agents

This guide helps you quickly find and copy the proven prompts from existing Supabase Edge Functions.

## 🔍 Weave Tracing Integration

**IMPORTANT**: All AI model calls (LearnLM, Perplexity, Qwen3 Coder) will use Weave for tracing and debugging.

```python
import weave

# Initialize Weave once in main.py
weave.init("tutorpilot-weavehacks")

# Wrap ALL AI functions with @weave.op() decorator
@weave.op()
async def call_google_learnlm(prompt: str) -> str:
    # Your implementation
    pass

@weave.op()
async def call_perplexity(prompt: str) -> str:
    # Your implementation
    pass

@weave.op()
async def call_qwen3_coder(prompt: str) -> str:
    # Your implementation
    pass

# This automatically traces:
# - Input prompts
# - Output responses
# - Execution time
# - Token usage
# - All parameters
```

**Benefits for Demo**:
- Show judges the agent's decision-making process
- Debug evaluation reasoning in real-time
- Visualize improvement over generations
- Track prompt adaptations

---

## Strategy Planner Prompts

### 1. Query Generation (From strategy-planner/index.ts)

**Location**: Lines 180-220 (approximate)

**What to copy**: Prompt for generating weekly learning topics

**Python adaptation**:
```python
def build_strategy_query_prompt(student, tutor, subject, weeks):
    return f"""You are an expert curriculum designer creating a {weeks}-week learning strategy.

STUDENT PROFILE:
- Name: {student['name']}
- Grade: {student['grade']}
- Learning Style: {student.get('learning_style', 'Mixed')}
- Interests: {', '.join(student.get('interests', []))}
- Objectives: {', '.join(student.get('objectives', []))}
- Cultural Context: {student.get('nationality', 'International')}

TUTOR PROFILE:
- Teaching Style: {tutor.get('teaching_style', 'Adaptive')}
- Education System: {tutor.get('education_system', 'Standard')}

SUBJECT: {subject}

Generate {weeks} weekly topics that:
1. Build progressively in complexity (scaffolding)
2. Align with the education system curriculum
3. Connect to student's interests
4. Address stated learning objectives
5. Are culturally relevant

Return JSON format:
{{
  "weeks": [
    {{
      "week_number": 1,
      "topic": "Clear, engaging topic",
      "focus_area": "Specific skill or concept",
      "learning_objectives": ["Objective 1", "Objective 2"],
      "key_concepts": ["Concept 1", "Concept 2"]
    }}
  ]
}}
"""
```

### 2. Strategy Generation (Main Prompt)

**Location**: strategy-planner/index.ts, lines 350-500 (approximate)

**Key sections to copy**:
- Weekly module structure
- Activity suggestions format
- Assessment criteria
- Cultural adaptation notes

**Python adaptation**:
```python
def build_strategy_generation_prompt(
    student, 
    tutor, 
    week_topics, 
    knowledge_contexts,
    learning_insights  # NEW: From self-improvement
):
    insights_section = ""
    if learning_insights:
        insights_section = f"""
IMPORTANT LEARNINGS FROM PREVIOUS STRATEGY GENERATIONS:
{format_insights_for_prompt(learning_insights)}

⚠️ Based on past evaluations, ensure your strategy:
- Avoids the weaknesses identified above
- Incorporates the successful patterns
- Addresses the specific optimization opportunities
"""

    return f"""You are a master educator designing a comprehensive learning strategy.

{insights_section}

STUDENT PROFILE:
- Name: {student['name']}
- Grade: {student['grade']}
- Learning Style: {student.get('learning_style', 'Mixed')}
- Interests: {', '.join(student.get('interests', []))}
- Cultural Background: {student.get('nationality')}

TUTOR CONTEXT:
- Teaching Style: {tutor.get('teaching_style')}
- Education System: {tutor.get('education_system')}

WEEKLY TOPICS WITH RESEARCH:
{format_knowledge_contexts(week_topics, knowledge_contexts)}

CREATE A COMPREHENSIVE {len(week_topics)}-WEEK STRATEGY:

For each week, provide:

1. **Learning Objectives** (3-4 objectives using Bloom's Taxonomy)
   - Mix of understand, apply, analyze levels
   - Aligned with curriculum standards

2. **Key Concepts** (4-6 core concepts)
   - Build on previous weeks
   - Connect to student interests where possible

3. **Activities** (4-6 diverse activities)
   - Mix of: exploration, practice, application, reflection
   - Include: readings (with URLs from research), hands-on tasks, discussions
   - Culturally responsive and engaging

4. **Assessment Methods** (2-3 checkpoints)
   - Formative assessments throughout
   - Clear success criteria

5. **Resources** (from the research provided)
   - Embed credible source URLs
   - Mix of interactive, visual, and reading materials

6. **Cultural Adaptations**
   - How to respect student's cultural context
   - Communication style adjustments

Return comprehensive JSON structure with all weeks.
"""

def format_knowledge_contexts(week_topics, knowledge_contexts):
    """Format the research from Layer 1 for inclusion in prompt"""
    result = []
    for i, (topic, context) in enumerate(zip(week_topics, knowledge_contexts)):
        result.append(f"""
Week {i+1}: {topic['topic']}
Focus: {topic['focus_area']}

RESEARCH CONTEXT:
{context['explanation'][:1000]}...  # Truncate if too long

CREDIBLE SOURCES:
{format_sources(context['sources'])}
""")
    return "\n---\n".join(result)
```

---

## Lesson Creator Prompts

### 3. 5E Lesson Prompt

**Location**: lesson-creator/index.ts, lines 497-683

**What to copy**: The entire 5E framework structure

**Python adaptation**:
```python
def build_lesson_prompt(
    student,
    tutor,
    topic,
    duration,
    knowledge_context,
    learning_insights  # NEW
):
    insights_section = ""
    if learning_insights:
        insights_section = f"""
LEARNINGS FROM PREVIOUS LESSON GENERATIONS:
{format_insights_for_prompt(learning_insights)}
"""

    attention_span = 15  # Default, can load from memory
    
    return f"""You are a master teacher designing an active learning lesson using the 5E model.

{insights_section}

STUDENT PROFILE:
- Name: {student['name']}
- Grade: {student['grade']}
- Learning Style: {student.get('learning_style', 'Visual')}
- Interests: {', '.join(student.get('interests', []))}
- Attention Span: {attention_span} minutes

TUTOR:
- Teaching Style: {tutor.get('teaching_style')}
- Tools Available: {tutor.get('tools', 'Standard materials')}

TOPIC: {topic}
DURATION: {duration} minutes

RESEARCH CONTEXT:
{knowledge_context['explanation']}

CREDIBLE SOURCES:
{format_sources(knowledge_context['sources'])}

---

DESIGN A 5E LESSON:

**1. ENGAGE (5 mins)**: Hook that creates curiosity
- Connect to student interest: {student.get('interests', ['general topics'])[0]}
- Create cognitive dissonance or curiosity gap
- Example: [Provide specific hook idea]

**2. EXPLORE ({int(duration * 0.25)} mins)**: Student-led discovery
- Guided investigation activity
- Chunk into {attention_span}-minute segments
- Materials: [List specific materials]
- Scaffolding: [How you'll support]

**3. EXPLAIN ({int(duration * 0.2)} mins)**: Concept clarification
- Student explanations first, then teacher refinement
- Visual aids for {student.get('learning_style', 'visual')} learners
- Key concepts: [List 3-4 concepts]

**4. ELABORATE ({int(duration * 0.3)} mins)**: Application
- Real-world connections to {', '.join(student.get('interests', [])[:2])}
- Practice activities with differentiation
- Optional peer interaction

**5. EVALUATE ({int(duration * 0.15)} mins)**: Assessment & reflection
- Formative assessment checkpoints
- Metacognitive reflection questions
- Preview next session

Include:
- Materials needed (with URLs from research)
- Formative assessment strategies
- Differentiation for struggling/advanced learners
- Cultural adaptations

Return detailed JSON with all 5 phases.
"""
```

---

## Activity Creator Prompts

**NOTE**: Activity Creator now generates interactive React web pages instead of traditional activity descriptions. All activities are delivered as live, deployable web apps in Daytona sandboxes.

### 4. Simple Activity Description (For Non-Code Activities - Optional)

If you need to generate a simple activity description without code (e.g., for offline activities or physical experiments), use this prompt. However, **prioritize the React Activity Generator** below for maximum impact.

**Location**: activity-creator/index.ts, lines 491-723 (adapted)

**Python adaptation** (Use only if NOT generating React code):
```python
def build_simple_activity_prompt(
    student,
    activity_request,
    duration,
    knowledge_context,
    learning_insights  # NEW
):
    insights_section = ""
    if learning_insights:
        insights_section = f"""
LEARNINGS FROM PREVIOUS ACTIVITY GENERATIONS:
{format_insights_for_prompt(learning_insights)}
"""

    return f"""You are an expert activity designer specializing in flow state and gamified learning.

{insights_section}

ACTIVITY REQUEST: "{activity_request}"

STUDENT PROFILE:
- Name: {student['name']}
- Grade: {student['grade']}
- Learning Style: {student.get('learning_style')}
- Interests: {', '.join(student.get('interests', []))}

DURATION: {duration} minutes

RESEARCH CONTEXT:
{knowledge_context['explanation']}

CREDIBLE SOURCES:
{format_sources(knowledge_context['sources'])}

---

DESIGN FOR ACTIVE LEARNING & GAMIFICATION:

1. **Hook (Curiosity Driver)**: Start with an intriguing question or challenge
2. **Clear Goals**: Specific, measurable objectives
3. **Gamification**: Points, badges, progress tracking, or competitive elements
4. **Immediate Feedback**: Built-in self-check mechanisms
5. **Challenge Balance**: Appropriate difficulty with hints available
6. **Intrinsic Motivation**: Connect to {student.get('interests', ['interests'])[0]}

ACTIVITY STRUCTURE:

**Introduction (2 mins)**: Hook that creates curiosity
- Surprising fact or provocative question
- Connect to student interest: {student.get('interests', ['general topics'])[0]}

**Main Activity ({duration - 5} mins)**: Interactive learning experience
- Multiple interaction points
- Gamified elements (scoring, levels, achievements)
- Choice points for autonomy
- Progress tracking
- Hints system for support

**Reflection (3 mins)**: Metacognitive wrap-up
- Self-assessment questions
- Achievement recognition
- Connection to real-world applications

Include:
- Materials needed (with URLs from research)
- Gamification mechanics (points, badges, etc.)
- Differentiation for different skill levels
- Success metrics and assessment

Return comprehensive JSON with all activity details.
"""
```

**NOTE**: This prompt is secondary. The **primary approach** is to generate React code using the prompt below.

### 5. React Activity Generation Prompt (NEW for WaveHacks)

**Python implementation**:
```python
def build_react_activity_prompt(
    topic,
    grade,
    activity_description,
    knowledge_context,
    student
):
    """Generate prompt for Qwen3 Coder to create React-based educational activity"""
    
    return f"""Generate a complete, interactive React web page for an educational activity.

TOPIC: {topic}
STUDENT GRADE: {grade}
STUDENT INTERESTS: {', '.join(student.get('interests', []))}

ACTIVITY DESCRIPTION: {activity_description}

EDUCATIONAL CONTEXT:
{knowledge_context['explanation'][:1000]}

---

DESIGN PHILOSOPHY - CREATE A FUN, MEMORABLE LEARNING EXPERIENCE:

Your goal is to create an engaging, interactive educational experience that feels like a game, simulation, or adventure - NOT a traditional worksheet or quiz. Think of this as building an educational game or interactive exploration tool.

**ACTIVITY TYPES TO INSPIRE YOU** (Choose what fits best):

1. **Interactive Simulations**: 
   - Scientific phenomena visualization (physics, chemistry, biology)
   - Mathematical concept explorers (geometry, algebra, calculus)
   - Historical event simulators or timelines
   - Economic/social system models

2. **Educational Games**:
   - Puzzle-based learning (solve to progress)
   - Strategy games teaching concepts
   - Adventure/quest games with educational challenges
   - Building/construction games (molecules, circuits, ecosystems)

3. **Role-Playing Scenarios**:
   - Historical figure perspectives
   - Scientific method investigations
   - Literary character journeys
   - Professional role simulations (scientist, engineer, historian)

4. **Interactive Laboratories**:
   - Virtual experiments with variables
   - Data collection and analysis tools
   - Hypothesis testing environments
   - Creative design studios

5. **Story-Driven Explorations**:
   - Narrative with educational decision points
   - Mystery-solving with clues based on concepts
   - Journey through historical events
   - Character-driven concept explanations

---

**ENGAGEMENT PRINCIPLES** (Make it FUN, not just educational):

1. **Intrinsic Motivation** (not just points):
   - Curiosity-driven exploration (discover secrets, unlock mysteries)
   - Meaningful choices that affect outcomes
   - Creative expression opportunities
   - Sense of mastery and progression
   - Surprising "aha!" moments
   - Emotional connection to content

2. **Game Feel** (what makes it enjoyable):
   - Smooth, responsive interactions
   - Satisfying visual/audio feedback
   - Delightful animations and transitions
   - Sense of agency and control
   - Clear but non-linear progression
   - Replayability with different outcomes
   - Easter eggs or hidden features

3. **Active Learning Integration**:
   - Learning happens through DOING, not reading
   - Concepts emerge from experimentation
   - Students discover patterns themselves
   - Immediate visual feedback shows cause-effect
   - Multiple paths to understanding
   - Mistakes are interesting, not punishing

4. **Engagement Hooks** (optional, use what fits):
   - Progress indicators (if it enhances experience)
   - Achievement recognition (meaningful milestones, not arbitrary points)
   - Unlockable content (new features, areas, or tools)
   - Narrative progression (story unfolds as they learn)
   - Challenge modes (optional harder versions)
   - Customization options (choose colors, characters, approaches)

---

**DESIGN REQUIREMENTS:**

1. **Educational Goals**:
   - Clear learning objective (but don't make it feel like homework!)
   - Concepts integrated naturally into gameplay/interaction
   - Multiple difficulty levels or adaptive complexity
   - Opportunities for exploration beyond basics
   - Self-assessment without feeling like a test

2. **Interaction Design**:
   - Rich interactivity (not just click-to-advance)
   - Responsive to user input with immediate feedback
   - Multiple ways to interact (drag, click, type, slider, etc.)
   - Intuitive controls that don't need heavy instructions
   - Visual/animated feedback for all actions

3. **Visual Design**:
   - Beautiful, modern aesthetics with Tailwind CSS
   - Clear visual hierarchy
   - Engaging graphics and animations
   - Responsive layout (tablet/laptop friendly)
   - Culturally appropriate design choices

4. **Code Structure**:
   - Modern React with hooks (useState, useEffect, useCallback, etc.)
   - Clean component architecture
   - Smooth animations (CSS transitions or Framer Motion concepts)
   - Proper state management
   - **NO LINE LIMIT** - build something comprehensive!

---

**CREATIVE FREEDOM - BE INNOVATIVE:**

✨ **Think beyond traditional education**:
- This should feel like a mini-game or interactive experience
- Use storytelling, narrative, or scenarios
- Create a sense of discovery and wonder
- Make failures interesting (not discouraging)
- Add personality and humor where appropriate
- Include unexpected delightful details

🎨 **Technical possibilities**:
- Canvas API for custom graphics and animations
- SVG for interactive diagrams
- CSS animations for smooth transitions
- Drag-and-drop mechanics
- Interactive charts/graphs
- Timer-based challenges (if they add fun)
- Random variations for replayability

🌍 **Cultural adaptation**:
- Consider student's background: {student.get('nationality', 'International')}
- Use examples relevant to their interests: {', '.join(student.get('interests', [])[:2])}
- Adapt metaphors and scenarios appropriately

---

EXAMPLE CONCEPTS (for inspiration, adapt as needed):

**Chemistry - Molecular Building Game**:
- Drag atoms to form molecules
- Watch bonds form with animations
- Molecules react when combined correctly
- Unlock new atoms as you progress
- Visual effects show energy changes
- Challenge: Build specific compounds

**Physics - Projectile Motion Playground**:
- Adjust angle, velocity, gravity
- Watch trajectory in real-time
- Hit targets in creative ways
- Different environments (moon, earth, jupiter)
- Visual trails show previous attempts
- Discover optimal solutions

**History - Interactive Timeline Adventure**:
- Navigate through historical events
- Make decisions as historical figures
- See consequences unfold
- Multiple storylines based on choices
- Rich illustrations and context
- Discover hidden historical facts

**Math - Geometric Puzzle Constructor**:
- Build shapes to solve problems
- Visual proofs through manipulation
- Pattern discovery through play
- Increasing complexity
- Beautiful animations of transformations
- Multiple solution approaches

---

**EXAMPLE CODE STRUCTURE** (Chemistry Bonding Activity):

```jsx
import React, { useState, useEffect, useCallback } from 'react';

/**
 * Interactive Molecular Building Game
 * Students learn about chemical bonding by creating molecules
 */
export default function MolecularBuildingGame() {
  // Game state
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [createdMolecules, setCreatedMolecules] = useState([]);
  const [currentEnvironment, setCurrentEnvironment] = useState('lab');
  const [discoveredFacts, setDiscoveredFacts] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [bondAnimation, setBondAnimation] = useState(null);

  // Available atoms that unlock as you progress
  const [unlockedAtoms, setUnlockedAtoms] = useState(['H', 'O', 'C']);
  
  const atoms = {
    H: { name: 'Hydrogen', electrons: 1, color: 'from-red-400 to-red-600', bonds: 1 },
    O: { name: 'Oxygen', electrons: 8, color: 'from-blue-400 to-blue-600', bonds: 2 },
    C: { name: 'Carbon', electrons: 6, color: 'from-gray-600 to-gray-800', bonds: 4 },
    N: { name: 'Nitrogen', electrons: 7, color: 'from-cyan-400 to-cyan-600', bonds: 3 },
    Cl: { name: 'Chlorine', electrons: 17, color: 'from-green-400 to-green-600', bonds: 1 },
    Na: { name: 'Sodium', electrons: 11, color: 'from-yellow-400 to-yellow-600', bonds: 1 }
  };

  // Handle atom selection with visual feedback
  const handleAtomClick = useCallback((symbol) => {
    setSelectedAtoms(prev => [...prev, symbol]);
    
    // Animate the atom being added
    setBondAnimation(symbol);
    setTimeout(() => setBondAnimation(null), 500);
    
    // Check if atoms can bond after selection
    checkForBonding([...selectedAtoms, symbol]);
  }, [selectedAtoms]);

  // Check if selected atoms can form a molecule
  const checkForBonding = (atoms) => {
    const molecule = detectMolecule(atoms);
    
    if (molecule) {
      // Success! Molecule formed
      setCreatedMolecules(prev => [...prev, molecule]);
      setSelectedAtoms([]);
      celebrateMolecule(molecule);
      
      // Unlock new atoms based on progress
      if (createdMolecules.length === 2 && !unlockedAtoms.includes('N')) {
        setUnlockedAtoms(prev => [...prev, 'N']);
        showDiscovery("🎉 Nitrogen unlocked! Try making ammonia!");
      }
    }
  };

  // Visual celebration when molecule is created
  const celebrateMolecule = (molecule) => {
    // Show educational fact about the molecule
    const fact = getMoleculeFact(molecule);
    setDiscoveredFacts(prev => [...prev, fact]);
    
    // Trigger particle effects (implement with CSS animations)
    document.getElementById('celebration')?.classList.add('animate-burst');
  };

  // Detect what molecule the atoms form
  const detectMolecule = (atoms) => {
    const sorted = atoms.sort().join('');
    
    const molecules = {
      'HHO': { name: 'Water', formula: 'H₂O', fact: 'Water is essential for life!' },
      'HHH': { name: 'Hydrogen Gas', formula: 'H₂', fact: 'Lightest element!' },
      'CO': { name: 'Carbon Monoxide', formula: 'CO', fact: 'Careful - this is toxic!' },
      'CCO': { name: 'Carbon Dioxide', formula: 'CO₂', fact: 'Plants need this!' },
      // ... more molecules
    };
    
    return molecules[sorted] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-white">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-5xl font-bold mb-2 animate-fade-in">
          ⚛️ Molecular Laboratory
        </h1>
        <p className="text-xl text-purple-200">
          Build molecules and discover chemistry!
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* Left: Atom Selection */}
        <div className="col-span-2 space-y-6">
          {/* Workspace where atoms are combined */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">🧪 Your Workspace</h2>
            
            <div className="min-h-40 bg-black/30 rounded-xl p-6 flex items-center justify-center gap-4">
              {selectedAtoms.length === 0 ? (
                <p className="text-gray-400">Click atoms below to start building...</p>
              ) : (
                selectedAtoms.map((symbol, i) => (
                  <div key={i} className="relative animate-pop-in">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${atoms[symbol].color} 
                      flex items-center justify-center text-3xl font-bold shadow-xl
                      ${bondAnimation === symbol ? 'animate-bounce' : ''}`}>
                      {symbol}
                    </div>
                    {i < selectedAtoms.length - 1 && (
                      <div className="absolute top-1/2 -right-6 w-12 h-1 bg-yellow-400 animate-pulse" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Hint system */}
            {selectedAtoms.length > 0 && !showHint && (
              <button 
                onClick={() => setShowHint(true)}
                className="mt-4 text-yellow-300 hover:text-yellow-100 transition-colors"
              >
                💡 Need a hint?
              </button>
            )}
            
            {showHint && (
              <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p>Try different combinations! Each atom can form a certain number of bonds.</p>
              </div>
            )}
          </div>

          {/* Available atoms */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Available Atoms</h3>
            <div className="grid grid-cols-3 gap-4">
              {unlockedAtoms.map(symbol => (
                <button
                  key={symbol}
                  onClick={() => handleAtomClick(symbol)}
                  className="group relative"
                >
                  <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${atoms[symbol].color}
                    flex flex-col items-center justify-center shadow-xl
                    transform transition-all hover:scale-110 hover:shadow-2xl
                    cursor-pointer border-4 border-transparent hover:border-white`}>
                    <div className="text-4xl font-bold">{symbol}</div>
                    <div className="text-xs mt-1">{atoms[symbol].name}</div>
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                    opacity-0 group-hover:opacity-100 transition-opacity
                    bg-black/90 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    {atoms[symbol].electrons} electrons • Forms {atoms[symbol].bonds} bond(s)
                  </div>
                </button>
              ))}
              
              {/* Locked atoms (shown as mysterious) */}
              {!unlockedAtoms.includes('N') && (
                <div className="w-full aspect-square rounded-2xl bg-gray-800/50
                  flex items-center justify-center border-2 border-dashed border-gray-600">
                  <span className="text-4xl">🔒</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Progress & Discoveries */}
        <div className="space-y-6">
          {/* Created molecules */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">✨ Your Molecules</h3>
            <div className="space-y-3">
              {createdMolecules.length === 0 ? (
                <p className="text-gray-400 text-sm">Create your first molecule!</p>
              ) : (
                createdMolecules.map((mol, i) => (
                  <div key={i} className="bg-green-500/20 rounded-lg p-3 border border-green-500/50 animate-slide-in">
                    <div className="font-bold text-lg">{mol.formula}</div>
                    <div className="text-sm text-green-200">{mol.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Discovered facts */}
          {discoveredFacts.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">📚 Did You Know?</h3>
              <div className="space-y-2">
                {discoveredFacts.slice(-3).map((fact, i) => (
                  <p key={i} className="text-sm text-purple-200 animate-fade-in">
                    • {fact}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebration effect container */}
      <div id="celebration" className="fixed inset-0 pointer-events-none" />
    </div>
  );
}

// Helper functions would be implemented here
function getMoleculeFact(molecule) {
  return molecule.fact;
}

function showDiscovery(message) {
  // Implement toast notification or modal
  alert(message); // Replace with better UI
}
```

---

**OUTPUT FORMAT:**

Generate a COMPLETE, self-contained React component that creates an engaging educational experience. Your output should include:

1. **All necessary imports** (React hooks, any helpers)
2. **Main component** with thoughtful state management
3. **Game/simulation logic** that makes concepts discoverable
4. **Rich interactivity** (not just click-to-advance)
5. **Visual feedback** (animations, transitions, effects)
6. **Natural learning integration** (concepts emerge from play)
7. **Beautiful UI** with Tailwind CSS (modern, polished)
8. **Helpful comments** explaining educational intent and mechanics

**STRUCTURE FREEDOM:**

- NO REQUIRED STRUCTURE - design what makes sense for the activity!
- Could be: game with levels, open sandbox, story-driven, puzzle-based, etc.
- Avoid rigid "stage 1, stage 2" patterns unless they truly fit
- Let the activity type guide the structure naturally

**IMPORTANT CONSTRAINTS:**

✅ **Use**:
- React with hooks (useState, useEffect, useCallback, useMemo, etc.)
- Tailwind CSS for styling
- Modern JavaScript/JSX features
- CSS animations and transitions
- Canvas API or SVG for custom graphics (if helpful)

❌ **Don't use**:
- External libraries (no axios, no framer-motion, etc.)
- API calls or data fetching
- File system access
- localStorage (should work in sandbox)
- Dangerous operations

⚠️ **Safety Requirements**:
- Must run safely in Daytona sandbox
- No security vulnerabilities
- Handles edge cases gracefully
- Production-ready code quality

🎯 **Educational Requirements**:
- Concepts must be scientifically/historically accurate
- Age-appropriate for grade level
- Multiple ways to discover the main concepts
- Engaging without sacrificing educational value

---

**FINAL REMINDER - THIS IS THE MOST IMPORTANT PART:**

🌟 **Make it FUN first, educational second.** If students don't want to engage with it, they won't learn. Create something they'll actually WANT to use, then ensure the learning happens naturally through interaction.

Think: "What would make ME want to play/explore this?" then add the educational content into that experience.

The best educational activities don't feel like learning - they feel like play, discovery, or adventure.

**BE BOLD. BE CREATIVE. MAKE SOMETHING MEMORABLE!** 🚀
"""
```

---

### 6. Code Error Fixing Prompt (NEW - Self-Debugging Loop)

After deploying generated code to Daytona sandbox, check for errors and fix them automatically.

**Python implementation**:
```python
def build_code_fix_prompt(
    original_code: str,
    error_logs: str,
    topic: str,
    attempt_number: int
):
    """Generate prompt for fixing code errors from sandbox"""
    
    return f"""You are debugging React code that was deployed to a sandbox and encountered errors.

ORIGINAL TOPIC: {topic}
ATTEMPT NUMBER: {attempt_number}/3

DEPLOYED CODE:
```jsx
{original_code[:2000]}...  # Show relevant portion
```

ERROR LOGS FROM SANDBOX:
```
{error_logs}
```

---

**YOUR TASK**: Fix the code to eliminate ALL errors while maintaining the educational and interactive experience.

**DEBUGGING APPROACH**:

1. **Analyze the Error**:
   - Identify the root cause (syntax error, logic error, missing imports, etc.)
   - Check if it's a React-specific issue (hooks, state, lifecycle)
   - Look for Tailwind CSS class issues
   - Check for JavaScript errors (undefined variables, type mismatches)

2. **Fix Strategy**:
   - Make MINIMAL changes to fix the error
   - Don't remove features - fix them properly
   - Ensure all state updates are correct
   - Verify all event handlers are properly bound
   - Check all conditional rendering logic

3. **Common Issues to Watch For**:
   - Missing dependencies in useEffect
   - Incorrect hook usage (calling hooks conditionally)
   - Unescaped characters in JSX
   - Missing closing tags
   - Incorrect prop types
   - Using undefined variables
   - Math operations on undefined/null values

4. **Testing Mentally**:
   - Walk through the user flow
   - Verify all interactive elements work
   - Check edge cases (empty states, boundary conditions)
   - Ensure no infinite loops or memory leaks

**OUTPUT**: 

Return the COMPLETE, FIXED React component code. Include:
- All necessary fixes for the reported errors
- Comments explaining what was fixed and why
- Any additional defensive programming to prevent similar errors
- The full, working component (don't truncate)

**IMPORTANT**: 
- Fix the actual problem, don't just remove features
- Maintain ALL the educational and interactive elements
- Keep the code quality high
- The fixed code must run without errors

```jsx
// Your fixed code here
```
"""

# Usage in Activity Creator flow:
async def generate_and_deploy_activity(
    student_id: str,
    topic: str,
    activity_description: str,
    max_attempts: int = 3
):
    """Generate activity with automatic error fixing"""
    
    # Step 1: Generate initial code
    code = await generate_activity_code(topic, student_id, activity_description)
    
    # Step 2: Deploy to sandbox and check for errors
    for attempt in range(1, max_attempts + 1):
        print(f"Deployment attempt {attempt}/{max_attempts}")
        
        # Deploy to Daytona
        sandbox = await daytona_service.create_sandbox(
            code=code,
            language="javascript",
            dependencies=["react", "react-dom"],
            student_id=student_id
        )
        
        # Wait a moment for sandbox to initialize
        await asyncio.sleep(5)
        
        # Check for errors
        error_logs = await daytona_service.get_sandbox_logs(sandbox['sandbox_id'])
        
        if not has_errors(error_logs):
            print(f"✅ Activity deployed successfully on attempt {attempt}")
            # Store success in activity record
            return {
                "code": code,
                "sandbox_url": sandbox['url'],
                "sandbox_id": sandbox['sandbox_id'],
                "attempts": attempt,
                "status": "success"
            }
        
        print(f"⚠️ Errors found on attempt {attempt}:")
        print(error_logs[:500])
        
        if attempt < max_attempts:
            # Fix the errors
            print("🔧 Attempting to fix errors...")
            fixed_code = await fix_code_errors(code, error_logs, topic, attempt)
            
            # Store the fix attempt in memory for learning
            await store_code_fix_attempt(
                original_code=code,
                fixed_code=fixed_code,
                error_logs=error_logs,
                success=(attempt + 1 < max_attempts)  # Will know on next iteration
            )
            
            code = fixed_code
            
            # Delete failed sandbox before retry
            await daytona_service.delete_sandbox(sandbox['sandbox_id'])
        else:
            print(f"❌ Failed to fix errors after {max_attempts} attempts")
            # Return with error status but keep the last attempted code
            return {
                "code": code,
                "sandbox_url": None,
                "sandbox_id": None,
                "attempts": attempt,
                "status": "failed",
                "error_logs": error_logs
            }

async def fix_code_errors(code: str, error_logs: str, topic: str, attempt: int) -> str:
    """Use Qwen3 Coder to fix errors"""
    
    fix_prompt = build_code_fix_prompt(code, error_logs, topic, attempt)
    
    # Call Qwen3 Coder with the fix prompt (traced with Weave)
    fixed_code = await call_qwen3_coder(fix_prompt)
    
    # Extract code from response
    fixed_code = extract_code_block(fixed_code)
    
    return fixed_code

def has_errors(logs: str) -> bool:
    """Check if sandbox logs contain errors"""
    error_indicators = [
        'Error:',
        'SyntaxError:',
        'TypeError:',
        'ReferenceError:',
        'Failed to compile',
        'Module not found',
        'Uncaught'
    ]
    
    return any(indicator in logs for indicator in error_indicators)

async def store_code_fix_attempt(
    original_code: str,
    fixed_code: str,
    error_logs: str,
    success: bool
):
    """Store fix attempt in platform_memory for learning"""
    
    await supabase.table('platform_memory').insert({
        'entity_type': 'content',
        'entity_id': f'code_fix_{datetime.now().isoformat()}',
        'memory_category': 'code_debugging',
        'memory_key': 'fix_attempt',
        'memory_value': {
            'error_type': extract_error_type(error_logs),
            'fix_applied': get_code_diff_summary(original_code, fixed_code),
            'success': success
        },
        'confidence_score': 0.8 if success else 0.4,
        'created_at': datetime.now().isoformat()
    }).execute()
```

**Benefits of Error-Fixing Loop**:
1. ✅ **Self-Healing**: Agent fixes its own mistakes automatically
2. ✅ **Learning**: Stores successful fixes in memory
3. ✅ **Reliability**: Users get working activities, not broken code
4. ✅ **Demo Value**: Shows judges the agent can debug itself
5. ✅ **Self-Improvement**: Common error patterns inform future generations

---

## Self-Evaluation Prompts (NEW)

### 6. Strategy Evaluation Prompt

**Python implementation**:
```python
def build_evaluation_prompt(content, content_type, student):
    """Generate prompt for self-evaluation"""
    
    criteria = {
        "strategy": [
            "Pedagogical Soundness: Follows learning science principles",
            "Cultural Appropriateness: Respects student's cultural background",
            "Engagement Potential: Likely to maintain student interest",
            "Clarity: Clear learning objectives and outcomes",
            "Feasibility: Realistic within time and resource constraints",
            "Progression: Appropriate scaffolding and difficulty curve"
        ],
        "lesson": [
            "5E Structure: Properly implements Engage-Explore-Explain-Elaborate-Evaluate",
            "Active Learning: Incorporates student-centered activities",
            "Differentiation: Addresses diverse learning needs",
            "Assessment: Clear formative assessment strategies",
            "Engagement: Likely to maintain attention and motivation",
            "Feasibility: Realistic within time constraints"
        ],
        "activity": [
            "Flow State Design: Incorporates clear goals, feedback, appropriate challenge",
            "Engagement: Strong hooks, gamification, and intrinsic motivation",
            "Educational Value: Clear learning objectives with active learning principles",
            "Code Quality: Clean React code, responsive design, no bugs (for React activities)",
            "Interactivity: Multiple interactive elements with immediate feedback",
            "Creativity: Innovative approach that makes learning fun and memorable"
        ]
    }
    
    return f"""You are a pedagogical expert evaluating AI-generated educational content.

CONTENT TYPE: {content_type.upper()}

CONTENT TO EVALUATE:
{json.dumps(content, indent=2)[:2000]}...

STUDENT CONTEXT:
- Grade: {student['grade']}
- Learning Style: {student.get('learning_style', 'Mixed')}
- Cultural Background: {student.get('nationality', 'International')}
- Interests: {', '.join(student.get('interests', []))}

---

EVALUATION CRITERIA (rate each 1-10):

{chr(10).join(f"{i+1}. **{criterion}**" for i, criterion in enumerate(criteria[content_type]))}

For EACH criterion:
- Give a numeric score (1-10)
  - 1-3: Poor, major issues
  - 4-6: Fair, significant improvements needed
  - 7-8: Good, minor improvements possible
  - 9-10: Excellent, minimal changes needed
- Provide 1-2 sentence reasoning
- Be CRITICAL - identify real weaknesses

Also provide:
1. **Overall Score** (average of criteria scores)
2. **3 Specific Weaknesses** (be concrete, not vague)
3. **3 Concrete Improvements** (actionable suggestions)

BE HONEST: Most first-generation content scores 6-8. Don't give 9-10 unless truly excellent.

Return ONLY valid JSON:
{{
  "overall_score": 7.5,
  "criteria": {{
    "{criteria[content_type][0].split(':')[0].lower().replace(' ', '_')}": {{
      "score": 8,
      "reasoning": "Specific reasoning here"
    }},
    ...
  }},
  "weaknesses": [
    "Concrete weakness 1",
    "Concrete weakness 2",
    "Concrete weakness 3"
  ],
  "improvements": [
    "Actionable improvement 1",
    "Actionable improvement 2",
    "Actionable improvement 3"
  ],
  "confidence": 0.85
}}
"""
```

---

## Helper Functions

### Format Insights for Prompts

```python
def format_insights_for_prompt(insights: List[dict]) -> str:
    """Format learning insights for inclusion in generation prompts"""
    
    if not insights:
        return "No previous learnings available."
    
    result = []
    for insight in insights[:5]:  # Top 5 most relevant
        result.append(f"""
📊 **{insight['insight_type'].replace('_', ' ').title()}**
   Description: {insight['description']}
   Applicability: {json.dumps(insight['applicability'])}
   Evidence Count: {len(insight.get('supporting_evidence', []))}
""")
    
    return "\n".join(result)

def format_sources(sources: List[dict]) -> str:
    """Format research sources for prompts"""
    
    result = []
    for i, source in enumerate(sources[:6], 1):
        result.append(f"""
{i}. **{source['title']}**
   URL: {source['url']}
   Description: {source.get('description', 'N/A')}
   Credibility: {source.get('credibility_score', 0.8):.0%}
""")
    
    return "\n".join(result)
```

---

## Quick Copy Checklist

When implementing each agent:

- [ ] Copy base prompt structure from existing agent
- [ ] Add insights section at the top (NEW for self-improvement)
- [ ] Adapt variable names from TypeScript to Python
- [ ] Replace template literals with f-strings
- [ ] Keep educational frameworks intact (5E, Bloom's, etc.)
- [ ] Include research context from Layer 1
- [ ] Add self-evaluation call after generation
- [ ] Store evaluation in `agent_performance_metrics`
- [ ] **Wrap all AI functions with `@weave.op()` decorator for tracing**

---

## Summary: Key Changes for WaveHacks 2

### What Changed from Original Implementation

| Aspect | Original | WaveHacks 2 Version |
|--------|----------|-------------------|
| **Activity Output** | Text descriptions | Interactive React web pages |
| **Code Length** | Limited to <200 lines | **NO LIMIT** - build comprehensive activities |
| **Gamification** | Mentioned | **Core requirement** - must include game elements |
| **Active Learning** | Suggested | **Mandatory integration** in all activities |
| **Tracing** | Basic logs | **Weave tracing** on all AI calls |
| **Deployment** | N/A | **Daytona sandboxes** for live code execution |
| **Creativity** | Constrained | **Encouraged** - be innovative and fun |

### Activity Creator Focus

**Primary Goal**: Generate engaging, interactive React web pages that:
1. ✅ Include gamification (points, badges, progress)
2. ✅ Follow active learning principles (hook, explore, practice, reflect)
3. ✅ Are visually appealing (Tailwind CSS)
4. ✅ Work in sandboxes (no external dependencies)
5. ✅ Make learning FUN and memorable

**Not**: Simple activity descriptions or offline worksheets (unless absolutely necessary)

### Weave Integration Benefits

Using `@weave.op()` on all AI functions gives you:
- 📊 **Visibility**: See all prompts and responses
- 🐛 **Debugging**: Trace why evaluations scored low
- 📈 **Improvement Tracking**: Visualize score increases over time
- 🎯 **Demo Power**: Show judges the agent's reasoning

### Implementation Priority

1. **Strategy Planner** (reuse existing prompts + add insights)
2. **Lesson Creator** (reuse existing 5E framework + add insights)
3. **Activity Creator** (NEW React generation with gamification)
4. **Self-Evaluator** (NEW - critical for self-improvement)
5. **Reflection Loop** (NEW - analyzes patterns and creates insights)

---

**Time Saver**: Don't rewrite prompts from scratch! The existing ones are already well-tested and pedagogically sound. Just adapt the syntax, add self-improvement sections, and wrap with `@weave.op()`.

**Focus on the NEW stuff**: Self-evaluation, React activity generation, and Weave tracing are your differentiators!

