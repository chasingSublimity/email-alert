'use strict';

const nodemailer = require('nodemailer');
const {logger} = require('./utilities/logger');

// stored in `.env` -- never store passwords, api keys
// etc. inside source code
const {ALERT_FROM_EMAIL, ALERT_FROM_NAME, ALERT_TO_EMAIL, SMTP_URL} = process.env;


const emailData = 
  {
    from: ALERT_FROM_EMAIL,
    to: ALERT_TO_EMAIL,
    subject: "oh shid",
    text: "ERROR ERROR ERROR",
    html: "<p>HTML5</p>"
  };
  
const sendEmail = (emailData, smtpUrl=SMTP_URL) => {
  const transporter = nodemailer.createTransport(SMTP_URL);
  logger.info(`Attempting to send email from ${emailData.from}`);
  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
};


module.exports = {sendEmail};
