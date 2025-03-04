const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong.", 500));
  }
  if (!place) {
    return next(new HttpError("Could not find the place.", 404));
  }
  res.json({ place: place.toObject({ getters: true }), message: "It works!" });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlaces;
  try {
    userPlaces = await Place.find({ creator: userId });
    // Alternate Method
    // const user = await User.findById(userId).populate("places");
    // userPlaces = user.places;
  } catch (error) {
    return next(new HttpError("Something went wrong.", 500));
  }
  if (!userPlaces.length) {
    return next(new HttpError("Could not find a place for the user.", 404));
  }
  res.json({
    userPlaces: userPlaces.map((place) => place.toObject({ getters: true })),
    message: "It works!",
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please provide valid inputs.", 422));
  }

  const { title, description, address, creator } = req.body;
  const createdPlace = new Place({
    title,
    description,
    address,
    creator,
    image:
      "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(new HttpError("This user does not exist.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    // Here, push is a method by mongoose to establish the connection between the two models.
    // Behind the scenes, mongoose grabs the _id of the newly created place and pushes it into the places field for the user
    await user.save({ session: sess });
    await sess.commitTransaction(); // Only at this point changes are saved in the DB
  } catch (err) {
    return next(new HttpError("Creating place failed.", 500));
  }

  res.status(201).json({ createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please provide valid inputs.", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Updating place failed.", 500));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Updating place failed.", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError("Deleting place failed.", 500));
  }

  if (!place) {
    return next(new HttpError("The place to be deleted does not exist.", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);

    return next(new HttpError("Deleting place failed.", 500));
  }

  res.status(200).json({ message: "Place deleted successfully." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
