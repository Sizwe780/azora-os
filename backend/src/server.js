/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
const complianceApi = require('./api/compliance');
const quantumApi = require('./api/quantum');
const voiceApi = require('./api/voice');
const visionApi = require('./api/vision');
const chatApi = require('./api/chat');
const authApi = require('./api/auth');
const reputationApi = require('./api/reputation');
const learnApi = require('./api/learn');

const app = express();
app.use(express.json());

app.use('/api/auth', authApi);
app.use('/api/chat', chatApi);
app.use('/api/compliance', complianceApi);
app.use('/api/quantum', quantumApi);
app.use('/api/voice', voiceApi);
app.use('/api/vision', visionApi);
app.use('/api/reputation', reputationApi);
app.use('/api/learn', learnApi);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/azora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Azora OS backend running at http://localhost:${PORT}${server.graphqlPath}`);
});
