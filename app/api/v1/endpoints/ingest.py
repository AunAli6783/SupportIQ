from fastapi import APIRouter, BackgroundTasks
from src.ingestion.ingest import run_ingestion
from src.utils.logger import logger

router = APIRouter()

@router.post("/documents/ingest", tags=["Admin"])
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """Trigger background document ingestion pipeline."""
    logger.info("Received request to trigger background document ingestion.")
    background_tasks.add_task(run_ingestion)
    return {"message": "Ingestion task initiated in background."}
