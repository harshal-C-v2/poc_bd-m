const { sendMail } = require("../Utils/email");
const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");
const moment = require("moment");

exports.createVendor = async (req, res, next) => {
  try {
    const { name, email, phone, address, tags, contacts } = req.body;

    //check if user already exists
    const userExistsQuery = `SELECT * FROM vendors where email = ?`;
    const [data] = await db.query(userExistsQuery, req.body.email);

    if (data.length) {
      return res.status(400).json({
        status: "fail",
        message: `Vendor already exists with ${email}`,
      });
    }

    const query = `INSERT INTO vendors (name, email, phone, address, tags) VALUES (?, ?, ?, ?, ?)`;
    const values = [name, email, phone, address, tags];
    const [insertedItem] = await db.query(query, values);
    const selectQuery = `SELECT * FROM vendors WHERE id = ?`;
    const [insertedData] = await db.query(selectQuery, [insertedItem.insertId]);

    if (contacts) insertUpdateContact(contacts, insertedData[0].id);

    res.status(200).json({
      status: "success",
      message: "Vendor created successfully",
      data: insertedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getAllVendors = async (req, res, next) => {
  try {
    const [rows] = await db.query(`select * from vendors`);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`SELECT * FROM vendors ORDER BY createdDate DESC LIMIT ?, ?;`, [
      Number(offset),
      Number(limit),
    ]);

    const [total] = await db.query(`SELECT count(*) as total_records FROM vendors;`);
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

exports.getVendorById = async (req, res, next) => {
  try {
    const selectQuery = `SELECT * FROM vendors WHERE id = ?`;
    const [selectedData] = await db.query(selectQuery, [req.params.id]);
    const selectContactQuery = `SELECT id, name, email, phone, designation, isPrimary, id as _id FROM contacts WHERE vendorId = ?`;
    const [selectedContactData] = await db.query(selectContactQuery, [req.params.id]);
    const data = selectedData[0];
    data.contacts = selectedContactData;
    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const bodyObject = req.body;
    const { contacts } = req.body;
    delete bodyObject.contacts;
    const query = `UPDATE vendors set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [data] = await db.query(query, [req.params.id]);
    const selectQuery = `SELECT * FROM vendors WHERE id = ?`;
    const [updatedData] = await db.query(selectQuery, [req.params.id]);

    if (contacts) insertUpdateContact(contacts, updatedData[0].id);
    res.status(200).json({
      status: "success",
      message: "Vendor updated successfully",
      data: updatedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const query = `DELETE FROM vendors WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Vendor deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const insertUpdateContact = (contacts, insertedId) => {
  contacts.forEach(async (contact) => {
    delete contact._id;
    contact.isPrimary = contact.isPrimary ? 1 : 0;
    if (contact.id) {
      //update contacts
      const query = `UPDATE contacts set ${getQueryStringFromObject(contact)} WHERE id = ?`;
      const [data] = await db.query(query, [contact.id]);
    } else {
      //create contacts
      const query = `INSERT INTO contacts (name, email, phone, designation, isPrimary, vendorId) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [
        contact.name,
        contact.email,
        contact.phone,
        contact.designation,
        contact.isPrimary ? 1 : 0,
        insertedId,
      ];
      await db.query(query, values);
    }
  });
};
