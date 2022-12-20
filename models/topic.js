const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  categories: [{ type: String }],
  comments: [{ type: String }],
  keywords: [{ type: String }],
})

module.exports = mongoose.model("Topic", schema)
