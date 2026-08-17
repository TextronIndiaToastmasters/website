// Upcoming Events page: renders A4-landscape poster PNGs from data/events.json
// (posters live in assets/events/). Click a poster to view it enlarged.

function renderEvents(events) {
  const grid = document.querySelector("#events-grid");
  if (!events || events.length === 0) {
    grid.innerHTML = `<p class="loading-msg">No upcoming events yet.</p>`;
    return;
  }

  const sorted = [...events].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  grid.innerHTML = sorted
    .map(
      (e) => `
      <div class="event-card" data-image="${e.image}" data-title="${e.title || ""}">
        <img class="event-poster" src="${e.image}" alt="${e.title || "Event poster"}" />
        ${e.title || e.date ? `
        <div class="event-meta">
          ${e.date ? `<span class="event-date">${e.date}</span>` : ""}
          ${e.title ? `<span class="event-title">${e.title}</span>` : ""}
        </div>` : ""}
      </div>`
    )
    .join("");

  document.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", () => {
      const lightbox = document.querySelector("#event-lightbox");
      document.querySelector("#event-lightbox-img").src = card.dataset.image;
      document.querySelector("#event-lightbox-title").textContent = card.dataset.title;
      lightbox.showModal();
    });
  });
}

function initLightbox() {
  const modal = document.querySelector("#event-lightbox");
  modal.querySelector("[data-close-modal]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initLightbox();
  const events = await fetchData("data/events.json");
  renderEvents(events);
});
