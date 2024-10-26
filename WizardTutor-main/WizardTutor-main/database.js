import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

// convert to geolocation
export async function geocodeAddress(tutorID) {
  const [rows] = await pool.query(
    `
            SELECT address FROM Tutors
            WHERE tutorID = ${tutorID}
        `
  );

  const address = rows.length > 0 ? rows[0].address : null;

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=AIzaSyCJX888kACFRmb7Omi_Bpi37fW2j7y2zi8`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    console.error("Location valid but could not be found");
  }

  const coordinates = data.results[0].geometry.location;

  await pool.query(
    `
        UPDATE Tutors 
        SET latitude = ${coordinates["lat"]}, longitude = ${coordinates["lng"]}
        WHERE tutorID = ${tutorID}
      `
  );

  return coordinates;
}

// location commands

// gets every tutor's location and returns as a nested array in the form of [[tutorID, lat, long]]
export async function getTutorsLocations() {
  const [rows] = await pool.query(
    "SELECT tutorID, latitude, longitude FROM Tutors"
  );
  const locations = rows.map((row) => [
    row.tutorID,
    row.latitude,
    row.longitude,
  ]);
  return locations;
}

export async function initMapWithTutorsLocations() {
  const tutorsData = await getTutorsLocations();

  // promise that is resolved when data is initialized
  return new Promise((resolve, reject) => {
    window.initMap = function () {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      });

      for (const tutor of tutorsData) {
        const marker = new google.maps.Marker({
          position: { lat: tutor.latitude, lng: tutor.longitude },
          map: map,
          title: "Tutor: " + tutor.tutorID,
        });
      }
      resolve();
    };

    //maps is loaded
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCJX888kACFRmb7Omi_Bpi37fW2j7y2zi8&callback=initMap";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

// user get commands

export async function getName(id) {
  const [rows] = await pool.query(
    `
        SELECT *
        FROM Users
        WHERE UserID = ?
        `,
    [id]
  );
  return rows[0];
}

export async function searchUser(name) {
  const [rows] = await pool.query(
    `
      SELECT * FROM Users
      WHERE name = ?`,
    [name]
  );
  return rows.length > 0 ? rows[0].name : "Item not found";
}

export async function getAllUsers() {
  const [rows] = await pool.query("SELECT * FROM Users");
  return rows;
}

export async function countUserSessions(userID) {
  const [rows] = await pool.query(
    `
          SELECT COUNT(*) AS sessionCount FROM Sessions
          WHERE userID = ?
          `,
    [userID]
  );
  return rows[0].sessionCount;
}

// user add / update / delete commands

export async function createUser(userID, name, email) {
  if (email.endsWith("@scarletmail.rutgers.edu")) {
    const [result] = await pool.query(
      `
        INSERT INTO Users (userID, name, email)
        VALUES (?, ?, ?)
        `,
      [userID, name, email]
    );
    const insertedUserID = result.insertId;
    return getItem(insertedUserID);
  } else {
    throw new Error(
      "Invalid email address. Must be affiliated with Rutgers University"
    );
  }
}

export async function deleteUser(id) {
  const result = await pool.query(
    `DELETE FROM Users 
      WHERE userID = ?
      `,
    [id]
  );

  return result.affectedRows > 0
    ? "User deleted successfully"
    : "User not found";
}

export async function updateUserInformation(
  id,
  valueBeingUpdated,
  updatedInformation
) {
  const [result] = await pool.query(
    `
      UPDATE Users 
      SET ${valueBeingUpdated} = ?
      WHERE id = ?
    `,
    [updatedInformation, id]
  );
}

// tutor get commands

export async function getAllTutors() {
  const [rows] = await pool.query("SELECT * FROM Tutors");
  return rows;
}

export async function searchTutor(name) {
  const [rows] = await pool.query(
    `
    SELECT * FROM Tutors
    WHERE name = ?`,
    [name]
  );
  return rows.length > 0 ? rows[0].name : "Item not found";
}

export async function countTutorSessions(tutorID) {
  const [rows] = await pool.query(
    `
          SELECT COUNT(*) AS sessionCount FROM Sessions
          WHERE tutorID = ?
          `,
    [tutorID]
  );
  return rows[0].sessionCount;
}

// tutor add commands

export async function createTutor(tutorID, name, email, subject) {
  const [result] = await pool.query(
    `
    INSERT INTO Tutors (tutorID, name, email, subject)
    VALUES (?, ?, ?, ?)
    `,
    [tutorID, name, email, subject]
  );
  const tutID = result.insertId;
  return getItem(tutID);
}

export async function deleteTutor(id) {
  const result = await pool.query(
    `DELETE FROM Tutors 
      WHERE tutorID = ?
      `,
    [id]
  );

  return result.affectedRows > 0
    ? "Tutor deleted successfully"
    : "TUtor not found";
}

export async function updateTutorInformation(
  id,
  valueBeingUpdated,
  updatedInformation
) {
  const [result] = await pool.query(
    `
      UPDATE Tutors 
      SET ${valueBeingUpdated} = ?
      WHERE id = ?
    `,
    [updatedInformation, id]
  );
}

// subject get commands

export async function getAllSubjects(subject) {
  const [rows] = await pool.query(
    `SELECT * 
  FROM Tutors 
  WHERE subject = ?
  `,
    [subject]
  );
  return rows;
}

// session get commands

export async function getUserSessions(userID) {
  const [rows] = await pool.query(
    `
        SELECT * FROM Sessions
        WHERE userID = ?
        `,
    [userID]
  );
  return rows;
}

export async function getTutorSessions(tutorID) {
  const [rows] = await pool.query(
    `
        SELECT * FROM Sessions
        WHERE tutorID = ?
        `,
    [tutorID]
  );
  return rows;
}

export async function getSession(sessionID) {
  const [rows] = await pool.query(
    `
      SELECT * FROM Sessions
      WHERE sessionID = ?
      `,
    [sessionID]
  );
  return rows[0];
}

export async function getSessionsByDateRange(startDate, endDate) {
  const [rows] = await pool.query(
    `
          SELECT * FROM Sessions
          WHERE dateTime BETWEEN ? AND ?
          `,
    [startDate, endDate]
  );
  return rows;
}

// session update / delete / add commands

export async function bookSession(userID, tutorID, dateTime) {
  const [result] = await pool.query(
    `
      INSERT INTO Sessions (userID, tutorID, dateTime)
      VALUES (?, ?, ?)
      `,
    [userID, tutorID, dateTime]
  );
  const sessionID = result.insertId;
  return getSession(sessionID);
}

export async function cancelSession(sessionID) {
  const result = await pool.query(
    `
      DELETE FROM Sessions 
      WHERE sessionID = ?
      `,
    [sessionID]
  );
  return result.affectedRows > 0
    ? "Session canceled successfully"
    : "Session not found";
}

// review get commands

export async function getReview(reviewID) {
  const [rows] = await pool.query(
    `
        SELECT * FROM Reviews
        WHERE reviewID = ?
        `,
    [reviewID]
  );
  return rows[0];
}

export async function getReviewsByTutor(tutorID) {
  const [rows] = await pool.query(
    `
        SELECT * FROM Reviews
        WHERE tutorID = ?
        `,
    [tutorID]
  );
  return rows;
}

export async function getReviewsByUser(userID) {
  const [rows] = await pool.query(
    `
        SELECT * FROM Reviews
        WHERE userID = ?
        `,
    [userID]
  );
  return rows;
}

// review update / delete / create commands

export async function createReview(tutorID, userID, rating, comment) {
  const [result] = await pool.query(
    `
        INSERT INTO Reviews (tutorID, userID, rating, comment)
        VALUES (?, ?, ?, ?)
        `,
    [tutorID, userID, rating, comment]
  );
  const reviewID = result.insertId;
  return getReview(reviewID);
}

export async function updateReview(reviewID, rating, comment) {
  await pool.query(
    `
        UPDATE reviews 
        SET rating = ?, comment = ?
        WHERE reviewID = ?
        `,
    [rating, comment, reviewID]
  );
  return getReview(reviewID);
}

export async function deleteReview(reviewID) {
  const result = await pool.query(
    `
        DELETE FROM reviews 
        WHERE reviewID = ?
        `,
    [reviewID]
  );
  return result.affectedRows > 0
    ? "Review deleted successfully"
    : "Review not found";
}
