const express = require("express");
const router = express.Router();
const reportController = require("../Controller/reportController");
const authMiddleware = require("../Midelwares/AuthMiddleware");

router.use(authMiddleware.protectedRoute);
router.route("/addReport").post(reportController.createReport);
router.route("/editReport/:id").patch(reportController.editReport);
router.route("/addReportMultiple").post(reportController.createReportMultiple);
router.route("/byJobId/:jobId").get(reportController.getReportDetails);
router.route("/deleteReport/:id").delete(reportController.deleteReport);
router.route("/getReport/:id").get(reportController.getReportById);

module.exports = router;
