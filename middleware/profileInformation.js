const Profile = require("../models/profile");
const { Save, Connection, Follow } = require("../models");
const { fetchMutualConnections } = require("../utils/mutualConnections");

// Function to get connection status
const getConnectionStatus = async (currentUserId, personId) => {
  try {
    const connection = await Connection.findOne({
      userId: currentUserId,
      "connections.connectionId": personId,
    });

    return connection ? connection.connections[0].connectionType : null;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to get following status
const getFollowingStatus = async (currentUserId, personId) => {
  try {
    const follow = await Follow.findOne({
      userId: currentUserId,
      isFollowing: personId,
    });

    return !!follow;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to get saved status
const getSavedStatus = async (currentUserId, personId) => {
  try {
    const save = await Save.findOne({
      userId: currentUserId,
      savedUsers: personId,
    });

    return !!save;
  } catch (error) {
    throw new Error(error.message);
  }
};

// // Function to get mutual connections
// const getMutualConnections = async (currentUserId, personId) => {
//   try {
//     const currentConnections = await Connection.find({ userId: currentUserId });
//     const personConnections = await Connection.find({ userId: personId });

//     const mutualConnections = currentConnections
//       .map((conn) => conn.connections.map((c) => c.connectionId.toString()))
//       .flat()
//       .filter((id) =>
//         personConnections.some((conn) =>
//           conn.connections.some((c) => c.connectionId.toString() === id)
//         )
//       );

//     return mutualConnections;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// Function to get profile information for a user
module.exports.getProfileInformation = async (currentUserId, personId) => {
  try {
    let profile = await Profile.findOne({ user: personId });

    if (!profile) {
      const defaultProfileData = {
        user: personId,
        connectionStatus: "null",
        isFollowing: false,
        isFollowed: false,
        isSaved: false,
        mutualConnections: null,
        mutualConnectionsCount: 0,
      };

      profile = await Profile.create(defaultProfileData);
    }

    const connectionStatus = await getConnectionStatus(currentUserId, personId);
    const isFollowing = await getFollowingStatus(currentUserId, personId);
    const isSaved = await getSavedStatus(currentUserId, personId);
    const mutualConnections = await fetchMutualConnections(
      currentUserId,
      personId
    );

    // Customize this based on your needs
    const extendedProfile = {
      ...profile.toObject(),
      connectionStatus,
      isFollowing,
      isSaved,
      mutualConnections,
    };

    return { status: true, message: "Profile found", profile: extendedProfile };
  } catch (error) {
    console.error(error);
    return { status: false, message: "Error fetching profile", profile: null };
  }
};
