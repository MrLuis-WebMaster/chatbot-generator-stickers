const express = require("express");
const router = express.Router();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const mime = require('mime-types');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

const getStatusClient = async () => await client.getState();

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  let chat = await message.getChat();
  chat.sendSeen();
  console.log(message.body);
  console.log(chat);
  if (message.hasMedia) {
    try {
      const media = await message.downloadMedia();
      if (media) {
        const mediaPath = "./uploads";

        await client.sendMessage(
          message.from,
          'Creating the sticker for you 😁...'
        );

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        const extension = mime.extension(media.mimetype);

        const filename = new Date().getTime();

        const fullFilename = mediaPath + filename + "." + extension;

        fs.writeFileSync(fullFilename, media.data, { encoding: "base64" });
        console.log("File downloaded successfully!", fullFilename);
        console.log(fullFilename);

        MessageMedia.fromFilePath((filePath = fullFilename));
        await client.sendMessage(
          message.from,
          new MessageMedia(media.mimetype, media.data, filename),
          {
            sendMediaAsSticker: true,
            stickerAuthor: "Created by bot and made by Luis Martinez",
            stickerName: "Stickers",
          }
        );

        await client.sendMessage(
          message.from,
          'Ready the sticker for you 🥳, thanks for using the service.'
        );

        fs.unlinkSync(fullFilename);
        console.log(`File deleted successfully!`);
      }
    } catch (err) {
      console.log("Failed to save the file:", err);
      console.log(`File deleted successfully!`);
    }
  } else {
    message.reply(`Please send an image to generate the sticker 🤖`);
  }
});

router.get("/", async function (req, res, next) {
  try {
    console.log(await getStatusClient());
    if (await getStatusClient()) {
      res.render("session_active", { title: "Sticker Generator" });
      return;
    }
    res.redirect("/qr");
  } catch (error) {
    next();
  }
});

router.get("/qr", async function (req, res, next) {
  try {
    console.log(await getStatusClient());
    if (await getStatusClient()) {
      res.redirect("/");
      return;
    }
    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      res.render("qr_generator", { title: "Sticker Generator", qr });
    });
  } catch (error) {
    next();
  }
});

async function initializeClient() {
  await client.initialize();
}

initializeClient();

module.exports = router;
