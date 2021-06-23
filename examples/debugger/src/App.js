import './App.css';
import { Waku } from 'js-waku';
import { useEffect, useState } from 'react';
import { Paper } from '@material-ui/core';

console.log = function (message) {
  document.getElementById('console').innerHTML += '<br />' + message;
};

export default function App() {
  const [waku, setWaku] = useState();

  useEffect(() => {
    if (waku) return;
    console.log('Starting Waku');
    Waku.create()
      .then((waku) => {
        console.log('waku: ready');
        setWaku(waku);
      })
      .catch((e) => {
        console.error('Failed to start Waku', e);
      });
  }, [waku]);

  return (
    <div className="App">
      <Paper elevation={3}>
        <h2>Console:</h2>
        <div id="console"></div>
      </Paper>
    </div>
  );
}
