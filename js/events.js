// Upcoming Events page: renders A4-landscape poster PNGs from data/events.json
// (posters live in assets/events/). Click a poster to view it enlarged.

// Falls back to legacy "date"; no end_date means a one-day event.
function startDate(e) {
  return e.start_date || e.date || "";
}

function endDate(e) {
  return e.end_date || startDate(e);
}

function dateLabel(e) {
  const start = startDate(e);
  const end = endDate(e);
  return end && end !== start ? `${start} &ndash; ${end}` : start;
}

function eventCardsHtml(events) {
  return events
    .map(
      (e) => `
      <div class="event-card" data-image="${e.image}" data-title="${e.title || ""}">
        <img class="event-poster" src="${e.image}" alt="${e.title || "Event poster"}" />
        ${e.title || startDate(e) ? `
        <div class="event-meta">
          ${startDate(e) ? `<span class="event-date">${dateLabel(e)}</span>` : ""}
          ${e.title ? `<span class="event-title">${e.title}</span>` : ""}
        </div>` : ""}
      </div>`
    )
    .join("");
}

function renderEvents(events) {
  const grid = document.querySelector("#events-grid");
  const pastSection = document.querySelector("#past-events-section");
  const pastGrid = document.querySelector("#past-events-grid");

  // "YYYY-MM-DD" in local time; an event stays upcoming through its end date
  const today = new Date().toLocaleDateString("en-CA");
  const all = events || [];
  const upcoming = all
    .filter((e) => !endDate(e) || endDate(e) >= today)
    .sort((a, b) => startDate(a).localeCompare(startDate(b)));
  const past = all
    .filter((e) => endDate(e) && endDate(e) < today)
    .sort((a, b) => endDate(b).localeCompare(endDate(a)));

  grid.innerHTML = upcoming.length
    ? eventCardsHtml(upcoming)
    : `<p class="loading-msg">There are no events scheduled yet. Stay tuned for something interesting!</p>`;

  pastGrid.innerHTML = eventCardsHtml(past);
  pastSection.hidden = past.length === 0;

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
