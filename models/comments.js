const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const commentSchema = new mongoose.Schema({
    text: String,
  });
  
  module.exports = mongoose.model("Comment", commentSchema);