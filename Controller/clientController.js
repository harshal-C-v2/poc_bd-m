const { sendMail } = require("../Utils/email");
const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");
const moment = require("moment");

exports.createClient = async (req, res, next) => {
  try {
    const { name, email, phone, address, contacts } = req.body;

    //check if user already exists
    const userExistsQuery = `SELECT * FROM clients where email = ?`;
    const [data] = await db.query(userExistsQuery, req.body.email);

    if (data.length) {
      return res.status(400).json({
        status: "fail",
        message: `Client already exists with ${email}`,
      });
    }

    const query = `INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)`;
    const values = [name, email, phone, address];
    const [insertedItem] = await db.query(query, values);
    const selectQuery = `SELECT * FROM clients WHERE id = ?`;
    const [insertedData] = await db.query(selectQuery, [insertedItem.insertId]);

    //create contacts
    insertUpdateContact(contacts, insertedData[0].id);
    return res.status(200).json({
      status: "success",
      message: "Client created successfully",
      data: insertedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM clients ORDER BY createdDate DESC`);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getClients = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`SELECT * FROM clients ORDER BY createdDate DESC LIMIT ?, ${limit};`, [offset]);

    const [total] = await db.query(`SELECT count(*) FROM margrisha.clients;`);

    res.status(200).json({ status: "success", data: rows, total: total[0]["count(*)"] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const selectClientDetailsQuery = `SELECT * FROM clients WHERE id = ?`;
    const [insertedData] = await db.query(selectClientDetailsQuery, [req.params.id]);

    const contactsQuery = `SELECT id, name, email, phone, designation, isPrimary , id as _id  FROM contacts WHERE clientId = ?`;
    const [contactsData] = await db.query(contactsQuery, [req.params.id]);
    return res.status(200).json({ status: "success", data: { ...insertedData[0], contacts: contactsData } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const bodyObject = req.body;
    const id = req.params.id;
    const { contacts } = req.body;
    delete bodyObject.contacts;
    const query = `UPDATE clients set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [updatedData] = await db.query(query, [id]);
    insertUpdateContact(contacts, id);
    res.status(200).json({ status: "success", data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const query = `DELETE FROM clients WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({ status: "success", message: "Client deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const insertUpdateContact = (contacts, insertedId) => {
  contacts.forEach(async (contact) => {
    if (contact.id) {
      delete contact._id;
      //update contacts
      contact.isPrimary = contact.isPrimary ? 1 : 0;
      const query = `UPDATE contacts set ${getQueryStringFromObject(contact)} WHERE id = ?`;
      const [data] = await db.query(query, [contact.id]);
    } else {
      //create contacts
      const query = `INSERT INTO contacts (name, email, phone, designation, isPrimary, clientId) VALUES (?, ?, ?, ?, ?, ?)`;
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
