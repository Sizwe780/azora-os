import React from 'react';
import { useEffect, useState } from 'react';
import { Mail, Send, Inbox, Star, Trash2, RefreshCw, Plus, Search, Paperclip } from 'lucide-react';
import { Email, getEmailAccount, hasPermission } from '../types/founders';

interface EmailPageProps {
  userId: string;
}

export default function EmailPage({ userId }: EmailPageProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'starred' | 'trash'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  
  const emailAccount = getEmailAccount(userId);
  const canSend = hasPermission(userId, 'send_emails');
  const canViewAll = hasPermission(userId, 'view_all_emails');

  // Compose email form state
  const [composeForm, setComposeForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    fetchEmails();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [userId, filter]);

  const fetchEmails = async () => {
    try {
      const response = await fetch(`/api/emails/${userId}?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!canSend || !emailAccount) {
      alert('You do not have permission to send emails');
      return;
    }

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: emailAccount.email,
          to: composeForm.to.split(',').map(e => e.trim()),
          cc: composeForm.cc ? composeForm.cc.split(',').map(e => e.trim()) : [],
          bcc: composeForm.bcc ? composeForm.bcc.split(',').map(e => e.trim()) : [],
          subject: composeForm.subject,
          body: composeForm.body + '\n\n' + (emailAccount.signature || ''),
          timestamp: new Date(),
        }),
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setComposing(false);
        setComposeForm({ to: '', cc: '', bcc: '', subject: '', body: '' });
        fetchEmails();
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Error sending email');
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      await fetch(`/api/emails/${emailId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const toggleStar = async (emailId: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) return;
      
      await fetch(`/api/emails/${emailId}/star`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, starred: !email.starred }),
      });
      
      setEmails(emails.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    
    try {
      await fetch(`/api/emails/${emailId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      setEmails(emails.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!emailAccount) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">No email account found for this user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{emailAccount.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchEmails}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {canSend && (
              <button
                onClick={() => setComposing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Compose</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setFilter('inbox')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                filter === 'inbox'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
              <span className="ml-auto text-sm">{emails.filter(e => !e.read).length}</span>
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                filter === 'sent'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Sent</span>
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                filter === 'starred'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>Starred</span>
            </button>
            <button
              onClick={() => setFilter('trash')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                filter === 'trash'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Trash</span>
            </button>
          </nav>
        </div>

        {/* Email List */}
        <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    if (!email.read) markAsRead(email.id);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${!email.read ? 'border-l-4 border-blue-600' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-sm ${!email.read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white truncate flex-1`}>
                      {email.from}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                      className="ml-2"
                    >
                      <Star className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <p className={`text-sm ${!email.read ? 'font-semibold' : ''} text-gray-900 dark:text-white truncate mb-1`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                    {email.body.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(email.timestamp).toLocaleDateString()} {new Date(email.timestamp).toLocaleTimeString()}
                    </p>
                    {email.attachments && email.attachments.length > 0 && (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email View / Compose */}
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
          {composing ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Message</h2>
                <button
                  onClick={() => setComposing(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                  <input
                    type="text"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CC</label>
                  <input
                    type="text"
                    value={composeForm.cc}
                    onChange={(e) => setComposeForm({ ...composeForm, cc: e.target.value })}
                    placeholder="cc@example.com (optional)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Email subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    value={composeForm.body}
                    onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                    rows={12}
                    placeholder="Write your message..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setComposing(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          ) : selectedEmail ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Back to list
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleStar(selectedEmail.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Star className={`w-5 h-5 ${selectedEmail.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
                  <button
                    onClick={() => deleteEmail(selectedEmail.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedEmail.from}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  To: {selectedEmail.to.join(', ')}
                  {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                    <span> | CC: {selectedEmail.cc.join(', ')}</span>
                  )}
                </p>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white font-sans">
                  {selectedEmail.body}
                </pre>
              </div>
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">Attachments</p>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.filename}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{(attachment.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <a
                          href={attachment.url}
                          download
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 dark:text-gray-400">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
