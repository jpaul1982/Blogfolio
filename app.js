const express = require("express"),
  app = express(),
  PORT = process.env.PORT || 3000,
  bodyParser = require("body-parser"),
  Blog = require("./models/blog"),
  Comment = require("./models/comments"),
  mongoose = require("mongoose"), // mongoose is an ODM(object data mapper, this allows us to interact with our DB using JS)
  methodOverride = require("method-override"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/blogfolio", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/////// Passport Config ////////////
app.use(
  require("express-session")({
    secret: "Facts over feelings.",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.set("useFindAndModify", false);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

//////Regiser Route/////
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let newUser = { username: req.body.username }; // creates new user in a variable using the "User" model
  User.register(newUser, req.body.password, (err, user) => {
    // .register is a method that handles the logic for storing the salted/hashed password.
    if (err) {
      console.log("Something went wrong:", err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, () => { 
      res.redirect("/newest");
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/login", passport.authenticate("local",  // passport.authenticate is a middleware method that will handle the authentication logic.  
  {
    successRedirect: "/index",
    failureRedirect: "/login"
  })
);

// - Root Route - //
app.get("/", (req, res) => {
  res.render("landing");
});

//////// Index ///////////
app.get("/index", (req, res) => {
  console.log(req.user);
  
  let query = Blog.find().sort({ _id: -1 });
  query.exec({}, (err, allBlogs) => {
    if (err) {
      console.log("Something went wrong:", err);
    } else {
      res.render("index", {
        blogs: allBlogs,
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
app.post("/blogs", isLoggedIn, function(req, res) {
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

app.post("/comments/:id", isLoggedIn, (req, res) => {
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
          console.log("Success!  Comment Posted", comment, req.user.username);
          // comment.author.id = req.user._id;
          comment.author.username = req.user.username;
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
app.put("/blogs/:id", isLoggedIn, (req, res) => {
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
      console.log("Success, item deleted");
      res.redirect("/blog/" + req.params.id);
      // res.redirect("/index");
    }
  });
});

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // req.flash("error", "You need to be logged in to do that.");
  res.redirect("/login");
};

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
