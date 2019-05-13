 /* global Plaid */
import axios from 'axios';
import envvar from 'envvar';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const api = axios.create({
  baseURL: 'https://localhost:3000',
});

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

const PLAID_PUBLIC_KEY = envvar.string('REACT_APP_PLAID_PUBLIC_KEY')
const PLAID_ENV = envvar.string('REACT_APP_PLAID_ENV');

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: [],
    };
  }

  plaidLink = Plaid.create({
    apiVersion: 'v2',
    clientName: 'Plovers',
    env: PLAID_ENV,
    product: 'transactions',
    key: PLAID_PUBLIC_KEY,
    onSuccess: async public_token => {
      try {
        await api.post('/get_access_token', { public_token });
        const { transactions } = await api.get('/transactions');
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
