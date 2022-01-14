const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Cities = require("./cities");

// Import models
const User = require("./src/models/user");
const Center = require("./src/models/center");
const OTP = require("./src/models/otp");

// Define Application
const app = express();

// Define database connection
const db = mongoose.connect(
  "mongodb+srv://cowin:12345@cowin.o50hc.mongodb.net/CoWIN?retryWrites=true&w=majority"
);

// Use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use CORS
app.use(cors());

app.get("/", function (req, res) {
  // Handle the request for the root route
  res.send({ ping: "pong" });
});

// Create a Center
// USAGE: POST http://localhost:8080/center/create
// Request body contains the post in JSON format
app.post("/center/create", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  }

  var center = new Center();

  // Get values from request payload
  // Assign values to post model
  center.centerID = req.body.centerID;
  center.centerName = req.body.centerName;
  center.state = req.body.state;
  center.city = req.body.city;
  center.slotsAvailable = req.body.slotsAvailable;

  center.save(function (error, savedCenter) {
    if (error) {
      // send error response
      res.status(500).send({ error: "Unable to create Center" });
    } else {
      // send success response
      res.status(200).send(savedCenter);
    }
  });
});

// Deleting a Center
// USAGE: DELETE http://localhost:8080/center/delete?centerID=12321
app.delete("/center/delete", function (req, res) {
  queryPassed = !(Object.keys(req.query).length === 0);

  var centerID = 0;

  if (queryPassed && req.query.centerID != null) {
    centerID = req.query.centerID;
  } else {
    res.status(400).send({ error: "Must provide an ID to delete" });
  }

  // Center.find({ centerID: centerID }, function (error, centers) {
  //   if (error) {
  //     // send error response
  //     res.status(422).send({ error: "Unable to fetch centers " });
  //   } else {
  //     // send success response
  //     if (centers.length > 0) {
  //       centers[0].delete();
  //       res.status(200).send({ msg: "Center deleted successfully" });
  //     } else {
  //       res.status(422).send({ error: "No Center Deleted" });
  //     }
  //   }
  // });

  Center.deleteOne({ centerID: centerID }, function (err, docs) {
    if (err) {
      res.status(400).send({ error: "Unable to delete center" });
    } else {
      res.status(200).send(docs);
    }
  });
});

// Updating a Center
// USAGE: PATCH http://localhost:8080/center/update
// The new center should be passed as request body in JSON format
app.patch("/center/update", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  }

  var newCenter = {
    centerID: req.body.centerID,
    centerName: req.body.centerName,
    state: req.body.state,
    city: req.body.city,
    slotsAvailable: req.body.slotsAvailable,
  };

  queryPassed = !(Object.keys(req.query).length === 0);

  if (queryPassed && req.query.centerID != null) {
    var centerID = req.query.centerID;
  } else {
    res.status(400).send({ error: "Must provide an ID to modify" });
  }

  Center.updateOne({ centerID: centerID }, newCenter, function (err, docs) {
    if (err) {
      res.status(400).send({ error: "Unable to modify center" });
    } else {
      res.status(200).send(docs);
    }
  });
});

// Get Cities of a state
// {
//   state: "Maharashtra"
// }
app.get("/cities", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  }

  const state = req.body.state;
  var i = 0;
  var found = false;

  for (i; i < Cities.DB.length; i++) {
    if (Cities.DB[i].state === state) {
      found = true;
      break;
    }
  }

  if (found) {
    res.status(200).send({ cities: Cities.DB[i].cities });
  } else {
    res.status(404).send({ msg: "Invalid state name" });
  }
});

// Get a Centers by its ID or City
// USAGE: GET http://localhost:8080/center?centerID=123123
// USAGE: GET http://localhost:8080/center?city=New+Delhi
// Returns the list of all posts if no query passed
// USAGE: GET http://localhost:8080/center
app.get("/center", function (req, res) {
  IDPassed = req.query.centerID != null;
  cityPassed = req.query.city != null;

  if (IDPassed) {
    centerID = req.query.centerID;
    Center.findOne({ centerID: centerID }, function (error, center) {
      if (error) {
        // send error response
        res.status(422).send({ error: "Unable to fetch centers" });
      } else {
        // send success response
        if (center != null) {
          res.status(200).send(center);
        } else {
          res.status(400).send({ error: "No Centers found" });
        }
      }
    });
  } else if (cityPassed) {
    city = req.query.city;
    Center.find({ city: city }, function (error, centers) {
      if (error) {
        // send error response
        res.status(422).send({ error: "Unable to fetch centers" });
      } else {
        // send success response
        // returns an empty list if no matchin centers
        res.status(200).send(centers);
      }
    });
  } else {
    res.status(400).send({ error: "Must provide query parameters" });
  }
});

// {
//   mobile: "9896532101"
// }
app.post("/user/generateOTP", function (req, res) {
  if (Object.keys(req.body).length === 0 || req.body.mobile === null) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  }

  var otp = new OTP();
  otp.mobile = req.body.mobile;
  otp.code = Math.floor(Math.random() * 9999) + 1000;

  otp.save(function (error, savedOTP) {
    if (error) {
      // send error response
      res.status(500).send({ error: "Unable to create OTP" });
    } else {
      // send success response
      res.status(200).send(savedOTP);
    }
  });
});

app.post("/user/validateOTP", function (req, res) {
  if (Object.keys(req.body).length === 0 || req.body.mobile === null) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  }

  const mobile = req.body.mobile;
  const code = req.body.code;

  OTP.findOne({ mobile: mobile, code: code }, function (error, otp) {
    if (error) {
      // send error response
      res.status(422).send({ error: error });
    } else {
      // If OTP matched
      if (otp != null) {
        otp.delete();

        // Checks if user already exists
        User.findOne({ mobile: mobile }, function (error, existingUser) {
          if (error) {
            res.status(422).send({ error: "Unable to fetch Users" });
          } else {
            if (existingUser != null) {
              // If a user is fount
              res.status(200).send(existingUser);
            } else {
              // If not creates a new blank user
              var user = new User();

              user.fullName = "";
              user.identityNo = "";
              user.mobile = mobile;
              user.appointment = {};

              user.save(function (error, savedUser) {
                if (error) {
                  // send error response
                  res.status(500).send({ error: "Unable to create User" });
                } else {
                  // send success response
                  res.status(200).send(savedUser);
                }
              });
            }
          }
        });
      } else {
        res.status(400).send({ msg: "Invalid OTP" });
      }
    }
  });
});

// For new (blank) users (to get thier name an ID no.)
app.post("/user/setUser", function (req, res) {});

app.post("/user/book", function (req, res) {});

app.listen(process.env.PORT || 8080, function () {
  console.log("Server is running");
});

// app.use("/login", (req, res) => {
//   res.send({
//     token: "test123",
//   });
// });
