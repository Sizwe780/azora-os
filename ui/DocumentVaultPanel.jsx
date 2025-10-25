import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Folder, Upload, Download, 
  Search, Filter, Lock, Eye 
} from 'lucide-react'

const DocumentVaultPanel = () => {
  const [activeTab, setActiveTab] = useState('vault')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'vault', label: 'Document Vault', icon: FileText },
    { id: 'ledger', label: 'Blockchain Ledger', icon: Lock },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'search', label: 'Search', icon: Search }
  ]

  const documents = [
    { 
      id: 'DOC-001', 
      name: 'Operating License 2024',
      type: 'License',
      category: 'Legal',
      size: '2.4 MB',
      uploaded: '2024-01-15',
      expires: '2024-12-31',
      status: 'active',
      encrypted: true
    },
    { 
      id: 'DOC-002', 
      name: 'Insurance Certificate',
      type: 'Certificate',
      category: 'Insurance',
      size: '1.8 MB',
      uploaded: '2024-01-10',
      expires: '2024-06-30',
      status: 'active',
      encrypted: true
    },
    { 
      id: 'DOC-003', 
      name: 'Driver Training Records',
      type: 'Training',
      category: 'HR',
      size: '5.2 MB',
      uploaded: '2024-01-08',
      expires: '2024-08-31',
      status: 'active',
      encrypted: false
    },
    { 
      id: 'DOC-004', 
      name: 'Vehicle Inspection Report',
      type: 'Report',
      category: 'Maintenance',
      size: '3.1 MB',
      uploaded: '2024-01-05',
      expires: '2024-07-05',
      status: 'expiring',
      encrypted: true
    },
    { 
      id: 'DOC-005', 
      name: 'Financial Audit 2023',
      type: 'Audit',
      category: 'Finance',
      size: '8.7 MB',
      uploaded: '2023-12-20',
      expires: '2027-12-20',
      status: 'archived',
      encrypted: true
    }
  ]

  const folders = [
    { name: 'Legal Documents', count: 12, lastModified: '2 days ago' },
    { name: 'Insurance', count: 8, lastModified: '1 week ago' },
    { name: 'HR Records', count: 24, lastModified: '3 days ago' },
    { name: 'Vehicle Documentation', count: 18, lastModified: '1 day ago' },
    { name: 'Financial Records', count: 15, lastModified: '5 days ago' },
    { name: 'Compliance Certificates', count: 9, lastModified: '2 weeks ago' }
  ]

  const blockchainEntries = [
    { 
      hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
      document: 'Operating License 2024',
      action: 'Document Created',
      timestamp: '2024-01-15 14:30:22',
      user: 'admin@azora.com'
    },
    { 
      hash: '0x9876543210fedcba0987654321abcdef',
      document: 'Insurance Certificate',
      action: 'Document Updated',
      timestamp: '2024-01-10 09:15:45',
      user: 'manager@azora.com'
    },
    { 
      hash: '0xabcdef1234567890fedcba0987654321',
      document: 'Driver Training Records',
      action: 'Access Granted',
      timestamp: '2024-01-08 16:22:10',
      user: 'hr@azora.com'
    }
  ]

  const vaultMetrics = [
    { label: 'Total Documents', value: '247', change: '+12', color: 'var(--accent-primary)' },
    { label: 'Storage Used', value: '2.8 GB', change: '+0.3 GB', color: 'var(--success)' },
    { label: 'Encrypted Files', value: '89%', change: '+5%', color: 'var(--success)' },
    { label: 'Expiring Soon', value: '7', change: '+2', color: 'var(--warning)' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vault':
        return (
          <div>
            {/* Vault Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {vaultMetrics.map((metric, index) => (
                <div key={index} className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                    {metric.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {metric.label}
                    </span>
                    <span style={{ color: metric.color, fontSize: '14px', fontWeight: '500' }}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Vault */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              {/* Folders */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Document Folders
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {folders.map((folder, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Folder size={20} style={{ color: 'var(--accent-primary)' }} />
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '2px' }}>{folder.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {folder.count} files • {folder.lastModified}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Documents */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Documents</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary">
                      <Filter size={16} />
                      Filter
                    </button>
                    <button className="btn-primary">
                      <Upload size={16} />
                      Upload
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {documents.map((doc) => (
                    <div key={doc.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        doc.status === 'active' ? 'var(--success)' : 
                        doc.status === 'expiring' ? 'var(--warning)' : 'var(--text-muted)'
                      }`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--accent-primary)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={16} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {doc.name}
                            {doc.encrypted && <Lock size={12} style={{ color: 'var(--success)' }} />}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {doc.type} • {doc.size} • {doc.uploaded}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          background: doc.status === 'active' ? 'var(--success)' : 
                                     doc.status === 'expiring' ? 'var(--warning)' : 'var(--text-muted)',
                          color: 'white'
                        }}>
                          {doc.status.toUpperCase()}
                        </div>
                        <button className="btn-secondary" style={{ padding: '6px' }}>
                          <Eye size={14} />
                        </button>
                        <button className="btn-secondary" style={{ padding: '6px' }}>
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'ledger':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Blockchain Document Ledger
              </h3>
              <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Lock size={20} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: '600' }}>Blockchain Security Active</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                  All document transactions are recorded on an immutable blockchain ledger for maximum security and transparency.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {blockchainEntries.map((entry, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{entry.document}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{entry.action}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.timestamp}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{entry.user}</div>
                      </div>
                    </div>
                    <div style={{
                      background: 'var(--bg-tertiary)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)'
                    }}>
                      Hash: {entry.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'upload':
        return (
          <div>
            <div className="card" style={{ padding: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
                Upload Documents
              </h3>
              <div style={{
                border: '2px dashed var(--border-primary)',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <Upload size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Drag and drop files here
                </h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  or click to browse and select files
                </p>
                <button className="btn-primary">
                  Choose Files
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Document Category
                  </label>
                  <select className="input">
                    <option value="">Select category</option>
                    <option value="legal">Legal Documents</option>
                    <option value="insurance">Insurance</option>
                    <option value="hr">HR Records</option>
                    <option value="maintenance">Vehicle Documentation</option>
                    <option value="finance">Financial Records</option>
                    <option value="compliance">Compliance Certificates</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Document Type
                  </label>
                  <select className="input">
                    <option value="">Select type</option>
                    <option value="license">License</option>
                    <option value="certificate">Certificate</option>
                    <option value="report">Report</option>
                    <option value="contract">Contract</option>
                    <option value="invoice">Invoice</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: '14px' }}>
                    Encrypt document with blockchain security
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      case 'search':
        return (
          <div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Search Documents
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={20} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    placeholder="Search documents by name, type, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <select className="input">
                  <option value="">All Categories</option>
                  <option value="legal">Legal Documents</option>
                  <option value="insurance">Insurance</option>
                  <option value="hr">HR Records</option>
                </select>
                <select className="input">
                  <option value="">All Types</option>
                  <option value="license">License</option>
                  <option value="certificate">Certificate</option>
                  <option value="report">Report</option>
                </select>
                <select className="input">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              {searchQuery && (
                <div>
                  <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    Found {documents.length} documents matching "{searchQuery}"
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {documents.filter(doc => 
                      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((doc) => (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '2px' }}>{doc.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {doc.category} • {doc.type} • {doc.uploaded}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-secondary">
                            <Eye size={16} />
                            View
                          </button>
                          <button className="btn-secondary">
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              This section is under development
            </p>
          </div>
        )
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Document Vault & Ledger
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Secure document storage with blockchain verification
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '16px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}

export default DocumentVaultPanel
