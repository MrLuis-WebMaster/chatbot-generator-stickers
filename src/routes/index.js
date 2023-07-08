const express = require('express');

const whatsappRouter = require('../whatsapp/whatsapp.controller');
const webhookRouter = require('../webhook/release.controller');
const healthyRouter = require('./healthy');

const indexRouter = express.Router();

indexRouter.use('/', whatsappRouter);
indexRouter.use('/webhook', webhookRouter);
indexRouter.use('/healthy', healthyRouter);


module.exports = indexRouter