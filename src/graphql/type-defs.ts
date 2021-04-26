export const typeDefs = `
  # Illegal investment product
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

  type Query {
    illegalInvestments(
      name: String,
      limit: Int,
      offset: Int
    ): [IllegalInvestment!]!
    illegalInvestment(id: ID): IllegalInvestment
    products(name: String, limit: Int, offset: Int): [Product!]!
    product(id: ID): Product
    apps(name: String, limit: Int, offset: Int): [App!]!
    app(id: ID): App
  }
`;
