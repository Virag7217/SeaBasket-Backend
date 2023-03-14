const nodemailer = require("nodemailer");

exports.sendMail = async (req, res, next) => {
  let email = req;
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "shane77@ethereal.email",
      pass: "adRZBavbgM4UsMhkaJ",
    },
  });
  let info = await transporter.sendMail({
    from: '"Virag Ranipa" <virag@gmail.com>',
    to: email,
    subject: "Welcome to seabasket",
    text: "You successfully singup!",
  });
  console.log("Message sent: %s", info.messageId);
};
