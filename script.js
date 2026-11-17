"use strict";
// The product catalog and storage keys are separate data objects for easy maintenance.
const bakeryProducts = [
  { id: "sourdough", label: "Country Sourdough", category: "Bread" },
  { id: "signature", label: "Signature Loaf", category: "Bread" },
  { id: "pastries", label: "Morning Pastries", category: "Pastry" },
  { id: "cakes", label: "Celebration Cakes", category: "Cake" }
];
const storageKeys = { favorites: "northStarBakeryFavoritesV1", customerName: "northStarBakeryCustomerNameV1" };
const inputRules = {
  name: { message: "Please enter your name (at least 2 characters)." },
  email: { message: "Please enter a valid email address." },
  "request-type": { message: "Please choose a request type." },
  items: { message: "Please describe your request (at least 5 characters)." }
};

function readSaved(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved === null ? fallback : JSON.parse(saved); }
  catch (error) { return fallback; }
}
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* Storage may be blocked */ }
}
function initFavorites() {
  const choices = document.getElementById("favorite-options");
  if (!choices) return;
  const saved = readSaved(storageKeys.favorites, []);
  let favorites = Array.isArray(saved) ? saved.filter(id => bakeryProducts.some(product => product.id === id)) : [];
  const result = document.getElementById("favorite-result");
  function renderFavorites() {
    choices.innerHTML = "";
    bakeryProducts.forEach(product => {
      const button = document.createElement("button");
      const selected = favorites.includes(product.id);
      button.type = "button";
      button.className = "favorite-choice";
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = `${selected ? "✓ " : "+ "}${product.label} (${product.category})`;
      button.addEventListener("click", () => toggleFavorite(product.id));
      choices.appendChild(button);
    });
    const selectedNames = bakeryProducts.filter(product => favorites.includes(product.id)).map(product => product.label);
    result.textContent = selectedNames.length ? `Saved favorites (${selectedNames.length}): ${selectedNames.join(", ")}.` : "No favorites saved yet. Select a product above.";
  }
  function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    saveData(storageKeys.favorites, favorites);
    renderFavorites();
  }
  document.getElementById("clear-favorites").addEventListener("click", () => {
    favorites = []; saveData(storageKeys.favorites, favorites); renderFavorites();
  });
  renderFavorites();
}
function validateField(field) {
  const value = field.value.trim();
  let message = "";
  switch (field.id) {
    case "name": if (value.length < 2) message = inputRules.name.message; break;
    case "email": if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = inputRules.email.message; break;
    case "request-type": if (!value) message = inputRules["request-type"].message; break;
    case "items": if (value.length < 5) message = inputRules.items.message; break;
  }
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
  return !message;
}
function initContactForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const fields = ["name", "email", "request-type", "items"].map(id => document.getElementById(id));
  const name = document.getElementById("name");
  const rememberedName = readSaved(storageKeys.customerName, "");
  if (typeof rememberedName === "string") name.value = rememberedName;
  name.addEventListener("input", () => saveData(storageKeys.customerName, name.value));
  fields.forEach(field => field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => validateField(field)));
  form.addEventListener("submit", event => {
    event.preventDefault(); // This educational website has no server endpoint.
    const valid = fields.map(validateField).every(Boolean);
    const result = document.getElementById("form-result");
    result.textContent = valid ? "Your inquiry details look good! This demo does not send requests to the bakery." : "Please correct the highlighted fields before continuing.";
    if (!valid) fields.find(field => field.getAttribute("aria-invalid") === "true").focus();
  });
}
document.addEventListener("DOMContentLoaded", () => { initFavorites(); initContactForm(); });
