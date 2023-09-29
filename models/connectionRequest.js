const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
      },
      connectionId: {
        type: mongoose.Types.ObjectId,
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
      },
      connectionStatus: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
      }
}, {
    timestamps: true
})

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema)