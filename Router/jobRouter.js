const express = require("express");
const router = express.Router();
const jobsController = require("../Controller/jobsController");

router.route("/").get(jobsController.getJobs).post(jobsController.createJob);

router.route("/:id").patch(jobsController.updateJob).delete(jobsController.deleteJob).get(jobsController.getJobById);

module.exports = router;
