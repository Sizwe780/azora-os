/**
 * Azora OS - Admin Portal Service
 * 
 * Comprehensive admin portal with role-based access, integrated email system,
 * user management, and administrative privileges.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * @author Autonomous Logistics Team
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 4085;

// ============================================================================
// DATA STORES
// ============================================================================

const users = new Map(); // userId -> user profile
const roles = new Map(); // roleId -> role definition
const emails = new Map(); // emailId -> email message
const emailFolders = new Map(); // userId -> folders (inbox, sent, drafts)
const auditLog = new Map(); // auditId -> audit entry

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

function initializeRoles() {
  const roleDefinitions = [
    {
      id: 'admin',
      name: 'System Administrator',
      permissions: ['*'], // All permissions
      description: 'Full system access'
    },
    {
      id: 'fleet_manager',
      name: 'Fleet Manager',
      permissions: ['view_fleet', 'manage_vehicles', 'view_reports', 'manage_drivers', 'view_analytics'],
      description: 'Manage fleet operations'
    },
    {
      id: 'compliance_officer',
      name: 'Compliance Officer',
      permissions: ['view_compliance', 'generate_reports', 'audit_logs', 'view_documents'],
      description: 'Monitor and ensure compliance'
    },
    {
      id: 'driver',
      name: 'Driver',
      permissions: ['view_trips', 'start_trip', 'submit_inspection', 'view_documents'],
      description: 'Driver access'
    },
    {
      id: 'manager',
      name: 'Manager',
      permissions: ['view_fleet', 'view_reports', 'view_analytics', 'manage_drivers'],
      description: 'Management access'
    },
    {
      id: 'accountant',
      name: 'Accountant',
      permissions: ['view_expenses', 'view_analytics', 'generate_financial_reports'],
      description: 'Financial oversight'
    }
  ];
  
  roleDefinitions.forEach(role => roles.set(role.id, role));
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

function createUser(userData) {
  const userId = `USER-${Date.now()}`;
  
  const user = {
    id: userId,
    email: userData.email,
    name: userData.name,
    role: userData.role || 'driver',
    department: userData.department,
    permissions: [],
    
    profile: {
      avatar: userData.avatar || null,
      phone: userData.phone,
      address: userData.address,
      emergencyContact: userData.emergencyContact
    },
    
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      dashboardLayout: 'default'
    },
    
    status: 'active', // active, suspended, inactive
    
    createdAt: new Date().toISOString(),
    lastLogin: null,
    lastActivity: null
  };
  
  // Assign permissions based on role
  const role = roles.get(user.role);
  if (role) {
    user.permissions = role.permissions;
  }
  
  users.set(userId, user);
  
  // Initialize email folders
  initializeEmailFolders(userId);
  
  // Audit log
  logAudit({
    action: 'USER_CREATED',
    userId,
    details: { email: user.email, role: user.role }
  });
  
  return user;
}

function updateUser(userId, updates) {
  const user = users.get(userId);
  if (!user) return { error: 'User not found' };
  
  // Update allowed fields
  if (updates.name) user.name = updates.name;
  if (updates.role) {
    user.role = updates.role;
    const role = roles.get(updates.role);
    if (role) user.permissions = role.permissions;
  }
  if (updates.department) user.department = updates.department;
  if (updates.profile) user.profile = { ...user.profile, ...updates.profile };
  if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };
  if (updates.status) user.status = updates.status;
  
  users.set(userId, user);
  
  logAudit({
    action: 'USER_UPDATED',
    userId,
    details: updates
  });
  
  return user;
}

function deleteUser(userId) {
  const user = users.get(userId);
  if (!user) return { error: 'User not found' };
  
  user.status = 'inactive';
  users.set(userId, user);
  
  logAudit({
    action: 'USER_DELETED',
    userId,
    details: { email: user.email }
  });
  
  return { success: true, message: 'User deactivated' };
}

function checkPermission(userId, permission) {
  const user = users.get(userId);
  if (!user) return false;
  
  // Admin has all permissions
  if (user.permissions.includes('*')) return true;
  
  return user.permissions.includes(permission);
}

// ============================================================================
// INTEGRATED EMAIL SYSTEM
// ============================================================================

function initializeEmailFolders(userId) {
  emailFolders.set(userId, {
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
    starred: []
  });
}

function sendEmail(fromUserId, emailData) {
  const emailId = `EMAIL-${Date.now()}`;
  
  const email = {
    id: emailId,
    from: fromUserId,
    to: emailData.to, // Array of userIds or email addresses
    cc: emailData.cc || [],
    bcc: emailData.bcc || [],
    subject: emailData.subject,
    body: emailData.body,
    attachments: emailData.attachments || [],
    
    threadId: emailData.threadId || emailId, // For threading
    isRead: false,
    isStarred: false,
    
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
  
  emails.set(emailId, email);
  
  // Add to sender's sent folder
  const senderFolders = emailFolders.get(fromUserId);
  if (senderFolders) {
    senderFolders.sent.push(emailId);
  }
  
  // Add to recipients' inbox
  email.to.forEach(recipientId => {
    const recipientFolders = emailFolders.get(recipientId);
    if (recipientFolders) {
      recipientFolders.inbox.push(emailId);
    }
  });
  
  logAudit({
    action: 'EMAIL_SENT',
    userId: fromUserId,
    details: { emailId, to: email.to, subject: email.subject }
  });
  
  return email;
}

function getEmails(userId, folder = 'inbox') {
  const folders = emailFolders.get(userId);
  if (!folders) return [];
  
  const emailIds = folders[folder] || [];
  
  return emailIds.map(id => emails.get(id)).filter(Boolean);
}

function markEmailAsRead(emailId, _userId) {
  const email = emails.get(emailId);
  if (!email) return { error: 'Email not found' };
  
  email.isRead = true;
  emails.set(emailId, email);
  
  return email;
}

function deleteEmail(emailId, userId) {
  const folders = emailFolders.get(userId);
  if (!folders) return { error: 'Folders not found' };
  
  // Move to trash
  Object.keys(folders).forEach(folder => {
    const index = folders[folder].indexOf(emailId);
    if (index > -1) {
      folders[folder].splice(index, 1);
    }
  });
  
  folders.trash.push(emailId);
  emailFolders.set(userId, folders);
  
  return { success: true };
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

function logAudit(entry) {
  const auditId = `AUDIT-${Date.now()}`;
  
  const auditEntry = {
    id: auditId,
    timestamp: new Date().toISOString(),
    action: entry.action,
    userId: entry.userId,
    details: entry.details,
    ipAddress: entry.ipAddress || null,
    userAgent: entry.userAgent || null
  };
  
  auditLog.set(auditId, auditEntry);
  
  return auditEntry;
}

function getAuditLog(filters = {}) {
  let logs = Array.from(auditLog.values());
  
  if (filters.userId) {
    logs = logs.filter(log => log.userId === filters.userId);
  }
  
  if (filters.action) {
    logs = logs.filter(log => log.action === filters.action);
  }
  
  if (filters.startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ============================================================================
// DASHBOARD CUSTOMIZATION
// ============================================================================

function getDashboardConfig(userId) {
  const user = users.get(userId);
  if (!user) return { error: 'User not found' };
  
  // Default widgets based on role
  const dashboardConfigs = {
    admin: [
      { widget: 'system_health', position: { x: 0, y: 0, w: 6, h: 4 } },
      { widget: 'user_activity', position: { x: 6, y: 0, w: 6, h: 4 } },
      { widget: 'audit_log', position: { x: 0, y: 4, w: 12, h: 6 } }
    ],
    fleet_manager: [
      { widget: 'fleet_overview', position: { x: 0, y: 0, w: 8, h: 4 } },
      { widget: 'active_trips', position: { x: 8, y: 0, w: 4, h: 4 } },
      { widget: 'vehicle_health', position: { x: 0, y: 4, w: 6, h: 4 } },
      { widget: 'driver_scores', position: { x: 6, y: 4, w: 6, h: 4 } }
    ],
    compliance_officer: [
      { widget: 'compliance_alerts', position: { x: 0, y: 0, w: 6, h: 4 } },
      { widget: 'hos_violations', position: { x: 6, y: 0, w: 6, h: 4 } },
      { widget: 'audit_ready', position: { x: 0, y: 4, w: 12, h: 6 } }
    ],
    driver: [
      { widget: 'my_trips', position: { x: 0, y: 0, w: 8, h: 4 } },
      { widget: 'my_score', position: { x: 8, y: 0, w: 4, h: 4 } },
      { widget: 'upcoming_tasks', position: { x: 0, y: 4, w: 12, h: 4 } }
    ],
    manager: [
      { widget: 'team_overview', position: { x: 0, y: 0, w: 8, h: 4 } },
      { widget: 'kpi_summary', position: { x: 8, y: 0, w: 4, h: 4 } },
      { widget: 'recent_alerts', position: { x: 0, y: 4, w: 12, h: 4 } }
    ],
    accountant: [
      { widget: 'financial_summary', position: { x: 0, y: 0, w: 6, h: 4 } },
      { widget: 'expense_breakdown', position: { x: 6, y: 0, w: 6, h: 4 } },
      { widget: 'profit_trends', position: { x: 0, y: 4, w: 12, h: 6 } }
    ]
  };
  
  return {
    userId,
    role: user.role,
    widgets: dashboardConfigs[user.role] || dashboardConfigs.driver,
    preferences: user.preferences
  };
}

function updateDashboardLayout(userId, layout) {
  const user = users.get(userId);
  if (!user) return { error: 'User not found' };
  
  user.preferences.dashboardLayout = layout;
  users.set(userId, user);
  
  return { success: true, layout };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Admin Portal Service',
    status: 'operational',
    users: users.size,
    roles: roles.size,
    emails: emails.size
  });
});

// Initialize roles (run once)
app.post('/api/admin/initialize', (req, res) => {
  initializeRoles();
  
  res.json({
    success: true,
    message: 'Roles initialized',
    roles: Array.from(roles.values())
  });
});

// User Management
app.post('/api/admin/users', (req, res) => {
  const user = createUser(req.body);
  
  res.json({
    success: true,
    user
  });
});

app.get('/api/admin/users', (req, res) => {
  const allUsers = Array.from(users.values());
  
  res.json({
    users: allUsers,
    total: allUsers.length
  });
});

app.get('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

app.put('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  
  const user = updateUser(userId, updates);
  
  if (user.error) {
    return res.status(404).json(user);
  }
  
  res.json({
    success: true,
    user
  });
});

app.delete('/api/admin/users/:userId', (req, res) => {
  const { userId } = req.params;
  
  const result = deleteUser(userId);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

// Role & Permission Management
app.get('/api/admin/roles', (req, res) => {
  res.json({
    roles: Array.from(roles.values())
  });
});

app.get('/api/admin/users/:userId/permissions', (req, res) => {
  const { userId } = req.params;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    userId,
    role: user.role,
    permissions: user.permissions
  });
});

app.post('/api/admin/users/:userId/check-permission', (req, res) => {
  const { userId } = req.params;
  const { permission } = req.body;
  
  const hasPermission = checkPermission(userId, permission);
  
  res.json({
    userId,
    permission,
    hasPermission
  });
});

// Email System
app.post('/api/admin/email/send', (req, res) => {
  const { fromUserId, ...emailData } = req.body;
  
  const email = sendEmail(fromUserId, emailData);
  
  res.json({
    success: true,
    email
  });
});

app.get('/api/admin/email/:userId/:folder', (req, res) => {
  const { userId, folder } = req.params;
  
  const emails = getEmails(userId, folder);
  
  res.json({
    folder,
    emails,
    count: emails.length
  });
});

app.put('/api/admin/email/:emailId/read', (req, res) => {
  const { emailId } = req.params;
  const { userId } = req.body;
  
  const email = markEmailAsRead(emailId, userId);
  
  if (email.error) {
    return res.status(404).json(email);
  }
  
  res.json({
    success: true,
    email
  });
});

app.delete('/api/admin/email/:emailId', (req, res) => {
  const { emailId } = req.params;
  const { userId } = req.body;
  
  const result = deleteEmail(emailId, userId);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

// Dashboard
app.get('/api/admin/dashboard/:userId', (req, res) => {
  const { userId } = req.params;
  
  const config = getDashboardConfig(userId);
  
  if (config.error) {
    return res.status(404).json(config);
  }
  
  res.json(config);
});

app.put('/api/admin/dashboard/:userId/layout', (req, res) => {
  const { userId } = req.params;
  const { layout } = req.body;
  
  const result = updateDashboardLayout(userId, layout);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

// Audit Log
app.get('/api/admin/audit', (req, res) => {
  const filters = req.query;
  
  const logs = getAuditLog(filters);
  
  res.json({
    logs,
    count: logs.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Admin Portal Service running on port ${PORT}`);
  console.log(`👥 User Management: ACTIVE`);
  console.log(`📧 Integrated Email: ACTIVE`);
  console.log(`🔐 Role-Based Access: ACTIVE`);
  console.log(`📊 Custom Dashboards: ACTIVE`);
  console.log(`📝 Audit Logging: ACTIVE`);
});

module.exports = app;
