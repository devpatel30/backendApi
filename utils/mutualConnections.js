const Connection = require("../models/connection")
const mongoose = require("mongoose")


module.exports.fetchMutualConnections = async (loggedInUserId, userId) => {
    let compare = [
        new mongoose.Types.ObjectId(loggedInUserId),
        new mongoose.Types.ObjectId(userId)
    ]
    let connections = await Connection.aggregate([
        { $match: { connectionStatus: 'accepted' } },
        { $group: { _id: "$connectionId", users: { $push: "$userId" } } },
        { $match: { users: { $all: compare } } },
        { $project: { connectionId: '$_id' } }
    ])
    await Connection.populate(connections, { path: 'connectionId' })
    return connections.map(x => x['connectionId'])
}