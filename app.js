const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require('./db/dbConnect');
const User = require('./db/userModel')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const auth = require("./auth")

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
})

app.post("/register", (request, response)=> {

  // hash the password
  bcrypt.hash(request.body.password, 10)
  .then((hashedPassword) => {
    // create a new user instance and collect the data
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
    })

    //  Save the new user
    user.save()
    //  return success if the new user is added to the database successfully
    .then((result) => {
      response.status(201).send({
        message: "User Created Successfully",
        result,
      })
    })
    .catch((error) => {
      response.status(500).send({
        message: "error creating user",
        error,
      })
    })
  })
  // catch error if the password hash isn't successful
  .catch((e) => {
    response.status(500).send({
      message: "Password was not hashed successfully",
      e,
    });
  });
})

app.post("/login", (request, response) => {
  User.findOne({ 
    email: request.body.email
  })
  .then((user) => {
    bcrypt.compare(request.body.password, user.password)
    .then((passwordCheck) => {
      // Check if the password matches 
      if(!passwordCheck){
        return response.status(400).send({
          message: "Passwords do not match",
          error,
        })
      }

      // Create JWT token 
      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email
        },
        "BEARER-TOKEN",
        { expiresIn: "24h" }
      );

      // Return success response
      response.status(200).send({
        message: "Login Successful",
        email: user.email,
        token,
      })

    })
    .catch(e => {
      response.status(404).send({
        message:"Passwords do not match",
        e,
      })
    })
  })
  .catch(e => {
    response.status(404).send({
      message: "Invalid Credentials",
      e
    })
  })
})

app.get("/freepoint", (request, response) => {
  response.json({message: "You are free to access this endpoint"})
})

app.get("/authpoint", auth, (request, response) => {
  response.json({message: "You are authorized to access this endpoint"})
})


module.exports = app;