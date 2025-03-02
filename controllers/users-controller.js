const uuid = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  { id: "u1", name: "Nishant", email: "test@test.com", password: "testing" },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signupUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please provide valid inputs.", 422));
  }
  const { userName, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    return next(new HttpError("Email already registered.", 422));
  }
  const createdUser = {
    id: uuid.v4(),
    name: userName,
    email,
    password,
  };
  DUMMY_USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError(
        "Could not login the user. Credentials seem to be wrong!",
        401
      )
    );
  }
  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signupUser = signupUser;
exports.loginUser = loginUser;
