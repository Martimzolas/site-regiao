const topBtn = document.getElementById("topBtn");
const scrollProgress = document.getElementById("scrollProgress");
const navLinks = document.querySelectorAll(".sticky-nav a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");

const locationInput = document.getElementById("locationInput");
const fetchWeatherButton = document.getElementById("fetchWeather");
const loadDemoButton = document.getElementById("loadDemo");
const apiStatus = document.getElementById("apiStatus");
const weatherOutput = document.getElementById("weatherOutput");

function setRevealDirections() {
  revealItems.forEach((item) => {
    const direction = item.dataset.reveal;
    if (direction === "left") item.classList.add("reveal-left");
    if (direction === "right") item.classList.add("reveal-right");
  });
}

function setupRevealOnScroll() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealItems.forEach((item) => observer.observe(item));
}

function smoothNavLinks() {
  const nav = document.getElementById("mainNav");
  const navHeight = nav ? nav.offsetHeight : 0;

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 2;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

function updateScrollElements() {
  const scrollTop = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0;

  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (topBtn) topBtn.classList.toggle("show", scrollTop > 450);
}

function markActiveSection() {
  let activeId = "";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) activeId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function getIcon(summary) {
  const text = (summary || "").toLowerCase();
  if (text.includes("chuva") || text.includes("rain")) return "🌧️";
  if (text.includes("trovo") || text.includes("storm")) return "⛈️";
  if (text.includes("nuv") || text.includes("cloud")) return "☁️";
  return "☀️";
}

function renderWeather(data) {
  if (!weatherOutput) return;

  weatherOutput.innerHTML = `
    <div class="weather-main">
      <div class="wx-icon">${getIcon(data.summary)}</div>
      <div>
        <p class="wx-place">${data.place}</p>
        <p class="wx-summary">${data.summary}</p>
        <p class="wx-temp">${data.tempC}°</p>
      </div>
    </div>
    <div class="weather-grid">
      <article class="weather-stat"><p class="weather-title">Sensação</p><p>${data.feelsLikeC}°C</p></article>
      <article class="weather-stat"><p class="weather-title">Humidade</p><p>${data.humidity}%</p></article>
      <article class="weather-stat"><p class="weather-title">Vento</p><p>${data.windKph} km/h</p></article>
      <article class="weather-stat"><p class="weather-title">Pressão</p><p>${data.pressureHpa} hPa</p></article>
    </div>
  `;
}

function mapXweather(payload, fallbackLocation) {
  const entry = payload?.response?.[0] || payload?.response || {};
  const period = entry?.periods?.[0] || entry;

  const tempC = period?.tempC ?? Math.round(((period?.tempF ?? 68) - 32) * (5 / 9));

  return {
    place: entry?.place?.name || fallbackLocation,
    summary: period?.weatherPrimary || period?.weather || "Sem descrição",
    tempC,
    feelsLikeC: period?.feelslikeC ?? tempC,
    windKph: period?.windSpeedKPH ?? period?.windKPH ?? "--",
    humidity: period?.humidity ?? "--",
    pressureHpa: period?.pressureMB ?? "--"
  };
}

async function fetchWeather() {
  if (!locationInput || !apiStatus) return;

  const location = locationInput.value.trim() || "Porto,PT";
  apiStatus.textContent = "A pedir dados ao servidor local...";
  apiStatus.style.color = "#0a4d68";

  try {
    const response = await fetch(`/api/weather?place=${encodeURIComponent(location)}`);
    const payload = await response.json();

    if (!response.ok || payload?.error) {
      throw new Error(payload?.error || `HTTP ${response.status}`);
    }

    renderWeather(mapXweather(payload, location));
    apiStatus.textContent = "Dados reais carregados com sucesso.";
    apiStatus.style.color = "#166534";
  } catch (error) {
    apiStatus.textContent = "Falha ao obter dados reais. Verifica o .env e se o servidor está ligado.";
    apiStatus.style.color = "#b42318";
  }
}

function loadDemoWeather() {
  if (!locationInput || !apiStatus) return;

  renderWeather({
    place: locationInput.value.trim() || "Porto,PT",
    summary: "Céu parcialmente limpo",
    tempC: 19,
    feelsLikeC: 18,
    windKph: 17,
    humidity: 68,
    pressureHpa: 1017
  });

  apiStatus.textContent = "Modo demo carregado. Estrutura pronta para API real.";
  apiStatus.style.color = "#0a4d68";
}

if (topBtn) {
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
if (fetchWeatherButton) fetchWeatherButton.addEventListener("click", fetchWeather);
if (loadDemoButton) loadDemoButton.addEventListener("click", loadDemoWeather);
if (locationInput) {
  locationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") fetchWeather();
  });
}

window.addEventListener("scroll", () => {
  updateScrollElements();
  markActiveSection();
});

setRevealDirections();
setupRevealOnScroll();
smoothNavLinks();
updateScrollElements();
markActiveSection();
loadDemoWeather();