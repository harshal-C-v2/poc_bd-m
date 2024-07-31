const crypto = require("crypto");
const { sendMail } = require("../Utils/email");
const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");
const moment = require("moment");
const { generateAuthToken, decrypt, encrypt } = require("../Utils/authHelper");
require("dotenv").config();

exports.createUser = async (req, res, next) => {
  try {
    // will make a user
    const { firstName, lastName, email, role, phone } = req.body;
    const passwordChangedAt = moment().format("YYYY-MM-DD");
    const queryUser = `INSERT INTO users (firstName, lastName, email, role, passwordChangedAt, phone) VALUES (?, ?, ?, ?, ?, ?)`;
    const userValues = [firstName, lastName, email, role, passwordChangedAt, phone];
    const [userInsert] = await db.query(queryUser, userValues);
    const selectQuery = `SELECT users.id, users.firstName, users.lastName, users.email, users.phone, users.profilePicture, users.status, user_role.role FROM users JOIN user_role ON users.role = user_role.id WHERE users.id = ?`;
    const [insertedUserData] = await db.query(selectQuery, [userInsert.insertId]);
    //  make Temp Token
    const queryTempToken = `INSERT INTO user_token (userRef, token, tokenExpiry) VALUES ('${userInsert.insertId}', '${req.authToken.decryptedToken}', '${req.authToken.tokenExpiresAt}')`;
    await db.query(queryTempToken);
    await sendMail(
      email,
      "Created Account",
      `${process.env.SETPASSWORD_URL}?auth=${req.authToken.encryptedToken}`,
      "createUser"
    );

    return res.status(200).json({
      status: "success",
      message: "User created successfully",
      mailStatus: "mail sent successfully",
      data: insertedUserData[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT  users.id, users.firstName, users.lastName, users.email, users.phone, users.profilePicture, users.status, user_role.role,user_role.id as role_id
      FROM users
      JOIN user_role ON users.role = user_role.id
      WHERE users.id != ?
      ORDER BY createdDate DESC
      LIMIT ?, ?;`,
      [req.user[0].id, Number(offset), Number(limit)]
    );

    const [total] = await db.query(`SELECT count(*) as cnt FROM users;`);
    return res.status(200).json({ status: "success", data: rows, total: total[0]["cnt"] });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const selectQuery = `SELECT *, NULL AS passwordChangedAt, NULL AS password FROM users WHERE id = ?`;
    const [insertedUserData] = await db.query(selectQuery, [req.params.id]);
    return res.status(200).json({ status: "success", data: insertedUserData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const bodyObject = req.body;
    const query = `UPDATE users set ${getQueryStringFromObject(bodyObject)} WHERE id = ?`;
    const [updatedUserData] = await db.query(query, [req.params.id]);
    const selectQuery = `SELECT users.id, users.firstName, users.lastName,users.passwordChangedAt, users.email, users.phone, users.profilePicture, users.status, user_role.role
    FROM users
    JOIN user_role ON users.role = user_role.id
    WHERE users.id = ?
    `;
    const [insertedUserData] = await db.query(selectQuery, [req.params.id]);
    return res.status(200).json({ status: "success", data: insertedUserData[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    const authToken = req.query.auth;
    if (!authToken) {
      return res.status(400).json({ status: "error", message: "Auth token is missing or invalid" });
    }
    // Change
    const encryptedTempToken = await decrypt(authToken);
    const query = `SELECT * FROM user_token WHERE token = ? AND tokenExpiry > NOW()`;
    const [getUser] = await db.query(query, [encryptedTempToken]);
    if (!getUser.length) {
      return res.status(400).json({ status: "error", message: "Token has expired" });
    }

    const userId = getUser[0].userRef;
    const bodyObject = req.body;

    const setPasswordQuery = `UPDATE users SET password = ?, status = ? WHERE id = ?`;
    const [updatedData] = await db.query(setPasswordQuery, [bodyObject.password, "active", userId]);
    //
    const token = await generateAuthToken(getUser[0].userRef);
    const deleteQuery = `DELETE FROM user_token WHERE id=?`;
    await db.query(deleteQuery, [getUser[0].id]);
    //
    const getUserQuery = `select * from users where id = ?`;
    const [userData] = await db.query(getUserQuery, [getUser[0].userRef]);

    return res.status(200).json({
      status: "success",
      data: {
        email: userData[0].email,
        firstName: userData[0].firstName,
        lastName: userData[0].lastName,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      data: req.user[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.generateSetPasswordLink = async (req, res) => {
  try {
    const tokenExpiresAt = moment().add(24, "hours").format("YYYY-MM-DD hh:mm:ss");
    const updateQuery = `UPDATE user_token SET tokenExpiry = ? WHERE userRef = ?`;
    await db.query(updateQuery, [tokenExpiresAt, req.params.id]);
    const searchQuery = `Select * FROM user_token WHERE userRef = ?`;
    const [token] = await db.query(searchQuery, [req.params.id]);
    if (!token.length) {
      return res.status(404).json({ status: "error", message: "invalid user user not found" });
    }
    const encryptedToken = await encrypt(token[0].token);
    return res
      .status(201)
      .json({ status: "success", data: { resetLink: `${process.env.SETPASSWORD_URL}?auth=${encryptedToken}` } });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
exports.deactivateUser = async (req, res) => {
  try {
    const updateQuery = `UPDATE users SET status = ? WHERE id = ?`;
    await db.query(updateQuery, ["inactive", req.params.id]);
    return res.status(204).json({ status: "error", message: "user has been deactivated" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
