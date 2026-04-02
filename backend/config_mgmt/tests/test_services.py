import unittest
from unittest.mock import patch, MagicMock
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from config_mgmt.services import ChangeNoticeService

class ChangeNoticeServiceTest(unittest.TestCase):
    def test_create_with_django_validation_error_message_dict(self):
        """Test that ChangeNoticeService.create catches DjangoValidationError with message_dict and raises DRF ValidationError."""
        serializer_mock = MagicMock()

        error_msg = {'field_name': ['Error message']}
        serializer_mock.save.side_effect = DjangoValidationError(error_msg)

        request_mock = MagicMock()

        with self.assertRaises(ValidationError) as context:
            ChangeNoticeService.create(serializer_mock, request_mock)

        self.assertEqual(context.exception.detail, error_msg)

    def test_create_with_django_validation_error_messages(self):
        """Test that ChangeNoticeService.create catches DjangoValidationError with messages list and raises DRF ValidationError."""
        serializer_mock = MagicMock()

        error_msg = "A single error message"
        # When initialized with a string, DjangoValidationError sets it in .messages
        serializer_mock.save.side_effect = DjangoValidationError(error_msg)

        request_mock = MagicMock()

        with self.assertRaises(ValidationError) as context:
            ChangeNoticeService.create(serializer_mock, request_mock)

        # The DRF ValidationError detail will be a list containing the string
        self.assertEqual(context.exception.detail, [error_msg])
