const express = require("express");
const router = express.Router();
let middleware = require("../middleware");
Blog = require("../models/blog"),

// Index //
router.get("/index", (req, res) => {
  let query = Blog.find().sort({ _id: -1 });
  query.exec({}, (err, allBlogs) => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      res.render("index", {
        blogs: allBlogs
      });
    }
  });
});

// New //
router.get("/new_post", middleware.isLoggedIn, (req, res) => {
  res.render("new");
});

// Show //
router.get("/newest", (req, res) => {
  let query = Blog.find()
    .sort({ _id: -1 })
    .limit(1);
  query.exec((err, newest) => {
    if (err) {
      console.log("Error", err);
    } else {
      res.render("newest", { newest: newest });
    }
  });
});

router.get("/blog/:id", (req, res) => {
  Blog.findById(req.params.id)
    .populate("comments")
    .exec((err, foundBlog) => {
      if (err) {
        console.log("Something went wrong:", err);
      } else {
        res.render("blog", { blog: foundBlog });
      }
    });
});
 
// Create //
router.post("/blogs", middleware.isLoggedIn, function(req, res) {
  let name = req.body.name;
  let year = req.body.year;
  let medium = req.body.medium;
  let source = req.body.source;
  let description = req.body.desc;
  let author = {                 // this is important!!
    id: req.user._id,            // this will add username to db object ("blog" object)
    username: req.user.username  // so it can be referenced later in middleware
}
  let newBlog = {
    name: name,
    year: year,
    medium: medium,
    source: source,
    description: description,
    author:author
  };
  Blog.create(newBlog, (err, blog) => {
    if (err) {
      console.log("Something went wrong");
      console.log(err);
    } else {
      console.log("Success! New Blog posted to Mongo DB");
      console.log(blog);
      res.redirect("/index");
    }
  });
});

// Edit //
router.get("/edit_blog/:id", middleware.checkBlogOwnership,(req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
  if (err) {
      console.log("Error", err);
      res.redirect("back");
    } else {
      console.log(foundBlog);
      res.render("edit", { foundBlog: foundBlog });
    }
  });
});

// Update //
router.put("/blogs/:id",(req, res) => {
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, foundBlog) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Update route hit!!");
      console.log(req.body.blog);
      res.redirect("/blog/" + foundBlog._id);
    }
  });
});

// Destroy //
router.delete("/blog/:id",(req, res) => {
  Blog.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      console.log("Success, item deleted");
      res.redirect("/index");
    }
  });
});


module.exports = router;