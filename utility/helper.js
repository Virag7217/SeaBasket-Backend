const nodemailer = require("nodemailer");

exports.sendMail = async (req, res, next) => {
  let email = req;
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "naomi.runte13@ethereal.email",
      pass: "9t4XFsE4cAECZawrQV",
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
