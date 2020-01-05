const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 3000,
  mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set("view engine", "ejs");

let blogSchema = new mongoose.Schema({
  name: String,
  year: Number,
  medium: String,
  source: String,
  description: String
});

let Blog = mongoose.model("Blog", blogSchema);

let piece = new Blog({
  name: "Witches Sabbath",
  year: 1798,
  medium: "Oil on Canvas",
  source:
    "https://render.fineartamerica.com/images/rendered/default/poster/8/10/break/images/artworkimages/medium/1/the-witches-sabbath-goya.jpg",
  description: "A really cool painting!"
});

piece.save((err, piece) => {
  if (err) {
    console.log("Something went wrong", err);
  } else {
    console.log("New blog saved to database");
    console.log(piece);
  }
});

//////// Index Routes ///////////
app.get("/", (req, res) => {
  res.render("index");
});
//////// New Routes ///////////
app.get("/new_post", (req, res) => {
  res.render("new");
});

//////// Show Routes ////////////

//////// Create Routes //////////
app.post("/", (req, res) => {});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
