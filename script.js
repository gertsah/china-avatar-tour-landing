const header = document.querySelector(".site-header");
const modal = document.querySelector("#videoModal");
const modalVideo = document.querySelector("#modalVideo");
const openVideoButtons = document.querySelectorAll("[data-open-video]");
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const leadForm = document.querySelector("#leadForm");
const formNote = document.querySelector("#formNote");
const dayTabs = document.querySelectorAll(".day-tab");
const dayPanels = document.querySelectorAll(".day-panel");
const daySelect = document.querySelector("#daySelect");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const setActiveDay = (day) => {
  dayTabs.forEach((tab) => {
    const isActive = tab.dataset.day === day;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  dayPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === day);
  });

  if (daySelect && daySelect.value !== day) {
    daySelect.value = day;
  }
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

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

dayTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveDay(tab.dataset.day);
  });
});

daySelect?.addEventListener("change", (event) => {
  setActiveDay(event.target.value);
});

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
    channel: formData.get("channel"),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem("chinaAvatarTourLead", JSON.stringify(lead));
  formNote.textContent = "Заявка сохранена на этой странице. Можно подключить отправку в мессенджер или CRM.";
  leadForm.reset();
  setActiveDay("1");
});
