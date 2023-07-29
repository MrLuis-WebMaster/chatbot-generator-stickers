const cron = require("node-cron");
const MailService = require("./mail.service");

const mailService = new MailService();

cron.schedule("0 9 * * 1", async () => {
  await mailService.sendEmailReport();
}, {
  scheduled: true,
  timezone: "America/Bogota"
});
