// eslint-disable-next-line no-unused-vars,import/no-extraneous-dependencies
const nodeMail = require('nodemailer');

exports.sendMail = (option) => {
  const transporter = nodeMail.createTransport({});
};
