/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Minimum Viable Ecosystem (MVE) - Farmer App Frontend
// Simulates the full Azora Forge Architecture for demo

import React, { useState, useEffect } from 'react';
import './FarmerApp.css';

const FarmerApp: React.FC = () => {
  const [farmId, setFarmId] = useState('');
  const [pestName, setPestName] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // Load existing recommendations
    fetchRecommendations();

    // Set up real-time connection (Server-Sent Events)
    const eventSource = new EventSource('/events');

    eventSource.onopen = () => {
      setConnectionStatus('Connected to Azora Forge');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'recommendation') {
        setRecommendations(prev => [data, ...prev]);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('Connection lost - retrying...');
    };

    return () => eventSource.close();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/get_recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || !pestName) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmId,
          pestName,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log('Pest report submitted successfully');
        // Clear form
        setPestName('');
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="farmer-app">
      <header className="app-header">
        <h1>🌾 Azora Farmer</h1>
        <div className="status-bar">
          <span className={`status ${connectionStatus.includes('Connected') ? 'connected' : 'disconnected'}`}>
            {connectionStatus}
          </span>
        </div>
      </header>

      <main className="app-main">
        <section className="report-section">
          <h2>Report Pest Detection</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="farmId">Farm ID:</label>
              <input
                type="text"
                id="farmId"
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                placeholder="Enter your farm ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pestName">Pest Detected:</label>
              <input
                type="text"
                id="pestName"
                value={pestName}
                onChange={(e) => setPestName(e.target.value)}
                placeholder="e.g., Fall Armyworm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Report Pest'}
            </button>
          </form>
        </section>

        <section className="recommendations-section">
          <h2>AI Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.length === 0 ? (
              <p className="no-recommendations">No recommendations yet. Report a pest to get started!</p>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className={`recommendation-card ${rec.urgency || 'medium'}`}>
                  <div className="recommendation-header">
                    <h3>{rec.action || rec.recommendation}</h3>
                    <span className="timestamp">{new Date(rec.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="recommendation-details">
                    <p><strong>Farm:</strong> {rec.farmId}</p>
                    <p><strong>Pest:</strong> {rec.pest}</p>
                    <p><strong>Weather:</strong> {rec.weather}</p>
                    {rec.urgency && <p><strong>Urgency:</strong> {rec.urgency.toUpperCase()}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Powered by Azora ES Forge Architecture</p>
        <p>Real-time AI-driven agriculture optimization</p>
      </footer>
    </div>
  );
};

export default FarmerApp;