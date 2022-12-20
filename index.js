const { ApolloServer, UserInputError, gql } = require("apollo-server")
require("dotenv").config()
const User = require("./models/user")
const Topic = require("./models/topic")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

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
    allUsers: async (root, args) => {
      return User.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },

  Mutation: {
    addTopic: async (root, args) => {
      const existingTopic = await Topic.findOne({
        content: { $in: [args.content] },
      })
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
    createUser: async (root, args) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(args.password, saltRounds)
      const user = new User({
        username: args.username,
        passwordHash: passwordHash,
      })
      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash)

      if (!(user && passwordCorrect)) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
