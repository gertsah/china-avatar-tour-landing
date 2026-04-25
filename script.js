const header = document.querySelector(".site-header");
const modal = document.querySelector("#videoModal");
const modalVideo = document.querySelector("#modalVideo");
const openVideoButtons = document.querySelectorAll("[data-open-video]");
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const leadForm = document.querySelector("#leadForm");
const formNote = document.querySelector("#formNote");
const railLinks = document.querySelectorAll(".journey-rail a");
const revealItems = document.querySelectorAll(".reveal");
const scenes = document.querySelectorAll(".scene");

const updateScrollState = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  document.documentElement.style.setProperty("--progress", `${progress}%`);
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const openVideo = () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {});
};

const closeVideo = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalVideo.pause();
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

const sceneObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const step = visible.target.dataset.step;
    railLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.rail === step);
    });
  },
  {
    threshold: [0.2, 0.45, 0.7],
    rootMargin: "-18% 0px -46% 0px",
  },
);

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

revealItems.forEach((item) => revealObserver.observe(item));
scenes.forEach((scene) => sceneObserver.observe(scene));

openVideoButtons.forEach((button) => {
  button.addEventListener("click", openVideo);
});

closeVideoButtons.forEach((button) => {
  button.addEventListener("click", closeVideo);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeVideo();
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const lead = {
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message"),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem("chinaAvatarTourLead", JSON.stringify(lead));
  formNote.textContent = "Заявка сохранена на этой странице. Можно подключить отправку в мессенджер или CRM.";
  leadForm.reset();
});
