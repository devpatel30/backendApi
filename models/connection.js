const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  headline: {
    type: String,
  },
  description: {
    type: String,
  },
  universityName: {
    type: String,
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  connectionType: {
    type: String,
    enum: ["connection", "network", null],
  },
  mutualConnections: [
    {
      type: Schema.Types.ObjectId,
      ref: "ConnectionResource",
    },
  ],
});

const ConnectionResource = mongoose.model(
  "ConnectionResource",
  connectionSchema
);

module.exports = ConnectionResource;
