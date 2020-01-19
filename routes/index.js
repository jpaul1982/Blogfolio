const express = require("express");
const router = express.Router();
passport = require("passport"),
User = require("../models/user");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
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

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.post("/login",passport.authenticate (
    "local", // passport.authenticate is a middleware method that will handle the authentication logic.
    {
      successRedirect: "/index",
      failureRedirect: "/login"
    }
  )
);

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };

module.exports = router;