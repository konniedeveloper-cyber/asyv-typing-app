'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  PencilSquareIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import ConfirmDeleteModal from '@/app/components/ConfirmDeleteModal';
import SuccessModal from '@/app/components/SuccessModal';

export default function AdminDashboardContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null, isLoading: false });
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
  });

  // Get user from localStorage (set during login)
  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        console.log('✅ [ADMIN] User data from localStorage:', userData.email);
        setUser(userData);

        // Redirect non-admins
        if (userData.role !== 'admin') {
          console.log('🔄 [ADMIN] Non-admin redirecting to /dashboard');
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('❌ [ADMIN] Failed to parse user data:', error);
        router.push('/auth/login');
        return;
      }
    } else {
      console.log('❌ [ADMIN] No user in localStorage, redirecting to login');
      router.push('/auth/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('admin-darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update dark mode
  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('admin-darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('admin-darkMode', 'false');
      }
    }
  }, [darkMode, mounted]);

  // Fetch users when user is loaded
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(user?.email)}`);
      
      if (!response.ok) {
        let errorMsg = 'Failed to fetch users';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      console.log('📤 [ADMIN] Logging out...');
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('authUser');
      localStorage.removeItem('theme');
      localStorage.removeItem('admin-darkMode');
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('auth') || key.startsWith('token') || key.startsWith('session')) {
          localStorage.removeItem(key);
        }
      });
      
      // Wait a brief moment for localStorage to clear, then sign out
      await new Promise(resolve => setTimeout(resolve, 100));
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('❌ [ADMIN] Logout error:', error);
      setLogoutLoading(false);
      setSuccessModal({
        isOpen: true,
        title: 'Logout Error',
        message: 'Failed to logout. Please try again.'
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, email: user?.email }),
      });

      let errorMsg = 'Failed to update user';
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      setEditingUser(null);
      await fetchUsers();
      setSuccessModal({
        isOpen: true,
        title: 'Success',
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Update role error:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error Updating Role',
        message: error.message || 'Failed to update user'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    // Open the confirmation modal
    setDeleteConfirm({ isOpen: true, userId, isLoading: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.userId) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/admin/users/${deleteConfirm.userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      let errorMsg = 'Failed to delete user';
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      setDeleteConfirm({ isOpen: false, userId: null, isLoading: false });
      await fetchUsers();
      
      setSuccessModal({
        isOpen: true,
        title: 'User Deleted',
        message: 'User has been successfully deleted from the system'
      });
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteConfirm({ isOpen: false, userId: null, isLoading: false });
      setSuccessModal({
        isOpen: true,
        title: 'Error Deleting User',
        message: error.message || 'Failed to delete user'
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !user) {
    const isDarkMode = darkMode;
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        {/* Navbar Skeleton */}
        <nav className={`border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} sticky top-0 z-50`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`}></div>
                <div className={`h-7 bg-gray-200 w-48 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`h-4 bg-gray-200 w-32 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
                <div className={`h-10 w-10 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`}></div>
                <div className={`h-10 w-20 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} animate-pulse`}></div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`rounded-lg border p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`h-4 bg-gray-200 w-24 mb-3 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
                    <div className={`h-8 bg-gray-200 w-16 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
                  </div>
                  <div className={`w-12 h-12 rounded-full animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Switcher Skeleton */}
          <div className="mb-8 flex gap-4 flex-wrap">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-10 px-4 rounded-lg animate-pulse w-32 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className={`rounded-lg border p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`h-6 bg-gray-200 w-40 mb-6 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>

            {/* Search/Filter Skeleton */}
            <div className={`h-10 bg-gray-200 w-full mb-6 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>

            {/* Table skeleton */}
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`flex-1 h-4 bg-gray-200 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
                ))}
              </div>
              {/* Data rows */}
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <div key={j} className={`flex-1 h-4 bg-gray-200 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex gap-2 mt-6 justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-10 h-10 bg-gray-200 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : ''}`}></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {user?.username || user?.email}
              </span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logoutLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Students
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.students || 0}
                </p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Teachers
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.teachers || 0}
                </p>
              </div>
              <AdjustmentsHorizontalIcon className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Admins
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.admins || 0}
                </p>
              </div>
              <ShieldCheckIcon className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Users Management
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex justify-between items-center">
                <p className="text-red-800 dark:text-red-300 font-medium">
                  ⚠️ {errorMessage}
                </p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-slate-400">
                No users found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {user.username || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                role: e.target.value,
                              })
                            }
                            className="px-2 py-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                : user.role === 'teacher'
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        {editingUser?.id === user.id ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateRole(user.id, editingUser.role)
                              }
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-900 dark:text-white rounded text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded text-xs font-medium transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, isLoading: false })}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and all associated data will be removed."
        isLoading={deleteConfirm.isLoading}
      />

      {/* Success/Error Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        buttonText="OK"
      />
    </div>
  );
}
