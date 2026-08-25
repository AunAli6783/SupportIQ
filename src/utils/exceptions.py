class SupportIQException(Exception):
    """Base exception class for all SupportIQ domain errors."""
    pass

class ConfigurationError(SupportIQException):
    """Raised when environment settings, paths, or API keys are invalid or missing."""
    pass

class DocumentIngestionError(SupportIQException):
    """Raised when document parsing, text splitting, or embedding generation fails."""
    pass

class VectorStoreError(SupportIQException):
    """Raised when ChromaDB collection creation or query retrieval fails."""
    pass

class ToolExecutionError(SupportIQException):
    """Raised when an agent tool (order API, product catalog, calculator, etc.) fails."""
    pass

class SecurityAccessDeniedError(SupportIQException):
    """Raised when an unauthorized user attempts to access another customer's private data."""
    pass

class LowConfidenceError(SupportIQException):
    """Raised when RAG retrieval or agent confidence drops below minimum threshold."""
    pass
