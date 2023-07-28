const express = require("express");
const router = express.Router();

const whatsappService = require('../services/whatsapp.service')
const UserService = require('../services/user.service')

const services = new whatsappService()
const userService = new UserService()
const client = services.client


client.on("message", async (message) => {
    await services.dispatchServicesForBot(message)
    await userService.createUser(message)
});

router.get("/", async function (req, res, next) {
  try {
    const clientStatus = await client.getState();
    if (clientStatus) {
      res.render("session_active", { title: "Sticker Generator" });
      return;
    }
    res.render("session_inactive", { title: "Sticker Generator" });
  } catch (error) {
    next();
  }
});

router.get("/qr", async function (req, res, next) {
  try {
    const clientStatus = await client.getState();
    if (clientStatus) {
      res.redirect("/");
    } else {
      const qr = await services.generateQR();
      res.render("whatsapp-qr", { title: "Sticker Generator", qr });
    }
  } catch (error) {
    next(error);
  }
});

client.initialize()

client.on("ready", () => {
    console.log("Client is ready!");
});

module.exports = router;
module.exports.client = client;
