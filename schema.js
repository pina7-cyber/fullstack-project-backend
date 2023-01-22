const { gql } = require("apollo-server")

const typeDefs = gql`
  type User {
    username: String!
    id: ID!
    passwordHash: String!
  }
  type Token {
    value: String!
  }
  type Topic {
    categories: [String!]!
    content: String!
    user: User!
    comments: [String]!
    keywords: [String!]!
    id: ID!
  }
  type Query {
    allTopics(category: String, keyword: String, id: ID): [Topic!]!
    allUsers: [User!]!
    me: User
  }
  type Mutation {
    addTopic(
      categories: [String!]!
      content: String!
      keywords: [String!]!
    ): Topic
    createUser(username: String!, password: String!): User
    login(username: String!, password: String!): Token
  }
`
module.exports = typeDefs
