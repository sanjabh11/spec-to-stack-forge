
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import httpx
from typing import Optional
import asyncio

app = FastAPI(title="LLM Inference Service", version="1.0.0")

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 256
    temperature: float = 0.7
    top_k: int = 50
    top_p: float = 0.9
    model: str = "llama3-70b"

class GenerateResponse(BaseModel):
    text: str
    tokens_used: int
    model: str
    latency_ms: int

# Model endpoints configuration
MODEL_ENDPOINTS = {
    "llama3-70b": os.getenv("LLAMA3_ENDPOINT", "http://llama3-70b-service:8000"),
    "mistral-7b": os.getenv("MISTRAL_ENDPOINT", "http://mistral-service:8000"),
    "gemini-2.5-pro": "api"  # External API
}

@app.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """Generate text using specified LLM model"""
    start_time = asyncio.get_event_loop().time()
    
    if request.model not in MODEL_ENDPOINTS:
        raise HTTPException(status_code=400, detail=f"Model {request.model} not supported")
    
    endpoint = MODEL_ENDPOINTS[request.model]
    
    try:
        if endpoint == "api":
            # Handle external API models (Gemini, etc.)
            result = await call_external_api(request)
        else:
            # Handle self-hosted models (vLLM endpoints)
            result = await call_vllm_endpoint(endpoint, request)
        
        latency = int((asyncio.get_event_loop().time() - start_time) * 1000)
        
        return GenerateResponse(
            text=result["text"],
            tokens_used=result.get("tokens_used", len(result["text"]) // 4),
            model=request.model,
            latency_ms=latency
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

async def call_vllm_endpoint(endpoint: str, request: GenerateRequest):
    """Call vLLM-compatible endpoint"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{endpoint}/v1/completions",
            json={
                "model": request.model,
                "prompt": request.prompt,
                "max_tokens": request.max_tokens,
                "temperature": request.temperature,
                "top_k": request.top_k,
                "top_p": request.top_p
            }
        )
        response.raise_for_status()
        data = response.json()
        return {
            "text": data["choices"][0]["text"],
            "tokens_used": data.get("usage", {}).get("total_tokens", 0)
        }

async def call_external_api(request: GenerateRequest):
    """Call external API models like Gemini"""
    if request.model == "gemini-2.5-pro":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}",
                json={
                    "contents": [{"parts": [{"text": request.prompt}]}],
                    "generationConfig": {
                        "temperature": request.temperature,
                        "maxOutputTokens": request.max_tokens
                    }
                }
            )
            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"text": text, "tokens_used": len(text) // 4}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models": list(MODEL_ENDPOINTS.keys())}

@app.get("/models")
async def list_models():
    """List available models"""
    models = []
    for model, endpoint in MODEL_ENDPOINTS.items():
        status = "healthy"
        try:
            if endpoint != "api":
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.get(f"{endpoint}/health")
        except:
            status = "unhealthy"
        
        models.append({
            "name": model,
            "endpoint": endpoint,
            "status": status,
            "type": "external" if endpoint == "api" else "self-hosted"
        })
    
    return {"models": models}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
