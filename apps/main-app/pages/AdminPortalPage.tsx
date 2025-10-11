import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import { mockEmails, mockUsers, Email, User } from '../features/admin-portal/mockAdminData';

import AdminTabs from '../components/admin-portal/AdminTabs';
import EmailSidebar from '../components/admin-portal/EmailSidebar';
import EmailList from '../components/admin-portal/EmailList';
import EmailDetail from '../components/admin-portal/EmailDetail';
import EmailComposer from '../components/admin-portal/EmailComposer';
import UserManagement from '../components/admin-portal/UserManagement';
import UserModal from '../components/admin-portal/UserModal';
import Dashboard from '../components/admin-portal/Dashboard';

type AdminTab = 'email' | 'users' | 'dashboard';

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Email state
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // User Management state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredEmails = useMemo(() => {
    if (selectedFolder === 'starred') {
      return emails.filter(e => e.starred);
    }
    return emails.filter(e => e.folder === selectedFolder);
  }, [emails, selectedFolder]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
  };

  const handleToggleStar = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  };

  const handleSendEmail = (newEmail: { to: string; subject: string; body: string }) => {
    const email: Email = {
      id: (emails.length + 1).toString(),
      from: { name: 'Admin', email: 'admin@azora.world', avatar: '/avatars/admin-user.png' },
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date().toISOString(),
      folder: 'sent',
      starred: false,
      read: true,
      labels: [],
    };
    setEmails(prev => [email, ...prev]);
    setIsComposing(false);
  };

  const handleSaveUser = (user: Partial<User>) => {
    if (user.id) { // Edit existing user
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...user } as User : u));
    } else { // Add new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        name: user.name || 'New User',
        email: user.email || '',
        avatar: `/avatars/new-user.png`,
        role: user.role || 'Driver',
        status: user.status || 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const openUserModal = (user: User | null) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'email':
        return (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
            <div className="col-span-3">
              <EmailSidebar
                onCompose={() => { setSelectedEmail(null); setIsComposing(true); }}
                selectedFolder={selectedFolder}
                onSelectFolder={(folder) => { setSelectedFolder(folder); setSelectedEmail(null); setIsComposing(false); }}
              />
            </div>
            <motion.div
              key={selectedFolder}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-9 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {isComposing ? (
                  <EmailComposer onClose={() => setIsComposing(false)} onSend={handleSendEmail} />
                ) : selectedEmail ? (
                  <EmailDetail email={selectedEmail} onBack={() => setSelectedEmail(null)} />
                ) : (
                  <EmailList emails={filteredEmails} onSelectEmail={handleSelectEmail} onToggleStar={handleToggleStar} />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      case 'users':
        return (
          <UserManagement
            users={users}
            onAddUser={() => openUserModal(null)}
            onEditUser={(user) => openUserModal(user)}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'dashboard':
        return <Dashboard usersCount={users.length} emailsCount={emails.length} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal | Azora</title>
        <meta name="description" content="The central command center for Azora OS. Manage users, monitor communications, and view live dashboards." />
      </Helmet>
      <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">Admin Portal</h1>
          <p className="text-blue-300/80">Your Command Center - All in One Place</p>
        </motion.div>

        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showUserModal && (
            <UserModal
              user={editingUser}
              onClose={() => { setShowUserModal(false); setEditingUser(null); }}
              onSave={handleSaveUser}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
