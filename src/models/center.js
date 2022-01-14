const mongoose = require("mongoose");
const { Schema } = mongoose;

const centerSchema = new Schema({
  centerID: Number,
  centerName: String,
  state: String,
  city: String,
  slotsAvailable: Number,
});

module.exports = mongoose.model("Center", centerSchema);
