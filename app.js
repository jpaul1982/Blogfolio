const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 3000,
  bodyParser = require("body-parser"),
  Blog = require("./models/blog"),
  mongoose = require("mongoose"); // mongoose is an ODM(object data mapper, this allows us to interact with our DB using JS)
methodOverride = require("method-override");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//////// Index Routes ///////////
app.get("/", (req, res) => {
  Blog.find({}, (err, allBlogs) => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      res.render("index", {
        blogs: allBlogs
      });
    }
  });
});

app.get("/blogs", (req, res) => {
});
//////// New Routes ///////////
app.get("/new_post", (req, res) => {
  res.render("new");
});

//////// Show Routes ////////////

//////// Create Routes //////////

app.post("/blogs", function(req, res) {
  console.log("REQ DOT", req.body);
  let name = req.body.name;

  let year = req.body.year;
  let medium = req.body.medium;
  let source = req.body.source;
  let description = req.body.desc;
  let newBlog = {
    name: name,
    year: year,
    medium: medium,
    source: source,
    description: description
  };

  Blog.create(newBlog, (err, blog) => {
    if (err) {
      console.log("Something went wrong");
      console.log(err);
    } else {
      console.log("Success! New Blog posted to Mongo DB");
      console.log(blog);
    }
  });
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
