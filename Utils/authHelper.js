const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const crypto = require("crypto");

exports.generateAuthToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_TOKEN);
  return token;
};

exports.checkHashedPassword = async (plainText, hashedText) => {
  try {
    const match = await bcrypt.compare(plainText, hashedText);
    return match;
  } catch (error) {
    console.error("Error checking hashed password:", error);
    return false;
  }
};

exports.encrypt = (token) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.CRYPTOKEY);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (encryptedToken) => {
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", process.env.CRYPTOKEY);
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return error;
  }
};
