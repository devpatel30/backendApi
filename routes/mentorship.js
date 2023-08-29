const express = require("express");
const router = express.Router();

router.post("/top-matches", (req, res) => {
  res.send("top matches");
});

module.exports = router;
