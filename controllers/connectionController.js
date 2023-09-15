const Connection = require("../models/connection")
const Follow = require("../models/follow")
const catchAsync = require("../utils/catchAsync")
const { fetchMutualConnections } = require("../utils/mutualConnections")

module.exports.handleFollowing = catchAsync(async (req, res, next) => {
    const { userId } = req.body
    // 1. Check for required data
    if (!userId) {
        return res.status(200).json({
            status: false,
            message: "Please provide user id"
        })
    }
    // 2. Check if the logged in user is following this user
    const isFollowExists = await Follow.findOne({ userId: req.userId, isFollowing: userId })
    // 3. If he's following then unfollow
    if (isFollowExists) {
        await Follow.findByIdAndDelete(isFollowExists._id)
        return res.status(200).json({
            status: true,
            isFollowing: false,
            message: "User is unfollowed successfully"
        })
    } else { // 4. If he's not following then follow
        await Follow.create({ userId: req.userId, isFollowing: userId })
        return res.status(200).json({
            status: true,
            isFollowing: true,
            message: "User is followed successfully"
        })
    }
})

module.exports.sendConnectionRequest = catchAsync(async (req, res, next) => {
    const { userId, relationshipType, connectionType } = req.body
    // 1. Check for valid input data
    if (!userId || !relationshipType || !connectionType) {
        return res.status(200).json({
            status: false,
            message: 'Please provide the required data'
        })
    }
    // 2. Check if connection already exists
    const isConnectionExists = await Connection.findOne({ userId: req.userId, connectionId: userId })
    if (isConnectionExists) {
        return res.status(200).json({
            status: false,
            message: 'Connection already exists'
        })
    }
    // 3. Create Connection request
    await Connection.create({ userId: req.userId, connectionId: userId, relationshipType, connectionType })
    res.status(200).json({
        status: true,
        message: 'Connection request sent successfully'
    })
})

module.exports.withdrawConnection = catchAsync(async (req, res, next) => {
    const { userId } = req.body
    // 1. Check for valid input data
    if (!userId) {
        return res.status(200).json({
            status: false,
            message: 'Please provide the required data'
        })
    }
    // 2. Check if connection doesn't exist
    const isConnectionExists = await Connection.findOne({ userId: req.userId, connectionId: userId })
    if (!isConnectionExists) {
        return res.status(200).json({
            status: false,
            message: 'Connection does not exist'
        })
    }
    // 3. Delete the Connection from DB
    await Connection.findOneAndDelete({ userId: req.userId, connectionId: userId })
    res.status(200).json({
        status: true,
        message: 'Connection removed successfully'
    })
})

module.exports.getMutualConnections = catchAsync(async (req, res, next) => {
    const { userId } = req.body
    // 1. Check for valid input data
    if (!userId) {
        return res.status(200).json({
            status: false,
            message: 'Please provide the required data'
        })
    }
    // 2. Fetch Mutual Connections
    const connections = await fetchMutualConnections(req.userId, userId)
    res.status(200).json({
        status: true,
        message: "Mutual Connections",
        data: connections
    })
})

