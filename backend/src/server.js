const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const app = express();

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
