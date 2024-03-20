require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("node:dns");

app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const urlSchema = new mongoose.Schema({
  original: {
    type: String,
    require: true,
  },
  short: {
    type: String,
    require: true,
  },
});
const URL = mongoose.model("URL", urlSchema);
// database
const createAndSaveUrlInfo = (url, done) => {
  const object = new URL(url);
  new URL(url).save((err, data) => {
    if (err) return done(err);
    done(null, data);
  });
};
const findUrlInfoByShortUrl = (url, done) => {
  URL.find({ short: url }, (err, data) => {
    if (err) return done(err);
    done(null, data);
  });
};
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
app.post("/api/shorturl", async function (req, res) {
  const httpRegex = /^(http|https)(:\/\/)/;
  if (!httpRegex.test(req.body.url)) {return res.json({ error: 'invalid url' })}
  createAndSaveUrlInfo(
    { original: req.body.url, short: Math.floor(Math.random() * 100) },
    (err, data) => {
      if (err) res.status(500).send("error");
      res.send({ original_url: data.original, short_url: data.short });
    }
  );
});
app.get("/api/shorturl/:url", (req, res) => {
  findUrlInfoByShortUrl(req.params.url, (err, data) => {
    if (err) res.status(500).send("error");
    res.redirect(data[0].original);
  });
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});