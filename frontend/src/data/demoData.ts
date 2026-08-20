import type { EventStreamEntry, AgentDecision } from '../types';

export const demoAnalysisResult = {
  name: 'demo-flask-api',
  languages: { Python: 62, TypeScript: 28, CSS: 7, Other: 3 },
  frameworks: ['Flask', 'React', 'Vite'],
  files_count: 42,
  dependencies: { python: ['flask', 'flask-cors', 'pytest', 'requests', 'pyjwt'], javascript: ['react', 'react-dom', 'vite'] },
  entry_points: ['backend/app.py', 'frontend/src/App.js'],
  test_files: ['tests/test_api.py'],
  structure: {
    'backend/': {
      'app.py': null,
      'models.py': null,
      'auth.py': null,
      '__init__.py': null,
    },
    'frontend/': {
      'src/': { 'App.js': null, 'index.js': null },
      'package.json': null,
    },
    'tests/': { 'test_api.py': null, '__init__.py': null },
    'requirements.txt': null,
    'README.md': null,
  },
  summary: 'Flask REST API with authentication, CRUD operations, and React frontend. 42 files across backend, frontend, and tests.',
  keyFindings: [
    'Authentication layer identified',
    'API routes identified',
    'Test suite detected',
    'Dependency structure mapped',
  ],
  architectureLayers: ['API', 'Services', 'Models', 'Tests'],
  languageBreakdown: [
    { name: 'Python', percentage: 62 },
    { name: 'TypeScript', percentage: 28 },
    { name: 'CSS', percentage: 7 },
    { name: 'Other', percentage: 3 },
  ],
};

export const demoPlanResult = {
  goal: 'Add JWT authentication to the Flask API with token validation middleware and protected routes',
  steps: [
    { id: 1, description: 'Create JWT token utility', files_involved: ['backend/auth.py'], reason: 'Centralize token generation and validation logic in a dedicated module' },
    { id: 2, description: 'Add authentication middleware', files_involved: ['backend/auth.py'], reason: 'Enforce authentication at the request boundary before protected resources' },
    { id: 3, description: 'Protect private API routes', files_involved: ['backend/app.py'], reason: 'Apply the token_required decorator to routes requiring authentication' },
    { id: 4, description: 'Update authentication tests', files_involved: ['tests/test_api.py'], reason: 'Verify auth endpoints and protected routes work correctly' },
    { id: 5, description: 'Handle expired tokens', files_involved: ['backend/auth.py'], reason: 'Return appropriate 401 responses for expired JWT tokens' },
    { id: 6, description: 'Handle invalid tokens', files_involved: ['backend/auth.py'], reason: 'Reject malformed or tampered JWT tokens gracefully' },
    { id: 7, description: 'Update documentation', files_involved: ['README.md'], reason: 'Document the new authentication flow and usage examples' },
  ],
  files_to_modify: ['backend/app.py', 'backend/auth.py', 'frontend/src/App.js', 'tests/test_api.py'],
  files_to_create: [],
  dependencies: ['pyjwt'],
  testing_strategy: 'Run pytest to verify auth endpoints and protected routes',
};

export const demoCodeChanges = [
  {
    id: 'auth.py',
    task_id: 'demo-impl',
    file_path: 'backend/auth.py',
    operation: 'modify',
    content: `import jwt
import datetime
from functools import wraps
from flask import request, jsonify, g

SECRET_KEY = "devpilot-demo-secret-key"

def create_access_token(user_id, expires_delta=3600):
    """Create a JWT access token for the given user."""
    payload = {
        "sub": user_id,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_delta)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def token_required(f):
    """Decorator to require a valid JWT token for route access."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.current_user = payload["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated`,
    diff: `@@ -1,8 +1,38 @@
 import jwt
-import g
+import datetime
+from functools import wraps
+from flask import request, jsonify, g
+
+SECRET_KEY = "devpilot-demo-secret-key"
+
+def create_access_token(user_id, expires_delta=3600):
+    """Create a JWT access token for the given user."""
+    payload = {
+        "sub": user_id,
+        "iat": datetime.datetime.utcnow(),
+        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_delta)
+    }
+    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
+
+def token_required(f):
+    """Decorator to require a valid JWT token for route access."""
+    @wraps(f)
+    def decorated(*args, **kwargs):
+        token = None
+        auth_header = request.headers.get("Authorization", "")
+        if auth_header.startswith("Bearer "):
+            token = auth_header.split(" ")[1]
+
+        if not token:
+            return jsonify({"error": "Token is missing"}), 401
+
+        try:
+            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
+            g.current_user = payload["sub"]
+        except jwt.ExpiredSignatureError:
+            return jsonify({"error": "Token has expired"}), 401
+        except jwt.InvalidTokenError:
+            return jsonify({"error": "Invalid token"}), 401
+
+        return f(*args, **kwargs)
+    return decorated`,
    language: 'python',
    why: 'The requested task requires JWT authentication. The repository currently resolves users before validating the bearer token. DevPilot identified this middleware as the request boundary responsible for authentication enforcement.',
    impact: 'Security ↑',
  },
  {
    id: 'app.py',
    task_id: 'demo-impl',
    file_path: 'backend/app.py',
    operation: 'modify',
    content: `from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.auth import create_access_token, token_required

app = Flask(__name__)
CORS(app)

@app.route("/api/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Demo: accept any non-empty credentials
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    token = create_access_token(username)
    return jsonify({"token": token, "user": username})

@app.route("/api/protected", methods=["GET"])
@token_required
def protected_route():
    """Example protected route requiring JWT authentication."""
    return jsonify({"message": "Access granted", "user": g.current_user})

@app.route("/api/items", methods=["GET"])
def get_items():
    """Public endpoint to list items."""
    return jsonify({"items": [{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]})

if __name__ == "__main__":
    app.run(debug=True)`,
    diff: `@@ -1,6 +1,8 @@
 from flask import Flask, request, jsonify
 from flask_cors import CORS
+from backend.auth import create_access_token, token_required
+
 app = Flask(__name__)
 CORS(app)
 
@@ -8,6 +10,22 @@
-    return jsonify({"message": "Hello, World!"})
+@app.route("/api/login", methods=["POST"])
+def login():
+    """Authenticate user and return JWT token."""
+    data = request.get_json()
+    username = data.get("username")
+    password = data.get("password")
+    if not username or not password:
+        return jsonify({"error": "Username and password required"}), 400
+    token = create_access_token(username)
+    return jsonify({"token": token, "user": username})
+
+@app.route("/api/protected", methods=["GET"])
+@token_required
+def protected_route():
+    """Example protected route requiring JWT authentication."""
+    return jsonify({"message": "Access granted", "user": g.current_user})`,
    language: 'python',
    why: 'The login endpoint must issue JWT tokens, and protected routes must validate them. The auth module provides both capabilities, so this file imports and applies them.',
    impact: 'Security ↑, Functionality ↑',
  },
];

export const demoTestRun = {
  id: 'demo-test',
  task_id: 'demo-test',
  command: 'pytest tests/ -v',
  exit_code: 0,
  stdout: `================ test session starts ================

tests/test_api.py::test_get_items PASSED
tests/test_api.py::test_login_success PASSED
tests/test_api.py::test_login_missing_fields PASSED
tests/test_api.py::test_protected_route_no_token PASSED
tests/test_api.py::test_protected_route_invalid_token PASSED
tests/test_api.py::test_protected_route_valid_token PASSED
tests/test_api.py::test_create_item PASSED
tests/test_api.py::test_delete_item PASSED
tests/test_api.py::test_update_item PASSED

================= 9 passed in 1.23s =================`,
  stderr: '',
  duration: 1.23,
  created_at: new Date().toISOString(),
};

export const demoTestRunFailed = {
  id: 'demo-test-failed',
  task_id: 'demo-test-failed',
  command: 'pytest tests/ -v',
  exit_code: 1,
  stdout: `================ test session starts ================

tests/test_api.py::test_get_items PASSED
tests/test_api.py::test_login_success PASSED
tests/test_api.py::test_login_missing_fields PASSED
tests/test_api.py::test_protected_route_no_token FAILED
tests/test_api.py::test_protected_route_valid_token FAILED

================= 2 failed, 3 passed in 1.45s =================`,
  stderr: `FAILED tests/test_api.py::test_protected_route_no_token - AttributeError: module 'backend.auth' has no attribute 'g'
FAILED tests/test_api.py::test_protected_route_valid_token - AttributeError: module 'backend.auth' has no attribute 'g'`,
  duration: 1.45,
  created_at: new Date().toISOString(),
};

export const demoDebugResult = {
  root_cause: 'The original auth.py accessed g.user before validating the JWT token, causing an AttributeError when the token was missing or invalid.',
  suggested_fix: 'Validate the JWT token and extract the user from the payload before accessing g.current_user. Use the token_required decorator to ensure proper authentication flow.',
  affected_files: ['backend/auth.py'],
  confidence: 0.92,
};

export const demoReportResult = {
  summary: 'Successfully implemented JWT authentication for the Flask API. Added token generation, validation middleware, login endpoint, and protected routes. All 9 tests pass.',
  files_changed: ['backend/auth.py', 'backend/app.py', 'tests/test_api.py'],
  features_implemented: [
    'JWT token generation with configurable expiration',
    'Token validation middleware with decorator pattern',
    '/api/login endpoint for authentication',
    '/api/protected route example',
    'Comprehensive authentication test suite',
  ],
  tests_passed: 9,
  tests_failed: 0,
  issues: [],
  security_considerations: [
    'Secret key should be stored in environment variables in production',
    'Token expiration is set to 1 hour by default',
    'Consider adding refresh token mechanism for long sessions',
  ],
  next_steps: [
    'Add token refresh endpoint',
    'Implement role-based access control',
    'Add rate limiting to login endpoint',
  ],
  score: {
    completeness: 9,
    code_quality: 8,
    test_coverage: 8,
    documentation: 7,
    architecture: 8,
    overall: 8,
  },
};

export const demoDecisions: AgentDecision[] = [
  {
    id: 'decision-1',
    timestamp: '14:32:13',
    agent: 'Planning Agent',
    title: 'Authentication boundary identified',
    reasoning: 'The requested task requires JWT authentication. DevPilot identified the middleware as the request boundary responsible for authentication enforcement. The repository currently resolves users before validating the bearer token.',
    evidence: ['backend/auth.py', 'backend/app.py', 'tests/test_api.py'],
    affectedFiles: ['backend/auth.py', 'backend/app.py'],
    outcome: 'Validate the JWT before resolving the user',
    diffLink: 'auth.py',
  },
  {
    id: 'decision-2',
    timestamp: '14:32:25',
    agent: 'Debugging Agent',
    title: 'Middleware validation order corrected',
    reasoning: 'The test failures revealed that auth.py accessed g.user before the JWT token was validated. The token_required decorator must extract and validate the token before any user resolution occurs.',
    evidence: ['tests/test_api.py', 'backend/auth.py'],
    affectedFiles: ['backend/auth.py'],
    outcome: 'Reordered middleware to validate token before user resolution',
    diffLink: 'auth.py',
  },
];

export const demoBeforeHealth = {
  overall: 69,
  code_quality: 73,
  architecture: 76,
  testing: 58,
  security: 71,
  documentation: 70,
  rating: 'NEEDS WORK',
};

export const demoAfterHealth = {
  overall: 89,
  code_quality: 91,
  architecture: 88,
  testing: 94,
  security: 92,
  documentation: 82,
  rating: 'EXCELLENT',
};

export const demoEventStream: EventStreamEntry[] = [
  { timestamp: '14:32:07', agent: 'analyzer', message: 'Scanning repository...', type: 'info' },
  { timestamp: '14:32:08', agent: 'analyzer', message: '42 files discovered', type: 'info' },
  { timestamp: '14:32:09', agent: 'analyzer', message: 'Flask detected', type: 'success' },
  { timestamp: '14:32:10', agent: 'analyzer', message: 'Repository analysis complete', type: 'success' },
  { timestamp: '14:32:12', agent: 'planner', message: 'Building implementation plan...', type: 'info' },
  { timestamp: '14:32:13', agent: 'planner', message: '7 implementation steps generated', type: 'success' },
  { timestamp: '14:32:13', agent: 'planner', message: 'Authentication boundary identified', type: 'decision' },
  { timestamp: '14:32:15', agent: 'planner', message: 'Plan generated', type: 'success' },
  { timestamp: '14:32:17', agent: 'implementer', message: 'Generating code changes...', type: 'info' },
  { timestamp: '14:32:19', agent: 'implementer', message: 'Modifying backend/auth.py', type: 'info' },
  { timestamp: '14:32:21', agent: 'implementer', message: 'Modifying backend/app.py', type: 'info' },
  { timestamp: '14:32:23', agent: 'implementer', message: 'Code changes generated', type: 'success' },
  { timestamp: '14:32:25', agent: 'tester', message: 'Running test suite...', type: 'info' },
  { timestamp: '14:32:27', agent: 'tester', message: '9/9 tests passing', type: 'success' },
  { timestamp: '14:32:28', agent: 'evaluator', message: 'Generating report...', type: 'info' },
  { timestamp: '14:32:30', agent: 'evaluator', message: 'Engineering health: 89/100', type: 'success' },
];

export const demoRunSummary = `DevPilot Engineering Run

Task: Add JWT authentication
Result: ✓ Completed

Files: 4 created, 7 modified
Tests: 12/12 passing
Engineering Health: 89/100

Workflow: Analyze → Plan → Implement → Test → Debug → Verify

Decisions: 8 engineering decisions
Verification: Tests executed, Failures diagnosed, Fix verified`;

export const guidedDemoSteps = [
  { label: 'Analysis', description: 'DevPilot is understanding the repository before changing code.', detail: '42 files analyzed' },
  { label: 'Plan', description: 'DevPilot identified the files and changes required for the task.', detail: '7 implementation steps' },
  { label: 'Build', description: 'Code changes generated with explanations for each modification.', detail: '2 files modified' },
  { label: 'Diff', description: 'Review the exact changes with context on why each was made.', detail: '34 lines added' },
  { label: 'Test', description: 'Automated test execution to verify correctness.', detail: '9/9 passing' },
  { label: 'Debug', description: 'If tests fail, DevPilot identifies root causes and applies fixes.', detail: 'Root cause identified' },
  { label: 'Verify', description: 'Re-run tests to confirm the fix resolved the issue.', detail: 'All passing' },
  { label: 'Report', description: 'Engineering health assessment with transparency on methodology.', detail: '89/100' },
];
