const { ApolloServer, UserInputError, gql } = require("apollo-server")
const { v1: uuid } = require("uuid")

let users = [
  {
    username: "Robi",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    registered: 1952,
  },
  {
    username: "Sabrina",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    registered: 1952,
  },
  {
    username: "freak",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    registered: 1952,
  },
]

let topics = [
  {
    categories: ["math", "physics"],
    content: "hoe to solve 1X1",
    comments: ["does not work", "how to do 1x1"],
    keywords: ["beginners", "multiply"],
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    categories: ["data science"],
    content: "problem with react hooks",
    comments: ["react is easy", "hooks are awsome"],
    keywords: ["beginners", "patterns", "design"],
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    categories: ["data science"],
    content: "backend using graphQL",
    comments: [],
    keywords: ["backend", "graphQL"],
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
]

const typeDefs = gql`
  type User {
    username: String!
    id: ID!
    registered: Int!
  }
  type Topic {
    categories: [String!]!
    content: String!
    comments: [String]!
    keywords: [String!]!
    id: ID!
  }
  type Query {
    allTopics(category: String, keyword: String): [Topic!]!
    allUsers: [User!]!
  }
  type Mutation {
    addTopic(
      categories: [String!]!
      content: String!
      keywords: [String!]!
    ): Topic
  }
`

const resolvers = {
  Query: {
    allTopics: (root, args) => {
      if (!args.keyword) {
        if (!args.category) {
          return topics
        }
        return topics.filter((t) =>
          t.categories.find((c) => c === args.category)
        )
      }
      if (!args.category) {
        return topics.filter((t) => t.keywords.find((k) => k === args.keyword))
      }
      return topics
        .filter((t) => t.categories.find((c) => c === args.category))
        .filter((t) => t.keywords.find((k) => k === args.keyword))
    },
    allUsers: (root, args) => {
      return users
    },
  },

  Mutation: {
    addTopic: (root, args) => {
      if (topics.find((t) => t.content === args.content)) {
        throw new UserInputError("already in store", {
          invalidArgs: args.content,
        })
      }

      const topic = { ...args, id: uuid(), comments: [] }
      topics = topics.concat(topic)
      return topic
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
