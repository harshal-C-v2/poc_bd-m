const moment = require("moment");
const db = require("../server");
const { checkHashedPassword, generateAuthToken } = require("../Utils/authHelper");
const { sendMail } = require("../Utils/email");

const asyncHandler = (fn) => (req, res, next) => {
  try {
    return fn(req, res, next);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ status: "error", message: "Something went wrong!" });
  }
};

exports.signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, phone, status, password } = req.body;
    const passwordChangedAt = moment().format("YYYY-MM-DD");
    const queryUser = `INSERT INTO users (firstName, lastName, email, role, phone, status ,password, passwordChangedAt) VALUES (?, ?, ?, ?, ?, ?, ?,'${passwordChangedAt}')`;
    const userValues = [firstName, lastName, email, role, phone, status, password];
    const [userInsert] = await db.query(queryUser, userValues);

    const token = await generateAuthToken(userInsert.insertId);
    res.status(200).json({ status: "success", token });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Query the user from the database
  const getUserQuery = `SELECT * FROM users WHERE email=?`;
  const [loginQuery] = await db.query(getUserQuery, email);

  // If no user found with the provided email
  if (loginQuery.length === 0) {
    return res.status(401).json({ status: "error", message: "Invalid credentials!" });
  }
  //
  if (loginQuery[0].status == "inactive") {
    return res.status(401).json({ status: "error", message: "Account has been deactivated" });
  }
  // Validate the password
  const credentialValidation = await checkHashedPassword(password, loginQuery[0].password);

  // If password validation fails
  if (!credentialValidation) {
    return res.status(401).json({ status: "error", message: "Invalid credentials!" });
  }

  // Generate authentication token
  const token = await generateAuthToken(loginQuery[0].id);

  // Respond with success and token
  return res.status(200).json({
    status: "success",
    data: {
      // id: loginQuery[0].id,
      email: loginQuery[0].email,
      firstName: loginQuery[0].firstName,
      lastName: loginQuery[0].lastName,
      token,
    },
  });
});

exports.forgetPasswordMail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const getUserQuery = `select * from users where email=?`;
    const [user] = await db.query(getUserQuery, email);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const encryptedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiry = moment().add(10, "minute").format("YYYY-MM-DD hh:mm:ss");
    const queryTempToken = `INSERT INTO user_token (userRef, token, tokenExpiry) VALUES ('${user.insertId}', '${encryptedOTP}', '${otpExpiry}')`;
    await db.query(queryTempToken);
    await sendMail(email, "Reset Password", otp, "resetPassword");
    return res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
exports.forgetPasswordSetPassword = async (req, res, next) => {
  try {
    const otp = req.body.otp;

    if (!otp) {
      return res.status(400).json({
        status: "error",
        message: "otp is missing or invalid",
      });
    }

    const encryptedTempToken = crypto.createHash("sha256").update(otp).digest("hex");

    const query = `SELECT * FROM user_token WHERE token = ? AND tokenExpiry > NOW()`;

    const [getUser] = await db.query(query, [encryptedTempToken]);

    if (!getUser.length) {
      return res.status(400).json({ status: "error", message: "Token has expired" });
    }

    const setPasswordQuery = `UPDATE users SET password = ? WHERE id = ?`;
    if (!req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Password is missing in the request body",
      });
    }
    const [updatedData] = await db.query(setPasswordQuery, [req.body.password, getUser[0].userRef]);
    const deleteQuery = `DELETE FROM user_token WHERE id = ?`;
    await db.query(deleteQuery, [getUser[0].id]);
    const token = await generateAuthToken(getUser[0].userRef);
    return res.status(200).json({ status: "success", data: updatedData, token });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
