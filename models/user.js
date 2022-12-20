const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  registered: {
    type: Number,
  },
})

module.exports = mongoose.model("User", schema)
