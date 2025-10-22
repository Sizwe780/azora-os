/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora NLP - Custom Natural Language Processing
 * NO external AI dependencies (OpenAI, Anthropic, etc.)
 * Built from scratch using TensorFlow.js and custom training
 */

const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

class AzoraNLP {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.model = null;
    this.vocabulary = new Map();
    this.maxSequenceLength = 100;
  }

  async initialize() {
    console.log('🧠 Initializing Azora NLP Model...');
    
    // Build vocabulary from training data
    await this.buildVocabulary();
    
    // Load or create model
    this.model = await this.loadOrCreateModel();
    
    console.log('✅ Azora NLP Model Ready');
  }

  async buildVocabulary() {
    // Pre-trained vocabulary for common tasks
    const commonWords = [
      'signup', 'login', 'withdraw', 'deposit', 'transfer', 'balance',
      'student', 'founder', 'azora', 'coin', 'reward', 'earn', 'learn',
      'help', 'support', 'error', 'success', 'pending', 'complete',
      'verify', 'kyc', 'compliance', 'blockchain', 'wallet', 'transaction'
    ];
    
    commonWords.forEach((word, idx) => {
      this.vocabulary.set(word, idx + 1); // Start from 1, 0 is padding
    });
  }

  async loadOrCreateModel() {
    try {
      // Try loading existing model
      return await tf.loadLayersModel('file://./models/azora-nlp/model.json');
    } catch {
      // Create new model
      const model = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: this.vocabulary.size + 1,
            outputDim: 128,
            inputLength: this.maxSequenceLength,
          }),
          tf.layers.lstm({ units: 64, returnSequences: false }),
          tf.layers.dropout({ rate: 0.5 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 5, activation: 'softmax' }) // 5 intent classes
        ]
      });

      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      return model;
    }
  }

  tokenize(text) {
    return this.tokenizer.tokenize(text.toLowerCase());
  }

  encode(tokens) {
    const encoded = tokens.map(token => this.vocabulary.get(token) || 0);
    // Pad or truncate to maxSequenceLength
    while (encoded.length < this.maxSequenceLength) encoded.push(0);
    return encoded.slice(0, this.maxSequenceLength);
  }

  async predict(text) {
    const tokens = this.tokenize(text);
    const encoded = this.encode(tokens);
    const tensor = tf.tensor2d([encoded]);
    
    const prediction = await this.model.predict(tensor);
    const result = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();

    return {
      intent: this.getIntentLabel(result),
      confidence: Math.max(...result),
      sentiment: this.analyzeSentiment(tokens),
    };
  }

  getIntentLabel(prediction) {
    const intents = ['query', 'transaction', 'help', 'complaint', 'praise'];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    return intents[maxIndex];
  }

  analyzeSentiment(tokens) {
    const score = this.sentiment.getSentiment(tokens);
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  async generateResponse(intent, context = {}) {
    const responses = {
      query: `I can help you with that. ${context.details || 'What would you like to know?'}`,
      transaction: `Processing your transaction. ${context.amount ? `Amount: ${context.amount} AZR` : ''}`,
      help: 'I\'m here to help! Please describe your issue.',
      complaint: 'I apologize for the inconvenience. Let me escalate this.',
      praise: 'Thank you for your feedback! We appreciate your support.',
    };

    return responses[intent] || 'I understand. How can I assist you?';
  }

  async train(trainingData) {
    console.log('🎓 Training Azora NLP Model...');
    
    const xs = trainingData.map(d => this.encode(this.tokenize(d.text)));
    const ys = trainingData.map(d => this.oneHotEncode(d.label));

    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor2d(ys);

    await this.model.fit(xsTensor, ysTensor, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
        }
      }
    });

    // Save model
    await this.model.save('file://./models/azora-nlp');
    
    xsTensor.dispose();
    ysTensor.dispose();
    
    console.log('✅ Training Complete');
  }

  oneHotEncode(label) {
    const labels = ['query', 'transaction', 'help', 'complaint', 'praise'];
    const encoded = new Array(labels.length).fill(0);
    const index = labels.indexOf(label);
    if (index !== -1) encoded[index] = 1;
    return encoded;
  }
}

module.exports = AzoraNLP;
