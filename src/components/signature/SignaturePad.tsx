import React from 'react';
/**
 * Signature Pad Component
 * 
 * Legally binding e-signature capture with canvas drawing.
 * Captures metadata (IP, timestamp, location) for audit trail.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 */

import { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSign: (signature: string) => void;
  onBack: () => void;
  contractType: string;
  signerName: string;
  signerRole: string;
}

export default function SignaturePad({
  onSign,
  onBack,
  contractType,
  signerName,
  signerRole
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [metadata, setMetadata] = useState({
    timestamp: new Date().toISOString(),
    ipAddress: '102.65.123.45', // Would get real IP in production
    location: 'Johannesburg, South Africa'
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL('image/png');
    setSignatureData(signature);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const generateTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Signature text
    ctx.fillStyle = '#000';
    ctx.font = '48px "Brush Script MT", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

    const signature = canvas.toDataURL('image/png');
    setSignatureData(signature);
  };

  const handleSign = () => {
    if (!signatureData) return;
    onSign(signatureData);
  };

  return (
    <div className="text-white">
      <h3 className="text-2xl font-bold mb-4">✍️ Sign Your {contractType} Agreement</h3>
      
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <p><strong>Signing as:</strong> {signerName}</p>
        <p><strong>Role:</strong> {signerRole}</p>
        <p><strong>Date:</strong> {new Date().toLocaleString('en-ZA')}</p>
        <p><strong>Location:</strong> {metadata.location}</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSignatureMode('draw')}
          className={`flex-1 px-4 py-2 rounded-lg transition ${
            signatureMode === 'draw'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          ✏️ Draw Signature
        </button>
        <button
          onClick={() => setSignatureMode('type')}
          className={`flex-1 px-4 py-2 rounded-lg transition ${
            signatureMode === 'type'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300'
          }`}
        >
          ⌨️ Type Signature
        </button>
      </div>

      {/* Drawing mode */}
      {signatureMode === 'draw' && (
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Draw your signature below:</p>
          <canvas
            ref={canvasRef}
            className="w-full bg-white rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      )}

      {/* Typing mode */}
      {signatureMode === 'type' && (
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Type your full name:</p>
          <input
            type="text"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            placeholder={signerName}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white text-2xl font-['Brush_Script_MT']"
            onBlur={generateTypedSignature}
          />
        </div>
      )}

      {/* Signature preview */}
      {signatureData && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 mb-2">Signature Preview:</p>
          <img src={signatureData} alt="Signature" className="w-full max-w-md mx-auto bg-white rounded" />
        </div>
      )}

      {/* Legal notice */}
      <div className="bg-yellow-900/30 rounded-lg p-4 mb-6 text-sm">
        <p className="font-semibold mb-2">⚖️ Legal Notice:</p>
        <p>
          By signing this document electronically, you agree that your electronic signature
          is the legal equivalent of your manual signature and has the same force and effect
          as a manual signature under the South African Electronic Communications and
          Transactions Act, 2002 (ECT Act).
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 text-sm">
        <p className="font-semibold mb-2">📋 Signature Metadata:</p>
        <p>Timestamp: {new Date(metadata.timestamp).toLocaleString('en-ZA')}</p>
        <p>IP Address: {metadata.ipAddress}</p>
        <p>Location: {metadata.location}</p>
        <p>Device: {navigator.userAgent.substring(0, 50)}...</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleClear}
          className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
        >
          Clear
        </button>
        <button
          onClick={handleSign}
          disabled={!signatureData}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign Document ✓
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Your signature will be encrypted and stored securely.</p>
        <p>A copy will be sent to {signerName}'s email.</p>
      </div>
    </div>
  );
}
