"""
TutorPilot FastAPI Backend - WaveHacks 2
Self-Improving AI Tutoring Platform
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import weave
import os
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Initialize Weave for tracing
weave.init(os.getenv("WEAVE_PROJECT_NAME", "tutorpilot-weavehacks"))

# Import services (will create these next)
# from services.learning_service import start_reflection_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 TutorPilot backend starting...")
    print(f"📊 Weave tracing enabled: {os.getenv('WEAVE_PROJECT_NAME')}")
    
    # Start background reflection loop
    # reflection_task = asyncio.create_task(start_reflection_loop())
    
    yield
    
    # Shutdown
    print("👋 TutorPilot backend shutting down...")
    # reflection_task.cancel()


app = FastAPI(
    title="TutorPilot API",
    description="Self-Improving AI Tutoring Platform for WaveHacks 2",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TutorPilot API - WaveHacks 2",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "weave_enabled": bool(os.getenv("WEAVE_PROJECT_NAME"))
    }


# ==========================================
# DATA API ENDPOINTS (for dropdowns)
# ==========================================

# ==========================================
# SELF-IMPROVEMENT / REFLECTION ENDPOINTS
# ==========================================

@app.post("/api/v1/reflection/analyze")
async def trigger_reflection_analysis(agent_type: str = None):
    """
    Trigger reflection analysis to generate learning insights
    This is the self-improvement loop!
    
    Args:
        agent_type: Optional - specific agent to analyze, or None for all
    """
    try:
        from agents.reflection_service import reflection_service
        
        if agent_type:
            insights = await reflection_service.generate_learning_insights(
                agent_type=agent_type,
                lookback_days=7
            )
            return {
                "success": True,
                "agent_type": agent_type,
                "insights_generated": len(insights),
                "insights": insights
            }
        else:
            # Analyze all agents
            all_insights = {}
            for agent in ['strategy_creator', 'lesson_creator', 'activity_creator']:
                insights = await reflection_service.generate_learning_insights(
                    agent_type=agent,
                    lookback_days=7
                )
                all_insights[agent] = insights
            
            return {
                "success": True,
                "insights_by_agent": {
                    agent: len(insights)
                    for agent, insights in all_insights.items()
                },
                "total_insights": sum(len(i) for i in all_insights.values()),
                "details": all_insights
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/reflection/insights/{agent_type}")
async def get_learning_insights(agent_type: str):
    """
    Get learning insights for a specific agent
    Shows what the AI has learned from past generations
    """
    try:
        from agents.reflection_service import reflection_service
        
        insights = await reflection_service.get_relevant_insights(
            agent_type=agent_type,
            max_insights=10
        )
        
        return {
            "success": True,
            "agent_type": agent_type,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/data/students")
async def get_students():
    """Get all students for dropdown selection"""
    try:
        response = supabase.table('students')\
            .select('id, name, grade, subject, learning_style')\
            .execute()
        return {
            "success": True,
            "students": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/data/tutors")
async def get_tutors():
    """Get all tutors for dropdown selection"""
    try:
        response = supabase.table('tutors')\
            .select('id, name, teaching_style, education_system')\
            .execute()
        return {
            "success": True,
            "tutors": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/data/strategies/{student_id}")
async def get_student_strategies(student_id: str):
    """Get all strategies for a student"""
    try:
        response = supabase.table('strategies')\
            .select('id, title, content, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
        return {
            "success": True,
            "strategies": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/data/lessons/{student_id}")
async def get_student_lessons(student_id: str):
    """Get all lessons for a student"""
    try:
        response = supabase.table('lessons')\
            .select('id, title, content, strategy_id, strategy_week_number, created_at')\
            .eq('student_id', student_id)\
            .order('created_at', desc=True)\
            .execute()
        return {
            "success": True,
            "lessons": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Import agents
from agents.strategy_planner import generate_strategy
from agents.lesson_creator import generate_lesson
from agents.activity_creator import generate_activity
from pydantic import BaseModel
from typing import Optional, Dict, Any
from db.supabase_client import supabase

# Request models
class StrategyRequest(BaseModel):
    student_id: str
    tutor_id: str
    subject: str
    weeks: int = 4

class LessonRequest(BaseModel):
    student_id: str
    tutor_id: str
    topic: Optional[str] = None  # Optional if from strategy
    duration: int = 60
    strategy_id: Optional[str] = None  # If creating from strategy week
    strategy_week_number: Optional[int] = None  # Which week (1-4)

class ActivityRequest(BaseModel):
    student_id: str
    tutor_id: str
    topic: Optional[str] = None  # Optional if from lesson
    activity_description: Optional[str] = None  # Optional if from lesson
    duration: int = 20
    lesson_id: Optional[str] = None  # If creating from lesson phase
    lesson_phase: Optional[str] = None  # Which phase (Engage, Explore, etc.)
    max_attempts: int = 3

# Collaborative Editing Models
class ContentVersionRequest(BaseModel):
    content_type: str  # 'strategy' or 'lesson'
    content_id: str
    content: Dict[str, Any]  # The edited content
    changes_summary: Optional[str] = None  # What changed
    edit_notes: Optional[str] = None  # WHY tutor edited (feeds learning insights)
    tutor_id: str

class ActivityChatRequest(BaseModel):
    activity_id: str
    tutor_id: str
    message: str  # Tutor's request for changes
    student_id: str

# Strategy endpoint
@app.post("/api/v1/agents/strategy")
async def create_strategy(request: StrategyRequest):
    """Generate a personalized learning strategy"""
    try:
        result = await generate_strategy(
            student_id=request.student_id,
            tutor_id=request.tutor_id,
            subject=request.subject,
            weeks=request.weeks
        )
        return {
            "success": True,
            "strategy_id": result['strategy_id'],
            "content": result['content'],
            "evaluation": result['evaluation'],
            "student": result['student'],
            "tutor": result['tutor']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Lesson endpoint
@app.post("/api/v1/agents/lesson")
async def create_lesson(request: LessonRequest):
    """Generate a 5E lesson plan"""
    try:
        result = await generate_lesson(
            student_id=request.student_id,
            tutor_id=request.tutor_id,
            topic=request.topic,
            duration=request.duration,
            strategy_id=request.strategy_id,
            strategy_week_number=request.strategy_week_number  # NEW
        )
        return {
            "success": True,
            "lesson_id": result['lesson_id'],
            "content": result['content'],
            "evaluation": result['evaluation'],
            "student": result['student'],
            "tutor": result['tutor']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Activity endpoint (with auto-fix!)
@app.post("/api/v1/agents/activity")
async def create_activity(request: ActivityRequest):
    """Generate an interactive React activity with auto-debugging"""
    try:
        result = await generate_activity(
            student_id=request.student_id,
            tutor_id=request.tutor_id,
            topic=request.topic,
            activity_description=request.activity_description,
            duration=request.duration,
            lesson_id=request.lesson_id,
            lesson_phase=request.lesson_phase,  # NEW
            max_attempts=request.max_attempts
        )
        return {
            "success": True,
            "activity_id": result['activity_id'],
            "content": result['content'],
            "evaluation": result['evaluation'],
            "deployment": result['deployment'],
            "student": result['student'],
            "tutor": result['tutor'],
            "sandbox_url": result['deployment'].get('url')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Activity redeployment endpoint (retry only Daytona deployment, don't regenerate code)
@app.post("/api/v1/agents/activity/redeploy")
async def redeploy_activity(request: dict):
    """
    Redeploy an existing activity's code to a new Daytona sandbox.
    This ONLY retries deployment, without regenerating code with AI.
    """
    try:
        from services.daytona_service import daytona_service
        
        activity_id = request.get('activity_id')
        student_id = request.get('student_id')
        
        if not activity_id or not student_id:
            raise HTTPException(status_code=400, detail="activity_id and student_id required")
        
        # Fetch existing activity code from database
        activity_result = supabase.table('activities')\
            .select('content')\
            .eq('id', activity_id)\
            .single()\
            .execute()
        
        if not activity_result.data:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        code = activity_result.data['content'].get('code')
        if not code:
            raise HTTPException(status_code=400, detail="No code found in activity")
        
        # Redeploy to Daytona (direct call, no auto-fix)
        print(f"♻️ Redeploying activity {activity_id} to Daytona...")
        deployment = await daytona_service.create_and_deploy_react_app(
            code=code,
            student_id=student_id,
            auto_stop_interval=120
        )
        
        # Update activity record with new sandbox URL
        sandbox_url = deployment.get('url')
        supabase.table('activities')\
            .update({'sandbox_url': sandbox_url})\
            .eq('id', activity_id)\
            .execute()
        
        return {
            "success": True,
            "activity_id": activity_id,
            "deployment": {
                "sandbox_id": deployment.get('sandbox_id'),
                "url": sandbox_url,
                "status": deployment.get('status', 'running'),
                "exit_code": deployment.get('exit_code', 0)
            },
            "sandbox_url": sandbox_url
        }
        
    except Exception as e:
        print(f"❌ Redeployment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# COLLABORATIVE EDITING ENDPOINTS
# ==========================================

@app.post("/api/v1/content/save-version")
async def save_content_version(request: ContentVersionRequest):
    """
    Save a new version of edited strategy or lesson content.
    Supports Google Doc-like collaborative editing with version history.
    
    This feeds into learning insights - we analyze WHY tutors edit content
    to improve future AI generations.
    """
    try:
        # Get current version number
        version_query = supabase.table('content_versions')\
            .select('version_number')\
            .eq('content_type', request.content_type)\
            .eq('content_id', request.content_id)\
            .order('version_number', desc=True)\
            .limit(1)\
            .execute()
        
        current_version = version_query.data[0]['version_number'] if version_query.data else 0
        new_version = current_version + 1
        
        # Save new version
        version_record = {
            'content_type': request.content_type,
            'content_id': request.content_id,
            'version_number': new_version,
            'content': request.content,
            'changes_summary': request.changes_summary,
            'edited_by': request.tutor_id,
            'edit_type': 'manual_edit',
            'edit_notes': request.edit_notes,  # WHY they edited (important for learning!)
        }
        
        result = supabase.table('content_versions').insert(version_record).execute()
        
        # Update main content table to mark latest version
        table_name = 'strategies' if request.content_type == 'strategy' else 'lessons'
        supabase.table(table_name)\
            .update({'current_version': new_version, 'content': request.content})\
            .eq('id', request.content_id)\
            .execute()
        
        return {
            "success": True,
            "version_number": new_version,
            "message": f"Version {new_version} saved successfully",
            "edit_notes": request.edit_notes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/content/versions/{content_type}/{content_id}")
async def get_content_versions(content_type: str, content_id: str):
    """
    Get version history for a strategy or lesson.
    Returns all versions with edit notes for tracking tutor modifications.
    """
    try:
        versions = supabase.table('content_versions')\
            .select('*')\
            .eq('content_type', content_type)\
            .eq('content_id', content_id)\
            .order('version_number', desc=True)\
            .execute()
        
        return {
            "success": True,
            "versions": versions.data,
            "total_versions": len(versions.data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/activity/chat")
async def activity_chat(request: ActivityChatRequest):
    """
    Chat-based conversational editing for activities.
    Tutors can request modifications, and the agent iterates on the code.
    
    This is different from version history - it's a conversational interface
    for tweaking activities through natural language.
    """
    try:
        # Save tutor message
        tutor_message = {
            'activity_id': request.activity_id,
            'tutor_id': request.tutor_id,
            'message_type': 'tutor_request',
            'message_content': request.message
        }
        
        supabase.table('activity_chat_history').insert(tutor_message).execute()
        
        # Get current activity
        activity_result = supabase.table('activities')\
            .select('*')\
            .eq('id', request.activity_id)\
            .execute()
        
        if not activity_result.data:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        current_activity = activity_result.data[0]
        current_code = current_activity['content'].get('code', '')
        
        # Generate modified activity based on chat
        # Import here to avoid circular dependency
        from agents.activity_creator import iterate_activity_from_chat
        
        result = await iterate_activity_from_chat(
            activity_id=request.activity_id,
            student_id=request.student_id,
            current_code=current_code,
            tutor_message=request.message,
            topic=current_activity.get('topic', '')
        )
        
        # Save agent response
        agent_message = {
            'activity_id': request.activity_id,
            'tutor_id': request.tutor_id,
            'message_type': 'agent_response',
            'message_content': result.get('explanation', 'Activity updated'),
            'code_snapshot': result.get('new_code'),
            'sandbox_url': result.get('sandbox_url')
        }
        
        supabase.table('activity_chat_history').insert(agent_message).execute()
        
        # Update activity
        supabase.table('activities')\
            .update({
                'content': {
                    **current_activity['content'],
                    'code': result.get('new_code'),
                    'iteration_count': current_activity['content'].get('iteration_count', 0) + 1
                }
            })\
            .eq('id', request.activity_id)\
            .execute()
        
        return {
            "success": True,
            "new_code": result.get('new_code'),
            "explanation": result.get('explanation'),
            "sandbox_url": result.get('sandbox_url'),
            "changes_made": result.get('changes')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/activity/chat/{activity_id}")
async def get_activity_chat_history(activity_id: str):
    """Get chat history for an activity"""
    try:
        chat_history = supabase.table('activity_chat_history')\
            .select('*')\
            .eq('activity_id', activity_id)\
            .order('created_at', desc=False)\
            .execute()
        
        return {
            "success": True,
            "chat_history": chat_history.data,
            "total_messages": len(chat_history.data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )

