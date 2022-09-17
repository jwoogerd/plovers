import axios from 'axios';
import React, { useCallback, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ReactP5Wrapper } from 'react-p5-wrapper';

import { usePlaidLink } from "react-plaid-link";

import './app.css';
import sketch from './sketch';

const api = axios.create({ baseURL: 'http://localhost:3000' });

const App = () => {
  const [transactions, setTransactions] = useState([])
  const [linkConfiguration, setLinkConfiguration] = useState({})

  const onSuccess = useCallback(public_token => {
    const getTransactions = async () => {
      try {
        await api.post('/get_access_token', { public_token });
        const { data } = await api.get('/transactions');
        setTransactions(transactions.concat(data.transactions))
      } catch (err) {
        console.log(err);
      }
    }
    getTransactions();
  });

  useEffect(() => {
    const intializeLink = async () => {
      try {
        const { data } = await api.get('/link_token');
        let isOauth = false;
        const config = {
          token: data.token,
          onSuccess,
        };
        if (window.location.href.includes("?oauth_state_id=")) {
          config.receivedRedirectUri = window.location.href;
          isOauth = true;
        }
        setLinkConfiguration(config)
      } catch (err) {
        console.log(err);
      }
    }
    intializeLink();
  }, [])

  const { open, ready } = usePlaidLink(linkConfiguration);

  return (
    <div className="App">
      <header className="App-header">Plovers</header>
      <ReactP5Wrapper sketch={sketch} transactions={transactions} />
      <Button variant="primary" onClick={() => open()} disabled={!ready}>
        Connect To Plaid To Add Plovers
      </Button>
    </div>
  );
}

export default App;
