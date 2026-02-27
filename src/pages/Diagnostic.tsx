import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, get } from 'firebase/database';
import { AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  error?: string;
}

const Diagnostic = () => {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Firebase Connection', status: 'pending', message: 'Testing...' },
    { name: 'Read /hazards', status: 'pending', message: 'Testing...' },
    { name: 'Write Test Report', status: 'pending', message: 'Testing...' },
    { name: 'Read Test Report', status: 'pending', message: 'Testing...' },
  ]);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const updateResult = (index: number, status: 'success' | 'error', message: string, error?: string) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], status, message, error };
      return newResults;
    });
  };

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([
      { name: 'Firebase Connection', status: 'pending', message: 'Testing...' },
      { name: 'Read /hazards', status: 'pending', message: 'Testing...' },
      { name: 'Write Test Report', status: 'pending', message: 'Testing...' },
      { name: 'Read Test Report', status: 'pending', message: 'Testing...' },
    ]);

    try {
      // Test 1: Firebase Connection
      console.log('Test 1: Checking Firebase connection...');
      if (!db) {
        updateResult(0, 'error', 'Firebase not initialized', 'db object is null');
        setTesting(false);
        return;
      }
      updateResult(0, 'success', 'Firebase database initialized successfully');

      // Test 2: Read /hazards
      console.log('Test 2: Attempting to read /hazards...');
      try {
        const hazardsRef = ref(db, 'hazards');
        const snapshot = await get(hazardsRef);
        updateResult(1, 'success', `Read successful. Data exists: ${snapshot.exists()}`);
      } catch (readError: any) {
        updateResult(1, 'error', 'Read failed', readError.message);
        console.error('Read error:', readError);
      }

      // Test 3: Write test report
      console.log('Test 3: Attempting to write test report...');
      let testReportKey = '';
      try {
        const testPayload = {
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Diagnostic test report'
        };
        const reportsRef = ref(db, 'hazards/reports');
        const newReportRef = await push(reportsRef, testPayload);
        testReportKey = newReportRef.key || '';
        updateResult(2, 'success', `Write successful! Report ID: ${newReportRef.key}`);

        // Test 4: Read the test report back
        console.log('Test 4: Reading test report back...');
        try {
          const readSnapshot = await get(newReportRef);
          if (readSnapshot.exists()) {
            updateResult(3, 'success', `Read test report successful. ✅ Firebase is working!`);
          } else {
            updateResult(3, 'error', 'Test report not found after write', 'Report was written but cannot be read back');
          }
        } catch (readBackError: any) {
          updateResult(3, 'error', 'Read test report failed', readBackError.message);
        }
      } catch (writeError: any) {
        updateResult(2, 'error', 'Write failed', writeError.message);
        console.error('Write error:', writeError);
        console.error('Error code:', writeError.code);
        console.error('Error name:', writeError.name);
      }
    } catch (err: any) {
      console.error('Diagnostic error:', err);
    }
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">🔍 System Diagnostics</h1>
          </div>

          {/* Auth Status */}
          <div className="mb-8 border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Authentication Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-gray-800">
                  {authLoading ? '⏳ Loading...' : user ? '✅ Logged In' : '⚠️ Not Logged In'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">User</p>
                <p className="text-lg font-bold text-gray-800">
                  {user?.name || 'Anonymous'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-bold text-gray-800 break-all">
                  {user?.email || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-bold text-gray-800">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Firebase Config */}
          <div className="mb-8 border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Firebase Configuration</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {import.meta.env.VITE_FIREBASE_API_KEY ? 
                  <CheckCircle className="w-5 h-5 text-green-600" /> : 
                  <XCircle className="w-5 h-5 text-red-600" />
                }
                <p className="font-semibold text-gray-800">API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Configured' : '✗ Missing'}</p>
              </div>
              <div className="flex items-center gap-2">
                {import.meta.env.VITE_FIREBASE_DATABASE_URL ? 
                  <CheckCircle className="w-5 h-5 text-green-600" /> : 
                  <XCircle className="w-5 h-5 text-red-600" />
                }
                <p className="font-semibold text-gray-800">Database URL: {import.meta.env.VITE_FIREBASE_DATABASE_URL ? '✓ Configured' : '✗ Missing'}</p>
              </div>
              <div className="flex items-center gap-2">
                {import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
                  <CheckCircle className="w-5 h-5 text-green-600" /> : 
                  <XCircle className="w-5 h-5 text-red-600" />
                }
                <p className="font-semibold text-gray-800">Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Configured' : '✗ Missing'}</p>
              </div>
            </div>
          </div>

          {/* Firebase Tests */}
          <div className="mb-8 border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Firebase Database Tests</h2>
            <div className="space-y-4 mb-6">
              {results.map((result, index) => (
                <div key={index} className="border-2 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    {result.status === 'pending' && (
                      <div className="mt-1 animate-spin">
                        <Loader className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    {result.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    )}

                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        result.status === 'success' ? 'text-green-700' :
                        result.status === 'error' ? 'text-red-700' :
                        'text-gray-700'
                      }`}>
                        {result.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.error && (
                        <div className="bg-red-100 border border-red-300 rounded p-2 mt-2">
                          <p className="text-xs font-mono text-red-900">{result.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {testing ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>

          {/* Solutions */}
          <div className="bg-red-50 border-4 border-red-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              🚨 ACTION REQUIRED: Fix Firebase Rules
            </h2>
            
            <div className="bg-white border-2 border-red-300 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-bold mb-3">Your database is BLOCKING all writes. Fix it now:</p>
              
              <a 
                href="https://console.firebase.google.com/project/aquaalert-ae2f7/database/aquaalert-ae2f7-default-rtdb/rules" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg mb-4"
              >
                🔧 OPEN FIREBASE RULES EDITOR →
              </a>

              <ol className="space-y-3 text-sm text-gray-900 list-decimal ml-5 mb-4">
                <li className="font-semibold">Click the button above (opens in new tab)</li>
                <li>You'll see the Rules editor with JSON code</li>
                <li><strong>DELETE EVERYTHING</strong> in that editor</li>
                <li>Copy and paste this EXACT code:</li>
              </ol>

              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto font-mono mb-4">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
              </pre>

              <ol start={5} className="space-y-3 text-sm text-gray-900 list-decimal ml-5">
                <li>Click the blue <strong className="text-blue-600">"Publish"</strong> button (top right)</li>
                <li>Click <strong>"Publish"</strong> again when asked to confirm</li>
                <li>Wait for the green checkmark ✅ "Rules published successfully"</li>
                <li className="font-bold text-red-700">Come back here and click "Run Tests Again" below</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-3">
              <p className="text-xs text-gray-800">
                <strong>Why?</strong> Firebase blocks ALL database writes by default for security. 
                You must explicitly allow writes by updating the rules. This is a one-time setup.
              </p>
            </div>
          </div>

          {/* Additional Help */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
            <h2 className="font-semibold text-blue-900 mb-3">Other Issues:</h2>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-semibold">❌ "Firebase Connection" fails:</p>
                <p className="ml-4 mt-1">Check your .env file has correct Firebase credentials and refresh the page</p>
              </div>
              <div>
                <p className="font-semibold">✅ All tests pass:</p>
                <p className="ml-4 mt-1">Great! Go to <a href="/report" className="text-blue-600 hover:underline font-bold">Report Hazard</a> or <a href="/test" className="text-blue-600 hover:underline font-bold">Simple Test</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <a href="/" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Home</a>
          <a href="/report" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Report Hazard</a>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
