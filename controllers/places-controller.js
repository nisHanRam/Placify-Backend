const uuid = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Taj Mahal",
    description: "7th Wonder",
    address: "Agra",
    creator: "u1",
  },
];

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

  try {
    await createdPlace.save();
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
    place = await Place.findById(placeId);
  } catch (error) {    
    return next(new HttpError("Deleting place failed.", 500));
  }
  
  if (!place) {
    return next(new HttpError("The place to be deleted does not exist.", 404));
  }
  
  try {
    await place.deleteOne();
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
