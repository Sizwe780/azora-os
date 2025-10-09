module.exports = {
  quantumService: {
    url: process.env.QUANTUM_SERVICE_URL || 'http://quantum_microservice:5000'
  },
  port: process.env.PORT || 3000
};
