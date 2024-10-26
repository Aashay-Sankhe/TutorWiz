CREATE DATABASE wizbase;
USE wizbase;
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
CREATE TABLE Tutors (
    tutorID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) DEFAULT NULL,
    longitude DECIMAL(9, 6) DEFAULT NULL
);
CREATE TABLE Sessions (
    sessionID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    tutorID INT,
    dateTime DATETIME,
    status ENUM('scheduled', 'completed', 'canceled') DEFAULT 'scheduled',
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (tutorID) REFERENCES Tutors(tutorID)
);
CREATE TABLE Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    tutorID INT,
    userID INT,
    rating INT CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutorID) REFERENCES Tutors(tutorID),
    FOREIGN KEY (userID) REFERENCES Users(userID)
);