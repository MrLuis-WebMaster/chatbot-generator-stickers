const express = require("express");
const router = express.Router();

const { client } = require('./whatsapp.controller')

router.get("/users/send/bulk/messages", async function (req, res, next) {
  try {
    res.render("send_message");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});

router.post("/users/send/bulk/messages", async function (req, res, next) {
    try {
      const message = req.body.message;
      console.log("Mensaje a enviar:", message);
      res.redirect('/users/send/bulk/messages')
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", status: 500 });
    }
  });

module.exports = router;
