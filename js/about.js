// About page: populates club history, mission and affiliation details.

function renderAbout(club) {
  if (!club) {
    document.querySelector("#about-history").textContent = "Club details could not be loaded.";
    return;
  }

  document.title = `${club.clubName} | About Us`;
  document.querySelector("#about-history").textContent = club.about?.history || "";
  document.querySelector("#about-mission").textContent = club.about?.mission || "";

  document.querySelector("#club-number").textContent = club.clubNumber || "-";
  document.querySelector("#club-district").textContent = club.district || "-";
  document.querySelector("#club-division").textContent = club.division || "-";
  document.querySelector("#club-area").textContent = club.area || "-";
  document.querySelector("#club-chartered").textContent = club.chartered || "-";
}

document.addEventListener("DOMContentLoaded", async () => {
  const club = await fetchData("data/club.json");
  renderAbout(club);
});
