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
const resourceRoutes = require("./routes/resource");

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// using passport for authentication
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));

// adding user and removing user from the session using passport local stratergy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.get("/", (req, res) => {
  res.send("home");
});
require("./config/appAuth");
app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.status(200).json({
      status: true,
      message: "Authenticated user",
      data: { id: req.user._id, username: req.user.personalInfo.email },
    });
  }
);

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/resource", resourceRoutes);
app.all("*", (req, res, next) => {
  res.status(404).json({ status: false, message: "Page not found" });
});
//err handler
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(status).json({ status: false, error: { err } });
});
