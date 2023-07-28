class BaseCommand {
  constructor(type) {
    this.type = type;
  }
}

class FunkyCommand extends BaseCommand {
  constructor() {
    super("@funky:");
    this.messages = {
      INVALID_COMMAND:
        "You must type in a keyword or search after the colon. 😁",
    };
  }
}
class WizardCommand extends BaseCommand {
  constructor() {
    super("@wizard:");
    this.messages = {
      INVALID_COMMAND:
        "You must type in a keyword or search after the colon. 😁",
    };
  }
}

class CreateCommand extends BaseCommand {
  constructor() {
    super("@funkyTag:");
    this.messages = {
      INVALID_COMMAND:
        "You must type a text for the sticker after the colon. 😁",
    };
  }
}


class AboutCommand extends BaseCommand {
  constructor() {
    super("@about");
    this.messages = {
      INTRODUCTION: `🤖 Welcome, human! I am GiggleBot, your cheerful companion in this digital realm! 🎉\n\nMy creator, Luis Martinez, poured their heart and soul into bringing me to life. Together, we're here to make your day brighter and more enjoyable! 😊\n\nWhether you want to create stickers or explore the depths of my commands, I'm here to assist you with a dash of humor and a touch of whimsy!\n\nSo go ahead, type **@help** to unveil the wonders I have in store for you! Let's giggle and have a blast together! 🎈🤗`,
    };
  }
}

class ContactCommand extends BaseCommand {
  constructor() {
    super("@contact");
    this.messages = {
      CONTACT: `For suggestions, complaints, services or support, please contact the project manager via the following methods:\n\n📧 Email: \n mr.luiswebmaster@gmail.com \n\n 📞 WhatsApp:\n https://wa.link/n29gvv`,
    };
  }
}

class DonateCommand extends BaseCommand {
  constructor() {
    super("@donate");
    this.messages = {
      DONATE: `You can support GiggleBot and other projects by making a donation at the following link: https://www.buymeacoffee.com/LuisMartinez ☕`,
    };
  }
}

class HelpCommand extends BaseCommand {
  constructor() {
    super("@help");
    this.messages = {
      INVALID_COMMAND: `***Command not recognized*** ❗ \n\n If you need help, you can see the list of commands by sending **@help** or send an image, gif, or video to create your sticker. 😊`,
    };
  }

  getMenuMessage() {
    const COMMANDS = generateCommands();
    return `If you want to create a sticker, simply send an image, video, or gif. 📷🎥🎞️\n\nCommand List:\n\n*${COMMANDS.FUNKY.type}* - Create a funky sticker by typing your search or keyword after the colon. 🔍\n*${COMMANDS.CREATE.type}* - Create a funky sticker with just text by typing after the colon. (BETA) 🔍\n*${COMMANDS.WIZARD.type}* - Create stickers with AI by sending a text message, and the AI will generate a fun sticker based on your text! 🤖🎉\n*${COMMANDS.ABOUT.type}* - Explore GiggleBot essence and features. 🔮\n*${COMMANDS.CONTACT.type}* - Get in touch with the project manager. 📞\n*${COMMANDS.DONATE.type}* - Support GiggleBot's and others projects development. 💙\n\nTo view this menu again, type **${this.type}**. \n\nEnjoy your chat with GiggleBot! 😄`;
  }
}

function generateCommands() {
  const COMMANDS = {
    FUNKY: new FunkyCommand(),
    WIZARD: new WizardCommand(),
    CREATE: new CreateCommand(),
    ABOUT: new AboutCommand(),
    CONTACT: new ContactCommand(),
    DONATE: new DonateCommand(),
    HELP: new HelpCommand(),
  };
  return COMMANDS;
}

const COMMANDS = generateCommands();

class InfoMessages {
  ERROR_TYPE_ALLOWED_STICKER =
    "Oops! Sorry, we encountered an error while creating your sticker. Please make sure the file you send is allowed (images or videos). ❌🖼️📹";

  NO_RESULTS_STICKER =
    "No results found to create a sticker. Please try a different search term. 😔❌";
  CREATING_STICKER = "Creating your sticker. Please wait... ⌛😁";

  FINISH_STICKER =
    "Your sticker is ready! Enjoy! 🎉😊 Thank you for using GiggleBot. ✨";

  ERROR_STICKER =
    "Something went wrong. Please try again later. We apologize for the inconvenience. 😔❌";
}

const INFO_MESSAGES = new InfoMessages();

module.exports = {
  COMMANDS,
  INFO_MESSAGES,
};
