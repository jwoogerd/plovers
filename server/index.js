const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const moment = require('moment');

const { Configuration, PlaidApi } = require('plaid');

require('dotenv').config()
const APP_PORT = process.env.APP_PORT || 3000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
const configuration = new Configuration({
  basePath: process.env.PLAID_BASE_PATH,
  baseOptions: {
    headers: {
      'Plaid-Version': '2020-09-14',
    },
  },
});
const client = new PlaidApi(configuration);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.get('/link_token', async function (request, response, next) {
  console.log('/link_token')
  try {
    const { data } = await client.linkTokenCreate({
      client_name: 'Plovers',
      country_codes: ['US'],
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      language: 'en',
      products: ['transactions'],
      user: {
        client_user_id: 'test-user',
      },
    })
    console.log('token', data.link_token);
    return response.json({
      token: data.link_token,
      error: null,
    });
  } catch (error) {
    console.log('error: ', error);
    return response.json({ error });
  }
});

// Exchange token flow - exchange a Link public_token for
app.post('/get_access_token', async function (request, response, next) {
  console.log('/get_access_token')
  PUBLIC_TOKEN = request.body.public_token;
  try {
    const { data } = await client.itemPublicTokenExchange({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      public_token: PUBLIC_TOKEN,
    });
    ACCESS_TOKEN = data.access_token;
    ITEM_ID = data.item_id;
    console.log('access token', data.access_token);
    return response.sendStatus(200);
  } catch (error) {
    console.log('error: ', error);
    return response.json({ error });
  }
});

app.get('/transactions', async function (request, response, next) {
  console.log('/transactions')
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(90, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  try {
    const { data } = await client.transactionsGet({
      client_id: PLAID_CLIENT_ID,
      secret: PLAID_SECRET,
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 250,
        offset: 0,
      },
    });
    const { transactions } = data;
    console.log('transactions', transactions)
    return response.json({ error: null, transactions });
  } catch (error) {
    console.log('error: ', error);
    return response.json({ error });
  }
});

app.listen(APP_PORT, () => console.log('plover server listening on port ' + APP_PORT));
