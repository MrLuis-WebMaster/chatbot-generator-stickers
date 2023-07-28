const express = require('express');

// const ActionsRouter = require('../controllers/bulkmessages.controller');
const whatsappRouter = require('../controllers/whatsapp.controller');
const webhookRouter = require('../controllers/release.controller');

const indexRouter = express.Router();

// indexRouter.use('/', ActionsRouter);
indexRouter.use('/', whatsappRouter);
indexRouter.use('/webhook', webhookRouter);


module.exports = indexRouter