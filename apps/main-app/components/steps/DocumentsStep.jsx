import React, { useState } from 'react'
import { motion } from 'framer-motion'

const DocumentsStep = ({ userData, setUserData }) => {
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files)
    setUserData(prev => ({
      ...prev,
      documents: [...prev.documents, ...fileArray]
    }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    handleFileUpload(files)
  }

  const removeDocument = (index) => {
    setUserData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const documentTypes = [
    { type: 'ID Document', icon: '🆔', required: true },
    { type: 'Business License', icon: '📄', required: false },
    { type: 'Tax Certificate', icon: '📋', required: false },
    { type: 'Insurance Certificate', icon: '🛡️', required: false }
  ]

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Document Upload
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '40px',
          textAlign: 'center'
        }}
      >
        Upload required documents to verify your account
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}
      >
        {documentTypes.map((doc, index) => (
          <div
            key={doc.type}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}
          >
            <div style={{
              fontSize: '24px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.2)'
            }}>
              {doc.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
                {doc.type}
                {doc.required && (
                  <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                )}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                {doc.required ? 'Required' : 'Optional'}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#22c55e' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          background: dragOver ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '30px'
        }}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          opacity: 0.7
        }}>
          📁
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#ffffff'
        }}>
          Drop files here or click to browse
        </h3>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '16px'
        }}>
          Supported formats: PDF, JPG, PNG (Max 10MB each)
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </motion.div>

      {userData.documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#ffffff'
          }}>
            Uploaded Documents ({userData.documents.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userData.documents.map((doc, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <span style={{ color: '#ffffff', fontSize: '14px' }}>
                    {doc.name}
                  </span>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#ef4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DocumentsStep
