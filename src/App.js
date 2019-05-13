 /* global Plaid */
import envvar from 'envvar';
import plaid from 'plaid';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

// TODO: delete ME
const dummy = [{
    "amount": 2307.21,
    "category": [
      "Shops",
      "Computers and Electronics"
    ],
    "category_id": "19013000",
    "transaction_type": "place"
    }, {
    "amount": 78.5,
    "category": [
      "Food and Drink",
      "Restaurants"
    ],
    "category_id": "13005000",
    "name": "Golden Crepes",
    "transaction_type": "place"
  }, {
    "amount": 78.5,
    "category": [
      "Food and Drink",
      "Restaurants"
    ],
    "category_id": "13005000",
    "name": "Golden Crepes",
    "transaction_type": "place"
 },
 {
  "amount": 78.5,
  "category": [
    "Food and Drink",
    "Restaurants"
  ],
  "category_id": "13005000",
  "name": "Golden Crepes",
  "transaction_type": "place"
},
{
  "amount": 78.5,
  "category": [
    "Food and Drink",
    "Restaurants"
  ],
  "category_id": "17001013",
  "name": "Golden Crepes",
  "transaction_type": "place"
},
];


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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: [],
    };
  }

  // TODO: delete me
  componentDidMount() {
    setTimeout(() => {
      this.setState({ transactions: dummy })
      console.log(this.state)
    }, 2000)
  }

  plaidLink = Plaid.create({
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
        // access_token = 'public-sandbox-f31c1dc5-da73-4cff-95e9-bf3a7f7c13ab'
        const { transactions } = await client.getAllTransactions(access_token);
        console.log(transactions);
        this.setState({ transactions });
      } catch(err) {
        console.log(err);
        this.setState({ transactions: dummy });  // DELETE ME
      }
    },
  });

  render() {
    return (
      <div className="App">
        <header className="App-header">Plovers</header>
        <P5Wrapper sketch={sketch} transactions={this.state.transactions}/>
        <Button variant="primary" onClick={() => this.plaidLink.open()}>
          Connect to Plaid
        </Button>
      </div>
    );
  }
}

export default App;
