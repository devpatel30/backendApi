const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user id']
  },
  connectionId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide connection id']
  },
  connectionType: {
    type: Number,
    enum: [1, 2],
    required: [true, 'Please provide connection type']
  },
  relationshipType: {
    type: Number,
    min: [1, 'Invalid value, Please provide values between (1, 5) inclusive'],
    max: [1, 'Invalid value, Please provide values between (1, 5) inclusive'],
    required: [true, 'Please provide relationship type']
  },
  connectionStatus: {
    type: String,
    enum: ["pending", "accepted"],
    default: "pending"
  }
}, {
  timestamps: true
});

const Connection = mongoose.model(
  "Connection",
  connectionSchema
);

module.exports = Connection;
