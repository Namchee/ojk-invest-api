import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  type IllegalInvestment {
    id: ID!
    name: String!
    address: String!
    number: String!
    email: String!
    url: String!
    type: String!
    inputDate: String!
    details: String!
  }

  type Product {
    id: ID!
    name: String!
    management: String!
    custodian: String!
    type: String!
  }

  type App {
    id: ID!
    name: String!
    url: String!
    owner: String!
  }

  type Query {
    getIllegalInvestments: [IllegalInvestment!]!
    getAuthorizedProducts: [Product!]!
    getAuthorizedApps: [App!]!
  }
`;

export default typeDefs;
