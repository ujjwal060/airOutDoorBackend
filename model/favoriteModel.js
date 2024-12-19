const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Favorite", favoriteSchema);
