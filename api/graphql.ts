import { ApolloServer } from '@saeris/apollo-server-vercel';

import { typeDefs } from './../src/graphql/type-defs';
import { resolvers } from './../src/graphql/resolver';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
});

export default server.createHandler();
