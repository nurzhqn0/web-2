// DOM Elements
const generateBtn = document.getElementById("generateBtn");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorAlert = document.getElementById("errorAlert");
const errorMessage = document.getElementById("errorMessage");
const userSection = document.getElementById("userSection");

// User Info Elements
const userPicture = document.getElementById("userPicture");
const userName = document.getElementById("userName");
const userAge = document.getElementById("userAge");
const userGender = document.getElementById("userGender");
const userCity = document.getElementById("userCity");
const userAddress = document.getElementById("userAddress");

// Country Info Elements
const countryLoading = document.getElementById("countryLoading");
const countryInfo = document.getElementById("countryInfo");
const countryError = document.getElementById("countryError");
const countryFlag = document.getElementById("countryFlag");
const countryName = document.getElementById("countryName");
const countryCapital = document.getElementById("countryCapital");
const countryLanguages = document.getElementById("countryLanguages");
const countryCurrency = document.getElementById("countryCurrency");

// Exchange Rate Elements
const exchangeLoading = document.getElementById("exchangeLoading");
const exchangeRates = document.getElementById("exchangeRates");
const exchangeError = document.getElementById("exchangeError");
const baseCurrency = document.getElementById("baseCurrency");
const usdRate = document.getElementById("usdRate");
const kztRate = document.getElementById("kztRate");

// News Elements
const newsLoading = document.getElementById("newsLoading");
const newsContainer = document.getElementById("newsContainer");
const newsError = document.getElementById("newsError");
const newsCountry = document.getElementById("newsCountry");

// Global variable to store current user data
let currentUser = null;

// Event Listeners
generateBtn.addEventListener("click", generateRandomUser);

// Main function to generate random user
async function generateRandomUser() {
  try {
    // Show loading, hide previous content
    showLoading();
    hideError();
    hideUserSection();

    // Fetch random user
    const response = await fetch("/api/random-user");
    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    currentUser = userData;

    // Display user information
    displayUserInfo(userData);

    // Show user section
    showUserSection();

    // Fetch additional data (country, exchange rate, news)
    fetchCountryInfo(userData.country);
    fetchNews(userData.country);

    hideLoading();
  } catch (error) {
    console.error("Error:", error);
    showError("Failed to generate user. Please try again.");
    hideLoading();
  }
}

// Display user information
function displayUserInfo(user) {
  userPicture.src = user.picture;
  userPicture.alt = `${user.firstName} ${user.lastName}`;
  userName.textContent = `${user.firstName} ${user.lastName}`;
  userAge.textContent = user.age;
  userGender.textContent = capitalizeFirst(user.gender);
  userCity.textContent = user.city;
  userAddress.textContent = user.fullAddress;
}

// Fetch country information
async function fetchCountryInfo(country) {
  try {
    // Show loading
    countryLoading.classList.remove("d-none");
    countryInfo.classList.add("d-none");
    countryError.classList.add("d-none");

    const response = await fetch(
      `/api/country-info/${encodeURIComponent(country)}`
    );
    if (!response.ok) throw new Error("Failed to fetch country data");

    const countryData = await response.json();

    // Display country information
    countryName.textContent = countryData.name;
    countryCapital.textContent = countryData.capital;
    countryLanguages.textContent = countryData.languages;
    countryCurrency.textContent = countryData.currency;

    if (countryData.flag && countryFlag) {
      countryFlag.src = countryData.flag;
      countryFlag.alt = `${countryData.name} flag`;
    }

    if (countryData.currencyCode) {
      fetchExchangeRate(countryData.currencyCode);
    } else {
      showExchangeError();
    }

    countryLoading.classList.add("d-none");
    countryInfo.classList.remove("d-none");
  } catch (error) {
    console.error("Country Info Error:", error);
    countryLoading.classList.add("d-none");
    countryError.classList.remove("d-none");
    showExchangeError();
  }
}

// Fetch exchange rate
async function fetchExchangeRate(currencyCode) {
  try {
    // Show loading
    exchangeLoading.classList.remove("d-none");
    exchangeRates.classList.add("d-none");
    exchangeError.classList.add("d-none");

    const response = await fetch(`/api/exchange-rate/${currencyCode}`);
    if (!response.ok) throw new Error("Failed to fetch exchange rate");

    const exchangeData = await response.json();

    // Display exchange rates
    baseCurrency.textContent = exchangeData.baseCurrency;
    usdRate.textContent = formatRate(exchangeData.USD);
    kztRate.textContent = formatRate(exchangeData.KZT);

    // Hide loading, show rates
    exchangeLoading.classList.add("d-none");
    exchangeRates.classList.remove("d-none");
  } catch (error) {
    console.error("Exchange Rate Error:", error);
    showExchangeError();
  }
}

// Show exchange error
function showExchangeError() {
  exchangeLoading.classList.add("d-none");
  exchangeError.classList.remove("d-none");
}

// Fetch news
async function fetchNews(country) {
  try {
    // Show loading
    newsLoading.classList.remove("d-none");
    newsContainer.classList.add("d-none");
    newsError.classList.add("d-none");
    newsContainer.innerHTML = "";

    const response = await fetch(`/api/news/${encodeURIComponent(country)}`);
    if (!response.ok) throw new Error("Failed to fetch news");

    const articles = await response.json();

    // Display news articles
    newsCountry.textContent = country;

    if (articles && articles.length > 0) {
      articles.forEach((article) => {
        const newsCard = createNewsCard(article);
        newsContainer.appendChild(newsCard);
      });

      // Hide loading, show news
      newsLoading.classList.add("d-none");
      newsContainer.classList.remove("d-none");
    } else {
      throw new Error("No articles found");
    }
  } catch (error) {
    console.error("News Error:", error);
    newsLoading.classList.add("d-none");
    newsError.classList.remove("d-none");
  }
}

// Create news card HTML
function createNewsCard(article) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 mb-4";

  col.innerHTML = `
    <div class="card news-card shadow-sm h-100">
      ${
        article.image
          ? `<img src="${article.image}" class="news-image" alt="${article.title}" onerror="this.parentElement.querySelector('.news-placeholder').classList.remove('d-none'); this.classList.add('d-none');">`
          : ""
      }
      <div class="news-placeholder ${article.image ? "d-none" : ""}">
        <i class="bi bi-newspaper"></i>
      </div>
      <div class="news-content">
        <h6 class="news-title">${article.title}</h6>
        <p class="news-description">${article.description}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="news-source">${article.source}</span>
          <a href="${
            article.url
          }" target="_blank" class="btn btn-sm btn-primary btn-news">
            Read More <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  return col;
}

// Utility Functions
function showLoading() {
  loadingSpinner.classList.remove("d-none");
  generateBtn.disabled = true;
}

function hideLoading() {
  loadingSpinner.classList.add("d-none");
  generateBtn.disabled = false;
}

function showError(message) {
  errorMessage.textContent = message;
  errorAlert.classList.remove("d-none");
}

function hideError() {
  errorAlert.classList.add("d-none");
}

function showUserSection() {
  userSection.classList.remove("d-none");
}

function hideUserSection() {
  userSection.classList.add("d-none");
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRate(rate) {
  if (rate === "N/A") return rate;
  return parseFloat(rate).toFixed(4);
}

// Generate user on page load (optional)
// Uncomment the line below if you want to auto-generate a user when page loads
// window.addEventListener('DOMContentLoaded', generateRandomUser);
