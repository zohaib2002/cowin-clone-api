const mongoose = require("mongoose");
const { Schema } = mongoose;

const otpSchema = new Schema({
  mobile: String,
  code: Number,
  expire_at: { type: Date, default: Date.now, expires: 3000 },
});

module.exports = mongoose.model("OTP", otpSchema);
