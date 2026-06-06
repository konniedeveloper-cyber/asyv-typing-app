'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightOnRectangleIcon,
  UserIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const CLASSES = [
  { id: 'ey-jupiter', name: 'EY Jupiter' },
  { id: 'ey-venus', name: 'EY Venus' },
  { id: 'ey-mercury', name: 'EY Mercury' },
  { id: 'ey-neptune', name: 'EY Neptune' },
];

export default function StudentProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState('ey-jupiter');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch current profile
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      if (data.classId) {
        // Map database class names back to IDs
        const classMap = {
          'EY jupiter': 'ey-jupiter',
          'EY venus': 'ey-venus',
          'EY mercury': 'ey-mercury',
          'EY neptune': 'ey-neptune',
        };
        setSelectedClass(classMap[data.classId] || 'ey-jupiter');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const classNameMap = {
        'ey-jupiter': 'EY jupiter',
        'ey-venus': 'EY venus',
        'ey-mercury': 'EY mercury',
        'ey-neptune': 'EY neptune',
      };

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classNameMap[selectedClass],
        }),
      });

      if (!response.ok) throw new Error('Failed to update class');

      setMessage({
        type: 'success',
        text: `✅ Successfully assigned to ${CLASSES.find((c) => c.id === selectedClass)?.name}`,
      });

      // Refresh profile
      setTimeout(() => fetchProfile(), 500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('authUser');
    localStorage.removeItem('theme');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('auth') || key.startsWith('token') || key.startsWith('session')) {
        localStorage.removeItem(key);
      }
    });
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentClass = CLASSES.find((c) => c.id === selectedClass);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {session?.user?.name || session?.user?.email}!
          </h2>
          <p className="text-gray-600">
            Update your class assignment below. Your teacher will be able to monitor your
            progress once you select a class.
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`rounded-lg border p-4 mb-8 flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={
                message.type === 'success'
                  ? 'text-emerald-800'
                  : 'text-red-800'
              }
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Class Selection Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <AcademicCapIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Select Your Class</h3>
          </div>

          <p className="text-gray-600 mb-6">
            Choose which class you belong to. Your teacher will monitor your typing progress
            through this class.
          </p>

          {/* Class Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedClass === cls.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Click to select</p>
                  </div>
                  {selectedClass === cls.id && (
                    <CheckCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Current Selection Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>Current Selection:</strong> {currentClass?.name}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveClass}
            disabled={saving}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Class Selection'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h4 className="font-semibold text-indigo-900 mb-2">💡 How It Works</h4>
          <ul className="text-sm text-indigo-800 space-y-2">
            <li>
              ✓ <strong>Select your class</strong> from the options above
            </li>
            <li>
              ✓ <strong>Your teacher</strong> will see you in their class dashboard
            </li>
            <li>
              ✓ <strong>They can monitor</strong> your typing speed and test progress
            </li>
            <li>
              ✓ <strong>You can update</strong> your class anytime from this page
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
