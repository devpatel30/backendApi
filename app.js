if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const resourceRoutes = require('./routes/resource')

const session = require("express-session");

app.listen(5000, () => {
  console.log("listening at port 5000");
});

mongoose.connect(process.env.MONGODB_URL),
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

// using passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// adding user and removing user from the session using passport local stratergy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.get("/", (req, res) => {
  res.send("home");
});

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use('/resource',resourceRoutes)
app.all("*", (req, res, next) => {
  //   next(new ExpressError("Page Not Found", 404));
  res.status(404).json({ message: "Page not found" });
});
//err handler
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(status).send({ error: { err } });
});
