import axios from 'axios';
import envvar from 'envvar';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const api = axios.create({ baseURL: 'http://localhost:3000' });
const PLAID_ENV = envvar.string('REACT_APP_PLAID_ENV');
const basePlaidURL = 'https://secure-testing.plaid.com/link/8f3bb8/link.html';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [linkURL, setLinkURL] = useState('');
  const [location] = useState(new URL(document.location));
  useEffect(() => {
    const params = location.searchParams;
    const public_token = params.get('public_token');
    debugger

    const onSuccess = async public_token => {
      try {
        await api.post('/get_access_token', { public_token });
        const { data } = await api.get('/transactions');
        const allTransactions = transactions.concat(data.transactions);
        setTransactions(allTransactions);
      } catch (err) {
        console.log(err);
      }
    }
    if (public_token) {
      onSuccess(public_token);
    }
  }, [location]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await api.post('/get_item_add_token');
        const params = new URLSearchParams({
          clientName: 'Plovers',
          env: PLAID_ENV,
          product: 'transactions',
          token: data.add_token,
          isWebview: true,
          isMobile: false,
        });
        setLinkURL(`${basePlaidURL}?${params.toString()}`);
      } catch(err) {
        console.log('error', err);
      }
    }
    fetchToken();
  }, []);

  return (
    <div className="App">
      <header className="App-header">Plovers</header>
      <P5Wrapper sketch={sketch} transactions={transactions}/>
        <Button variant="primary" onClick={() => {window.location = linkURL;}}>
          Connect To Plaid To Add Plovers
      </Button>
    </div>
  );
}

export default App;
