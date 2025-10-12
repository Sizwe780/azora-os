import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { mockEmails, Email, FolderName } from '../features/email/mockData';
import EmailSidebar from '../components/email/EmailSidebar';
import EmailList from '../components/email/EmailList';
import EmailView from '../components/email/EmailView';
import ComposeModal from '../components/email/ComposeModal';

const EmailPage = ({ userId }: { userId: string }) => {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('1');
  const [composing, setComposing] = useState(false);
  const [activeFolder, setActiveFolder] = useState<FolderName>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  console.log('Email page loaded for user:', userId);

  const filteredEmails = useMemo(() => {
    let filtered = emails;
    if (activeFolder === 'starred') {
      filtered = filtered.filter(e => e.starred);
    } else {
      filtered = filtered.filter(e => e.folder === activeFolder);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return filtered.filter(
        email =>
          email.subject.toLowerCase().includes(query) ||
          email.from.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query)
      );
    }
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emails, activeFolder, searchQuery]);

  const selectedEmail = useMemo(() => emails.find(e => e.id === selectedEmailId), [emails, selectedEmailId]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setEmails(currentEmails => currentEmails.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(currentEmails => currentEmails.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const unreadCount = useMemo(() => emails.filter(e => e.folder === 'inbox' && !e.read).length, [emails]);

  return (
    <>
      <Helmet>
        <title>Inbox | Azora</title>
      </Helmet>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-full bg-gray-950 text-white font-sans"
      >
        <EmailSidebar 
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
          onCompose={() => setComposing(true)}
          unreadCount={unreadCount}
        />
        <EmailList 
          emails={filteredEmails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={handleSelectEmail}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <EmailView 
          email={selectedEmail}
          onToggleStar={toggleStar}
        />
        <ComposeModal 
          isOpen={composing}
          onClose={() => setComposing(false)}
        />
      </motion.div>
    </>
  );
};

export default EmailPage;
