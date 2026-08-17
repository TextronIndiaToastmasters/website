// Shared behaviour for all pages: mobile nav toggle, active link, footer year.

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

function initFooterYear() {
  const yearEl = document.querySelector("#footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Fetches a JSON file from the /data folder. Returns null on failure so
// callers can show a friendly message instead of a broken page.
async function fetchData(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Hidden easter egg: wherever this exact name is rendered, make it a link.
const EASTER_EGG_NAME = "Arpan Mondal";
function linkifyName(name) {
  // normalize all whitespace (including non-breaking spaces from pasted text)
  const normalized = typeof name === "string" ? name.replace(/\s+/g, " ").trim() : "";
  if (normalized === EASTER_EGG_NAME) {
    return `<a href="secret.html" class="easter-egg">${name}</a>`;
  }
  return name;
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFooterYear();
});
