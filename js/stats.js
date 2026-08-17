// Club Stats page: renders top-5 leaderboards from data/stats.json (generated
// from the club's monthly Excel workbooks via scripts/generate_stats.py), as
// a podium (top 3, with progress rings) + compact rows (4-5), with a
// "Show all" modal per section listing the full data.

const CHART_COLORS = ["#e8873e", "#2f6690", "#3fa796", "#d1495b", "#8a5a44"];
const MEDALS = ["🥇", "🥈", "🥉"];

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function leaderboardHtml(items, { valueKey, valueSuffix = "", subLabel, kicker }) {
  const max = Math.max(...items.map((i) => i[valueKey]), 1);
  const kickerHtml = kicker ? `<div class="podium-kicker">${kicker}</div>` : "";

  const podium = items
    .slice(0, 3)
    .map((item, i) => {
      const percent = Math.round((item[valueKey] / max) * 100);
      const color = CHART_COLORS[i];
      return `
        <div class="podium-card rank-${i + 1}" style="border-color:${color}">
          <div class="ring" style="background:conic-gradient(${color} ${percent}%, var(--cream-soft) ${percent}% 100%)">
            <div class="ring-inner">${MEDALS[i] || initialsOf(item.name)}</div>
          </div>
          ${kickerHtml}
          <div class="podium-name">${linkifyName(item.name)}</div>
          <div class="podium-value">${item[valueKey]}${valueSuffix}${subLabel ? ` &middot; ${subLabel(item)}` : ""}</div>
        </div>`;
    })
    .join("");

  const rest = items
    .slice(3, 5)
    .map(
      (item, i) => `
        <div class="rest-row">
          <div class="rest-rank">#${i + 4}</div>
          ${kicker ? `<div class="rest-kicker">${kicker}</div>` : ""}
          <div class="rest-name">${linkifyName(item.name)}</div>
          <div class="rest-value">${item[valueKey]}${valueSuffix}</div>
        </div>`
    )
    .join("");

  return `<div class="podium">${podium}</div><div class="rest-list">${rest}</div>`;
}

function renderAttendance(rows) {
  const chart = document.querySelector("#attendance-chart");
  const tbody = document.querySelector("#attendance-table tbody");
  if (!rows || rows.length === 0) {
    chart.innerHTML = `<p class="loading-msg">No attendance data yet.</p>`;
    return;
  }

  chart.innerHTML = leaderboardHtml(rows, {
    valueKey: "points",
    valueSuffix: " pts",
    subLabel: (r) => `${r.percentage}%`,
  });

  tbody.innerHTML = rows
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${linkifyName(r.name)}</td>
        <td>${r.meetingsAttended} / ${r.totalMeetings}</td>
        <td>${r.points}</td>
        <td>${r.percentage}%</td>
      </tr>`
    )
    .join("");
}

function renderRoleTakers(rows) {
  const chart = document.querySelector("#role-takers-chart");
  const tbody = document.querySelector("#role-takers-table tbody");
  if (!rows || rows.length === 0) {
    chart.innerHTML = `<p class="loading-msg">No role-taker data yet.</p>`;
    return;
  }

  chart.innerHTML = leaderboardHtml(rows, {
    valueKey: "roleTakerPoints",
    valueSuffix: " pts",
  });

  tbody.innerHTML = rows
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${linkifyName(r.name)}</td>
        <td>${r.roleTakerPoints}</td>
        <td>${r.totalCombinedPoints}</td>
      </tr>`
    )
    .join("");
}

function renderBuddyOlympics(rows) {
  const chart = document.querySelector("#buddy-olympics-chart");
  const tbody = document.querySelector("#buddy-olympics-table tbody");
  if (!rows || rows.length === 0) {
    chart.innerHTML = `<p class="loading-msg">No Buddy Olympics data yet.</p>`;
    return;
  }

  chart.innerHTML = leaderboardHtml(
    rows.map((r) => ({ name: r.team, points: r.points })),
    { valueKey: "points", valueSuffix: " pts", kicker: "Team" }
  );

  tbody.innerHTML = rows
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${linkifyName(r.team)}</td>
        <td>${r.points}</td>
      </tr>`
    )
    .join("");
}

function pcaCardsHtml(meetings) {
  return meetings
    .map((m) => {
      const awardItems = Object.entries(m.awards)
        .map(([category, winner]) => `<li><span class="label">${category}</span>${linkifyName(winner)}</li>`)
        .join("");
      return `
        <div class="pca-card">
          <div class="pca-date">${m.date}</div>
          <ul class="pca-awards">${awardItems}</ul>
        </div>`;
    })
    .join("");
}

function renderPeopleChoice(meetings) {
  const top = document.querySelector("#pca-list");
  const full = document.querySelector("#pca-list-full");
  if (!meetings || meetings.length === 0) {
    top.innerHTML = `<p class="loading-msg">No award data yet.</p>`;
    return;
  }
  top.innerHTML = pcaCardsHtml(meetings.slice(0, 5));
  full.innerHTML = pcaCardsHtml(meetings);
}

function renderMonth(monthData) {
  renderAttendance(monthData.attendance);
  renderRoleTakers(monthData.roleTakers);
  renderBuddyOlympics(monthData.buddyOlympics);
  renderPeopleChoice(monthData.peopleChoiceAwards);
}

function initModals() {
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(`#${btn.dataset.openModal}`)?.showModal();
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.close();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initModals();

  const stats = await fetchData("data/stats.json");
  const select = document.querySelector("#month-select");
  if (!stats || !stats.months || stats.months.length === 0) {
    select.innerHTML = `<option>No data yet</option>`;
    return;
  }

  const monthsDesc = [...stats.months].sort((a, b) => b.key.localeCompare(a.key));
  select.innerHTML = monthsDesc.map((m) => `<option value="${m.key}">${m.label}</option>`).join("");
  select.value = monthsDesc[0].key;
  renderMonth(monthsDesc[0]);

  select.addEventListener("change", () => {
    const monthData = stats.months.find((m) => m.key === select.value);
    if (monthData) renderMonth(monthData);
  });
});
