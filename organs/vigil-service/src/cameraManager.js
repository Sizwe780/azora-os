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
          capabilities: await this.getCapabilities(cam)
        });

      } catch (error) {
        console.error(`Failed to connect to camera ${cameraConfig.id}:`, error);
        this.cameras.set(cameraConfig.id, {
          id: cameraConfig.id,
          config: cameraConfig,
          status: 'disconnected',
          error: error.message
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
      cameraList.push({
        id: camera.id,
        hostname: camera.config.hostname,
        status: camera.status,
        capabilities: camera.capabilities || null,
        lastSeen: new Date().toISOString()
      });
    }
    return cameraList;
  }

  getCamera(id) {
    return this.cameras.get(id);
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
}

const cameraManager = new CameraManager();

module.exports = cameraManager;