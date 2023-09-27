const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/utils");
const {
  becomeMentor,
  fetchMentees,
  createApplicationForm,
  fetchApplicationForms,
  applyToBeMentorsMentee,
  acceptApplicationRequest,
  rejectApplicationRequest,
  topMatch,
} = require("../controllers/mentorshipController");

router.post("/top-matches", isLoggedIn, topMatch);

// Apply to become a mentor
router.post("/become-a-mentor", isLoggedIn, becomeMentor);

// Create mentorship application form
router
  .route("/mentorship-application-form")
  .post(isLoggedIn, createApplicationForm)
  .get(isLoggedIn, fetchApplicationForms);

// Apply to be mentor's mentee
router.post("/apply-to-be-mentors-mentee", isLoggedIn, applyToBeMentorsMentee);

// Fetch mentees and applicants
router.get("/fetch-mentees", isLoggedIn, fetchMentees);

// Accept Mentee Request
router.post("/accept-mentee", isLoggedIn, acceptApplicationRequest);

// Reject Mentee Request
router.post("/reject-mentee", isLoggedIn, rejectApplicationRequest);

module.exports = router;
