const { Double, Decimal128 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const covidSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  register: {
    temperature: Decimal128,
    date: String,
    time: String,
  },
  vaccines: {
    vaccine1: { name: String, date: String },
    vaccine2: { name: String, date: String },
  },
  negative: Boolean,
});

module.exports = mongoose.model("Covid", covidSchema);
