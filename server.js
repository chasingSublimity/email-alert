'use strict';

const express = require('express');
const morgan = require('morgan');
// ask about use of destructuring on imports
const {sendEmail} = require('./emailer');
require('dotenv').config();
const {ALERT_FROM_EMAIL, ALERT_FROM_NAME, ALERT_TO_EMAIL,} = process.env;
const {logger} = require('./utilities/logger');
const {FooError, BarError, BizzError} = require('./errors');
const app = express();

// this route handler randomly throws one of `FooError`,
// `BarError`, or `BizzError`
const russianRoulette = (req, res) => {
  const errors = [FooError, BarError, BizzError];
  throw new errors[
    Math.floor(Math.random() * errors.length)]('It blew up!');
};

app.use(morgan('common', {stream: logger.stream}));

// for any GET request, we'll run our `russianRoulette` function
app.get('*', russianRoulette);

// YOUR MIDDLEWARE FUNCTION should be activated here using
// `app.use()`. It needs to come BEFORE the `app.use` call
// below, which sends a 500 and error message to the client
const handleAlerts = (err, req, res, next) => {
  // logic to fire sendEmail if the error is BarError or FooError
  if (err instanceof BarError || err instanceof FooError) {
    logger.silly(`Sending alert email to ${process.env.ALERT_TO_EMAIL}`);
  // set emailData
    const emailData = {
      from: process.env.ALERT_FROM_EMAIL,
      to: process.env.ALERT_TO_EMAIL,
      subject: `ERROR ERROR ERROR: ${err} ${err.name}`,
      text: `You done screwed up. The following error was thrown: ${err.stack}`
    };
    sendEmail(emailData);
  }
  next();
};

app.use(handleAlerts);

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

const port = process.env.PORT || 8080;

const listener = app.listen(port, function () {
  logger.info(`Your app is listening on port ${port}`);
});
