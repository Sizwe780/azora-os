import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Users, LayoutDashboard, Star, Send, Trash2, Plus, Edit, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  folder: string;
  starred: boolean;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const ROLES = ['Admin', 'Fleet Manager', 'Compliance Officer', 'Driver', 'Manager', 'Accountant'];
const FOLDERS = ['inbox', 'sent', 'drafts', 'trash', 'starred'];

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'users' | 'dashboard'>('email');
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Driver',
    password: ''
  });

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4085/api/admin/email/user123/${selectedFolder}`);
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      // Set demo data for now
      setEmails([
        {
          id: '1',
          from: 'fleet@azora.world',
          to: 'driver@azora.world',
          subject: 'Trip Assignment for Today',
          body: 'You have been assigned to deliver cargo to Durban. Please check your dashboard.',
          timestamp: new Date().toISOString(),
          folder: 'inbox',
          starred: false,
          read: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4085/api/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Set demo data
      setUsers([
        {
          id: '1',
          name: 'John Driver',
          email: 'john@azora.world',
          role: 'Driver',
          status: 'Active',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'email') {
      void fetchEmails();
    } else if (activeTab === 'users') {
      void fetchUsers();
    }
  }, [activeTab, fetchEmails, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'email') {
      void fetchEmails();
    }
  }, [activeTab, fetchEmails, selectedFolder]);

  const sendEmail = async () => {
    try {
      await axios.post('http://localhost:4085/api/admin/email/send', {
        ...emailForm,
        from: 'admin@azora.world'
      });
      toast.success('Email sent successfully!');
      setComposing(false);
      setEmailForm({ to: '', subject: '', body: '' });
      await fetchEmails();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    }
  };

  const toggleStar = async (emailId: string) => {
    try {
      await axios.post(`http://localhost:4085/api/admin/email/${emailId}/star`);
      toast.success('Email starred');
      await fetchEmails();
    } catch (error) {
      console.error('Failed to star email:', error);
      toast.error('Failed to star email');
    }
  };

  const createUser = async () => {
    try {
      await axios.post('http://localhost:4085/api/admin/users', userForm);
      toast.success('User created successfully!');
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'Driver', password: '' });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
        <p className="text-blue-200">Your Command Center - All in One Place</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === 'email'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Mail className="w-5 h-5" />
          Email
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === 'users'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Users className="w-5 h-5" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
            activeTab === 'dashboard'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
      </div>

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Folder Sidebar */}
          <div className="col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4"
            >
              <button
                onClick={() => setComposing(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all"
              >
                <Plus className="w-5 h-5" />
                Compose
              </button>

              <div className="space-y-2">
                {FOLDERS.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-4 py-2 rounded-lg capitalize transition-all ${
                      selectedFolder === folder
                        ? 'bg-blue-500 text-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Email List */}
          <div className="col-span-9">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              {composing ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-4">Compose Email</h2>
                  <input
                    type="email"
                    placeholder="To:"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Subject:"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Body:"
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={sendEmail}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                    <button
                      onClick={() => setComposing(false)}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedEmail ? (
                <div>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="mb-4 text-blue-400 hover:text-blue-300"
                  >
                    ← Back to inbox
                  </button>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">{selectedEmail.subject}</h2>
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>From: {selectedEmail.from}</span>
                      <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-white/90 whitespace-pre-wrap">{selectedEmail.body}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-white text-center py-8">Loading emails...</div>
                  ) : emails.length === 0 ? (
                    <div className="text-white/50 text-center py-8">No emails in {selectedFolder}</div>
                  ) : (
                    emails.map((email) => (
                      <motion.div
                        key={email.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedEmail(email)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all border border-white/10"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${email.read ? 'text-white/70' : 'text-white'}`}>
                                {email.subject}
                              </h3>
                              {!email.read && (
                                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">New</span>
                              )}
                            </div>
                            <p className="text-sm text-white/50">{email.from}</p>
                            <p className="text-sm text-white/70 mt-1 line-clamp-2">{email.body}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id);
                            }}
                            className="ml-4"
                          >
                            <Star className={`w-5 h-5 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-white/70">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400 hover:text-blue-300 mr-3">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-6"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <Shield className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-400">{users.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <Mail className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Emails Today</h3>
            <p className="text-3xl font-bold text-green-400">{emails.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Active Sessions</h3>
            <p className="text-3xl font-bold text-purple-400">12</p>
          </div>
        </motion.div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-800">
                    {role}
                  </option>
                ))}
              </select>
              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={createUser}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                >
                  Create User
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
