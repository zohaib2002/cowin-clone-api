const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Cities = require("./cities");

// Import models
const User = require("./src/models/user");
const Center = require("./src/models/center");
const OTP = require("./src/models/otp");
const Appointment = require("./src/models/appointment");

// Define Application
const app = express();

// Define database connection
const db = mongoose.connect("mongodb+srv://cowin:12345@cowin.o50hc.mongodb.net/CoWIN?retryWrites=true&w=majority");

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
// Request body contains the center details in JSON format
app.post("/center/create", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  } else {
    var center = new Center();

    // Get values from request payload
    // Assign values to center model
    center.centerName = req.body.centerName;
    center.state = req.body.state;
    center.city = req.body.city;
    center.slotsAvailable = req.body.slotsAvailable;

    center.save(function (error, savedCenter) {
      if (error) {
        // send error response
        res.status(500).send({ error: "Unable to create Center" });
      } else {
        // res doesn't end execution (unlike return) so we have to use else block
        // it only responds and closes connection
        // send success response
        res.status(200).send(savedCenter);
      }
    });
  }
});

// Deleting a Center
// USAGE: DELETE http://localhost:8080/center/delete?id=61e3f7e10e27341daf22be3d
app.delete("/center/delete", function (req, res) {
  queryPassed = !(Object.keys(req.query).length === 0);

  if (queryPassed && req.query.id != null) {
    var id = req.query.id;
    Center.deleteOne({ _id: id }, function (err, centerDocs) {
      if (err) {
        res.status(500).send({ error: "Unable to delete center" });
      } else {
        Appointment.deleteMany({ centerId: id }, function (err, aptDocs) {
          if (err) {
            res.status(500).send({ error: "Center deleted, unable to delete appointments" });
          } else {
            res.status(200).send({ msg: "Center deleted, appointments cancelled: " + aptDocs.deletedCount });
            // Inform users thier appointments have been cancelled (through SMS)
            // Can find all appointments, inform, delete appoitments one by one (find and delete)
          }
        });
      }
    });
  } else {
    res.status(400).send({ msg: "Must provide an ID to delete" });
  }
});

// Updating a Center
// USAGE: PATCH http://localhost:8080/center/update?id=61e3f7e10e27341daf22be3d
// The new center should be passed as request body in JSON format
app.patch("/center/update", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  } else {
    var newCenter = {
      centerName: req.body.centerName,
      state: req.body.state,
      city: req.body.city,
      slotsAvailable: req.body.slotsAvailable,
    };

    queryPassed = !(Object.keys(req.query).length === 0);

    if (queryPassed && req.query.id != null) {
      var id = req.query.id;
      Center.updateOne({ _id: id }, newCenter, function (err, docs) {
        if (err) {
          res.status(500).send({ error: "Unable to modify center" });
        } else {
          res.status(200).send(docs);
        }
      });
    } else {
      return res.status(400).send({ msg: "Must provide an ID to modify" });
    }
  }
});

// Get Cities of a state
// {
//   state: "Maharashtra"
// }
app.get("/cities", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  } else {
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
  }
});

// Get a Centers by its ID or City
// USAGE: GET http://localhost:8080/center?id=61e3f7e10e27341daf22be3d
// USAGE: GET http://localhost:8080/center?city=New+Delhi
app.get("/center", function (req, res) {
  IDPassed = req.query.id != null;
  cityPassed = req.query.city != null;

  if (IDPassed) {
    var id = req.query.id;
    Center.findById(id, function (error, center) {
      if (error) {
        res.status(500).send({ error: "Unable to fetch centers" });
      } else {
        if (center != null) {
          res.status(200).send(center);
        } else {
          res.status(400).send({ msg: "No Centers found / Invalid ID" });
        }
      }
    });
  } else if (cityPassed) {
    city = req.query.city;
    Center.find({ city: city }, function (error, centers) {
      if (error) {
        res.status(500).send({ error: "Unable to fetch centers" });
      } else {
        // returns empty list if no centers found
        res.status(200).send(centers);
      }
    });
  } else {
    res.status(400).send({ msg: "Must provide query parameters" });
  }
});

// Generate OTP for validation
// {
//   mobile: "9896532101"
// }
app.post("/user/generateOTP", function (req, res) {
  if (Object.keys(req.body).length === 0 || req.body.mobile === null) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  } else {
    var otp = new OTP();
    otp.mobile = req.body.mobile;

    // OTP generation
    otp.code = Math.floor(Math.random() * 8999) + 1000;

    otp.save(function (error, savedOTP) {
      if (error) {
        // send error response
        res.status(500).send({ error: "Unable to create OTP" });
      } else {
        // send OTP through SMS.
        res.status(200).send(savedOTP);
      }
    });
  }
});

// Validate OTP
// {
//   mobile: "9896532101"
//   code: 9845
// }
app.post("/user/validateOTP", function (req, res) {
  if (Object.keys(req.body).length === 0 || req.body.mobile === null) {
    return res.status(400).send({ msg: "Please provide a body for the request" });
  }

  const mobile = req.body.mobile;
  const code = req.body.code;

  OTP.findOne({ mobile: mobile, code: code }, function (error, otp) {
    if (error) {
      // send error response
      res.status(500).send({ error: "Unable to fetch OTP" });
    } else {
      // If OTP matched
      if (otp != null) {
        // Can use deleteOne {_id: otp._id} but this also works
        otp.delete(function (err, deletedOtp) {
          if (err) {
            res.status(500).send({ error: "Unable to remove OTP" });
          } else {
            // Checks if user already exists
            User.findOne({ mobile: mobile }, function (error, existingUser) {
              if (error) {
                res.status(500).send({ error: "Unable to fetch Users" });
              } else {
                if (existingUser != null) {
                  // If a user is found
                  res.status(200).send(existingUser);
                } else {
                  // If not creates a new blank user
                  var user = new User();

                  user.fullName = "User";
                  user.identityNo = "";
                  user.mobile = mobile;
                  user.appointmentId = "";

                  user.save(function (error, savedUser) {
                    if (error) {
                      res.status(500).send({ error: "Unable to create User" });
                    } else {
                      res.status(200).send(savedUser);
                    }
                  });
                }
              }
            });
          }
        });
      } else {
        res.status(400).send({ msg: "Invalid OTP" });
      }
    }
  });
});

// For new (blank) users (to get thier name an ID no.)
// Must provide registered mobile and fullName, identityNo in JSON body.
app.post("/user/setUser", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ msg: "Please provide a body for the request" });
  } else {
    const mobile = req.body.mobile;
    const fullName = req.body.fullName;
    const identityNo = req.body.identityNo;

    var newUser = {
      fullName: fullName,
      identityNo: identityNo,
      mobile: mobile,
      appointmentId: "",
    };

    User.updateOne({ mobile: mobile }, newUser, function (err, docs) {
      if (err) {
        res.status(500).send({ error: "Unable to modify user" });
      } else {
        if (docs.modifiedCount === 0) {
          res.status(400).send({ msg: "Mobile number not registered" });
        } else {
          res.status(200).send(docs);
        }
      }
    });
  }
});

// Book an appointment slot
// {
//   mobile: "9896532101"
//   centerId: "12358"
//   date: '07/30/2019'
// }
app.post("/appointment/book", function (req, res) {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({ msg: "Please provide a body for the request" });
  }

  const mobile = req.body.mobile;
  const centerId = req.body.centerId;
  const date = req.body.date;
  // Only 2 formats allowed: '07/30/2019' OR "1960-01-01"
  // This is done to ensure all dates have the same time value (00:00)
  // This allows us to exactly equate 2 Date onjects

  if (date.length > 10) {
    return res.status(400).send({ msg: "Invalid Date" });
  }

  var recentlyBooked = function (aId) {
    var booked = true;

    if (aId.length > 0) {
      // The user has booked an appointment
      // Now we check if it was recent (still in DB)
      Appointment.findById(aId, function (err, appointment) {
        if (err) {
          res.status(500).send({ error: "Unable to fetch appointments" });
        } else {
          if (appointment != null) {
            booked = true;
          } else {
            booked = false;
          }
        }
      });
    } else {
      booked = false;
    }

    return booked;
  };

  // Find the user
  User.findOne({ mobile: mobile }, function (err, user) {
    if (err) {
      res.status(500).send({ error: "Unable to fetch users" });
    } else {
      if (user != null) {
        if (user.identityNo.length > 0) {
          // Check if the user has already booked an appointment recently
          if (!recentlyBooked(user.appointmentId)) {
            Center.findById(centerId, function (err, center) {
              if (err) {
                res.status(500).send({ error: "Uanble to fetch centers" });
              } else {
                if (center != null) {
                  // Validate Date
                  const bookDate = new Date(date);
                  const now = new Date();

                  if (bookDate < now) {
                    // Cannot book appointment on the same day
                    res.status(400).send({ msg: "Invalid Date" });
                  } else if ((now - bookDate) / (1000 * 3600 * 24) > 14) {
                    res.status(400).send({ msg: "Invalid Date" });
                  } else {
                    // Count the number of appointments of that center on the given date
                    Appointment.find({ appointmentDate: bookDate, centerId: center._id }, function (err, appointments) {
                      if (err) {
                        res.status(500).send({ error: "Unable to fetch appointments" });
                      } else {
                        // Check if appointments are available on the given date
                        if (appointments.length >= center.slotsAvailable) {
                          res.status(205).send({
                            msg: "No appointment slots available on the selected date",
                          });
                        } else {
                          // Book an appointment
                          var appointment = new Appointment();
                          appointment.appointmentDate = bookDate;
                          appointment.appointmentNo = appointments.length + 1;
                          appointment.fullName = user.fullName;
                          appointment.identityNo = user.identityNo;
                          appointment.mobile = user.mobile;
                          appointment.centerId = center._id;

                          appointment.save(function (err, savedAppointment) {
                            if (err) {
                              res.status(500).send({
                                error: "Unable to create Appointment",
                              });
                            } else {
                              user.appointmentId = savedAppointment._id;
                              user.save();
                              res.status(200).send(savedAppointment);
                            }
                          });
                        }
                      }
                    });
                  }
                } else {
                  res.status(400).send({ msg: "Unable to find Center" });
                }
              }
            });
          } else {
            res.status(205).send({
              msg: "User has already booked an appointment. Try again after 14 days.",
            });
          }
        } else {
          res.status(400).send({ msg: "User not registered" });
        }
      } else {
        res.status(400).send({ msg: "Unregistered mobile number" });
      }
    }
  });
});

// Get a Appointments by its Id or centerId
// USAGE: GET http://localhost:8080/appointment?id=61e3f7e10e27341daf22be3d
// USAGE: GET http://localhost:8080/appointment?centerId=61e3f7e10e27341daf22be3d
app.get("/appointment", function (req, res) {
  IDPassed = req.query.id != null;
  centerPassed = req.query.centerId != null;

  if (IDPassed) {
    var id = req.query.id;
    Appointment.findById(id, function (error, appointment) {
      if (error) {
        res.status(500).send({ error: "Unable to fetch appointments" });
      } else {
        if (appointment != null) {
          res.status(200).send(appointment);
        } else {
          res.status(400).send({ msg: "Appointment not found / Appointment expired" });
        }
      }
    });
  } else if (centerPassed) {
    centerId = req.query.centerId;
    Appointment.find({ centerId: centerId }, function (error, appointments) {
      if (error) {
        res.status(500).send({ error: "Unable to fetch appointments" });
      } else {
        res.status(200).send(appointments);
      }
    });
  } else {
    res.status(400).send({ msg: "Must provide query parameters" });
  }
});

//

app.listen(process.env.PORT || 8080, function () {
  console.log("Server is running");
});

/* Developer Endpoints */
// Uncomment and use

// Wipes all data from the Database
app.delete("/developer/wipe", function (req, res) {
  User.deleteMany({}, function (err, docs) {
    if (err) {
      res.status(500).send({ error: err });
    }
  });

  Center.deleteMany({}, function (err, docs) {
    if (err) {
      res.status(500).send({ error: err });
    }
  });

  OTP.deleteMany({}, function (err, docs) {
    if (err) {
      res.status(500).send({ error: err });
    }
  });

  Appointment.deleteMany({}, function (err, docs) {
    if (err) {
      res.status(500).send({ error: err });
    }
  });

  OTP.collection.dropIndexes();
  Appointment.collection.dropIndexes();

  res.status(200).send({ msg: "Database wiped" });
});
