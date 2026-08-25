import sys
import logging
from src.config.settings import settings

def setup_logger(name: str = "SupportIQ") -> logging.Logger:
    """
    Configure and return a structured logger formatting console output with timestamps,
    log levels, module names, and line numbers.
    """
    logger = logging.getLogger(name)
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
