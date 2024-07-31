const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");

exports.createReport = async (req, res, next) => {
  try {
    const { tableName, payload } = req.body;

    const keys = Object.keys(payload);
    let columns = keys.join(", ");
    let values = keys.map((key) => `'${payload[key]}'`).join(", ");
    const insertIntoReportDB = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
    await db.query(insertIntoReportDB);
    return res.status(201).json({ status: "success" });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.createReportMultiple = async (req, res, next) => {
  try {
    const { tableName, payload } = req.body;
    const insertMultiple = payload.map(async (item) => {
      const keys = Object.keys(item);
      let columns = keys.join(", ");
      let values = keys.map((key) => `'${item[key]}'`).join(", ");
      const insertIntoReportDB = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
      await db.query(insertIntoReportDB);
    });
    await Promise.all(insertMultiple);
    return res.status(201).json({ status: "success" });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getReportDetails = async (req, res, next) => {
  try {
    if (!req.query.dbName || !req.params.jobId) {
      return res.status(400).json({ status: "error", message: "missing params" });
    }
    const searchQuery = `SELECT * FROM ${req.query.dbName} Where jobID = ?`;
    const [searchResult] = await db.query(searchQuery, [req.params.jobId]);
    return res.status(201).json({ status: "success", data: searchResult });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    if (!req.query.dbName || !req.params.id) {
      return res.status(400).json({ status: "error", message: "missing prams" });
    }
    const deleteQuery = `DELETE FROM ${req.query.dbName} Where id = ?`;
    await db.query(deleteQuery, [req.params.id]);
    return res.status(201).json({ status: "success" });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.editReport = async (req, res, next) => {
  try {
    const { tableName, payload } = req.body;
    const query = `UPDATE ${tableName} set ${getQueryStringFromObject(payload)} WHERE id = ?`;
    await db.query(query, [req.params.id]);
    return res.status(201).json({ status: "success" });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    if (!req.query.dbName) {
      return res.status(400).json({ status: "error", message: "missing params" });
    }
    const selectQuery = `SELECT * FROM ${req.query.dbName} WHERE id = ?`;
    const [insertedRecordData] = await db.query(selectQuery, [req.params.id]);
    return res.status(200).json({ status: "success", data: insertedRecordData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
