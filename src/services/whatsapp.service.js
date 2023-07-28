const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { createCanvas } = require('canvas');


const getStickersbyServiceGif = require("./gif.service");
const generateImageFromPrompt = require("./image.service");
const { COMMANDS, INFO_MESSAGES } = require("./messages.service");
const splitTextIntoLines   = require("../utils/nextLine");
const { colors }   = require("../utils/colors");

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

  async createStickerByAI(message, q) {
    try {
      const response = await generateImageFromPrompt(q);

      if (!response.length) {
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

      await this.client.sendMessage(
        message.from,
        await MessageMedia.fromUrl(response),
        {
          sendMediaAsSticker: true,
          stickerAuthor: "Created by bot and made by Luis Martinez",
          stickerName: "Stickers",
        }
      );

      await this.client.sendMessage(message.from, INFO_MESSAGES.FINISH_STICKER);
    } catch (err) {
      await this.client.sendMessage(message.from, INFO_MESSAGES.ERROR_STICKER);
    }
  }

  async createStickerByText(message, options) {
    try {

      await this.client.sendMessage(
        message.from,
        INFO_MESSAGES.CREATING_STICKER
      );


      function createCenteredTextImage(text, width = 1200, height = 1200, bgcolor = colors.black, textcolor = colors.white ) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        
        const fontSize = Math.floor(Math.min(width, height) * 0.1);
        context.font = `${fontSize}px Arial`;


        context.fillStyle = bgcolor || colors[bgcolor]; 

        context.fillRect(0, 0, width, height);
        const lines = splitTextIntoLines(text, width - 25, context);

        context.fillStyle = textcolor || colors[textcolor]; 

        const textHeight = lines.length * fontSize * 1.2;

        const textY = (height - textHeight) / 2 + fontSize + 25;

        lines.forEach((line, index) => {
          const textWidth = context.measureText(line).width;
          const textX = (width - textWidth) / 2 + 25;
          const lineY = textY + index * fontSize * 1.2;
          context.fillText(line, textX, lineY);
        });
        return canvas.toBuffer("image/png");
      }

      let buffer = null

      if (typeof options === 'string') {
        buffer = createCenteredTextImage(options, 1200, 1200);
      } else {
        const {text, bgcolor, textcolor} = options
        buffer = createCenteredTextImage(text, 900, 900, bgcolor, textcolor);
      }

      const mediaPath = path.join(__dirname, "../../public/uploads");
      const extension = 'png';
      const filename = new Date().getTime();
      const fullFilename = path.join(mediaPath, filename + "." + extension);

      fs.writeFileSync(fullFilename, buffer, { encoding: "base64" });

      await this.client.sendMessage(
        message.from,
        MessageMedia.fromFilePath(fullFilename),
        {
          sendMediaAsSticker: true,
          stickerAuthor: "Created by bot and made by Luis Martinez",
          stickerName: "Stickers",
        }
      );

      fs.unlinkSync(fullFilename);

      await this.client.sendMessage(message.from, INFO_MESSAGES.FINISH_STICKER);
    } catch (err) {
      console.log(err)
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
    } else if (messageBody.startsWith(COMMANDS.WIZARD.type)) {
      let messageForWizard = messageBody
        .slice(messageBody.indexOf(":") + 1)
        .trimStart();
      if (messageForWizard) {
        this.createStickerByAI(message, messageForWizard);
      } else {
        message.reply(COMMANDS.WIZARD.messages.INVALID_COMMAND);
      }
    } else if (messageBody.startsWith(COMMANDS.CREATE.type)) {
      let messageForCreate = messageBody
        .slice(messageBody.indexOf(":") + 1)
        .trimStart();
        if (messageForCreate) {
            try {
              const parenthesisStartIndex = messageForCreate.indexOf("(");
              const parenthesisEndIndex = messageForCreate.indexOf(")");
            
              if (parenthesisStartIndex !== -1 && parenthesisEndIndex !== -1 && parenthesisStartIndex < parenthesisEndIndex) {
                const result = messageForCreate.slice(parenthesisStartIndex + 1, parenthesisEndIndex).trim();
                const remainingPart = messageForCreate.slice(0, parenthesisStartIndex).trim();
            
                const values = result.split(",").map(value => value.split(":"));
                const options = {
                  text: remainingPart
                };
            
                values.forEach(([property, val]) => {
                  const propertyTrimmed = property.trim();
                  const valueTrimmed = val.trim();
            
                  if (propertyTrimmed === "bgcolor" && !options.bgcolor) {
                    options.bgcolor = valueTrimmed;
                  } else if (propertyTrimmed === "textcolor" && !options.textcolor) {
                    options.textcolor = valueTrimmed;
                  }
                });
                this.createStickerByText(message, options);
              } else {
                this.createStickerByText(message, messageForCreate);
              }
            } catch (error) {
              await this.client.sendMessage(message.from, INFO_MESSAGES.ERROR_STICKER);
            }
        }
         else {
        message.reply(COMMANDS.CREATE.messages.INVALID_COMMAND);
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
