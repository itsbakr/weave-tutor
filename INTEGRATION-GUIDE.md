# Technical Integration Guide - WaveHacks 2

## Latest Framework Versions & APIs (January 2025)

### 1. Daytona Integration

**Version**: Latest (v0.50.0+)  
**Purpose**: Secure sandbox execution for AI-generated React code

#### Installation

```bash
# Python SDK
pip install daytona-sdk

# CLI (optional, for testing)
brew install daytonaio/cli/daytona
```

#### Python SDK Usage

```python
from daytona import Daytona, DaytonaConfig

# Initialize client
config = DaytonaConfig(
    api_key=os.getenv("DAYTONA_API_KEY"),
    base_url="https://api.daytona.io"  # Or self-hosted URL
)
daytona_client = Daytona(config)

# Create sandbox
sandbox = daytona_client.create(
    language="javascript",
    timeout="30m",
    resources={
        "cpu": "1",
        "memory": "512Mi"
    }
)

# Deploy React code
response = sandbox.process.code_run(
    code=react_component_code,
    entry_point="App.jsx"
)

# Check for errors
if response.exit_code != 0:
    error_logs = response.stderr
    print(f"Deployment failed: {error_logs}")
else:
    print(f"Success! Sandbox URL: {sandbox.url}")

# Get logs
logs = sandbox.process.get_logs()

# Cleanup
sandbox.delete()
```

#### For Our Activity Creator

```python
class DaytonaService:
    def __init__(self):
        config = DaytonaConfig(api_key=os.getenv("DAYTONA_API_KEY"))
        self.client = Daytona(config)
    
    async def create_sandbox(
        self,
        code: str,
        language: str = "javascript",
        dependencies: List[str] = None,
        student_id: str = None
    ) -> dict:
        """Create a new sandbox with React code"""
        
        sandbox = self.client.create(
            language=language,
            timeout="2h",
            resources={"cpu": "1", "memory": "512Mi"},
            metadata={"student_id": student_id}
        )
        
        # Deploy code
        response = sandbox.process.code_run(
            code=code,
            entry_point="index.jsx"
        )
        
        return {
            "sandbox_id": sandbox.id,
            "url": sandbox.url,
            "status": "running" if response.exit_code == 0 else "failed",
            "exit_code": response.exit_code
        }
    
    async def get_sandbox_logs(self, sandbox_id: str) -> str:
        """Get error logs from sandbox"""
        sandbox = self.client.get(sandbox_id)
        logs = sandbox.process.get_logs()
        return logs.stderr + logs.stdout
    
    async def delete_sandbox(self, sandbox_id: str):
        """Delete sandbox"""
        sandbox = self.client.get(sandbox_id)
        sandbox.delete()
```

---

### 2. Weave Integration (W&B)

**Version**: Latest (v0.50.0+)  
**Purpose**: Trace all AI model calls, evaluate self-improvement

#### Installation

```bash
pip install weave
```

#### Python SDK Usage

```python
import weave

# Initialize once at startup
weave.init("tutorpilot-weavehacks")

# Decorate ALL AI functions
@weave.op()
async def call_google_learnlm(prompt: str) -> str:
    """Traced LearnLM call"""
    response = await learnlm_client.generate(
        model="models/learnlm-1.5-pro-experimental",
        prompt=prompt,
        temperature=0.7
    )
    return response.text

@weave.op()
async def call_perplexity(query: str) -> dict:
    """Traced Perplexity call"""
    response = await perplexity_client.chat.completions.create(
        model="llama-3.1-sonar-large-128k-online",
        messages=[{"role": "user", "content": query}]
    )
    return response

@weave.op()
async def call_qwen3_coder(prompt: str) -> str:
    """Traced Qwen3 Coder call"""
    # Use Hugging Face Inference API or another provider
    response = await hf_client.text_generation(
        model="Qwen/Qwen2.5-Coder-32B-Instruct",  # or 480B if available
        prompt=prompt,
        max_tokens=4096
    )
    return response

# Weave automatically logs:
# - Input prompts
# - Output responses
# - Execution time
# - Token usage
# - All parameters
```

#### View Traces

- Dashboard: `https://wandb.ai/your-username/tutorpilot-weavehacks`
- Shows all AI calls in a timeline
- Can filter by agent type, success/failure, evaluation score

---

### 3. Google LearnLM API

**Model**: `learnlm-1.5-pro-experimental`  
**Purpose**: Educational content generation

#### Installation

```bash
pip install google-generativeai
```

#### Python Implementation

```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_LEARNLM_API_KEY"))

@weave.op()
async def call_google_learnlm(
    prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 4096
) -> str:
    """Call LearnLM with retries"""
    
    model = genai.GenerativeModel('learnlm-1.5-pro-experimental')
    
    generation_config = genai.GenerationConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        candidate_count=1
    )
    
    # Retry logic
    for attempt in range(3):
        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** attempt)
```

---

### 4. Perplexity Sonar API

**Model**: `llama-3.1-sonar-large-128k-online`  
**Purpose**: Knowledge retrieval with sources

#### Installation

```bash
pip install openai  # Perplexity uses OpenAI-compatible API
```

#### Python Implementation

```python
from openai import AsyncOpenAI

perplexity_client = AsyncOpenAI(
    api_key=os.getenv("PERPLEXITY_API_KEY"),
    base_url="https://api.perplexity.ai"
)

@weave.op()
async def call_perplexity(
    query: str,
    model: str = "llama-3.1-sonar-large-128k-online"
) -> dict:
    """Search with Perplexity Sonar"""
    
    response = await perplexity_client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful research assistant providing educational content with credible sources."
            },
            {
                "role": "user",
                "content": query
            }
        ],
        temperature=0.2,
        max_tokens=2000,
        return_citations=True,
        return_images=False
    )
    
    return {
        "content": response.choices[0].message.content,
        "sources": response.citations if hasattr(response, 'citations') else []
    }
```

---

### 5. Qwen3 Coder API

**Model**: `Qwen/Qwen2.5-Coder-32B-Instruct` (or 480B if available via Weave)  
**Purpose**: React code generation

#### Option A: Hugging Face Inference API

```bash
pip install huggingface_hub
```

```python
from huggingface_hub import AsyncInferenceClient

hf_client = AsyncInferenceClient(
    token=os.getenv("HUGGING_FACE_TOKEN")
)

@weave.op()
async def call_qwen3_coder(prompt: str) -> str:
    """Generate code with Qwen3 Coder"""
    
    response = await hf_client.text_generation(
        prompt=prompt,
        model="Qwen/Qwen2.5-Coder-32B-Instruct",
        max_new_tokens=4096,
        temperature=0.2,
        do_sample=True,
        return_full_text=False
    )
    
    return response
```

#### Option B: Together AI (Recommended for hackathon - faster)

```bash
pip install together
```

```python
from together import AsyncTogether

together_client = AsyncTogether(
    api_key=os.getenv("TOGETHER_API_KEY")
)

@weave.op()
async def call_qwen3_coder(prompt: str) -> str:
    """Generate code with Qwen via Together AI"""
    
    response = await together_client.chat.completions.create(
        model="Qwen/Qwen2.5-Coder-32B-Instruct",
        messages=[
            {
                "role": "system",
                "content": "You are an expert React developer creating educational interactive components."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=4096
    )
    
    return response.choices[0].message.content
```

---

### 6. FastAPI Setup

**Version**: `0.109.0+`

#### Installation

```bash
pip install fastapi[all]==0.109.0
pip install uvicorn[standard]==0.27.0
```

#### Project Structure

```
backend/
├── main.py                 # FastAPI app with CORS
├── requirements.txt
├── .env
├── agents/
│   ├── __init__.py
│   ├── strategy_planner.py
│   ├── lesson_creator.py
│   ├── activity_creator.py
│   └── evaluator.py
├── services/
│   ├── __init__.py
│   ├── knowledge_service.py
│   ├── ai_service.py
│   ├── memory_service.py
│   ├── daytona_service.py
│   └── learning_service.py
├── models/
│   ├── __init__.py
│   ├── student.py
│   ├── strategy.py
│   ├── lesson.py
│   ├── activity.py
│   └── evaluation.py
└── db/
    ├── __init__.py
    └── supabase_client.py
```

---

### 7. Supabase Python Client

**Version**: `2.3.0+`

#### Installation

```bash
pip install supabase==2.3.4
```

#### Implementation

```python
from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Example queries
students = supabase.table('students').select('*').eq('id', student_id).execute()

# Insert with JSON
supabase.table('agent_performance_metrics').insert({
    'agent_type': 'strategy_planner',
    'success_rate': 0.85,
    'confidence_scores': [8, 9, 7, 8, 9],
    'evaluation_details': {
        'criteria': {...}
    }
}).execute()
```

---

## Complete requirements.txt

```txt
# FastAPI Backend
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Database
supabase==2.3.4
postgrest==0.13.2

# AI Models
google-generativeai==0.3.2
openai==1.10.0  # For Perplexity
huggingface-hub==0.20.3
together==1.0.2  # Alternative for Qwen

# Weave Tracing
weave==0.50.0

# Daytona Sandboxes
daytona-sdk==0.1.0  # Check actual version

# Utilities
httpx==0.26.0
aiohttp==3.9.1
python-multipart==0.0.6
```

---

## Environment Variables (.env)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# AI Models
GOOGLE_LEARNLM_API_KEY=your-google-api-key
PERPLEXITY_API_KEY=your-perplexity-key
HUGGING_FACE_TOKEN=your-hf-token
TOGETHER_API_KEY=your-together-key  # Alternative

# Weave
WANDB_API_KEY=your-wandb-key
WEAVE_PROJECT_NAME=tutorpilot-weavehacks

# Daytona
DAYTONA_API_KEY=your-daytona-key

# Server
HOST=0.0.0.0
PORT=8000
```

---

## Quick Start Commands

```bash
# Setup
cd Weave-Tutor/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test API
curl http://localhost:8000/health
```

---

## Critical Implementation Notes

### 1. Error Handling for Daytona

```python
async def deploy_with_error_fix(code, topic, student_id, max_attempts=3):
    """Robust deployment with auto-fix"""
    
    for attempt in range(1, max_attempts + 1):
        try:
            sandbox = await daytona_service.create_sandbox(
                code=code,
                language="javascript",
                dependencies=["react@18", "react-dom@18"],
                student_id=student_id
            )
            
            # Wait for compilation
            await asyncio.sleep(5)
            
            # Check logs
            logs = await daytona_service.get_sandbox_logs(sandbox['sandbox_id'])
            
            if not has_errors(logs):
                return {
                    "status": "success",
                    "sandbox_id": sandbox['sandbox_id'],
                    "url": sandbox['url'],
                    "attempts": attempt,
                    "code": code
                }
            
            # Auto-fix errors
            if attempt < max_attempts:
                print(f"⚠️ Attempt {attempt} failed, fixing...")
                code = await fix_code_errors(code, logs, topic, attempt)
                await daytona_service.delete_sandbox(sandbox['sandbox_id'])
            
        except Exception as e:
            print(f"❌ Deployment error: {str(e)}")
            if attempt == max_attempts:
                return {"status": "failed", "error": str(e)}
    
    return {"status": "failed", "attempts": max_attempts}
```

### 2. Weave Tracing Best Practices

```python
# ✅ DO: Trace all AI operations
@weave.op()
async def generate_strategy(student_id: str):
    # Function is automatically traced
    pass

# ✅ DO: Add custom attributes
@weave.op()
async def evaluate_activity(activity: dict):
    weave.log({"activity_type": activity['type']})
    # Your logic
    pass

# ❌ DON'T: Trace database operations (too noisy)
async def save_to_db(data):  # No @weave.op()
    supabase.table('...').insert(data).execute()
```

### 3. Rate Limiting

```python
import asyncio
from functools import wraps

def rate_limit(calls_per_minute: int):
    """Decorator for rate limiting API calls"""
    min_interval = 60.0 / calls_per_minute
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = asyncio.get_event_loop().time() - last_called[0]
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
            result = await func(*args, **kwargs)
            last_called[0] = asyncio.get_event_loop().time()
            return result
        return wrapper
    return decorator

# Usage
@rate_limit(calls_per_minute=10)
@weave.op()
async def call_google_learnlm(prompt: str):
    # Your implementation
    pass
```

---

## Testing Checklist

- [ ] Supabase connection works
- [ ] LearnLM API generates strategy
- [ ] Perplexity returns sources
- [ ] Qwen3 generates React code
- [ ] Daytona sandbox deploys code
- [ ] Error logs retrieved from sandbox
- [ ] Code fix loop runs successfully
- [ ] Weave dashboard shows traces
- [ ] Self-evaluation scores stored
- [ ] Learning insights generated

---

## Troubleshooting

### Daytona sandbox fails to start
- Check API key is valid
- Verify code doesn't have syntax errors
- Increase timeout if needed
- Check resource limits

### Weave not showing traces
- Verify `weave.init()` called at startup
- Check WANDB_API_KEY is set
- Ensure `@weave.op()` decorator is used
- View logs for authentication errors

### LearnLM rate limits
- Add rate limiting decorator
- Use exponential backoff
- Cache responses for development

---

**Next Steps**: 
1. ✅ Setup backend project structure
2. ✅ Install all dependencies
3. ✅ Configure environment variables
4. ✅ Test each API integration individually
5. ✅ Build agents step-by-step

**Time Estimate**: ~30 hours for full implementation following TASKS-WEAVEHACKS2-30HOURS.md

