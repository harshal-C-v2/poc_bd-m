const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");

exports.getAllTpia = async (req, res, next) => {
  try {
    const [rows] = await db.query(`select * from tpia`);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getTpias = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`SELECT * FROM tpia ORDER BY createdDate DESC LIMIT ?, ${limit};`, [offset]);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createTpia = async (req, res, next) => {
  try {
    const { name, email, phone, address, tags, description } = req.body;

    //check if user already exists
    const userExistsQuery = `SELECT * FROM tpia where email = ?`;
    const [data] = await db.query(userExistsQuery, req.body.email);

    if (data.length) {
      return res.status(400).json({
        status: "fail",
        message: `TPIA already exists with ${email}`,
      });
    }

    const query = `INSERT INTO tpia (name, email, phone, address, tags, description) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [name, email, phone, address, tags, description];
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

exports.getTpiaById = async (req, res, next) => {
  try {
    const selectClientDetailsQuery = `SELECT * FROM tpia WHERE id = ?`;
    const [insertedData] = await db.query(selectClientDetailsQuery, [req.params.id]);

    return res.status(200).json({ status: "success", data: insertedData[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateTpia = async (req, res, next) => {
  try {
    const bodyObject = req.body;

    const query = `UPDATE tpia set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [updatedData] = await db.query(query, [req.body.id]);
    res.status(200).json({ status: "success", data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteTpia = async (req, res, next) => {
  try {
    const query = `DELETE FROM tpia WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({ status: "success", message: "TPIA deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
