-- TutorPilot WaveHacks 2 - Minimal Schema
-- Only essential tables for 30-hour hackathon

/*
QUICK REFERENCE - Demo Entity IDs for Testing:

STUDENTS:
Alex Chen (Physics, Visual):        b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01
Emma Rodriguez (Chemistry, Kinesthetic): b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02
Yuki Tanaka (Biology, Auditory):   b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03
Omar Hassan (Math, Reading/Writing): b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04
Sofia Kowalski (Science, age 8):   b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05

TUTORS:
Dr. Sarah Johnson: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
Prof. Michael Chen: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22
Ms. Aisha Patel:   a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33

DEMO SESSIONS (for memory testing):
Alex Physics Session:    c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01
Emma Chemistry Session:  c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02
Sofia Science Session:   c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03
Yuki Biology Session:    c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04
Omar Math Session:       c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05

DEMO CONTENT (for effectiveness tracking):
Molecular Bonding Sim:   d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01
Periodic Table Game:     d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02
Projectile Motion React: d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03
*/

-- Core entities
CREATE TABLE tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  teaching_style text,
  education_system text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES tutors(id),
  name text NOT NULL,
  grade text,
  subject text,
  learning_style text,
  nationality text,
  residence text,
  languages jsonb DEFAULT '[]',
  interests jsonb DEFAULT '[]',
  objectives jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Self-improving memory system
CREATE TABLE platform_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar NOT NULL CHECK (entity_type IN ('student', 'session', 'content', 'platform')),
  entity_id uuid NOT NULL,
  memory_category varchar NOT NULL,
  memory_key varchar NOT NULL,
  memory_value jsonb NOT NULL,
  confidence_score numeric DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  update_count integer DEFAULT 1
);

CREATE INDEX idx_platform_memory_entity ON platform_memory(entity_type, entity_id);
CREATE INDEX idx_platform_memory_confidence ON platform_memory(confidence_score);

-- Agent performance tracking (for self-evaluation)
CREATE TABLE agent_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type varchar NOT NULL CHECK (agent_type IN ('strategy_planner', 'lesson_creator', 'activity_creator')),
  agent_id varchar NOT NULL,
  session_id uuid,
  success_rate numeric DEFAULT 1.0 CHECK (success_rate >= 0 AND success_rate <= 1),
  confidence_scores jsonb DEFAULT '[]',
  error_count integer DEFAULT 0,
  last_error text,
  evaluation_details jsonb,  -- Store full self-evaluation
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

CREATE INDEX idx_agent_performance_type ON agent_performance_metrics(agent_type);
CREATE INDEX idx_agent_performance_success ON agent_performance_metrics(success_rate);
CREATE INDEX idx_agent_performance_created ON agent_performance_metrics(created_at DESC);

-- Cross-agent learning insights
CREATE TABLE cross_agent_learning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_detected varchar NOT NULL,
  contributing_agents text[] NOT NULL,
  confidence_score numeric DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  applications jsonb DEFAULT '[]',
  propagation_status varchar DEFAULT 'identified' CHECK (propagation_status IN ('identified', 'testing', 'validated', 'applied', 'deprecated')),
  validation_results jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  usage_count integer DEFAULT 0,
  success_rate numeric DEFAULT 0.0
);

-- Learning insights (optimization opportunities)
CREATE TABLE learning_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type varchar NOT NULL CHECK (insight_type IN ('pattern_recognition', 'effectiveness_correlation', 'cultural_adaptation', 'optimization_opportunity')),
  description text NOT NULL,
  supporting_evidence jsonb DEFAULT '[]',
  applicability jsonb NOT NULL,  -- {"grade_levels": ["9", "10"], "subjects": ["Physics"]}
  validation_required boolean DEFAULT true,
  priority varchar DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status varchar DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'applied', 'deprecated')),
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  applied_at timestamptz
);

CREATE INDEX idx_learning_insights_status ON learning_insights(status);
CREATE INDEX idx_learning_insights_type ON learning_insights(insight_type);

-- Generated content
CREATE TABLE strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  title text NOT NULL,
  description text,
  weeks_count integer DEFAULT 4,
  content jsonb,  -- Full strategy with weeks
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  strategy_id uuid REFERENCES strategies(id),
  title text NOT NULL,
  duration integer DEFAULT 60,
  content jsonb,  -- 5E structure
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES tutors(id),
  student_id uuid REFERENCES students(id),
  lesson_id uuid REFERENCES lessons(id),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('traditional', 'simulation', 'interactive')),
  duration integer DEFAULT 20,
  content jsonb,
  code text,  -- NEW: Generated code for simulations
  language varchar,  -- NEW: 'python', 'javascript'
  sandbox_id varchar,  -- NEW: Daytona sandbox ID
  sandbox_url text,  -- NEW: Daytona sandbox URL
  self_evaluation jsonb,  -- NEW: Self-evaluation scores
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed data for demo (using actual UUIDs)
-- Note: These UUIDs are hardcoded for demo consistency. In production, use gen_random_uuid()

-- Demo Tutors
INSERT INTO tutors (id, name, email, teaching_style, education_system) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Sarah Johnson', 'sarah@demo.com', 'Socratic Method with guided discovery', 'IGCSE'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Prof. Michael Chen', 'michael@demo.com', 'Direct instruction with scaffolding', 'IB'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Ms. Aisha Patel', 'aisha@demo.com', 'Inquiry-based learning', 'CBSE');

-- Demo Students (diverse backgrounds for personalization demo)
INSERT INTO students (id, tutor_id, name, grade, subject, learning_style, nationality, residence, languages, interests, objectives) VALUES
-- Alex Chen - Visual learner, loves space and coding
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alex Chen', '10', 'Physics', 'Visual', 'Singapore', 'Singapore', 
 '["English", "Mandarin", "Malay"]', 
 '["space exploration", "robotics", "coding", "video games", "sci-fi movies"]', 
 '["Ace IGCSE Physics with A*", "Build strong foundation for A-levels", "Understand real-world applications of physics", "Prepare for engineering university"]'),

-- Emma Rodriguez - Kinesthetic learner, creative and hands-on
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Emma Rodriguez', '9', 'Chemistry', 'Kinesthetic', 'USA', 'California', 
 '["English", "Spanish"]', 
 '["environmental science", "cooking", "music", "painting", "sustainability"]', 
 '["Understand molecular structures through hands-on experiments", "Prepare for AP Chemistry", "Connect chemistry to environmental issues", "Improve lab skills"]'),

-- Yuki Tanaka - Auditory learner, loves discussions and explanations
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Yuki Tanaka', '11', 'Biology', 'Auditory', 'Japan', 'Tokyo', 
 '["Japanese", "English"]', 
 '["marine biology", "photography", "anime", "nature documentaries", "conservation"]', 
 '["Excel in IB Biology HL (7/7)", "Research career preparation", "Understand biodiversity and ecosystems", "Strengthen data analysis skills"]'),

-- Omar Hassan - Reading/Writing learner, analytical thinker
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Omar Hassan', '10', 'Mathematics', 'Reading/Writing', 'Egypt', 'Cairo', 
 '["Arabic", "English", "French"]', 
 '["chess", "problem-solving", "architecture", "history", "philosophy"]', 
 '["Master calculus concepts", "Prepare for mathematics olympiad", "Understand proofs and logical reasoning", "Score 95+ in final exams"]'),

-- Sofia Kowalski - Multimodal learner, very engaged but gets distracted
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sofia Kowalski', '8', 'Science', 'Visual/Kinesthetic', 'Poland', 'Warsaw', 
 '["Polish", "English", "German"]', 
 '["animals", "sports", "dance", "youtube", "social media"]', 
 '["Build confidence in science", "Improve focus and study habits", "Prepare for high school", "Connect science to daily life"]');

-- Rich memory entries for personalization demo
INSERT INTO platform_memory (entity_type, entity_id, memory_category, memory_key, memory_value, confidence_score) VALUES

-- Alex Chen memories (Visual learner - space enthusiast)
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'engagement_patterns', 'peak_triggers', 
  '{"data": {"peak_engagement_triggers": ["interactive simulations", "real-world space examples", "hands-on experiments", "coding activities", "visual diagrams", "video demonstrations"]}}', 0.85),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'learning_profile', 'attention_patterns', 
  '{"data": {"attention_span": 18, "optimal_chunk_duration": 15, "energy_patterns": "morning_peak", "preferred_session_time": "9am-11am"}}', 0.80),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'academic_performance', 'strengths_weaknesses',
  '{"data": {"strengths": ["problem-solving", "conceptual understanding", "mathematical applications"], "challenges": ["memorizing formulas", "long text passages", "staying focused on theory"], "breakthrough_moments": ["understood vectors through video game physics example"]}}', 0.82),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'cultural_context', 'learning_preferences',
  '{"data": {"achievement_focused": true, "prefers_structured_approach": true, "values_practical_applications": true, "competitive_mindset": "moderate"}}', 0.78),

-- Emma Rodriguez memories (Kinesthetic - hands-on creative)
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'engagement_patterns', 'peak_triggers', 
  '{"data": {"peak_engagement_triggers": ["lab experiments", "cooking analogies", "group activities", "creative projects", "real-world connections", "movement-based learning"]}}', 0.88),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'learning_profile', 'attention_patterns', 
  '{"data": {"attention_span": 12, "optimal_chunk_duration": 10, "energy_patterns": "afternoon_peak", "needs_movement_breaks": true}}', 0.83),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'academic_performance', 'strengths_weaknesses',
  '{"data": {"strengths": ["hands-on experiments", "creative thinking", "making connections"], "challenges": ["abstract concepts", "memorization", "sitting still for long periods"], "breakthrough_moments": ["understood pH through cooking/baking chemistry"]}}', 0.85),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'engagement_patterns', 'disengagement_signals',
  '{"data": {"disengagement_signals": ["fidgeting", "looking at phone", "asking to take breaks"], "re_engagement_strategies": ["switch to hands-on activity", "use cooking analogy", "collaborative work"]}}', 0.80),

-- Yuki Tanaka memories (Auditory - loves discussions)
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'engagement_patterns', 'peak_triggers', 
  '{"data": {"peak_engagement_triggers": ["verbal explanations", "discussions", "storytelling", "documentary-style content", "case studies", "question-answer sessions"]}}', 0.90),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'learning_profile', 'attention_patterns', 
  '{"data": {"attention_span": 22, "optimal_chunk_duration": 20, "energy_patterns": "consistent", "prefers_quiet_environment": true}}', 0.87),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'academic_performance', 'strengths_weaknesses',
  '{"data": {"strengths": ["detailed note-taking", "verbal reasoning", "connecting concepts", "research skills"], "challenges": ["rushing through visuals", "hands-on lab confidence"], "breakthrough_moments": ["marine ecosystem discussion led to deep understanding"]}}', 0.84),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'cultural_context', 'learning_preferences',
  '{"data": {"achievement_focused": true, "prefers_structured_approach": true, "respects_formal_instruction": true, "values_detailed_explanations": true}}', 0.81),

-- Omar Hassan memories (Reading/Writing - analytical)
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'engagement_patterns', 'peak_triggers', 
  '{"data": {"peak_engagement_triggers": ["problem-solving challenges", "logical proofs", "written explanations", "step-by-step derivations", "pattern recognition", "strategy games"]}}', 0.86),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'learning_profile', 'attention_patterns', 
  '{"data": {"attention_span": 25, "optimal_chunk_duration": 20, "energy_patterns": "evening_peak", "prefers_independent_work": true}}', 0.85),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'academic_performance', 'strengths_weaknesses',
  '{"data": {"strengths": ["logical reasoning", "pattern recognition", "written explanations", "persistence"], "challenges": ["rushed calculations", "visualizing 3D concepts"], "breakthrough_moments": ["chess analogy helped understand mathematical strategies"]}}', 0.83),

-- Sofia Kowalski memories (younger, needs engagement)
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'engagement_patterns', 'peak_triggers', 
  '{"data": {"peak_engagement_triggers": ["games", "competitions", "quick wins", "colorful visuals", "animals/nature examples", "short videos"]}}', 0.77),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'learning_profile', 'attention_patterns', 
  '{"data": {"attention_span": 8, "optimal_chunk_duration": 5, "energy_patterns": "variable", "needs_frequent_variety": true}}', 0.79),
('student', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'engagement_patterns', 'disengagement_signals',
  '{"data": {"disengagement_signals": ["looking at phone constantly", "yawning", "distracted easily"], "re_engagement_strategies": ["gamification", "movement break", "animal examples", "competitive element"]}}', 0.81),

-- Session effectiveness memories (for cross-agent learning)
('session', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'session_dynamics', 'effective_strategies',
  '{"data": {"effective_strategies": ["space exploration examples", "simulation-based learning", "coding integration"], "effectiveness_score": 9, "student_engagement": 8.5, "student_name": "Alex Chen", "topic": "Physics - Vectors"}}', 0.88),
('session', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'session_dynamics', 'effective_strategies',
  '{"data": {"effective_strategies": ["cooking analogies", "hands-on experiments", "movement breaks"], "effectiveness_score": 8.5, "student_engagement": 9, "student_name": "Emma Rodriguez", "topic": "Chemistry - pH Levels"}}', 0.85),
('session', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'session_dynamics', 'effective_strategies',
  '{"data": {"effective_strategies": ["gamification", "short activities", "animal examples", "instant feedback"], "effectiveness_score": 7, "student_engagement": 7.5, "improvement_needed": "maintain focus longer", "student_name": "Sofia Kowalski", "topic": "Science - Animal Adaptations"}}', 0.75),
('session', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'session_dynamics', 'effective_strategies',
  '{"data": {"effective_strategies": ["verbal explanations", "case studies", "marine examples"], "effectiveness_score": 9.5, "student_engagement": 9, "student_name": "Yuki Tanaka", "topic": "Biology - Marine Ecosystems"}}', 0.92),
('session', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'session_dynamics', 'effective_strategies',
  '{"data": {"effective_strategies": ["chess analogies", "step-by-step proofs", "written explanations"], "effectiveness_score": 8, "student_engagement": 7.5, "student_name": "Omar Hassan", "topic": "Mathematics - Calculus Derivatives"}}', 0.81),

-- Content effectiveness memories (for platform learning)
('content', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'usage_effectiveness', 'simulation_success',
  '{"data": {"content_type": "interactive_simulation", "topic": "molecular bonding", "effectiveness_score": 9, "engagement_level": "high", "age_range": "14-16", "used_by_students": 3}}', 0.87),
('content', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'usage_effectiveness', 'gamification_success',
  '{"data": {"content_type": "gamified_activity", "topic": "periodic table exploration", "gamification_elements": ["points", "unlockables", "challenges"], "effectiveness_score": 8, "engagement_level": "very high", "age_range": "12-14", "note": "younger students respond better to game elements", "used_by_students": 2}}', 0.84),
('content', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'usage_effectiveness', 'interactive_activity_success',
  '{"data": {"content_type": "react_interactive", "topic": "projectile motion", "effectiveness_score": 9.5, "engagement_level": "very high", "age_range": "15-17", "features": ["real-time visualization", "parameter adjustment", "game-like feel"], "used_by_students": 4}}', 0.91);

-- Views for demo dashboard
CREATE VIEW agent_improvement_over_time AS
SELECT 
  agent_type,
  DATE(created_at) as date,
  AVG(success_rate) as avg_success_rate,
  COUNT(*) as generation_count
FROM agent_performance_metrics
GROUP BY agent_type, DATE(created_at)
ORDER BY date DESC;

CREATE VIEW recent_learning_insights AS
SELECT 
  insight_type,
  description,
  applicability,
  status,
  created_at
FROM learning_insights
WHERE status = 'validated'
ORDER BY created_at DESC
LIMIT 20;