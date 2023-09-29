const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user id']
  },
  connections: [{
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide connection id']
    },
    connectionType: {
      type: String,
      enum: ["connection", "network"],
      required: [true, 'Please provide connection type']
    },
    relationshipType: {
      type: String,
      enum: ["friend", "classmate", "workmate", "through MiNextStep", "other"],
      required: [true, 'Please provide relationship type']
    }
  }]
}, {
  timestamps: true
});

const Connection = mongoose.model(
  "Connection",
  connectionSchema
);

module.exports = Connection;
