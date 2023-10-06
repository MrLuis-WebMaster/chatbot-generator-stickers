const express = require('express');

// const ActionsRouter = require('../controllers/bulkmessages.controller');
const whatsappRouter = require('../controllers/whatsapp.controller');
const webhookRouter = require('../controllers/release.controller');
const termRouter = require('../controllers/terms.controller');

const indexRouter = express.Router();

// indexRouter.use('/', ActionsRouter);
indexRouter.use('/', whatsappRouter);
indexRouter.use('/webhook', webhookRouter);
indexRouter.use('/privacy-policy-and-terms-of-use', termRouter);


module.exports = indexRouter