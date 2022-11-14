const USER = require("../MODELS/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
require("dotenv").config();
const cookiepar = require("cookie-parser");

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("PLZ ENTER REQUIRED FEILD PARAMETERS CORRECTLY");
    error.code = 400;
    return next(error);
  }

  let alreadyExists;
  try {
    alreadyExists = await USER.findOne({ email: email });
  } catch (err) {
    const error = new Error("ERROR CONNECTING TO SERVER");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  if (username.trim() == "" || email.trim() == "" || password.trim() == "") {
    const error = new Error("FEILDS ARE EMPTY , PLEASE ENTER DATA");
    error.code = 401;
    return next(error);
  }

  if (alreadyExists) {
    const error = new Error("USER WITH THIS MAIL ALREDAY EXISTS");
    error.code = 409;
    return next(error);
  }

  let usernameAlreadyExists;
  try {
    usernameAlreadyExists = await USER.findOne({ username: username });
  } catch {
    const error = new Error("ERROR CONNECTING TO SERVER");
    error.code = 500;
    return next(error);
  }

  if (usernameAlreadyExists) {
    const error = new Error("THIS USERNAME ALREDAY EXISTS");
    error.code = 409;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  let newUser;
  try {
    newUser = new USER({
      email: email,
      username: username,
      password: hashedPassword,
      messages: [],
    });
  } catch (err) {
    const error = new Error("USER CREATION FAILED , SERVER NOT RESPONDING");
    error.code = 500;
    return next(error);
  }

  let userCreated;
  try {
    userCreated = await newUser.save();
  } catch (err) {
    const error = new Error(
      "SOMETHING WENT WRONG WITH SERVER WHILE MAKING CHANGES",
    );
    error.code = 500;
    return next(error);
  }

  res
    .status(201)
    .json({ message: "USER CREATED SUCCESSFULLY , GO BACK AND LOG IN" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("PLZ ENTER REQUIRED FEILD PARAMETERS CORRECTLY");
    error.code = 400;
    return next(error);
  }

  let emailExists;
  try {
    emailExists = await USER.findOne({ email: email });
  } catch (err) {
    const error = new Error("ERROR CONNECTING TO SERVER , EMAIL");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  if (!emailExists) {
    const error = new Error("NO SUCH USER EXISTS ON THIS APP");
    error.code = 401;
    return next(error);
  }

  let comparePassword;
  try {
    comparePassword = await bcrypt.compare(password, emailExists.password);
  } catch (err) {
    const error = new Error("ERROR CONNECTING TO SERVER , PASSWORD");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  if (comparePassword !== true) {
    const error = new Error("PASSWORD IS WRONG");
    error.code = 401;
    return next(error);
  }
  let token, refreshToken;

  try {
    token = jwt.sign(
      { userId: emailExists.id, username: emailExists.username },
      process.env.JWT_KEY,
      { expiresIn: "30m" },
    );

    refreshToken = jwt.sign(
      {
        userId: emailExists.id,
        username: emailExists.username,
        email: emailExists.email,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "1d" },
    );

    res.cookie("jwtkicookie", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
  } catch (err) {
    const error = new Error("SOMETHING WENT WRONG");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  res.status(200);
  res.json({
    token: token,
    username: emailExists.username,
    userId: emailExists.id,
    email: email,
    message: "LOGIN SUCCESS , WELCOME !",
  });
};

const getUsers = async (req, res, next) => {
  let user;
  try {
    user = await USER.findOne({ username: req.extractedUsername });
  } catch (err) {
    const error = new Error("SOMETHING WENT WRONG");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  if (!user) {
    const error = new Error("NOT AUTHORIZED");
    console.log(err);
    error.code = 401;
    return next(error);
  }

  let users;
  try {
    users = await USER.find({}, { password: 0 });
  } catch (err) {
    const error = new Error("SOMETHING WENT WRONG");
    console.log(err);
    error.code = 500;
    return next(error);
  }

  res
    .status(200)
    .json({ users: users.map((item) => item.toObject({ getters: true })) });
};

const getRefreshToken = (req, res, next) => {
  if (req.cookies.jwtkicookie) {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwtkicookie;

    // Verifying refresh token
    let retoken;
    try {
      retoken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    } catch (err) {
      console.log("REFRESH TOKEN ERROR : " + err);

      return res.status(401).json({ message: "Unauthorized " });
    }

    // Correct token we send a new access token
    const accessToken = jwt.sign(
      {
        username: retoken.username,
        email: retoken.email,
        userId: retoken.userId,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "30m",
      },
    );

    res.status(201).json({
      token: accessToken,
      username: retoken.username,
      email: retoken.email,
      userId: retoken.userId,
    });
  } else {
    console.log("COOKIES DOESNT EXIST");
    res.status(401).json({ message: "Session has expired , login again" });
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getRefreshToken = getRefreshToken;
