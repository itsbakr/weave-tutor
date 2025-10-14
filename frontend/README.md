# TutorPilot Frontend - Next.js + TypeScript

Modern, Duolingo-inspired UI for AI-powered educational content generation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page (agent overview)
│   ├── strategy/            # Strategy Planner UI
│   ├── lesson/              # Lesson Creator UI
│   └── activity/            # Activity Creator UI + sandbox preview
├── components/
│   ├── RichTextEditor.tsx       # TipTap collaborative editor
│   ├── SelfEvaluationCard.tsx   # Criteria breakdown display
│   ├── ActivityChat.tsx         # Conversational code editing
│   ├── SandboxPreview.tsx       # Daytona iframe preview
│   └── VersionHistory.tsx       # Content version timeline
├── lib/
│   ├── api.ts                   # API client functions
│   ├── types.ts                 # TypeScript interfaces
│   ├── strategyFormatter.ts     # Markdown to HTML
│   └── lessonFormatter.ts       # JSON to HTML
└── package.json
```

## 🎨 Design System

- **Colors**: Red (`#EF4444`) and Blue (`#3B82F6`) - Duolingo-inspired
- **Typography**: Inter font, bold headings, clean hierarchy
- **Components**: Rounded corners (`rounded-2xl`), shadows, hover animations
- **Layout**: Max-width containers, generous spacing, gradient backgrounds

## 🔧 Key Features

### Hierarchical Agent Handoff
- **Strategy Page**: Dropdown to select student → generates 4-week plan
- **Lesson Page**: Dropdown to select strategy week → auto-fills topic
- **Activity Page**: Dropdown to select lesson + phase → generates React code

### Collaborative Editing

**Strategy & Lesson:**
- Rich text editor (TipTap) with formatting toolbar
- Version history with edit notes
- Self-evaluation display (6 criteria scores)

**Activity:**
- Chat-based editing ("Make molecules bigger, add sound effects")
- Full-screen sandbox preview (Daytona iframe)
- Retry deployment button

### Self-Evaluation Display
- Overall score with progress bar
- 6 criteria breakdown with individual scores
- Identified weaknesses (orange cards)
- Improvement suggestions (green cards)

## 📊 Pages

### Home (`/`)
- Overview of 3 agents with self-evaluation scores
- "Why This Wins" feature highlights
- Links to agent pages

### Strategy Planner (`/strategy`)
- Student/tutor selection
- Subject and weeks input
- Rich text editor for generated strategy
- Self-evaluation card
- Version history

### Lesson Creator (`/lesson`)
- Option: Create from strategy week OR standalone
- Comprehensive lesson structure display
- Rich text editor with version history
- Self-evaluation card

### Activity Creator (`/activity`)
- Option: Create from lesson phase OR standalone
- Full-screen Daytona sandbox preview
- Activity chat for iterations
- Self-evaluation card
- Retry deployment button

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Editor | TipTap |
| HTTP Client | Axios |
| State | React Hooks |

## 🎯 User Flow

```
1. Home → Choose Agent
2. Strategy: Select student → Generate → Edit/Save
3. Lesson: Select strategy week → Generate → Edit/Save
4. Activity: Select lesson phase → Generate → Chat to iterate
```

## 📝 License

Portfolio project for WaveHacks 2 2025 - Best Self-Improving Agent Track
