 /* global Plaid */
import axios from 'axios';
import envvar from 'envvar';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const api = axios.create({ baseURL: 'http://localhost:3000' });
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
        const { data } = await api.get('/transactions');
        const transactions = this.state.transactions.concat(data.transactions);
        this.setState({ transactions });
      } catch(err) {
        console.log(err);
      }
    },
  });

  render() {
    return (
      <div className="App">
        <header className="App-header">Plovers</header>
        <P5Wrapper sketch={sketch} transactions={this.state.transactions}/>
        <Button variant="primary" onClick={() => this.plaidLink.open()}>
          Connect To Plaid To Add Plovers
        </Button>
      </div>
    );
  }
}

export default App;
