const bodyParser = require('body-parser');
const cors = require('cors');
const envvar = require('envvar');
const express = require('express');
const moment = require('moment');
const plaid = require('plaid');

const APP_PORT = envvar.number('APP_PORT', 3000);
const PLAID_CLIENT_ID = envvar.string('PLAID_CLIENT_ID');
const PLAID_SECRET = envvar.string('PLAID_SECRET');
const PLAID_PUBLIC_KEY = envvar.string('PLAID_PUBLIC_KEY');
const PLAID_ENV = envvar.string('PLAID_ENV', 'sandbox');

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  {version: '2018-05-22'}
);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true }));

// Exchange token flow - exchange a Link public_token for
app.post('/get_access_token', async function(request, response, next) {
  console.log('request', request.body.public_token)
  PUBLIC_TOKEN = request.body.public_token;
  try {
    const { access_token, item_id } = await client.exchangePublicToken(PUBLIC_TOKEN);
    ACCESS_TOKEN = access_token;
    ITEM_ID = item_id;
    return response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return response.json({ error });
  }
});

app.get('/transactions', async function(request, response, next) {
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(90, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  try {
    // ACCESS_TOKEN = 'access-sandbox-8518bd00-1f46-4a4f-b019-60a68e02f902'
    const transactionResponse = await client.getTransactions(ACCESS_TOKEN, startDate, endDate, {
      count: 250,
      offset: 0,
    });
    const { transactions } = transactionResponse;
    console.log(transactions);
    return response.json({ error: null, transactions });
  } catch (error) {
    console.log(error);
    return response.json({ error });
  }
});

app.listen(APP_PORT, () => console.log('plover server listening on port ' + APP_PORT));
