// Committee page: renders officer cards from data/officers.json.

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderOfficers(officers) {
  const grid = document.querySelector("#officers-grid");

  if (!officers || officers.length === 0) {
    grid.innerHTML = `<p class="loading-msg">Committee details could not be loaded.</p>`;
    return;
  }

  grid.innerHTML = officers
    .map((officer) => {
      const photoHtml = officer.photo
        ? `<img class="officer-photo" src="${officer.photo}" alt="${officer.name}" onerror="this.outerHTML='<div class=&quot;officer-photo initials&quot;>${getInitials(officer.name)}</div>'" />`
        : `<div class="officer-photo initials">${getInitials(officer.name)}</div>`;

      return `
        <div class="officer-card">
          ${photoHtml}
          <h3>${linkifyName(officer.name)}</h3>
          <div class="role">${officer.role}</div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const officers = await fetchData("data/officers.json");
  renderOfficers(officers);
});
