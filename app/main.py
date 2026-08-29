from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_router
from src.config.settings import settings
from src.utils.logger import logger
from src.utils.exceptions import SupportIQException, SecurityAccessDeniedError

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent AI Customer Support & Knowledge Agent API for NovaCart",
    version="1.0.0"
)

# Enable CORS for frontend integration (Streamlit, React, Vue, Mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response Status: {response.status_code}")
    return response

@app.exception_handler(SecurityAccessDeniedError)
async def security_exception_handler(request: Request, exc: SecurityAccessDeniedError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": f"Access Denied: {str(exc)}"}
    )

@app.exception_handler(SupportIQException)
async def domain_exception_handler(request: Request, exc: SupportIQException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": f"Domain Error: {str(exc)}"}
    )

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy", 
        "service": settings.APP_NAME, 
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER
    }

app.include_router(api_router, prefix="/api/v1")
