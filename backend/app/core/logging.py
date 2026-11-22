"""Structured JSON Logging configuration with correlation ID tracking."""

import logging
import sys
from contextvars import ContextVar
from typing import Any, Dict, Optional

from pythonjsonlogger import jsonlogger

# Context variable to hold request correlation ID across async coroutines
correlation_id_ctx: ContextVar[Optional[str]] = ContextVar("correlation_id_ctx", default=None)


def get_correlation_id() -> Optional[str]:
    return correlation_id_ctx.get()


def set_correlation_id(correlation_id: str) -> None:
    correlation_id_ctx.set(correlation_id)


class EnterpriseJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter injecting standard observability attributes."""

    def add_fields(
        self,
        log_record: Dict[str, Any],
        record: logging.LogRecord,
        message_dict: Dict[str, Any],
    ) -> None:
        super().add_fields(log_record, record, message_dict)
        log_record["correlation_id"] = get_correlation_id() or "system"
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["source"] = f"{record.module}:{record.lineno}"


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures structured JSON logging for the application."""
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates
    for handler in list(logger.handlers):
        logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    formatter = EnterpriseJsonFormatter("%(asctime)s %(level)s %(logger)s %(correlation_id)s %(message)s")
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Silence overly verbose third-party loggers
    logging.getLogger("uvicorn.access").handlers = [console_handler]
    logging.getLogger("uvicorn.error").handlers = [console_handler]
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger


def get_logger(name: str = "") -> logging.Logger:
    """Returns a named logger instance."""
    return logging.getLogger(name)
