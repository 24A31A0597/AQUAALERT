import { useState } from 'react';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';

const SimpleTestForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    console.log('=== SIMPLE TEST SUBMISSION ===');
    console.log('Title:', title);
    console.log('Description:', description);

    try {
      const payload = {
        title: title,
        description: description,
        type: 'test',
        severity: 'medium',
        location: { lat: 20.5, lng: 78.9 },
        submittedBy: 'test-user',
        timestamp: new Date().toISOString()
      };

      console.log('Sending to Firebase:', payload);

      const reportsRef = ref(db, 'hazards/reports');
      const result = await push(reportsRef, payload);

      console.log('✅ SUCCESS! ID:', result.key);
      setMessage(`✅ Success! Report ID: ${result.key}`);
      setTitle('');
      setDescription('');
    } catch (error: any) {
      console.error('❌ FAILED:', error);
      setMessage(`❌ Error: ${error.message} (Code: ${error.code})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 Simple Firebase Test</h1>
        <p className="text-gray-600 mb-6">This is a minimal form to test if Firebase submission works</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p className="font-mono text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
          >
            {isSubmitting ? '⏳ Submitting...' : '📤 Submit Test'}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800"><strong>Note:</strong> Check browser console (F12) for detailed logs</p>
        </div>

        {/* Firebase Rules Fix Guide */}
        <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-3">🔴 Getting "Permission denied" error?</h3>
          <p className="text-red-800 font-semibold mb-3">Fix Firebase Rules NOW (takes 2 minutes):</p>
          
          <ol className="space-y-2 text-sm text-red-900 list-decimal ml-5">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Firebase Console</a></li>
            <li>Select project: <strong>aquaalert-ae2f7</strong></li>
            <li>Click <strong>Realtime Database</strong> (left sidebar)</li>
            <li>Click <strong>Rules</strong> tab at the top</li>
            <li>Replace EVERYTHING with this code:</li>
          </ol>

          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg mt-3 text-sm overflow-auto font-mono">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
          </pre>

          <ol start={6} className="space-y-2 text-sm text-red-900 list-decimal ml-5 mt-3">
            <li>Click the blue <strong>Publish</strong> button</li>
            <li>Confirm when asked</li>
            <li>Wait for green checkmark ✅</li>
            <li>Come back here and try again!</li>
          </ol>

          <div className="mt-4 bg-white border border-red-300 rounded p-3">
            <p className="text-xs text-gray-700">
              <strong>Why this error?</strong> Your Firebase database is currently blocking ALL write operations. 
              The rules above will allow your app to save hazard reports. Without this fix, nothing will work.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <a href="/" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Home</a>
          <a href="/report" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Full Form</a>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestForm;
