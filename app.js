const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

const PORT = 3000;

const COUNTRY_LAYER_API = process.env.COUNTRY_LAYER_API;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

const basePoint = "api";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 1. Random User Generator API
app.get(`/${basePoint}/random-user`, async (req, res) => {
  try {
    const response = await fetch("https://randomuser.me/api/");
    const data = await response.json();
    const user = data.results[0];

    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      picture: user.picture.large,
      age: user.dob.age,
      dateOfBirth: user.dob.date,
      city: user.location.city,
      country: user.location.country,
      fullAddress: `${user.location.street.number} ${user.location.street.name}`,
    };

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// 2. REST Countries API - Extract currency code
app.get(`/${basePoint}/country-info/:countryName`, async (req, res) => {
  try {
    const countryName = req.params.countryName.trim();

    const response = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`
    );

    if (!response.ok) {
      return res.status(404).json({
        error: "Country not found",
        message: `Could not find information for: ${countryName}`,
      });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Country not found" });
    }

    const country = data[0];

    const languages = country.languages
      ? Object.values(country.languages).join(", ")
      : "N/A";

    let currencyCode = null;
    let currencyDisplay = "N/A";

    if (country.currencies) {
      const currenciesArray = Object.entries(country.currencies).map(
        ([code, curr]) => {
          if (!currencyCode) {
            currencyCode = code;
          }
          return `${curr.name} (${code})`;
        }
      );
      currencyDisplay = currenciesArray.join(", ");
    }

    const countryInfo = {
      name: country.name.common || "N/A",
      capital: country.capital ? country.capital[0] : "N/A",
      languages: languages,
      currency: currencyDisplay,
      currencyCode: currencyCode, // ADD THIS - for exchange rate
      flag: country.flags?.svg || country.flags?.png || null,
      region: country.region || "N/A",
      population: country.population || 0,
    };

    res.json(countryInfo);
  } catch (error) {
    console.error("Error fetching country data:", error);
    res.status(500).json({
      error: "Failed to fetch country data",
      details: error.message,
    });
  }
});

// 3. Add Exchange Rate API based on user's currency
app.get(`/${basePoint}/exchange-rate/:currencyCode`, async (req, res) => {
  try {
    const currencyCode = req.params.currencyCode;
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${currencyCode}`
    );
    const data = await response.json();

    if (data.result === "error") {
      return res.status(404).json({ error: "Currency not found" });
    }

    const exchangeRates = {
      baseCurrency: currencyCode,
      USD: data.conversion_rates.USD || "N/A",
      KZT: data.conversion_rates.KZT || "N/A",
    };

    res.json(exchangeRates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});

// 4. Show headlines with News API based on user's country
app.get(`/${basePoint}/news/:country`, async (req, res) => {
  try {
    const country = req.params.country;

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${country}&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "error") {
      return res.status(400).json({ error: data.message });
    }

    const articles = data.articles.map((article) => ({
      title: article.title || "No title available",
      image: article.urlToImage || null,
      description: article.description || "No description available",
      url: article.url || "#",
      source: article.source.name || "Unknown source",
    }));

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// run app
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
