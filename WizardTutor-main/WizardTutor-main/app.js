import express from "express";

import {
  geocodeAddress,
  getTutorsLocations,
  initMapWithTutorsLocations,
  getName,
  searchUser,
  getAllUsers,
  countUserSessions,
  createUser,
  deleteUser,
  updateUserInformation,
  getAllTutors,
  searchTutor,
  countTutorSessions,
  createTutor,
  deleteTutor,
  updateTutorInformation,
  getAllSubjects,
  getUserSessions,
  getTutorSessions,
  getSession,
  getSessionsByDateRange,
  bookSession,
  cancelSession,
  getReview,
  getReviewsByTutor,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
} from "./database.js";

const app = express();

app.get("/wizards", async (req, res) => {
  const products = await getTutorsLocations();
  res.send(products);
});

app.get("/geocodelocation", async (req, res) => {
  const products = await geocodeAddress(6);
  res.send(products);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
