import { ApolloServer } from 'apollo-server-micro';

import CORS from 'micro-cors';

import { typeDefs } from './../src/graphql/type-defs';
import { resolvers } from './../src/graphql/resolver';

// TypeScript type hack
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');

// eslint-disable-next-line new-cap
const cors = CORS();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    // eslint-disable-next-line new-cap
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
  introspection: true,
});

const start = server.start();

export default cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  await start;
  await server.createHandler({ path: '/api/graphql' })(req, res);
});
