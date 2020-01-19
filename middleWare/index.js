const Blog = require("../models/blog");
let middlewareObj = {};

middlewareObj.checkBlogOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Blog.findById(req.params.id, (err, foundBlog) => {
      console.log("FoundBlog:", foundBlog.author.username);
      if (err) {
        console.log("Error", err);
        res.redirect("back");
      } else {
        console.log(req.user);
  
        if (foundBlog.author.id.equals(req.user._id)) {
          next();
        } else {
          res.send("You do not have permission to do that.");
        }
      }
    });
  } else {
    console.log("You need to be logged in to do that!");
    res.send("You need to be logged in to do that!");
  }
  };

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Blog.findById(req.params.id, function(err, foundComment) {
      
      if (err || !foundComment) {
        req.flash("error", "Comment not found");
        res.redirect("back");
      } else {
        // does user own the blog?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "Permission denied.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("back");
  }
};



middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that.");
  res.redirect("/login");
};

module.exports = middlewareObj;