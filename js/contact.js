// Contact Us page: renders the contact section from data/club.json as
// clickable cards (email, phone, WhatsApp, LinkedIn, Instagram).

function renderContact(club) {
  const grid = document.querySelector("#contact-grid");
  const contact = club?.contact;

  if (!contact) {
    grid.innerHTML = `<p class="loading-msg">Contact details could not be loaded.</p>`;
    return;
  }

  document.title = `${club.clubName} | Contact Us`;

  const channels = [
    { label: "Email", value: contact.email, href: contact.email && `mailto:${contact.email}` },
    { label: "Phone", value: contact.phone, href: contact.phone && `tel:${contact.phone.replace(/\s+/g, "")}` },
    { label: "WhatsApp", value: contact.whatsapp, href: contact.whatsapp },
    { label: "LinkedIn", value: contact.linkedin, href: contact.linkedin },
    { label: "Instagram", value: contact.instagram, href: contact.instagram },
  ].filter((c) => c.value);

  if (channels.length === 0) {
    grid.innerHTML = `<p class="loading-msg">No contact details added yet.</p>`;
    return;
  }

  grid.innerHTML = channels
    .map(
      (c) => `
      <a class="detail-card contact-card" href="${c.href}" target="_blank" rel="noopener">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
      </a>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const club = await fetchData("data/club.json");
  renderContact(club);
});
