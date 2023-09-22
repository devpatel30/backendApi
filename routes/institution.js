const router = require("express").Router()
const { 
    fetchInstitutionAllJobs, 
    fetchInstitutionRecentJobs,
    fetchInstitutionMembers,
    fetchInstitutionRecentPeople 
} = require("../controllers/institutionController")

router.post("/jobs", fetchInstitutionAllJobs)
router.post("/jobs/recent", fetchInstitutionRecentJobs)
router.post("/members", fetchInstitutionMembers)
router.post("/members/recent", fetchInstitutionRecentPeople)

module.exports = router