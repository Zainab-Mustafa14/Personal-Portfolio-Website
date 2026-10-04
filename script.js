
const navbar = document.getElementById("navbar");
const navToggle = document.querySelector(".navbar__toggle");
const navMenuWrap = document.querySelector(".navbar__nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
function setMenu(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navMenuWrap.classList.toggle("is-open", open);
}

navToggle.addEventListener("click", () => {
  setMenu(navToggle.getAttribute("aria-expanded") !== "true");
});

navMenuWrap.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------- Navbar scroll state ---------- */
function updateNavbar() {
  navbar.classList.toggle("is-scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

// /* ---------- Scroll reveal ---------- */
// const revealItems = document.querySelectorAll(".scroll-reveal");

// if (prefersReducedMotion || !("IntersectionObserver" in window)) {
//   revealItems.forEach((el) => el.classList.add("is-visible"));
// } else {
//   const revealObserver = new IntersectionObserver(
//     (entries, observer) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add("is-visible");
//           observer.unobserve(entry.target); // animate once
//         }
//       });
//     },
//     { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
//   );
//   revealItems.forEach((el) => revealObserver.observe(el));
// }

/* ---------- Scroll reveal (reusable) ----------
   Add the class "scroll-reveal" to any element to fade/slide it in when
   it enters the viewport (optional delay: style="--rd: 0.1s").
   Put data-reveal-stagger on a parent to stagger its children. */
document.querySelectorAll("[data-reveal-stagger], .footer__grid").forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    child.classList.add("scroll-reveal");
    child.style.setProperty("--rd", `${i * 0.08}s`);
  });
});

const revealItems = document.querySelectorAll(".scroll-reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((el) => revealObserver.observe(el));
}

/* ---------- Skill card tilt (mouse devices only) ---------- */
const canTilt =
  !prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canTilt) {
  const MAX_TILT = 9; // degrees, kept small for a subtle effect

  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${(x * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* ---------- Project card tilt (mouse devices only, very subtle) ---------- */
if (canTilt) {
  const PROJECT_TILT = 3; // degrees

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${(x * PROJECT_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * PROJECT_TILT * 2).toFixed(2)}deg`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* ---------- Contact form: sends through Web3Forms ----------
   No backend of our own and no email app is opened. The message goes to
   Web3Forms, which emails it to the address linked to the access key.
   The access key is public by design (it only identifies the form), and
   visitors cannot change the recipient. */

const WEB3FORMS_ACCESS_KEY = "personal-access-key";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const errorBox = document.getElementById("form-error");
  const successPanel = document.getElementById("contact-success");
  const sendAnotherBtn = document.getElementById("send-another");
  const submitBtn = contactForm.querySelector(".contact-form__submit");
  const submitLabel = submitBtn.textContent;
  const summary = {
    name: document.getElementById("summary-name"),
    email: document.getElementById("summary-email"),
    subject: document.getElementById("summary-subject"),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let isSending = false;

  const validators = {
    name: (v) => (v.trim() ? "" : "Please enter your name."),
    email: (v) => {
      if (!v.trim()) return "Please enter your email address.";
      return emailPattern.test(v.trim()) ? "" : "Please enter a valid email address.";
    },
    subject: (v) => (v.trim() ? "" : "Please enter a subject."),
    message: (v) => (v.trim() ? "" : "Please write a message."),
  };

  function checkField(input) {
    const field = input.closest(".field");
    const error = document.getElementById(`${input.id}-error`);
    const message = validators[input.name](input.value);
    error.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function setSending(state) {
    isSending = state;
    submitBtn.disabled = state;
    submitBtn.classList.toggle("is-loading", state);
    submitBtn.setAttribute("aria-busy", String(state));
    submitBtn.textContent = state ? "Sending..." : submitLabel;
  }

  function showError() {
    errorBox.hidden = false;
  }

  // Only the visible, validated fields (the hidden spam-trap is excluded)
  const fields = Array.from(contactForm.querySelectorAll(".field input, .field textarea"));

  fields.forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.value || input.closest(".field").classList.contains("is-invalid")) checkField(input);
    });
    input.addEventListener("input", () => {
      errorBox.hidden = true;
      if (input.closest(".field").classList.contains("is-invalid")) checkField(input);
    });
  });

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSending) return; // prevent duplicate submissions
    errorBox.hidden = true;

    // 1. Validate every field; stop here if anything is wrong
    const results = fields.map((input) => checkField(input));
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      return;
    }

    // 2. Spam trap: if a bot ticked the hidden box, do nothing
    if (contactForm.elements.botcheck.checked) return;

    // 3. Collect values
    const submitted = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      subject: contactForm.elements.subject.value.trim().replace(/[\r\n]+/g, " "),
      message: contactForm.elements.message.value.trim(),
    };

    // One fixed, clean email format
    const formattedMessage =
      "NEW PORTFOLIO CONTACT\n\n" +
      `Name: ${submitted.name}\n` +
      `Email: ${submitted.email}\n` +
      `Subject: ${submitted.subject}\n\n` +
      `Message:\n${submitted.message}\n\n` +
      "Submitted from:\nZainab Mustafa Portfolio";

    // 4. Send. The success panel appears only if the service confirms.
    setSending(true);
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: submitted.subject,
          from_name: "Portfolio Contact Form",
          replyto: submitted.email, // pressing Reply in your inbox goes to the visitor
          name: submitted.name,
          email: submitted.email,
          message: formattedMessage,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Request failed with status ${response.status}`);
      }

      summary.name.textContent = submitted.name;
      summary.email.textContent = submitted.email;
      summary.subject.textContent = submitted.subject;

      contactForm.reset();
      fields.forEach((input) => {
        input.setAttribute("aria-invalid", "false");
        input.closest(".field").classList.remove("is-invalid");
      });

      contactForm.hidden = true;
      successPanel.hidden = false;
      successPanel.focus();
    } catch (error) {
      // Technical details only in the console; the visitor's text stays in the form
      console.error("Contact form send failed:", error);
      showError();
    } finally {
      setSending(false);
    }
  });

  // "Send Another Message": back to a clean form
  sendAnotherBtn.addEventListener("click", () => {
    successPanel.hidden = true;
    contactForm.hidden = false;
    errorBox.hidden = true;
    contactForm.elements.name.focus();
  });
}

/* ---------- Back to top ---------- */
const backToTop = document.getElementById("back-to-top");

if (backToTop) {
  backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    document.querySelector(".navbar__brand").focus({ preventScroll: true });
  });
}

/* ---------- Hero: pause orbs off-screen + subtle pointer parallax ---------- */
const heroSection = document.getElementById("hero");

// Pause the slow orb animation while the hero is not visible
if (heroSection && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    heroSection.classList.toggle("is-offscreen", !entry.isIntersecting);
  }).observe(heroSection);
}

// Mouse parallax: only on mouse devices without reduced motion (canTilt is defined above)
if (heroSection && canTilt) {
  let heroFrame = 0;

  heroSection.addEventListener("pointermove", (e) => {
    if (heroFrame) return; // at most one update per frame
    heroFrame = requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      heroSection.style.setProperty("--px", ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
      heroSection.style.setProperty("--py", ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      heroFrame = 0;
    });
  });

  heroSection.addEventListener("pointerleave", () => {
    heroSection.style.setProperty("--px", "0");
    heroSection.style.setProperty("--py", "0");
  });
}