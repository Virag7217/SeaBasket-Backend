const nodemailer = require("nodemailer");

exports.sendMail = async (req, res, next) => {
  let email = req;
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "oma.pfannerstill61@ethereal.email",
      pass: "Wvz5dvp9ycEp5f8e6B",
    },
  });
  let info = await transporter.sendMail({
    from: '"Virag Ranipa" <virag@gmail.com>',
    to: email,
    subject: "You successfully singup to SeaBasket!",
    text: `Welcome to seabasket !!
            Offers !!!!!!`,
  });
  console.log("Message sent: %s", info.messageId);
};

exports.resetPassword = async (req, res, next) => {
  let { id, email, token } = req;
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "oma.pfannerstill61@ethereal.email",
      pass: "Wvz5dvp9ycEp5f8e6B",
    },
  });
  let info = await transporter.sendMail({
    from: '"Virag Ranipa" <virag@gmail.com>',
    to: email,
    subject: "Reset Password Link!",
    html: ` <p> You requeted a password reset</p>
                 <p>Click below to set a new password <p>
                 <a href="http://localhost:3000/reset-password/${token}">Reset Link </a>
          `,
  });
  console.log("Message sent: %s", info.messageId);
};
