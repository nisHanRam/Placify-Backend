const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// Error Handling if request is made to a route that does not exist
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

// Error Handling Middleware - Executes when any middleware in front of it yields an error
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "Unknown error occured!" });
});

mongoose
  .connect(
    "mongodb+srv://placify123:placify123@cluster0.pikth.mongodb.net/placifyDB?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));
