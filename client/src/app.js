import axios from 'axios';
import envvar from 'envvar';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import P5Wrapper from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const api = axios.create({ baseURL: 'http://localhost:3000' });
const PLAID_ENV = envvar.string('REACT_APP_PLAID_ENV');
const basePlaidURL = 'https://secure-testing.plaid.com/link/57642a/link.html';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [linkURL, setLinkURL] = useState('');
  const [location] = useState(new URL(document.location));
  const [show, setShow] = useState(false);

  useEffect(() => {
    const params = location.searchParams;
    const publicToken = params.get('public_token');
    const oauthStateId = params.get('oauth_state_id');

    const onOauthSuccess = async oauthStateId => {
      const token = sessionStorage.getItem('iat');
      const params = new URLSearchParams({
        clientName: 'Plovers',
        env: PLAID_ENV,
        product: 'transactions',
        token,
        isWebview: true,
        isMobile: false,
        oauthStateId,
        oauthNonce: token,
      });
      const url = `${basePlaidURL}?${params.toString()}`;
      window.location = url;
    }

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
    if (publicToken) {
      setShow(true);
      onSuccess(publicToken);
    }
    if (oauthStateId) {
      onOauthSuccess(oauthStateId);
    }
  }, [location]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await api.post('/get_item_add_token');
        sessionStorage.setItem('iat', data.add_token);
        const params = new URLSearchParams({
          clientName: 'Plovers',
          env: PLAID_ENV,
          product: 'transactions',
          token: data.add_token,
          isWebview: true,
          isMobile: false,
        });
        if (!location.searchParams.has('public_token') && !location.searchParams.has('oauth_state_id')) {
          setShow(true);
          setLinkURL(`${basePlaidURL}?${params.toString()}`);
        }
      } catch(err) {
        console.log('error', err);
      }
    }
    fetchToken();
  }, []);

  return (
    <div className="App">
      {show && (
        <>
        <header className="App-header">Plovers</header>
        <P5Wrapper sketch={sketch} transactions={transactions} />
        <div>
          <Button variant="primary" onClick={() => { window.location = linkURL; }}>
            Connect To Plaid To Add Plovers
          </Button>
          <Form.Group controlId="simulateOAuth">
            <Form.Check type="checkbox" label="Simulate OAuth" onClick={event => {
                const url = new URL(linkURL)
                const params = new URLSearchParams(url.search);
              if (event.target.checked) {
                params.append('countryCodes', 'GB')
                setLinkURL(`${basePlaidURL}?${params.toString()}`);
              } else {
                params.delete('countryCodes');
                setLinkURL(`${basePlaidURL}?${params.toString()}`);
              }
            }} />
          </Form.Group>
        </div>
        </>
      )}
    </div>
  );
}

export default App;
