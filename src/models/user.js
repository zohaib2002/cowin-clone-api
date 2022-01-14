const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: String, // empty for new user
  identityNo: String,
  mobile: String, // mobile is used as ID
  appointment: {
    refNo: String,
    date: { type: Date, default: Date.now },
    centerID: String,
  },
});

module.exports = mongoose.model("User", userSchema);
