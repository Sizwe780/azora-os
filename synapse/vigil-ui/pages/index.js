/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @module synapse/vigil-ui/pages
 * @description Main dashboard page for Vigil surveillance monitoring
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies next, react, @mui/material
 * @integrates_with
 *   - /organs/vigil-service (API)
 *   - /synapse/shared/ui-components
 * @api_endpoints /api/vigil/cameras, /api/vigil/alerts
 * @state_management local
 * @mobile_optimized Yes
 * @accessibility WCAG 2.1 AA
 * @tests unit, integration
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['next', 'react', '@mui/material'],
  exports: ['default'],
  consumed_by: [],
  dependencies: ['vigil-service', 'shared-ui-components'],
  api_calls: ['/api/vigil/cameras', '/api/vigil/alerts'],
  state_shared: false,
  environment_vars: ['NEXT_PUBLIC_VIGIL_API_URL']
}

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  height: '100%'
}));

const CameraCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

export default function VigilDashboard() {
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_VIGIL_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [camerasRes, alertsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/vigil/cameras`),
        axios.get(`${apiUrl}/api/vigil/alerts?limit=10`)
      ]);

      setCameras(camerasRes.data);
      setAlerts(alertsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startStream = async (cameraId) => {
    try {
      await axios.post(`${apiUrl}/api/vigil/streams/${cameraId}/start`);
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Failed to start stream:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Vigil Dashboard
        </Typography>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vigil - AI Surveillance Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cameras Overview */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Cameras ({cameras.length})
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {cameras.map((camera) => (
                <CameraCard key={camera.id}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {camera.hostname}
                    </Typography>
                    <Chip
                      label={camera.status}
                      color={camera.status === 'connected' ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => startStream(camera.id)}
                      disabled={camera.status !== 'connected'}
                    >
                      Start AI
                    </Button>
                  </CardContent>
                </CameraCard>
              ))}
            </Box>
          </StyledPaper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {alerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {alert.type.split('.').pop()}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(alert.time).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Camera: {alert.source.split('/').pop()} | Confidence: {(alert.confidence * 100).toFixed(1)}%
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </StyledPaper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Streams
                    </Typography>
                    <Typography variant="h5">
                      {cameras.filter(c => c.status === 'connected').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Alerts
                    </Typography>
                    <Typography variant="h5">
                      {alerts.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      System Health
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      Online
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
}