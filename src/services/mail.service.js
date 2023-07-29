const nodemailer = require("nodemailer");
const UserService = require('./user.service')

const userService = new UserService()

class MailService {
  constructor() {
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmailReport() {
    const totalUsers = await userService.totalUsers();
    const subject = 'Weekly Report of GiggleBot';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GiggleBot Weekly Report</title>
        <style>
          /* Estilos CSS en línea para el diseño */
          body {
            font-family: Arial, sans-serif;
          }
          .header {
            background-color: #f7b500; /* Amarillo */
            color: #4a154b; /* Morado */
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            color: #4a154b; /* Morado */
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 GiggleBot 🤖</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>👥 Total Users: ${totalUsers} 👥</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_ADMIN,
      subject: subject,
      html: htmlContent,
    };

    try {
      const info = await this.transport.sendMail(mailOptions);
      console.log("Sent Email:", info.messageId);
    } catch (error) {
      console.error("Failed Email:", error);
    }
  }
}


module.exports = MailService;
