from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from django.test import TestCase
import logging
import json

from edms_api.models import AuditLog
from shared.views import AuditLogViewSet, LoginView, SavedQueryCreateView, SearchFacetsView, SearchView
from shared.logging import JsonLogFormatter
from shared.startup import validate_startup_config


class AuditLogViewSetSecurityTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user_alice = User.objects.create_user(username='alice', password='pass')
        self.user_bob = User.objects.create_user(username='bob', password='pass')
        self.admin = User.objects.create_user(username='admin', password='pass', is_staff=True)

        AuditLog.log('LOGIN', 'System', user=self.user_alice, entity='alice')
        AuditLog.log('LOGIN', 'System', user=self.user_bob, entity='bob')

    def test_non_admin_only_sees_own_logs(self):
        request = self.factory.get('/api/v1/audit/log/')
        force_authenticate(request, user=self.user_alice)
        response = AuditLogViewSet.as_view({'get': 'list'})(request)

        self.assertEqual(response.status_code, 200)
        payload = response.data
        items = payload.get('results', []) if isinstance(payload, dict) else payload
        self.assertGreaterEqual(len(items), 1)
        self.assertTrue(all(item['user'] == self.user_alice.id for item in items))

    def test_admin_can_filter_by_username(self):
        request = self.factory.get('/api/v1/audit/log/?user=bob')
        force_authenticate(request, user=self.admin)
        response = AuditLogViewSet.as_view({'get': 'list'})(request)

        self.assertEqual(response.status_code, 200)
        payload = response.data
        items = payload.get('results', []) if isinstance(payload, dict) else payload
        self.assertGreaterEqual(len(items), 1)
        self.assertTrue(all(item['user'] == self.user_bob.id for item in items))


class ApiEnvelopeTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(username='viewer', password='pass')

    def test_login_invalid_credentials_returns_standard_error(self):
        request = self.factory.post('/api/v1/auth/login/', {'username': 'bad', 'password': 'bad'}, format='json')
        response = LoginView.as_view()(request)

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['error']['code'], 'invalid_credentials')

    def test_search_short_query_returns_standard_error(self):
        request = self.factory.get('/api/v1/search/?q=x')
        force_authenticate(request, user=self.user)
        response = SearchView.as_view()(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['error']['code'], 'query_too_short')


class StartupValidationTests(TestCase):
    def test_validate_startup_config_flags_missing_non_debug_values(self):
        issues = validate_startup_config(
            debug=False,
            db_engine='postgresql',
            env={
                'DJANGO_SECRET_KEY': 'your-secret-key-change-in-production',
                'DJANGO_ALLOWED_HOSTS': '',
                'POSTGRES_PASSWORD': '',
            },
        )
        self.assertGreaterEqual(len(issues), 3)


class JsonLogFormatterTests(TestCase):
    def test_json_formatter_outputs_structured_payload(self):
        formatter = JsonLogFormatter()
        record = logging.LogRecord(
            name='test.logger',
            level=logging.INFO,
            pathname=__file__,
            lineno=123,
            msg='hello',
            args=(),
            exc_info=None,
        )
        record.correlation_id = 'cid-1'
        record.tenant_id = 'tenant-1'
        record.plant_id = 'plant-1'
        payload = json.loads(formatter.format(record))
        self.assertEqual(payload['message'], 'hello')
        self.assertEqual(payload['correlation_id'], 'cid-1')


class SearchAuxEndpointsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create_user(username='searcher', password='pass')

    def test_search_facets_endpoint_returns_success_envelope(self):
        request = self.factory.get('/api/v1/search/facets/?q=pump')
        force_authenticate(request, user=self.user)
        response = SearchFacetsView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('documents', response.data['data'])

    def test_saved_query_requires_query(self):
        request = self.factory.post('/api/v1/search/saved-query/', {'scope': 'ALL'}, format='json')
        force_authenticate(request, user=self.user)
        response = SavedQueryCreateView.as_view()(request)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['status'], 'error')

    def test_saved_query_create_success(self):
        request = self.factory.post('/api/v1/search/saved-query/', {'query': 'pump', 'scope': 'ALL'}, format='json')
        force_authenticate(request, user=self.user)
        response = SavedQueryCreateView.as_view()(request)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['query'], 'pump')
