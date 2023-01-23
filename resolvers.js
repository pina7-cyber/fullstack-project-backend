const Topic = require("./models/topic")
const User = require("./models/user")
const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")
const { UserInputError } = require("apollo-server")

const JWT_SECRET = process.env.JWT_SECRET

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

module.exports = resolvers
