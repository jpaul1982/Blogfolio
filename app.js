const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 3000,
  bodyParser = require("body-parser"),
  Blog = require("./models/blog"),
  Comment = require("./models/comments"),
  mongoose = require("mongoose"); // mongoose is an ODM(object data mapper, this allows us to interact with our DB using JS)
methodOverride = require("method-override");


mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useFindAndModify", false);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  res.locals.moment = require("moment");

  next();
});

// - Root Route - //
app.get("/", (req, res) => {
  res.render("landing");
});

//////// Index ///////////
app.get("/index", (req, res) => {
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

//////// Show ///////////
app.get("/newest", (req, res) => {
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

app.get("/blog/:id", (req, res) => {
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

//////// New ///////////
app.get("/new_post", (req, res) => {
  res.render("new");
});

app.get("/comments/:id", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      console.log("ID", req.params.id, "Blog", foundBlog);
      res.render("comments", { blog: foundBlog });
    }
  });
});

//////// Create //////////
app.post("/blogs", function(req, res) {
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
      res.redirect("/index");
    }
  });
});

app.post("/comments/:id", (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      console.log("BLOG", blog);
      let newComment = { comment: req.body.comment };
      Comment.create(newComment.comment, (err, comment) => {
        if (err) {
          console.log("Something went wrong:", err);
        } else {
          console.log("Success!  Comment Posted", comment);
          console.log(comment.date.toLocaleDateString("en-US"));
          
          comment.save();
          blog.comments.push(comment);
          blog.save();
          res.redirect("/blog/" + blog._id);
        }
      });
    }
  });
});

////// Edit //////////
app.get("/edit_blog/:id", (req, res) => {
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

////// Update //////////
app.put("/blogs/:id", (req, res) => {
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

////// Destroy //////////
app.delete("/blog/:id", (req, res) => {
  Blog.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      console.log("Success, item deleted");
      res.redirect("/index");
    }
  });
});

app.delete("/blog/:id/comments/:comment_id", (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, err => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      console.log("ReQdot:", req.params.comment_id);
      console.log("ReQdot:", req.params.id);
      console.log("Success, item deleted");
      res.redirect("/blog/" + req.params.id);
      // res.redirect("/index");
    }
  });
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
