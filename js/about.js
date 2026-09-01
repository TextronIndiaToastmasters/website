// About page: populates club affiliation details.

function renderAbout(club) {
  if (!club) {
    document.querySelector("#club-number").textContent = "Club details could not be loaded.";
    return;
  }

  document.title = `${club.clubName} | About Us`;

  document.querySelector("#club-number").textContent = club.clubNumber || "-";
  document.querySelector("#club-district").textContent = club.district || "-";
  document.querySelector("#club-division").textContent = club.division || "-";
  document.querySelector("#club-area").textContent = club.area || "-";
}

document.addEventListener("DOMContentLoaded", async () => {
  const club = await fetchData("data/club.json");
  renderAbout(club);
});
