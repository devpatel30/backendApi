const router = require("express").Router()
const { 
    fetchInstitutionAllJobs, 
    fetchInstitutionRecentJobs 
} = require("../controllers/institutionController")

router.post("/jobs", fetchInstitutionAllJobs)
router.post("/jobs/recent", fetchInstitutionRecentJobs)

module.exports = router