from unittest.mock import MagicMock, patch

from django.core.exceptions import ValidationError as DjangoValidationError
from django.test import SimpleTestCase
from rest_framework.exceptions import ValidationError

from config_mgmt.services import BomService


class BomServiceValidationTests(SimpleTestCase):
    def test_update_raises_validation_error_from_message_dict(self):
        serializer = MagicMock()
        serializer.save.side_effect = DjangoValidationError({"field": ["Invalid data"]})
        serializer.instance.parent = MagicMock()

        request = MagicMock()
        request.user = MagicMock()

        with patch("config_mgmt.services.PermissionService"):
            with self.assertRaises(ValidationError) as context:
                BomService.update(serializer, request)

        self.assertEqual(context.exception.detail, {"field": ["Invalid data"]})
