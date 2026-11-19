"""Initial multi-tenant schema with kiosk and visitor models

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-19 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Tenants table
    op.create_table(
        'tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('plan_tier', sa.String(length=50), nullable=False, server_default='enterprise'),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_tenants_id', 'tenants', ['id'])
    op.create_index('ix_tenants_slug', 'tenants', ['slug'], unique=True)

    # 2. Buildings table
    op.create_table(
        'buildings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('timezone', sa.String(length=100), nullable=False, server_default='UTC'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_buildings_id', 'buildings', ['id'])
    op.create_index('ix_buildings_tenant_id', 'buildings', ['tenant_id'])

    # 3. Kiosk Devices table
    op.create_table(
        'kiosk_devices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('building_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('buildings.id', ondelete='SET NULL'), nullable=True),
        sa.Column('device_code', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('hardware_serial', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='offline'),
        sa.Column('capabilities', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('last_heartbeat_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_kiosk_devices_id', 'kiosk_devices', ['id'])
    op.create_index('ix_kiosk_devices_tenant_id', 'kiosk_devices', ['tenant_id'])
    op.create_index('ix_kiosk_devices_building_id', 'kiosk_devices', ['building_id'])
    op.create_index('ix_kiosk_devices_device_code', 'kiosk_devices', ['device_code'], unique=True)

    # 4. Visitors table
    op.create_table(
        'visitors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('is_vip', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('custom_fields', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_visitors_id', 'visitors', ['id'])
    op.create_index('ix_visitors_tenant_id', 'visitors', ['tenant_id'])
    op.create_index('ix_visitors_full_name', 'visitors', ['full_name'])
    op.create_index('ix_visitors_email', 'visitors', ['email'])
    op.create_index('ix_visitors_phone', 'visitors', ['phone'])
    op.create_index('ix_visitors_tenant_email', 'visitors', ['tenant_id', 'email'])
    op.create_index('ix_visitors_tenant_phone', 'visitors', ['tenant_id', 'phone'])

    # 5. Visitor Sessions table
    op.create_table(
        'visitor_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('visitor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('visitors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('kiosk_device_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('kiosk_devices.id', ondelete='SET NULL'), nullable=True),
        sa.Column('host_name', sa.String(length=255), nullable=False),
        sa.Column('host_email', sa.String(length=255), nullable=True),
        sa.Column('host_notified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('purpose_of_visit', sa.String(length=255), nullable=False),
        sa.Column('badge_printed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('checkin_status', sa.String(length=50), nullable=False, server_default='checked_in'),
        sa.Column('checkin_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('checkout_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('session_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_visitor_sessions_id', 'visitor_sessions', ['id'])
    op.create_index('ix_visitor_sessions_tenant_id', 'visitor_sessions', ['tenant_id'])
    op.create_index('ix_visitor_sessions_visitor_id', 'visitor_sessions', ['visitor_id'])
    op.create_index('ix_visitor_sessions_kiosk_device_id', 'visitor_sessions', ['kiosk_device_id'])

    # 6. Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='SET NULL'), nullable=True),
        sa.Column('actor_type', sa.String(length=50), nullable=False),
        sa.Column('actor_id', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=100), nullable=False),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('changes', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_audit_logs_id', 'audit_logs', ['id'])
    op.create_index('ix_audit_logs_tenant_id', 'audit_logs', ['tenant_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_resource_type', 'audit_logs', ['resource_type'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_logs_tenant_action', 'audit_logs', ['tenant_id', 'action'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('visitor_sessions')
    op.drop_table('visitors')
    op.drop_table('kiosk_devices')
    op.drop_table('buildings')
    op.drop_table('tenants')
