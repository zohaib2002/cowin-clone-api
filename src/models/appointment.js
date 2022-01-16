const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  appointmentDate: { type: Date },
  appointmentNo: Number,
  /* We are storing user info so that we dont have to query through millions of users */
  fullName: String,
  identityNo: String,
  mobile: String,
  centerId: String,
});

appointmentSchema.index({ appointmentDate: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Appointment", appointmentSchema);
