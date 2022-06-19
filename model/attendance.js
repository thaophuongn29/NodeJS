const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  date: { type: String, required: true },
  place: { type: String, required: true },
  checkinTime: { type: String },
  checkoutTime: { type: String },
  state: { type: String, required: true },
  hours: { type: Number },
  month: { type: Number },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
