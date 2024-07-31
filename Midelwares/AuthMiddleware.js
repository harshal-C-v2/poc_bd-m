const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();
const moment = require("moment");
const jwt = require("jsonwebtoken");
const db = require("../server");
const { encrypt } = require("../Utils/authHelper");

exports.returnTempToken = (req, res, next) => {
  const generateToken = crypto.randomBytes(32).toString("hex");
  const encryptedGenerateToken = encrypt(generateToken);
  const tokenExpiresAt = moment().add(24, "hours").format("YYYY-MM-DD hh:mm:ss");
  req.authToken = { encryptedToken: encryptedGenerateToken, decryptedToken: generateToken, tokenExpiresAt };
  return next();
};

exports.hashPassword = async (req, res, next) => {
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 8);
  req.body.password = hashedPassword;
  next();
};

exports.protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorize" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const userId = decoded.id;
    const getUserQuery =
      "SELECT users.id, users.firstName, users.lastName, users.email, users.phone, users.profilePicture, users.status,user_role.role FROM users JOIN user_role ON users.role = user_role.id WHERE users.id = ?";
    const [user] = await db.query(getUserQuery, [userId]);
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
};

exports.rollChecker = (...arg) => {
  return (req, res, next) => {
    if (!arg.includes(req.user[0].role) || req.user.status === "inactive") {
      return res.status(401).json({
        error: "You do not have the correct rights to access this route",
      });
    }
    next();
  };
};
