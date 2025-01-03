const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const passwordService = require("./utils/passwordService");
const generateToken = require("./utils/generateJWT");

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

dbConnect();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.post("/register", async (request, response) => {
  // destructure the email and password in a variable
  const { email, password } = request.body;
  // hash the password
  const { success, error, hashedPassword } = await passwordService.hashPassword(
    password
  );

  const user = new User({
    email: request.body.email,
    password: hashedPassword,
  });

  if (success) {
    //  Save the new user
    user
      .save()
      //  return success if the new user is added to the database successfully
      .then((result) => {
        response.status(201).send({
          message: "User Created Successfully",
          result,
        });
      })
      .catch((error) => {
        response.status(500).send({
          message: "error creating user",
          error,
        });
      });
  } else {
    response.send(500).send({
      message: "Password hash failed",
      error,
    });
  }
});

app.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(500).send({
      message: "fields can not be empty",
    });
    
  }

  User.findOne({
    email: request.body.email,
  })
    .then(async(user) => {
      const {success, error} = await passwordService.validatePassword(password, user.password);
      
          // Check if the password matches
          if (!success) {
            return response.status(400).send({
              message: "Passwords do not match",
              error,
            });
          }

          // Create JWT token
          const {token, err} = generateToken(user._id, user.email)

          if(token){
            response.status(200).send({
              message: "Login Successful",
              email: user.email,
              token,
            });
          }
          else{
            response.status(404).send({
              message: "Login failed, possibly wrong credentials",
              err,
            });
          }
    })
    .catch((e) => {
      response.status(404).send({
        message: "Invalid Credentials",
        e,
      });
    });
});

app.get("/freepoint", (request, response) => {
  response.json({ message: "You are free to access this endpoint" });
});

app.get("/authpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access this endpoint" });
});

module.exports = app;
