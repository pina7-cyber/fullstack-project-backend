const { ApolloServer, UserInputError, gql } = require("apollo-server")
require("dotenv").config()
const User = require("./models/user")
const Topic = require("./models/topic")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.MONGODB_URI

console.log("connecting to", MONGODB_URI)

mongoose.set("strictQuery", true)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message)
  })

// let users = [
//   {
//     username: "Robi",
//     id: "fjk5thw-344d-11e9-a414-719c6709cf3e",
//     registered: 1952,
//   },
//   {
//     username: "Sabrina",
//     id: "hjkwgh-344d-11e9-a414-719c6709cf3e",
//     registered: 1952,
//   },
//   {
//     username: "freak",
//     id: "hgkjewr-344d-11e9-a414-719c6709cf3e",
//     registered: 1952,
//   },
// ]



const typeDefs = gql`
  type User {
    username: String!
    id: ID!
    registered: Int!
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
    allTopics: async (root, args) => {
      const topic = await Topic.findOne({ _id: { $in: [args.id] } }).populate(
        "user"
      )
      if (topic) {
        return Topic.find({ _id: { $in: [args.id] } }).populate("user")
      }
      if (!args.keyword) {
        if (!args.category) {
          return Topic.find({}).populate("user")
        }
        return Topic.find({ categories: { $in: [args.category] } }).populate(
          "user"
        )
      }
      if (!args.category) {
        return Topic.find({ keywords: { $in: [args.keyword] } }).populate(
          "user"
        )
      }
      return Topic.find({
        categories: { $in: [args.category] },
        keywords: { $in: [args.keyword] },
      }).populate("user")
    },
    allUsers: (root, args) => {
      return User.find({})
    },
  },

  Mutation: {
    addTopic: async (root, args) => {
      const existingTopic = await Topic.findOne({ content: { $in: [args.content] } })
      if (existingTopic) {
        console.log(existingTopic)
        throw new UserInputError("topic already exists", {
          invalidArgs: args.content,
        })
      }
      const topic = new Topic({ ...args, comments: [] })
      try {
        await topic.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

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
