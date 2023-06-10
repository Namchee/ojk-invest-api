import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Illegal investment product
  type IllegalInvestment {
    id: ID!
    name: String!
    alias: [String!]!
    address: [String!]! 
    phone: [String!]!
    web: [String!]!
    email: [String!]!
    entity_type: String!
    activity_type: [String!]!
    input_date: String!
    description: String!
  }

  # Legal and authorized shared fund products
  type Product {
    id: ID!
    name: String!
    management: String!
    custodian: String!
    type: String!
  }

  # Legal and authorized shared funds manager application
  type App {
    id: ID!
    name: String!
    url: String!
    owner: String!
  }

  type IllegalsQueryResult {
    data: [IllegalInvestment!]!
    count: Int!
    version: String!
  }

  type AppsQueryResult {
    data: [App!]!
    count: Int!
    version: String!
  }

  type ProductsQueryResult {
    data: [Product!]!
    count: Int!
    version: String!
  }

  type IllegalQueryResult {
    data: IllegalInvestment
    version: String!
  }

  type AppQueryResult {
    data: App
    version: String!
  }

  type ProductQueryResult {
    data: Product
    version: String!
  }

  type Query {
    illegalInvestments(
      name: String,
      limit: Int,
      offset: Int
    ): IllegalsQueryResult!
    illegalInvestment(id: ID): IllegalQueryResult!
    products(name: String, limit: Int, offset: Int): ProductsQueryResult!
    product(id: ID): ProductQueryResult!
    apps(name: String, limit: Int, offset: Int): AppsQueryResult!
    app(id: ID): AppQueryResult!
  }
`;
