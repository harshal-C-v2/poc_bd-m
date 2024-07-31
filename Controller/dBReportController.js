const db = require("../server");

exports.fetchReportFromReportType = async (req, res) => {
  try {
    let str = "";
    const reportTypeArray = req.body.reportType;
    reportTypeArray.forEach((element, index, array) => {
      if (index === 0) {
        str = `JSON_CONTAINS(reportType, '${element}')`;
      } else {
        str = str + `AND JSON_CONTAINS(reportType, '${element}')`;
      }
    });

    const reportQuery = `SELECT * FROM report WHERE ${str} ORDER BY reportName ASC`;

    const [queryResults] = await db.query(reportQuery);
    return res.status(200).json({ status: "successful", data: queryResults });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.fetchReport = async (req, res) => {
  try {
    const reportQuery = `SELECT * FROM report`;
    const [queryResults] = await db.query(reportQuery);
    return res.status(200).json({ status: "successful", data: queryResults });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.fetchReportType = async (req, res) => {
  try {
    const reportQuery = `SELECT * FROM report_type`;
    const [queryResults] = await db.query(reportQuery);
    return res.status(200).json({ status: "successful", data: queryResults });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.fetchReportAll = async (req, res) => {
  try {
    const reportQuery = `SELECT * FROM report`;
    const [queryReportResults] = await db.query(reportQuery);
    const reportTypeQuery = `SELECT * FROM report_type`;
    const [queryReportTypeResults] = await db.query(reportTypeQuery);
    return res
      .status(200)
      .json({ status: "successful", data: { report: queryReportResults, reportType: queryReportTypeResults } });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
