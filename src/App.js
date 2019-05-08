 /* global Plaid */
import envvar from 'envvar';
import plaid from 'plaid';
import React from 'react';
import Button from 'react-bootstrap/Button';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const PLAID_CLIENT_ID = envvar.string('REACT_APP_PLAID_CLIENT_ID');
const PLAID_PUBLIC_KEY = envvar.string('REACT_APP_PLAID_PUBLIC_KEY')
const PLAID_SECRET = envvar.string('REACT_APP_PLAID_SECRET');
const PLAID_ENV = envvar.string('REACT_APP_PLAID_ENV');

let PUBLIC_TOKEN;
let ACCESS_TOKENS = [];
const ITEM_IDS = [];

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  { version: '2018-05-22' }
);

const plaidLink = Plaid.create({
  apiVersion: 'v2',
  clientName: 'Plovers',
  env: PLAID_ENV,
  product: 'transactions',
  key: PLAID_PUBLIC_KEY,
  onSuccess: async public_token => {
    PUBLIC_TOKEN = public_token;
    try {
      const { access_token, item_id } = await client.exchangePublicToken(PUBLIC_TOKEN);
      ACCESS_TOKENS.push(access_token);
      ITEM_IDS.push(item_id);
    } catch(err) {
      console.log(err);
    }
  },
});

function App() {
  return (
    <div className="App">
      <header className="App-header">Hello</header>
      {/* <Button variant="primary" onClick={() => plaidLink.open()}>
        Connect to Plaid
      </Button> */}
      <P5Wrapper sketch={sketch} transactions={[{ test: 'hello'}]}/>
    </div>
  );
}

export default App;
