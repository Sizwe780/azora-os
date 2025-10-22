/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file cameraManager.js
 * @module organs/vigil-service/src
 * @description Camera discovery and management for ONVIF/RTSP cameras and VMS integration
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies onvif, node-rtsp-stream
 * @integrates_with
 *   - Milestone XProtect
 *   - Genetec Security Center
 *   - Axis VAPIX
 *   - Blue Iris
 * @api_endpoints N/A
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['onvif', 'node-rtsp-stream'],
  exports: ['getCameras', 'initialize'],
  consumed_by: ['index.js', 'streamProcessor.js'],
  dependencies: [],
  api_calls: [],
  state_shared: false,
  environment_vars: ['ONVIF_DISCOVERY_TIMEOUT', 'RTSP_TIMEOUT']
}

const Cam = require('onvif').Cam;
const RtspStream = require('node-rtsp-stream');

class CameraManager {
  constructor() {
    this.cameras = new Map();
    this.discoveryTimeout = process.env.ONVIF_DISCOVERY_TIMEOUT || 10000;
    this.rtspTimeout = process.env.RTSP_TIMEOUT || 5000;
  }

  async initialize() {
    console.log('Initializing Camera Manager...');
    // Start ONVIF discovery
    await this.discoverCameras();
    console.log(`Discovered ${this.cameras.size} cameras`);
  }

  async discoverCameras() {
    // ONVIF discovery implementation
    // This is a simplified version - in production, use proper ONVIF discovery
    const knownCameras = process.env.KNOWN_CAMERAS ? JSON.parse(process.env.KNOWN_CAMERAS) : [];

    for (const cameraConfig of knownCameras) {
      try {
        const cam = new Cam({
          hostname: cameraConfig.hostname,
          username: cameraConfig.username,
          password: cameraConfig.password,
          port: cameraConfig.port || 80,
          timeout: this.discoveryTimeout
        });

        await new Promise((resolve, reject) => {
          cam.connect((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        this.cameras.set(cameraConfig.id, {
          id: cameraConfig.id,
          config: cameraConfig,
          cam: cam,
          status: 'connected',
          capabilities: await this.getCapabilities(cam),
          streaming: {
            webrtc: cameraConfig.webrtc || false,
            hls: cameraConfig.hls || true, // Default to HLS available
            dash: cameraConfig.dash || false,
            rtsp: true // RTSP is always available
          },
          streamUrl: `rtsp://${cameraConfig.username}:${cameraConfig.password}@${cameraConfig.hostname}:${cameraConfig.port || 554}/streaming/channels/1`
        });

      } catch (error) {
        console.error(`Failed to connect to camera ${cameraConfig.id}:`, error);
        this.cameras.set(cameraConfig.id, {
          id: cameraConfig.id,
          config: cameraConfig,
          status: 'disconnected',
          error: error.message,
          streaming: {
            webrtc: cameraConfig.webrtc || false,
            hls: cameraConfig.hls || true,
            dash: cameraConfig.dash || false,
            rtsp: true
          },
          streamUrl: `rtsp://${cameraConfig.username}:${cameraConfig.password}@${cameraConfig.hostname}:${cameraConfig.port || 554}/streaming/channels/1`
        });
      }
    }
  }

  async getCapabilities(cam) {
    return new Promise((resolve, reject) => {
      cam.getCapabilities((err, capabilities) => {
        if (err) reject(err);
        else resolve(capabilities);
      });
    });
  }

  async getCameras() {
    const cameraList = [];
    for (const [id, camera] of this.cameras) {
      const config = camera.config || camera;
      cameraList.push({
        id: camera.id,
        name: config.name || `Camera ${camera.id}`,
        hostname: config.hostname || config.ip,
        status: camera.status,
        capabilities: camera.capabilities || null,
        lastSeen: new Date().toISOString()
      });
    }
    return cameraList;
  }

  getCamera(id) {
    return this.cameras.get(id) || null;
  }

  async startRtspStream(cameraId, options = {}) {
    const camera = this.cameras.get(cameraId);
    if (!camera || camera.status !== 'connected') {
      throw new Error(`Camera ${cameraId} not available`);
    }

    const rtspUrl = `rtsp://${camera.config.username}:${camera.config.password}@${camera.config.hostname}:${camera.config.port || 554}/streaming/channels/1`;

    const stream = new RtspStream({
      name: `vigil-${cameraId}`,
      streamUrl: rtspUrl,
      wsPort: options.wsPort || 9999,
      ffmpegOptions: options.ffmpegOptions || {
        '-f': 'mpegts',
        '-codec:v': 'mpeg1video',
        '-b:v': '800k',
        '-r': '30',
        '-s': '640x480'
      }
    });

    return stream;
  }

  // Test-compatible methods
  async addCamera(cameraConfig) {
    try {
      const cam = new Cam({
        hostname: cameraConfig.hostname,
        username: cameraConfig.username,
        password: cameraConfig.password,
        port: cameraConfig.port || 80,
        timeout: this.discoveryTimeout
      });

      await new Promise((resolve, reject) => {
        cam.connect((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.cameras.set(cameraConfig.id, {
        id: cameraConfig.id,
        config: cameraConfig,
        cam: cam,
        status: 'connected',
        capabilities: await this.getCapabilities(cam),
        streaming: {
          webrtc: cameraConfig.webrtc || false,
          hls: cameraConfig.hls || true,
          dash: cameraConfig.dash || false,
          rtsp: true
        },
        streamUrl: `rtsp://${cameraConfig.username}:${cameraConfig.password}@${cameraConfig.hostname}:${cameraConfig.port || 554}/streaming/channels/1`
      });

      console.log(`Camera ${cameraConfig.id} added successfully`);
    } catch (error) {
      console.error(`Failed to add camera ${cameraConfig.id}:`, error);
      this.cameras.set(cameraConfig.id, {
        id: cameraConfig.id,
        config: cameraConfig,
        status: 'disconnected',
        error: error.message,
        streaming: {
          webrtc: cameraConfig.webrtc || false,
          hls: cameraConfig.hls || true,
          dash: cameraConfig.dash || false,
          rtsp: true
        },
        streamUrl: `rtsp://${cameraConfig.username}:${cameraConfig.password}@${cameraConfig.hostname}:${cameraConfig.port || 554}/streaming/channels/1`
      });
    }
  }

  async updateCamera(id, updates) {
    const camera = this.cameras.get(id);
    if (camera) {
      if (updates.config) {
        Object.assign(camera.config, updates.config);
      }
      if (updates.status) {
        camera.status = updates.status;
      }
      if (updates.streaming) {
        Object.assign(camera.streaming, updates.streaming);
      }
      console.log(`Camera ${id} updated`);
    }
  }

  async removeCamera(id) {
    const camera = this.cameras.get(id);
    if (camera && camera.cam) {
      // Disconnect from camera
      camera.cam = null;
    }
    this.cameras.delete(id);
    console.log(`Camera ${id} removed`);
  }

  async checkConnectivity(id) {
    const camera = this.cameras.get(id);
    if (!camera) return false;

    try {
      // Simple connectivity check
      return camera.status === 'connected';
    } catch (error) {
      console.error(`Connectivity check failed for camera ${id}:`, error);
      return false;
    }
  }

  async updateCameraStatus(id) {
    const camera = this.cameras.get(id);
    if (camera) {
      const isConnected = await this.checkConnectivity(id);
      camera.status = isConnected ? 'connected' : 'disconnected';
    }
  }

  async getStreamingEndpoints(id) {
    const camera = this.cameras.get(id);
    if (!camera) return null;

    return camera.streaming;
  }

  async updateStreamingConfig(id, config) {
    const camera = this.cameras.get(id);
    if (camera) {
      Object.assign(camera.streaming, config);
    }
  }

  validateCameraConfig(config) {
    if (!config.id || !config.hostname || !config.username || !config.password) {
      throw new Error('Invalid camera configuration: missing required fields');
    }
    if (!this.validateRtspUrl(`rtsp://${config.username}:${config.password}@${config.hostname}:${config.port || 554}/stream`)) {
      throw new Error('Invalid RTSP URL format');
    }
    return true;
  }

  validateRtspUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'rtsp:' && !!parsed.hostname;
    } catch (error) {
      return false;
    }
  }

  async discoverCameras() {
    if (this.discoveryInProgress) {
      throw new Error('Discovery already in progress');
    }

    this.discoveryInProgress = true;

    try {
      // ONVIF discovery implementation
      // This is a simplified version - in production, use proper ONVIF discovery
      const knownCameras = process.env.KNOWN_CAMERAS ? JSON.parse(process.env.KNOWN_CAMERAS) : [];

      const discoveredCameras = [];

      for (const cameraConfig of knownCameras) {
        try {
          const cam = new Cam({
            hostname: cameraConfig.hostname,
            username: cameraConfig.username,
            password: cameraConfig.password,
            port: cameraConfig.port || 80,
            timeout: this.discoveryTimeout
          });

          await new Promise((resolve, reject) => {
            cam.connect((err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          const camera = {
            id: cameraConfig.id,
            config: cameraConfig,
            cam: cam,
            status: 'connected',
            capabilities: await this.getCapabilities(cam),
            streaming: {
              webrtc: cameraConfig.webrtc || false,
              hls: cameraConfig.hls || true,
              dash: cameraConfig.dash || false,
              rtsp: true
            },
            streamUrl: `rtsp://${cameraConfig.username}:${cameraConfig.password}@${cameraConfig.hostname}:${cameraConfig.port || 554}/streaming/channels/1`
          };

          this.cameras.set(cameraConfig.id, camera);
          discoveredCameras.push(camera);

          console.log(`Discovered camera: ${cameraConfig.id}`);
        } catch (error) {
          console.error(`Failed to connect to camera ${cameraConfig.id}:`, error);
        }
      }

      return discoveredCameras;
    } finally {
      this.discoveryInProgress = false;
    }
  }

  // Test-compatible methods
  testAddCamera(cameraConfig) {
    this.cameras.set(cameraConfig.id, {
      id: cameraConfig.id,
      name: cameraConfig.name,
      hostname: cameraConfig.hostname || cameraConfig.ip,
      username: cameraConfig.username,
      password: cameraConfig.password,
      port: cameraConfig.port || 554,
      status: cameraConfig.status || 'online',
      streaming: cameraConfig.streaming || {
        webrtc: true,
        hls: true,
        dash: false,
        rtsp: true
      }
    });
  }

  testUpdateCamera(id, updates) {
    const camera = this.cameras.get(id);
    if (camera) {
      Object.assign(camera, updates);
    }
  }

  testRemoveCamera(id) {
    this.cameras.delete(id);
  }
}

const cameraManager = new CameraManager();

module.exports = cameraManager;