const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/utils");
const multer = require("multer");
const {
  becomeMentor,
  fetchMentees,
  createApplicationForm,
  fetchApplicationForms,
  applyToBeMentorsMentee,
  acceptApplicationRequest,
  rejectApplicationRequest,
  verifyMentor,
  topMatch,
  getPublicMentor,
  getMentorshipProgram,
  editMentorshipProgram,
  extendProgramDuration,
  sendFeedback,
  handleExtensionRequest,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  fetchInstMentorshipProgram,
  createInstProgram,
  updateInstProgram,
  fetchfypInstMentorshipProgram,
} = require("../controllers/mentorshipController");

// get top matches
router.post("/top-matches", isLoggedIn, topMatch);

// Fetch public mentors
router.get("/public-mentors", isLoggedIn, getPublicMentor);

// Apply to become a mentor
router.post("/become-a-mentor", isLoggedIn, becomeMentor);

// Mentor verification from institution
router.post("/verify-mentor", isLoggedIn, verifyMentor);

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

// fetch user's mentors past and current
router.get("/fetch-my-mentors", isLoggedIn);

// create mentorship program
router.post("/get-mentorship-program", isLoggedIn, getMentorshipProgram);

// edit mentorship program
router.patch("/edit-mentorship-program", isLoggedIn, editMentorshipProgram);

// extend program,  mentee requests for extension for program
router.patch("/extend-mentorship-program", isLoggedIn, extendProgramDuration);

// extend program,  mentee requests for extension for program
router.patch("/handle-extension-request", isLoggedIn, handleExtensionRequest);

// feedback form
router.post("/submit-feedback", isLoggedIn, sendFeedback);

// create task
router.post("/program-task", isLoggedIn, createTask);

// update task
router.patch("/program-task", isLoggedIn, updateTask);

// delete task
router.delete("/program-task", isLoggedIn, deleteTask);

// update task status
router.patch("/program-task-status", isLoggedIn, updateTaskStatus);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router
  .route("/institution-mentorship-program")
  // create institution mentorship program
  .post(isLoggedIn, upload.single("coverImage"), createInstProgram)
  // fetch institution mentorship programs
  .get(isLoggedIn, fetchInstMentorshipProgram)
  // update institution mentorship programs
  .patch(isLoggedIn, upload.single("coverImage"), updateInstProgram);

router.route("/institution-mentorship-program-associated-people").post();
// my enrolled programs
router.get(
  "/fetch-fyp-institution-programs",
  isLoggedIn,
  fetchfypInstMentorshipProgram
);
module.exports = router;
