const Connection = require("../models/connection")
const mongoose = require("mongoose")


module.exports.fetchMutualConnections = async (loggedInUserId, userId) => {
    let compare = [
        new mongoose.Types.ObjectId(loggedInUserId),
        new mongoose.Types.ObjectId(userId)
    ]
    let connections = await Connection.aggregate([
        { $match: { "connections.connectionId": { $all: compare } } },
        { $unwind: "$connections" },
        { $match: { "connections.connectionId": new mongoose.Types.ObjectId(loggedInUserId) } },
        { $group: { 
            _id: "$userId",
            "userId": { $first: "$userId" },
            "connectionType": { $first: "$connections.connectionType" },
            "relationshipType": { $first: "$connections.relationshipType" }
        } },
        { $project: { _id: 0 } }
    ])
    await Connection.populate(connections, { path: 'userId' })
    return connections
}