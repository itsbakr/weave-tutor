"""
Centralized AI Service
Handles all AI model interactions with Weave tracing
"""

import os
import httpx
import asyncio
from typing import Dict, Any
from openai import AsyncOpenAI
import weave
import google.generativeai as genai

# weave.init() is called in main.py

@weave.op()
async def call_google_learnlm(
    prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 2000
) -> str:
    """
    Call Google's Gemini model via official SDK (for educational content)
    
    Using gemini-2.0-flash-exp or gemini-1.5-pro based on availability
    
    Args:
        prompt: The prompt to send
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        
    Returns:
        Generated text response
    """
    api_key = os.getenv("GOOGLE_LEARNLM_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_LEARNLM_API_KEY not set in environment")
    
    # Configure Google AI with the API key
    genai.configure(api_key=api_key)
    
    # Use Gemini 2.0 Flash (much faster than LearnLM for hackathon demos)
    # LearnLM is too slow (~2-3 min per call) for real-time use
    # Gemini 2.0 Flash is optimized for speed while maintaining quality
    model = genai.GenerativeModel("gemini-flash-lite-latest")
    
    # Configure generation
    generation_config = genai.GenerationConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        top_p=0.95,
        top_k=40
    )
    
    # Retry logic with exponential backoff for various API errors
    max_retries = 5
    base_delay = 3  # seconds
    
    for attempt in range(max_retries):
        try:
            # Generate content (run sync function in thread pool for async compatibility)
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=generation_config
            )
            
            if response and response.text:
                return response.text
            else:
                raise Exception("No text in LearnLM response")
                
        except Exception as e:
            error_str = str(e).lower()
            is_last_attempt = attempt == max_retries - 1
            
            # Determine if this is a retryable error
            is_retryable = (
                "429" in str(e) or  # Rate limit
                "503" in str(e) or  # Service unavailable
                "500" in str(e) or  # Internal server error
                "quota" in error_str or
                "service unavailable" in error_str or
                "deadline exceeded" in error_str or
                "timeout" in error_str
            )
            
            # Special handling for 404 (model not found) - don't retry
            if "404" in str(e) or "not found" in error_str:
                raise Exception(f"LearnLM model not found. Please check the model name 'learnlm-2.0-flash-experimental' is correct.")
            
            if is_retryable and not is_last_attempt:
                # Exponential backoff: 3s, 6s, 12s, 24s, 48s
                delay = base_delay * (2 ** attempt)
                error_type = "rate limit" if "429" in str(e) else "service error"
                print(f"⏳ API {error_type}, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(delay)
                continue
            elif is_retryable and is_last_attempt:
                raise Exception(f"LearnLM API failed after {max_retries} retries. Last error: {str(e)[:200]}")
            else:
                # Non-retryable error, raise immediately
                raise Exception(f"LearnLM API error: {str(e)[:200]}")


@weave.op()
async def call_perplexity(
    prompt: str,
    temperature: float = 0.1,
    max_tokens: int = 2500
) -> Dict[str, Any]:
    """
    Call Perplexity Sonar API for knowledge retrieval
    
    Args:
        prompt: Search/question prompt
        temperature: Sampling temperature
        max_tokens: Maximum tokens
        
    Returns:
        Dict with 'content' (str) and 'sources' (list)
    """
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise ValueError("PERPLEXITY_API_KEY not set in environment")
    
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sonar",  # or "sonar-pro"
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "return_citations": True,  # Request citations/sources
        "return_related_questions": False
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            
            data = response.json()
            
            if "choices" in data and data["choices"]:
                choice = data["choices"][0]
                content = choice["message"]["content"]
                
                # Extract sources/citations
                sources = []
                if "citations" in data:
                    # Format: citations is a list of URLs
                    for i, url in enumerate(data.get("citations", [])):
                        sources.append({
                            "title": f"Source {i+1}",
                            "url": url,
                            "snippet": ""
                        })
                
                return {
                    "content": content,
                    "sources": sources
                }
            else:
                raise Exception(f"No choices in Perplexity response: {data}")
                
    except Exception as e:
        raise Exception(f"Perplexity Sonar API error: {str(e)}")


@weave.op()
async def call_qwen3_coder(
    prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 9000
) -> str:
    """
    Call Qwen3 Coder 480B via W&B Inference API
    
    Uses W&B's hosted inference endpoint with Weave tracing
    This uses your W&B/Weave credits from the hackathon
    
    Based on: https://wandb.ai/wandb_fc/genai-research/reports/Tutorial-Run-inference-with-Qwen3-Coder
    
    Args:
        prompt: Code generation prompt
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        
    Returns:
        Generated code
    """
    try:
        # Create OpenAI client pointing to W&B Inference
        # Weave automatically logs this since we called weave.init() at startup
        wb_client = AsyncOpenAI(
            base_url='https://api.inference.wandb.ai/v1',
            api_key=os.getenv("WANDB_API_KEY")
        )
        
        # Call Qwen3 Coder 480B
        response = await wb_client.chat.completions.create(
            model="Qwen/Qwen3-Coder-480B-A35B-Instruct",  # W&B's hosted model
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert React developer creating educational interactive components. Generate clean, well-commented, production-ready code."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        error_msg = f"Qwen3 Coder via W&B Inference error: {str(e)}"
        print(f"❌ {error_msg}")
        print("💡 Ensure WANDB_API_KEY is set and you have access to W&B Inference")
        raise Exception(error_msg)


def extract_code_block(response: str, language: str = "jsx") -> str:
    """
    Extract code from markdown code blocks
    
    Args:
        response: LLM response that may contain code blocks
        language: Expected language (jsx, python, javascript)
        
    Returns:
        Extracted code without markdown formatting
    """
    import re
    
    # Try to find code block with language specifier
    pattern = f"```{language}\\n(.*?)```"
    match = re.search(pattern, response, re.DOTALL)
    
    if match:
        return match.group(1).strip()
    
    # Try generic code block
    pattern = "```\\n(.*?)```"
    match = re.search(pattern, response, re.DOTALL)
    
    if match:
        return match.group(1).strip()
    
    # If no code block found, return as-is
    return response.strip()


def has_errors(logs: str) -> bool:
    """
    Check if sandbox logs contain error indicators
    
    Args:
        logs: Sandbox log output
        
    Returns:
        True if errors detected, False otherwise
    """
    if not logs:
        return False
    
    error_keywords = [
        "Error",
        "error:",
        "Exception",
        "Failed",
        "ENOENT",
        "Cannot find",
        "Unexpected",
        "SyntaxError",
        "TypeError",
        "ReferenceError",
        "undefined",
        "Failed to compile",
        "Module not found",
        "Uncaught"
    ]
    
    logs_lower = logs.lower()
    
    for keyword in error_keywords:
        if keyword.lower() in logs_lower:
            return True
    
    return False
