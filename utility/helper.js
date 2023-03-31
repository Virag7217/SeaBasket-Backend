const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'zackary.borer95@ethereal.email',
      pass: 'yWKasdeB28gTPkmKvx'
  }
});

exports.signedUpMail = async (req, res, next) => {
  let email = req;
  let testAccount = await nodemailer.createTestAccount();
  let info = await transporter.sendMail({
    from: '"SeaBasket" <seabasket@gmail.com>',
    to: email,
    subject: "You successfully signup to SeaBasket!",
    text: `Welcome to seabasket !!
            Offers !!!!!!`,
  });
  console.log("Message sent: %s", info.messageId);
};

exports.loginVerificationMail = async (req, res, next) => {
  let { email, userName, code } = req;
  let testAccount = await nodemailer.createTestAccount();
  let info = await transporter.sendMail({
    from: '"SeaBasket" <seabasket@gmail.com>',
    to: email,
    subject: "Login Verification!",
    html: ` <p> Hello ${userName}!!</p>
                 <p>Hope you are doing well! <p>
                 <p>${code} is your verification code or OTP for login to seabasket.  </p>
          `,
  });
  console.log("Message sent: %s", info.messageId);
};

exports.resetPasswordMail = async (req, res, next) => {
  let { email, token } = req;
  let testAccount = await nodemailer.createTestAccount();
  let info = await transporter.sendMail({
    from: '"SeaBasket" <seabasket@gmail.com>',
    to: email,
    subject: "Reset Password Link!",
    html: ` <p> You requeted a password reset</p>
                 <p>Click below to set a new password <p>
                 <a href="http://localhost:3000/reset-password/${token}">Reset Link </a>
          `,
  });
  console.log("Message sent: %s", info.messageId);
};