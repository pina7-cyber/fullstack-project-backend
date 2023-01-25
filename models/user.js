const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    minlength: 4,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 4,
  },
})

module.exports = mongoose.model("User", schema)
