const MailService = require("./mail.service");

const mailService = new MailService();

(async () => {
  await mailService.sendEmailReport();
})();
