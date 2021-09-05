const axios = require("axios");
const querystring = require("querystring");
const crypto = require("crypto");


const API_KEY =
  "PJ0GfbAS0jlA6mf85wxAFe0kx71XSRPjVZbdOjgpZCo5T0MdgSHswZ8G3v5bkxpr";
const API_SECRET =
  "CgSmhhEtebluVu3PHgmfLcPOOatEuWv0563sl68uYFfQLS7Ri6H0RTMBFB2DQTLQ";

const app = require("express")();

app.use(require("cors")());

app.post("/:side/:symbol/:quantity", (req, res) => {
  const { side, symbol, quantity } = req.params;

  const data = {
    symbol,
    side,
    quantity,
    type: "MARKET",
    timestamp: Date.now(),
    recvWindow: 60000,
  };

  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(querystring.stringify(data))
    .digest("hex");

  const newData = { ...data, signature };
  const url =
    "https://testnet.binance.vision/api/v3/order?" +
    querystring.stringify(newData);

    axios.post(url, null, {headers: {'X-MBX-APIKEY': API_KEY}})
    .then(result => {
        console.log(result.data)
        res.json(result.data)
    }).catch(err => {
        console.error(err.response.data)
        res.sendStatus(500)
    })
});

app.listen(3001, () => {
  console.log("rodando saporra");
});
