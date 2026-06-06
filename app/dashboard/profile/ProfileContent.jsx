'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function ProfileContent({ session }) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(session.user.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUsernameChange = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (newUsername.length > 20) {
      setError('Username must not exceed 20 characters');
      return;
    }

    // Check if username contains only valid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUsername: newUsername.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update username');
        setLoading(false);
        return;
      }

      setSuccess('Username updated successfully!');
      setIsEditingUsername(false);
      
      // Update the session username display (requires page refresh for full effect)
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(session.user.username || '');
    setIsEditingUsername(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl p-8 md:p-12">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-gray-200 dark:border-slate-700">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Profile"}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {session.user.name || "User Profile"}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-lg">
                {session.user.role
                  ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)
                  : "Student"}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-8 space-y-6">
            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200 dark:border-slate-700">
              <label className="text-gray-600 dark:text-slate-400 font-medium mb-2 md:mb-0">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                {session.user.email}
              </p>
            </div>

            {/* Name */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200 dark:border-slate-700">
              <label className="text-gray-600 dark:text-slate-400 font-medium mb-2 md:mb-0">
                Full Name
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                {session.user.name || "Not Set"}
              </p>
            </div>

            {/* Username - Editable */}
            <div className="py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <label className="text-gray-600 dark:text-slate-400 font-medium">
                  Username
                </label>
                {!isEditingUsername ? (
                  <div className="flex items-center gap-3">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {session.user.username || "Not Set"}
                    </p>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
                      title="Edit username"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter new username"
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUsernameChange}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <CheckIcon className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
              )}
              {success && (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">{success}</p>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-b border-gray-200 dark:border-slate-700">
              <label className="text-gray-600 dark:text-slate-400 font-medium mb-2 md:mb-0">
                Role
              </label>
              <div className="inline-flex px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                {session.user.role
                  ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)
                  : "Student"}
              </div>
            </div>

            {/* User ID */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
              <label className="text-gray-600 dark:text-slate-400 font-medium mb-2 md:mb-0">
                User ID
              </label>
              <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                {session.user.id}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700 flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-center text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
