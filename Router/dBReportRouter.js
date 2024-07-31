const express = require("express");
const router = express.Router();

const reportController = require("../Controller/dBReportController");

router.route("/reportFromReportType").post(reportController.fetchReportFromReportType);
router.route("/report").get(reportController.fetchReport);
router.route("/reportType").get(reportController.fetchReportType);
router.route("/reportAndType").get(reportController.fetchReportAll);

module.exports = router;
