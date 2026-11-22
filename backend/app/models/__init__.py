"""Package models registry for Alembic discovery and ORM imports."""

from app.db.base import Base
from app.models.audit import AuditLog
from app.models.conversation import Conversation, ConversationMessage
from app.models.knowledge import (
    DocumentChunk,
    DocumentProcessingJob,
    DocumentVersion,
    KnowledgeDocument,
)
from app.models.tenant import Branch, KioskDevice, Tenant, TenantSetting
from app.models.user import Permission, Role, RolePermission, User, UserRole
from app.models.visitor import Visitor, VisitorSession

__all__ = [
    "Base",
    "Tenant",
    "Branch",
    "TenantSetting",
    "KioskDevice",
    "User",
    "Role",
    "Permission",
    "UserRole",
    "RolePermission",
    "Visitor",
    "VisitorSession",
    "Conversation",
    "ConversationMessage",
    "KnowledgeDocument",
    "DocumentVersion",
    "DocumentChunk",
    "DocumentProcessingJob",
    "AuditLog",
]
