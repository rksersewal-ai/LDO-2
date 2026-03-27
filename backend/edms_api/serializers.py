"""
Compatibility serializer façade.

The canonical serializers now live in the modular backend apps. These
re-exports preserve older imports while the public API remains stable.
"""

from config_mgmt.serializers import PlBomLineSerializer, PlDocumentLinkSerializer, PlItemSerializer
from documents.serializers import DocumentSerializer, OcrJobSerializer
from shared.serializers import AuditLogSerializer
from work.serializers import ApprovalSerializer, CaseSerializer, WorkRecordSerializer

__all__ = [
    'ApprovalSerializer',
    'AuditLogSerializer',
    'CaseSerializer',
    'DocumentSerializer',
    'OcrJobSerializer',
    'PlBomLineSerializer',
    'PlDocumentLinkSerializer',
    'PlItemSerializer',
    'WorkRecordSerializer',
]
