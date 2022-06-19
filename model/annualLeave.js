const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  month: Number,
  annualLeave: Number,
});

module.exports = mongoose.model("AnnualLeave", annualLeaveSchema);
