const express = require("express")
const router = express.Router()
const { isLoggedIn } = require("../middleware/utils")
const {
    handleFollowing,
    sendConnectionRequest,
    withdrawConnection,
    getMutualConnections
} = require("../controllers/connectionController")

router.post("/handleFollowing", isLoggedIn, handleFollowing)

router.post("/sendConnection", isLoggedIn, sendConnectionRequest)

router.post("/withdrawConnection", isLoggedIn, withdrawConnection)

router.get("/mutualConnections", isLoggedIn, getMutualConnections)

module.exports = router