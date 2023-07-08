const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const qrcode = require("qrcode-terminal");
const getStickersbyServiceGif = require("../services/gif");

const { COMMANDS, INFO_MESSAGES } = require("../utils/messages");

const allowedTypes = ["image", "video"];

class whatsappService {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox"],
    },
    ffmpegPath: process.env.ROUTE_FFMPEG,
  });

  generateQR() {
    return new Promise((resolve, reject) => {
      this.client.on("qr", (qr) => {
        qrcode.generate(qr, { small: true });
        resolve(qr);
      });
    });
  }

  async createSticker(message) {
    try {
      const media = await message.downloadMedia();
      const mediaType = media.mimetype;
      if (!allowedTypes.includes(mediaType.slice(0, mediaType.indexOf("/")))) {
        await this.client.sendMessage(message.from, INFO_MESSAGES.ERROR_TYPE_ALLOWED_STICKER);
        return;
      }
      if (media) {
        const mediaPath = path.join(__dirname, "../../public/uploads");

        await this.client.sendMessage(
          message.from,
          INFO_MESSAGES.CREATING_STICKER
        );

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath, { recursive: true });
        }

        const extension = mime.extension(media.mimetype);
        const filename = new Date().getTime();

        const fullFilename = path.join(mediaPath, filename + "." + extension);

        fs.writeFileSync(fullFilename, media.data, { encoding: "base64" });

        console.log("File downloaded successfully!", fullFilename);

        await this.client.sendMessage(
          message.from,
          new MessageMedia(media.mimetype, media.data, filename),
          {
            sendMediaAsSticker: true,
            stickerAuthor: "Created by bot and made by Luis Martinez",
            stickerName: "Stickers",
          }
        );

        fs.unlinkSync(fullFilename);

        await this.client.sendMessage(
          message.from,
          INFO_MESSAGES.FINISH_STICKER
        );
      }
    } catch (err) {
      console.log("Failed to save the file:", err);
      fs.unlinkSync(fullFilename);
      console.log(`File deleted successfully!`);
      await this.client.sendMessage(message.from, INFO_MESSAGES.ERROR_STICKER);
    }
  }

  async createStickerByGif(message, q) {
    try {
      const response = await getStickersbyServiceGif(q);
      const gifs = response.data.results;

      if (!gifs.length) {
        await this.client.sendMessage(
          message.from,
          INFO_MESSAGES.NO_RESULTS_STICKER
        );
        return;
      }

      await this.client.sendMessage(
        message.from,
        INFO_MESSAGES.CREATING_STICKER
      );

      await Promise.all(
        gifs.map(async (gif) => {
          await this.client.sendMessage(
            message.from,
            await MessageMedia.fromUrl(gif.media_formats.mp4.url),
            {
              sendMediaAsSticker: true,
              stickerAuthor: "Created by bot and made by Luis Martinez",
              stickerName: "Stickers",
            }
          );
        })
      );

      await this.client.sendMessage(message.from, INFO_MESSAGES.FINISH_STICKER);
    } catch (err) {
      await this.client.sendMessage(message.from, INFO_MESSAGES.ERROR_STICKER);
    }
  }

  async dispatchServicesForBot(message) {
    let chat = await message.getChat();
    let messageBody = message.body;
    await chat.sendSeen();
    await chat.sendStateTyping();

    if (message.hasMedia) {
      this.createSticker(message);
      return;
    } else if (messageBody.startsWith(COMMANDS.FUNKY.type)) {
      let messageForFunky = messageBody
        .slice(messageBody.indexOf(":") + 1)
        .trimStart();
      if (messageForFunky) {
        this.createStickerByGif(message, messageForFunky);
      } else {
        message.reply(COMMANDS.FUNKY.messages.INVALID_COMMAND);
      }
    } else if (messageBody.trim() === COMMANDS.HELP.type) {
      message.reply(COMMANDS.HELP.getMenuMessage());
    } else if (messageBody.trim() === COMMANDS.ABOUT.type) {
      message.reply(COMMANDS.ABOUT.messages.INTRODUCTION);
    } else if (messageBody.trim() === COMMANDS.CONTACT.type) {
      message.reply(COMMANDS.CONTACT.messages.CONTACT);
    } else if (messageBody.trim() === COMMANDS.DONATE.type) {
      message.reply(COMMANDS.DONATE.messages.DONATE);
    } else {
      message.reply(COMMANDS.HELP.messages.INVALID_COMMAND);
    }
  }
}

module.exports = whatsappService;
