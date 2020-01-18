const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
      id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
      },
      username: String
    },
    date: {
      type: Date,
      default: Date,
    },

      
  });
  
  module.exports = mongoose.model("Comment", commentSchema);