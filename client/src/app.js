import axios from 'axios';
import React, { useCallback, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ReactP5Wrapper } from 'react-p5-wrapper';

import './app.css';
import sketch from './sketch';

const api = axios.create({ baseURL: 'http://localhost:3000' });
const basePlaidURL = 'http://localhost:8000/flink.html'

const App = () => {
  const [transactions, setTransactions] = useState([])
  const [linkURL, setLinkURL] = useState('');
  const [location] = useState(new URL(window.location));

  const onSuccess = useCallback(publicToken => {
    const getTransactions = async public_token => {
      try {
        await api.post('/get_access_token', { public_token });
        const { data } = await api.get('/transactions');
        const allTransactions = transactions.concat(data.transactions);
        setTransactions(allTransactions);
      } catch (err) {
        console.log(err);
      }
    }
    getTransactions(publicToken);
  });

  const onOauthSuccess = useCallback(oauthStateId => {
    const redirectWithOAuth = async oauthStateId => {
      const token = sessionStorage.getItem('iat');
      const params = new URLSearchParams({
        token,
        useRedirectUri: true,
        oauthStateId,
      });
      const url = `${basePlaidURL}?${params.toString()}`;
      window.location = url;
    }
    redirectWithOAuth(oauthStateId)
  });

  const intializeLink = useCallback(() => {
    const getToken = async () => {
      try {
        const { data } = await api.get('/link_token');
        const params = new URLSearchParams();
        params.set('useRedirectUri', 'true');
        params.set('token', data.token)
        if (!location.searchParams.has('public_token') && !location.searchParams.has('oauth_state_id')) {
          setLinkURL(`${basePlaidURL}?${params.toString()}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
    getToken();
  });


  useEffect(() => {
    const params = location.searchParams;
    const publicToken = params.get('public_token');
    const oauthStateId = params.get('oauth_state_id');

    if (publicToken) {
      onSuccess(publicToken);
    } else if (oauthStateId) {
      onOauthSuccess(oauthStateId);
    } else {
      intializeLink();
    }
  }, []);

  const open = () => {
    window.location = linkURL;
  }

  return (
    <div className="App">
      <header className="App-header">Plovers</header>
      <ReactP5Wrapper sketch={sketch} transactions={transactions} />
      <Button variant="primary" onClick={() => open()} disabled={linkURL === ''}>
        Connect To Plaid To Add Plovers
      </Button>
    </div>
  );
}

export default App;
