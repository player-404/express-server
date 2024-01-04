// eslint-disable-next-line no-unused-vars,import/no-extraneous-dependencies
const nodeMail = require('nodemailer');

const sendMail = async (option) => {
  const transporter = nodeMail.createTransport({
    port: 465,
    host: 'smtp.qcloudmail.com',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: '"zp_notify" <zp@mail.zphl.top>',
    to: option.to,
    subject: option.subject,
    text: option.text,
  });
  return info;
};

module.exports = {
  sendMail,
};
