const mongoose = require("mongoose");
const { Schema } = mongoose;

const centerSchema = new Schema({
  centerName: String,
  state: String,
  city: String,
  slotsAvailable: Number, //per day
});

module.exports = mongoose.model("Center", centerSchema);
