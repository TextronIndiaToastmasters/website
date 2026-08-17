// Home page: populates club info, meeting details and the countdown timer.

let countdownInterval = null;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Computes the next occurrence of the club's weekly meeting (e.g. next Thursday 3:00 PM).
function getNextMeetingDate(dayOfWeek, startTime) {
  const targetDay = WEEKDAYS.indexOf(dayOfWeek);
  const [hours, minutes] = (startTime || "00:00").split(":").map(Number);
  if (targetDay === -1) return null;

  const now = new Date();
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);

  let diffDays = (targetDay - now.getDay() + 7) % 7;
  if (diffDays === 0 && result <= now) diffDays = 7;
  result.setDate(now.getDate() + diffDays);

  return result;
}

// True while "now" falls inside today's meeting window (e.g. Thursday 3:00-4:30 PM).
function isMeetingHappeningNow(now, dayOfWeek, startTime, endTime) {
  if (!endTime || WEEKDAYS[now.getDay()] !== dayOfWeek) return false;

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  return now >= start && now <= end;
}

function renderCountdown(dayOfWeek, startTime, endTime) {
  const el = document.querySelector("#countdown");
  const label = document.querySelector("#countdown-label");
  if (!el) return;

  if (!dayOfWeek) {
    el.innerHTML = `<p class="loading-msg">Next meeting date coming soon.</p>`;
    return;
  }

  function tick() {
    const now = new Date();

    if (isMeetingHappeningNow(now, dayOfWeek, startTime, endTime)) {
      if (label) label.textContent = "";
      el.innerHTML = `<div class="happening-now">🎤 Happening Now!</div>`;
      return;
    }

    if (label) label.textContent = "Next meeting in";

    const targetDate = getNextMeetingDate(dayOfWeek, startTime);
    if (!targetDate) {
      el.innerHTML = `<p class="loading-msg">Next meeting date coming soon.</p>`;
      return;
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    el.innerHTML = `
      <div class="countdown-box"><span class="num">${days}</span><span class="label">Days</span></div>
      <div class="countdown-box"><span class="num">${hours}</span><span class="label">Hours</span></div>
      <div class="countdown-box"><span class="num">${minutes}</span><span class="label">Min</span></div>
      <div class="countdown-box"><span class="num">${seconds}</span><span class="label">Sec</span></div>
    `;
  }

  tick();
  clearInterval(countdownInterval);
  countdownInterval = setInterval(tick, 1000);
}

function renderHome(club) {
  if (!club) {
    document.querySelector("#hero-content").innerHTML =
      `<h1>Textron India Toastmasters Club</h1><p class="loading-msg">Club details could not be loaded.</p>`;
    return;
  }

  document.title = `${club.clubName} | Home`;
  document.querySelector("#club-name").textContent = club.clubName;
  document.querySelector("#club-tagline").textContent = club.tagline;

  const guestCta = document.querySelector("#guest-cta");
  if (guestCta && club.contact?.email) {
    guestCta.href = `mailto:${club.contact.email}?subject=Guest%20Visit%20Request`;
  }

  document.querySelector("#meeting-frequency").textContent = club.meeting?.frequency || "TBD";
  document.querySelector("#meeting-time").textContent = club.meeting?.time || "TBD";
  document.querySelector("#meeting-mode").textContent = club.meeting?.mode || "TBD";
  document.querySelector("#meeting-location").textContent = club.meeting?.location || "TBD";

  document.querySelector("#what-is-toastmasters").textContent =
    club.about?.whatIsToastmasters || "";

  renderCountdown(club.meeting?.dayOfWeek, club.meeting?.startTime, club.meeting?.endTime);
}

document.addEventListener("DOMContentLoaded", async () => {
  const club = await fetchData("data/club.json");
  renderHome(club);
});
