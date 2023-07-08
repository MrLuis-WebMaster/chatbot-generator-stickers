const express = require("express");
const router = express.Router();

const whatsappService = require('./whatsapp.service')

const services = new whatsappService()
const client = services.client

const statusClient = async () => await client.getState();

client.on("message", async (message) => {
    await services.dispatchServicesForBot(message)
});

router.get("/", async function (req, res, next) {
  try {
    const clientStatus = await statusClient();
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
    const clientStatus = await statusClient();
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
