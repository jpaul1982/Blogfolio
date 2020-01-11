const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const blogSchema = new mongoose.Schema({
    name: String,
    year: Number,
    medium: String,
    source: String,
    description: String,
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment"
      }
    ]
  });
  
  module.exports = mongoose.model("Blog", blogSchema);
