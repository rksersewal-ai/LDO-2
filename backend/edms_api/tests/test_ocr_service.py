from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase
from edms_api.ocr_service import extract_text, OcrResult

class ExtractTextUtilityTests(SimpleTestCase):
    @patch('edms_api.ocr_service.get_ocr_service')
    def test_extract_text_success(self, mock_get_service):
        # Setup mock
        mock_service = MagicMock()
        mock_result = OcrResult(text="extracted text", confidence=0.95, engine="test_engine")
        mock_service.extract_text.return_value = mock_result
        mock_get_service.return_value = mock_service

        # Execute
        text, conf, engine, error = extract_text("dummy/path.pdf")

        # Assert
        mock_service.extract_text.assert_called_once_with("dummy/path.pdf")
        self.assertEqual(text, "extracted text")
        self.assertEqual(conf, 0.95)
        self.assertEqual(engine, "test_engine")
        self.assertIsNone(error)

    @patch('edms_api.ocr_service.get_ocr_service')
    def test_extract_text_error(self, mock_get_service):
        # Setup mock
        mock_service = MagicMock()
        mock_result = OcrResult(text="", confidence=0.0, engine="test_engine", error="some error")
        mock_service.extract_text.return_value = mock_result
        mock_get_service.return_value = mock_service

        # Execute
        text, conf, engine, error = extract_text("dummy/path.pdf")

        # Assert
        self.assertEqual(text, "")
        self.assertEqual(conf, 0.0)
        self.assertEqual(error, "some error")
