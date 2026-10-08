// Announcements page: renders posts from data/announcements.json, newest first.
// Each post: { "title": "...", "date": "YYYY-MM-DD", "text": "...", "image": "assets/announcements/name.png" }
// "text" and "image" are optional.

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatPostDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderAnnouncements(posts) {
  const feed = document.querySelector("#announcements-feed");
  if (!posts || posts.length === 0) {
    feed.innerHTML = `<p class="loading-msg">No announcements yet. Check back soon!</p>`;
    return;
  }

  const sorted = [...posts].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  feed.innerHTML = sorted
    .map(
      (p) => `
      <article class="post-card">
        <div class="post-header">
          <img class="post-avatar" src="assets/logo/toastmasters-logo.png" alt="" onerror="this.remove()" />
          <div>
            <div class="post-author">Textron India Toastmasters Club</div>
            ${p.date ? `<div class="post-date">${escapeHtml(formatPostDate(p.date))}</div>` : ""}
          </div>
        </div>
        ${p.title ? `<h3 class="post-title">${escapeHtml(p.title)}</h3>` : ""}
        ${p.text ? `<p class="post-text">${escapeHtml(p.text)}</p>` : ""}
        ${p.image ? `<img class="post-image" src="${escapeHtml(p.image)}" alt="Announcement image" onerror="this.remove()" />` : ""}
      </article>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const posts = await fetchData("data/announcements.json");
  renderAnnouncements(posts);
});
