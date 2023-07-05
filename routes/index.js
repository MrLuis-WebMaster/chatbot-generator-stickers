const express = require("express");
const router = express.Router();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const ffmpeg = require("fluent-ffmpeg")

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
  ffmpegPath:  process.env.ROUTE_FFMPEG
});

const getStatusClient = async () => await client.getState();

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  let chat = await message.getChat();
  chat.sendSeen();

  if (message.hasMedia) {
    try {
      const media = await message.downloadMedia();
      if (media) {
        const mediaPath = path.join(__dirname, "../public/uploads");

        await client.sendMessage(
          message.from,
          'Creating the sticker for you 😁...'
        );

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath, { recursive: true });
        }

        const extension = mime.extension(media.mimetype);
        const filename = new Date().getTime();

        const fullFilename = path.join(mediaPath, filename + "." + extension); 

        fs.writeFileSync(fullFilename, media.data, { encoding: "base64" });

        console.log("File downloaded successfully!", fullFilename);

        await client.sendMessage(
          message.from,
          new MessageMedia(media.mimetype, media.data, filename),
          {
            sendMediaAsSticker: true,
            stickerAuthor: "Created by bot and made by Luis Martinez",
            stickerName: "Stickers",
          }
        );

        fs.unlinkSync(fullFilename);     
        
        
        await client.sendMessage(
          message.from,
          'Ready the sticker for you 🥳, thanks for using the service.'
        );

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
