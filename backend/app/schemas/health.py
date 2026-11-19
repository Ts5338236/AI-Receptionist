"""Pydantic schemas for system and subsystem health probes."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall service status (healthy, degraded, unhealthy)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(..., description="Application version")
    environment: str = Field(..., description="Deployment environment")
    service: str = Field(default="ai-receptionist-backend")


class SubsystemHealth(BaseModel):
    name: str
    status: str = Field(..., description="Component status (healthy, unhealthy)")
    latency_ms: float = Field(..., description="Probe response latency in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class DatabaseHealthResponse(SubsystemHealth):
    name: str = "postgresql"


class RedisHealthResponse(SubsystemHealth):
    name: str = "redis"
