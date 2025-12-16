const express = require("express");
const path = require("path");
const app = express();

const PORT = 3000;

const COUNTRY_LAYER_API = process.env.COUNTRY_LAYER_API;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
