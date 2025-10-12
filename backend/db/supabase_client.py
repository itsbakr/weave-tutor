"""
Supabase Client Configuration
"""

from supabase import create_client, Client
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_ANON_KEY", "")  # Use anon key for client-side operations
)


async def get_student(student_id: str) -> Optional[Dict[str, Any]]:
    """Get student by ID"""
    try:
        response = supabase.table('students') \
            .select('*') \
            .eq('id', student_id) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching student: {str(e)}")
        return None


async def get_tutor(tutor_id: str) -> Optional[Dict[str, Any]]:
    """Get tutor by ID"""
    try:
        response = supabase.table('tutors') \
            .select('*') \
            .eq('id', tutor_id) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching tutor: {str(e)}")
        return None


async def load_student_memories(student_id: str, limit: int = 10) -> list:
    """Load student-specific memories"""
    try:
        response = supabase.table('platform_memory') \
            .select('*') \
            .eq('entity_type', 'student') \
            .eq('entity_id', student_id) \
            .gte('confidence_score', 0.3) \
            .order('confidence_score', desc=True) \
            .limit(limit) \
            .execute()
        
        return response.data if response.data else []
    except Exception as e:
        print(f"Error loading student memories: {str(e)}")
        return []


async def load_learning_insights(grade: str, subject: str = None, limit: int = 5) -> list:
    """Load validated learning insights for adaptive prompting"""
    try:
        query = supabase.table('learning_insights') \
            .select('*') \
            .eq('status', 'validated')
        
        # Note: JSON filtering might need adjustment based on Supabase version
        # This is a simplified version - may need to use .filter() or client-side filtering
        
        response = query \
            .order('created_at', desc=True) \
            .limit(limit) \
            .execute()
        
        # Filter client-side for applicability
        insights = response.data if response.data else []
        filtered = []
        
        for insight in insights:
            applicability = insight.get('applicability', {})
            grade_levels = applicability.get('grade_levels', [])
            subjects = applicability.get('subjects', [])
            
            # Check if applicable to this grade/subject
            if grade in grade_levels or not grade_levels:
                if not subject or subject in subjects or not subjects:
                    filtered.append(insight)
        
        return filtered[:limit]
    except Exception as e:
        print(f"Error loading learning insights: {str(e)}")
        return []
