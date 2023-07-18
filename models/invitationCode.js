const mongoose = require("mongoose");
const { Schema } = mongoose;

const invitationCodeSchema = new Schema({
  invitationCode: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("InvitationCode", invitationCodeSchema);
