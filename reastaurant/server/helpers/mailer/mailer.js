

// //====================================================================





// const nodemailer = require("nodemailer");
// const { EMAIL_USER, EMAIL_PASS } = require("../../config/appConfig");

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT),
//     secure: false,
//     auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASS,
//     },
// });

// async function sendEmailToGmail({ email, subject, html, content }) {
//     try {
//         const mailOptions = {
//             from: EMAIL_USER,
//             to: email,
//             subject,
//             html: html || content,
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log("Email sent:", info.response);
//         return info;
//     } catch (error) {
//         console.error("Email sending error:", error.stack);
//         throw new Error(`Failed to send email: ${error.message}`);
//     }
// }

// module.exports = { sendEmailToGmail };

















const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../../config/appConfig");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // Or true, depending on your SMTP server's requirements
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function sendEmailToGmail({ email, subject, html, content }) {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject,
      html: html || content,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending error:", error.stack);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = { sendEmailToGmail };