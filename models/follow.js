const mongoose = require("mongoose")
const { Schema } = mongoose

const followSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user id']
    },
    isFollowing: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide followed user id']
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Follow', followSchema)