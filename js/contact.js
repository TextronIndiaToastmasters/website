// Contact Us page: submits the contact form to Formspree via fetch, showing
// an inline success/error message instead of redirecting away from the site.

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const status = document.querySelector("#form-status");
  const submitBtn = form.querySelector("button[type=submit]");

  submitBtn.disabled = true;
  status.textContent = "Sending...";
  status.className = "form-status";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      status.textContent = "Thanks! Your message has been sent.";
      status.className = "form-status success";
      form.reset();
    } else {
      status.textContent = "Something went wrong. Please try again or email us directly.";
      status.className = "form-status error";
    }
  } catch {
    status.textContent = "Network error. Please try again or email us directly.";
    status.className = "form-status error";
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const club = await fetchData("data/club.json");
  if (club?.clubName) {
    document.title = `${club.clubName} | Contact Us`;
  }

  document.querySelector("#contact-form")?.addEventListener("submit", handleSubmit);
});

