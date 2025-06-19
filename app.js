if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

//Routers.
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

let port = 8080;

// const dburl = process.env.ATLASDB_URL;
const dburl = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"/views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({extended: true}));

app.use(methodOverride("_method"));

//mongo session (connect-mongo)
// const store = MongoStore.create({
//   mongoUrl: dburl,
//   crypto:{
//     secret: process.env.SECRET,
//   },
//   touchAfter: 24 * 3600
// })

// store.on("error", () =>{
//   console.log("ERROR in mongo session store");
// })

//Express - session
const sessionOptions = {
  // store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
      expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
  }
}

//Use session and it's options.
app.use(session(sessionOptions));

//use connect-flash package.
app.use(flash());

//user authentication & authorization.

//middleware that initialize passport.
app.use(passport.initialize());

//a web application needs the ability to identify a users as they browse from page to page. 
app.use(passport.session());

// use static authenticate method of model in LocalStrategy.
passport.use(new LocalStrategy(User.authenticate()));

// use for serialize and deserialize user (session should know about the user).
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//use flash messages for success and errors.
app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // session user info.
  next();
});

//Listing Routes.
app.use("/listings", listingRouter);

//Reviews Routes.
app.use("/listings/:id/reviews", reviewRouter);

//User Routes
app.use("/", userRouter);

//middleware - throw error if any request are not satisfied with any exitsting routes (express-error handling).
app.use((req, res, next) =>{
  next(new ExpressError(404, "Page Not Found!"));
});

//middleware - show which type of error occured and display it on client-side (server-side error handling).
app.use((err, req, res, next) =>{
  let {statusCode=500, message="something was wrong"} = err;
  res.status(statusCode).render("error.ejs", {message});
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log("server is listening on 8080...");
});