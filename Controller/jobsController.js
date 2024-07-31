const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");

exports.getAllJobs = async (req, res, next) => {
  try {
    const [rows] = await db.query(`select * from jobs`);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const {
      jobNo,
      poNo,
      poDate,
      reportDate,
      itemNo,
      itemName,
      clientId,
      tpiaId,
      reportTypeId,
      drawingNo,
      description,
      reportId,
    } = req.body;

    const reportIdString = JSON.stringify(reportId);
    const query = `INSERT INTO jobs (jobNo, poNo, poDate, reportDate, itemNo, itemName, clientId, tpiaId, reportTypeId, reportId, drawingNo, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      jobNo,
      poNo,
      poDate,
      reportDate,
      itemNo,
      itemName,
      clientId,
      tpiaId,
      reportTypeId,
      reportIdString,
      drawingNo,
      description,
    ];
    const [insertedItem] = await db.query(query, values);
    const selectQuery = `SELECT * FROM jobs WHERE id = ?`;
    const [insertedData] = await db.query(selectQuery, [insertedItem.insertId]);

    res.status(200).json({
      status: "success",
      message: "Job created successfully",
      data: insertedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT 
          jobs.id, 
          jobNo, 
          clientId,
          clients.name as clientName, 
          DATE_FORMAT(reportDate, '%Y-%m-%d') AS reportDate, 
          poNo, 
          DATE_FORMAT(poDate, '%Y-%m-%d') AS poDate, 
          itemNo,
          itemName,
          tpiaId,
          reportTypeId,
          reportId,
          drawingNo,
          description
       FROM jobs INNER JOIN clients ON jobs.clientId = clients.id 
       ORDER BY jobs.createdDate DESC LIMIT ?, ?;`,
      [Number(offset), Number(limit)]
    );

    const [total] = await db.query(`SELECT count(*) as total_records FROM jobs;`);
    res.status(200).json({
      status: "success",
      data: rows,
      total: total[0]["total_records"],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const selectQuery = `SELECT jobs.id, 
       jobs.jobNo, 
       jobs.clientId,
       clients.name as clientName, 
       DATE_FORMAT(reportDate, '%Y-%m-%d') AS reportDate,
       jobs.poNo, 
       DATE_FORMAT(poDate, '%Y-%m-%d') AS poDate, 
       jobs.itemNo,
       jobs.itemName,
       tpia.id as tpiaId,
       tpia.name as tpiaName, 
       jobs.reportTypeId,
       jobs.reportId,
       jobs.drawingNo,
       jobs.description
      FROM jobs
      JOIN clients ON jobs.clientId = clients.id 
      JOIN tpia ON jobs.tpiaId = tpia.id 
      WHERE jobs.id = ?`;
    const [selectedData] = await db.query(selectQuery, [req.params.id]);
    const data = selectedData[0];
    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const bodyObject = req.body;
    delete bodyObject.clientName;
    bodyObject.reportId = JSON.stringify(bodyObject.reportId);
    const query = `UPDATE jobs set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [data] = await db.query(query, [req.params.id]);
    const selectQuery = `SELECT * FROM jobs WHERE id = ?`;
    const [updatedData] = await db.query(selectQuery, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      data: updatedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const query = `DELETE FROM jobs WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Job deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
