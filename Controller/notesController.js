const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");
const moment = require("moment");

exports.getNotesByJobId = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT notes.*, users.id AS user_id, users.firstName, users.lastName, users.profilePicture FROM notes JOIN users ON notes.createdBy = users.id WHERE jobId = ? ORDER BY notes.dateTime DESC`,
      [req.params.id]
    );
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { description, jobId, reportId } = req.body;
    const userAuthDetails = req.user;
    const query = `INSERT INTO notes (description, createdBy, dateTime, jobId, reportId, isEdited) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [description, userAuthDetails[0].id, moment().format("YYYY-MM-DD hh:mm:ss"), jobId, reportId, 0];
    const [insertedItem] = await db.query(query, values);
    const selectQuery = `SELECT * FROM tpia WHERE id = ?`;
    const [insertedData] = await db.query(selectQuery, [insertedItem.insertId]);

    return res.status(200).json({
      status: "success",
      message: "TPIA created successfully",
      data: insertedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const query = `DELETE FROM notes WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({ status: "success", message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateNotes = async (req, res, next) => {
  try {
    const bodyObject = req.body;
    bodyObject.isEdited = 1;
    bodyObject.updatedDate = moment().format("YYYY-MM-DD hh:mm:ss");

    const query = `UPDATE notes set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [updatedData] = await db.query(query, [req.params.id]);
    res.status(200).json({ status: "success", data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
