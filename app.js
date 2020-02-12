const express           = require("express"),
      app               = express(),
      PORT              = process.env.PORT || 3000,
      bodyParser        = require("body-parser"),
      mongoose          = require("mongoose"), // mongoose is an ODM(object data mapper, this allows us to interact with our DB using JS)
      methodOverride    = require("method-override"),
      passport          = require("passport"),
      LocalStrategy     = require("passport-local"),
      User              = require("./models/user"),
      flash             = require("connect-flash"),
      blogRoutes        = require("./routes/blogs"),
      commentRoutes     = require("./routes/comments"),
      indexRoutes       = require("./routes/index");

// mongoose.connect("mongodb://localhost:27017/blogfolio", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

mongoose.connect("mongodb+srv://paulMolnar:Vitruvian12358@cluster0-1qme8.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser:true,
  useCreateIndex:true,
}).then(() => {
  console.log("Connected to DB!");
  
}).catch(err => {
  console.log("Error:", err.message);
  
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
app.use(express.static(__dirname + '/public'));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.use(indexRoutes);
app.use(blogRoutes);
app.use(commentRoutes);
// - Root Route - //
app.get("/", (req, res) => {
  res.render("landing");
});

app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
