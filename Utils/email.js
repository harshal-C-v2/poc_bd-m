let nodemailer = require("nodemailer");

exports.sendMail = async (sendTo, subject, variablePayload, mailBodyType) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kumarley.tejas7.tk15@gmail.com",
      pass: "ldfsyrkhqstusenl",
    },
  });
  const mailOptions = {
    from: "kumarley.tejas7.tk15@gmail.com",
    to: sendTo,
    subject,
    html:
      mailBodyType == "createUser" ? returnHTMLcreateUser(variablePayload) : returnHTMLresetPassword(variablePayload),
  };
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const returnHTMLcreateUser = (variablePayload) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #333;
            margin-top: 0;
        }

        .content {
            padding: 20px 0;
            text-align: center;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        .button:hover {
            background-color: #0056b3;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome!</h1>
        </div>
        <div class="content">
            <p>User created. Use the following link to set your password:</p>
            <a href="${variablePayload}" class="button">Reset Password</a>
        </div>
        <div class="footer">
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;
};

const returnHTMLresetPassword = (variablePayload) => {
  return `
    <html>
    <head>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #007bff;
                color: #ffffff;
                text-align: center;
                padding: 20px 0;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            .content {
                padding: 30px;
            }
            .otp-box {
                background-color: #007bff;
                color: #ffffff;
                text-align: center;
                font-size: 28px;
                padding: 10px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verification OTP</h1>
            </div>
            <div class="content">
                <p>Dear User,</p>
                <p>Your OTP for verification is:</p>
                <div class="otp-box">${variablePayload}</div>
                <p>Please use this OTP to verify your account.</p>
            </div>
        </div>
    </body>
    </html>
`;
};
