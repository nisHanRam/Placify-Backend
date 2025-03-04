const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("Failed to fetch users, try again later.", 500));
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Please provide valid inputs.", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Signing up failed.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead.", 500)
    );
  }

  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    new HttpError("Signing up failed, please try again.", 500);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Logging in failed.", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError("Could not login the user. Invalid credentials!", 401)
    );
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signupUser = signupUser;
exports.loginUser = loginUser;
