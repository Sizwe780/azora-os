/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file streamProcessor.js
 * @module organs/vigil-service/src
 * @description Video stream processing with AI inference for detection and alerting
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies node-rtsp-stream
 * @integrates_with
 *   - NVIDIA DeepStream
 *   - Triton Inference Server
 *   - cameraManager
 *   - alertEngine
 * @api_endpoints N/A
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests integration
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['node-rtsp-stream'],
  exports: ['startStream', 'stopStream', 'initialize'],
  consumed_by: ['index.js'],
  dependencies: ['cameraManager', 'alertEngine'],
  api_calls: [],
  state_shared: false,
  environment_vars: ['INFERENCE_ENDPOINT', 'MODEL_CONFIG']
}

const cameraManager = require('./cameraManager');
const alertEngine = require('./alertEngine');

class StreamProcessor {
  constructor() {
    this.activeStreams = new Map();
    this.inferenceEndpoint = process.env.INFERENCE_ENDPOINT || 'http://localhost:8000';
    this.modelConfig = process.env.MODEL_CONFIG ? JSON.parse(process.env.MODEL_CONFIG) : {
      intrusion: 'intrusion_v1.2',
      ppe: 'ppe_compliance_v1.0'
    };
  }

  async initialize() {
    console.log('Initializing Stream Processor...');
    // Initialize inference client (Triton)
    // In production: const tritonClient = new TritonClient(this.inferenceEndpoint);
  }

  async startStream(cameraId) {
    console.log(`Starting stream processing for camera ${cameraId}`);

    const camera = cameraManager.getCamera(cameraId);
    if (!camera) {
      throw new Error(`Camera ${cameraId} not found`);
    }

    // Start RTSP stream
    const stream = await cameraManager.startRtspStream(cameraId);

    // Set up frame processing
    stream.on('data', async (frame) => {
      await this.processFrame(cameraId, frame);
    });

    this.activeStreams.set(cameraId, {
      stream: stream,
      camera: camera,
      startTime: new Date(),
      frameCount: 0
    });

    return {
      cameraId: cameraId,
      status: 'started',
      streamUrl: `ws://localhost:9999/vigil-${cameraId}`
    };
  }

  async stopStream(cameraId) {
    const activeStream = this.activeStreams.get(cameraId);
    if (activeStream) {
      activeStream.stream.stop();
      this.activeStreams.delete(cameraId);
      console.log(`Stopped stream processing for camera ${cameraId}`);
    }
  }

  async processFrame(cameraId, frame) {
    const activeStream = this.activeStreams.get(cameraId);
    if (!activeStream) return;

    activeStream.frameCount++;

    // Simulate inference (in production, send to Triton/DeepStream)
    const detections = await this.runInference(frame);

    // Process detections
    for (const detection of detections) {
      if (detection.confidence > 0.8) { // Configurable threshold
        await this.handleDetection(cameraId, detection);
      }
    }
  }

  async runInference(frame) {
    // Placeholder for AI inference
    // In production: send frame to Triton server and get detections

    // Simulate random detections for demo
    const detections = [];
    if (Math.random() < 0.01) { // 1% chance per frame
      detections.push({
        type: 'intrusion',
        confidence: 0.93,
        bbox: [100, 200, 300, 400],
        trackId: 'trk-' + Math.random().toString(36).substr(2, 9),
        zone: 'loading-bay'
      });
    }

    return detections;
  }

  async handleDetection(cameraId, detection) {
    // Generate alert
    const alertData = {
      type: detection.type,
      cameraId: cameraId,
      site: 'default', // From config
      severity: detection.confidence > 0.9 ? 'high' : 'medium',
      confidence: detection.confidence,
      trackId: detection.trackId,
      bbox: detection.bbox,
      zone: detection.zone,
      model: this.modelConfig[detection.type] || 'default',
      frameTs: new Date().toISOString(),
      snapshotUrl: `s3://vigil/alerts/${Date.now()}.jpg`, // Placeholder
      videoClipUrl: `s3://vigil/clips/${Date.now()}.mp4` // Placeholder
    };

    await alertEngine.generateAlert(alertData);
  }

  getActiveStreams() {
    const streams = [];
    for (const [cameraId, streamData] of this.activeStreams) {
      streams.push({
        cameraId: cameraId,
        startTime: streamData.startTime,
        frameCount: streamData.frameCount,
        status: 'active'
      });
    }
    return streams;
  }

  async getStreamStatus(cameraId) {
    const activeStream = this.activeStreams.get(cameraId);
    if (activeStream) {
      return {
        cameraId: cameraId,
        status: 'active',
        startTime: activeStream.startTime,
        uptime: Date.now() - activeStream.startTime.getTime(),
        frameCount: activeStream.frameCount,
        fps: activeStream.frameCount / ((Date.now() - activeStream.startTime.getTime()) / 1000),
        lastFrame: new Date().toISOString()
      };
    } else {
      return {
        cameraId: cameraId,
        status: 'inactive'
      };
    }
  }
}

const streamProcessor = new StreamProcessor();

module.exports = streamProcessor;