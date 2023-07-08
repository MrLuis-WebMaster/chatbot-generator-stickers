const express = require("express");
const router = express.Router();

const { client } = require('../whatsapp/whatsapp.controller')

router.post("/release", async function (req, res, next) {
  try {
    const { action, release } = req.body
    if (action === 'published') {
        const {name, body} = release;
        const chats = await client.getChats()
        chats.forEach(async ({id}) => {
            await client.sendMessage(id._serialized,`New release ${name} \n\n ${body}`)
        });
    }
    res.status(200).json({message: "success", status: 200})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});


module.exports = router;
