const express = require("express");
const router = express.Router();
let middleware = require("../middleware");
Blog = require("../models/blog"),
Comment = require("../models/comments"),

// New //

router.get("/comments/:id", middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
      if (err) {
        console.log("Something went wrong:", err);
      } else {
        console.log("ID", req.params.id, "Blog", foundBlog);
        res.render("comments", { blog: foundBlog });
      }
    });
  });
  
// Create //
router.post("/comments/:id", middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
      if (err) {
        console.log("Something went wrong:", err);
      } else {
        let newComment = { comment: req.body.comment };
        Comment.create(newComment.comment, (err, comment) => {
          if (err) {
            console.log("Something went wrong:", err);
          } else {
            console.log("Success!  Comment Posted");
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            blog.comments.push(comment);
            blog.save();
            console.log(comment);
            res.redirect("/blog/" + blog._id);
          }
        });
      }
    });
  });
  
// Destroy //   
router.delete("/blog/:id/comments/:comment_id", middleware.checkCommentOwnership,(req, res) => {
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

  module.exports = router;