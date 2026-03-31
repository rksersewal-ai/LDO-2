"""
Compatibility serializer façade.

The canonical serializers now live in the modular backend apps. These
re-exports preserve older imports while the public API remains stable.
"""

from config_mgmt.serializers import (
    BaselineItemSerializer,
    BaselineSerializer,
    BomAddSerializer,
    BomCompareSerializer,
    BomImpactPreviewSerializer,
    BomMoveSerializer,
    BomReorderSerializer,
    BomReplaceSerializer,
    ChangeNoticeDecisionSerializer,
    ChangeNoticeSerializer,
    ChangeRequestDecisionSerializer,
    ChangeRequestSerializer,
    PlBomLineSerializer,
    PlDocumentLinkSerializer,
    PlItemSerializer,
)
from documents.serializers import DocumentSerializer, OcrJobSerializer
from shared.serializers import AuditLogSerializer
from work.serializers import ApprovalSerializer, CaseSerializer, WorkRecordSerializer

__all__ = [
    'ApprovalSerializer',
    'AuditLogSerializer',
    'BaselineItemSerializer',
    'BaselineSerializer',
    'BomAddSerializer',
    'BomCompareSerializer',
    'BomImpactPreviewSerializer',
    'BomMoveSerializer',
    'BomReorderSerializer',
    'BomReplaceSerializer',
    'ChangeNoticeDecisionSerializer',
    'ChangeNoticeSerializer',
    'ChangeRequestDecisionSerializer',
    'ChangeRequestSerializer',
    'CaseSerializer',
    'DocumentSerializer',
    'OcrJobSerializer',
    'PlBomLineSerializer',
    'PlDocumentLinkSerializer',
    'PlItemSerializer',
    'WorkRecordSerializer',
]
