import { useEffect, useState } from "react";
import axios from 'axios'
import useWebSocket from "react-use-websocket";
import "./App.css";

function App() {
  const [ticker, setTicker] = useState({});
  const [tradingView, setTradingView] = useState({});
  const [config, setConfig] = useState({
    buy: 0,
    sell: 0,
    side: "BUY",
    symbol: "BTCUSDT",
  });

  const [profit, setProfit] = useState({
    value: 0,
    perc: 0,
    lastBuy: 0
  })

  function processData(ticker) {
    const lastPrice = parseFloat(ticker.c);
    if (config.side === "BUY" && config.buy > 0 && lastPrice <= config.buy) {
      buyNow()
      config.side = "SELL";

      setProfit({
        value: profit.value,
        perc: profit.perc,
        lastBuy: lastPrice
      })
    } else if (
      config.side === "SELL" &&
      config.sell > profit.lastBuy &&
      lastPrice >= config.sell
    ) {
      sellNow()
      config.side = "BUY";
      const lastProft = lastPrice - profit.lastBuy
      setProfit({
        value: profit.value + lastProft,
        perc: profit.perc + (lastPrice * 100 / profit.lastBuy - 100),
        lastBuy: 0
      })
    }
  }

  const { lastJsonMessage } = useWebSocket(
    "wss://stream.binance.com:9443/stream?streams=" +
      config.symbol.toLocaleLowerCase() +
      "@ticker",
    {
      onMessage: () => {
        if (lastJsonMessage && lastJsonMessage.data) {
          if (
            lastJsonMessage.stream ===
            config.symbol.toLocaleLowerCase() + "@ticker"
          ) {
            setTicker(lastJsonMessage.data);
            processData(lastJsonMessage.data);
          }
        }
      },
      onError: (event) => {
        alert(event);
      },
    }
  );

  useEffect(() => {
    const tv = new window.TradingView.widget({
      autosize: true,
      symbol: "BINANCE:" + config.symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "br",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      allow_symbol_change: true,
      details: true,
      container_id: "tradingview_c00e7",
    });
    setTradingView(tv);
  }, [config.symbol]);

  function onSymbolChange(event) {
    setConfig((prevState) => ({ ...prevState, symbol: event.target.value }));
  }

  function onValueChange(event) {
    setConfig((prevState) => ({
      ...prevState,
      [event.target.id]: parseFloat(event.target.value),
    }));

    console.log(config.buy)
  }

  function buyNow(){
    axios.post('http://localhost:3001/BUY/' + config.symbol + '/0.01')
    .then(result => {
      console.log(result.data)
    }).catch(err => {
      console.log(err)
    })
  }

  function sellNow(){
    axios.post('http://localhost:3001/SELL/' + config.symbol + '/0.01')
    .then(result => {
      console.log(result.data)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div>
      <h1>Sniper bot </h1>
      <div className="tradingview-widget-container">
        <div id="tradingview_c00e7"></div>
      </div>
      <div className="dashboard">
        <div>
          <b>Snipe :</b>
          <br />
          Symbol:{" "}
          <select
            id="symbol"
            defaultValue={config.symbol}
            onChange={onSymbolChange}
          >
            <option>BTCUSDT</option>
            <option>ETHUSDT</option>
          </select>
          <br />
          Buy at:{" "}
          <input
            type="number"
            id="buy"
            defaultValue={config.buy}
            onChange={onValueChange}
          />
          <br />
          Sell at:{" "}
          <input
            type="number"
            id="sell"
            defaultValue={config.sell}
            onChange={onValueChange}
          />
        </div>
        <div>
          <b>Profit: </b><br/>
          Profit: {profit && profit.value.toFixed(8)}<br/>
          Profit %: { profit && profit.perc.toFixed(2)}
        </div>
        <div>
          <b>Ticker 24h:</b>
          <br />
          Open: {ticker && ticker.o} <br />
          High: {ticker && ticker.h} <br />
          Low: {ticker && ticker.l} <br />
          Last: {ticker && ticker.c} <br />
          Change %: {ticker && ticker.P} <br />
        </div>
      </div>
    </div>
  );
}

export default App;
