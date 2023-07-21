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
invitationCodeSchema.pre(/^find/, function (next) {
  this.populate("createdBy");
  next();
});
module.exports = mongoose.model("InvitationCode", invitationCodeSchema);
