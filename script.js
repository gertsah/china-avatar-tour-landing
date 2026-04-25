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
const mapFallback = document.querySelector("#mapFallback");
const mapSteps = document.querySelector("#mapSteps");
const mapPlayButton = document.querySelector("#mapPlayButton");
const mapDayLabel = document.querySelector("#mapDayLabel");
const mapPlaceLabel = document.querySelector("#mapPlaceLabel");

const tourStops = [
  {
    day: "День 1",
    number: "1",
    place: "Пекин",
    title: "Прилет и первые храмы",
    transport: "Трансфер и прогулки по городу",
    coords: [39.9163, 116.3972],
  },
  {
    day: "День 2",
    number: "2",
    place: "Храм Неба",
    title: "Императорский Пекин",
    transport: "Микроавтобус с гидом",
    coords: [39.8799, 116.4029],
  },
  {
    day: "День 3",
    number: "3",
    place: "Великая стена Мутяньюй",
    title: "Утро на Великой стене",
    transport: "Выезд из Пекина",
    coords: [40.4361, 116.5571],
  },
  {
    day: "День 4",
    number: "4",
    place: "Чжанцзяцзе",
    title: "Национальный парк и горы Аватара",
    transport: "Перелет из Пекина",
    coords: [29.3153, 110.4348],
  },
  {
    day: "День 5",
    number: "5",
    place: "Тяньмэнь",
    title: "Небесные врата или стеклянный мост",
    transport: "Горный маршрут",
    coords: [29.0499, 110.4789],
  },
  {
    day: "Дни 6-7",
    number: "6",
    place: "Шанхай",
    title: "Старый город, Пудун и Хуанпу",
    transport: "Скоростной поезд",
    coords: [31.2304, 121.4737],
  },
  {
    day: "Опция",
    number: "+",
    place: "Чжуцзяцзяо",
    title: "Китайская Венеция",
    transport: "Дополнительный день",
    coords: [31.1076, 121.057],
  },
];

let tourMap;
let routeLine;
let activeRouteLine;
let movingMarker;
let animationFrame;

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

const createRouteIcon = (label) =>
  L.divIcon({
    className: "",
    html: `<span class="route-marker">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const createMovingIcon = () =>
  L.divIcon({
    className: "",
    html: '<span class="moving-marker"></span>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const updateMapLabels = (stopIndex) => {
  const stop = tourStops[stopIndex];
  mapDayLabel.textContent = stop.day;
  mapPlaceLabel.textContent = stop.place;

  document.querySelectorAll(".map-step").forEach((step) => {
    step.classList.toggle("is-active", Number(step.dataset.stopIndex) === stopIndex);
  });
};

const interpolate = (from, to, amount) => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
];

const buildPartialRoute = (progress) => {
  const maxSegment = tourStops.length - 1;
  const exact = progress * maxSegment;
  const segmentIndex = Math.min(Math.floor(exact), maxSegment - 1);
  const segmentProgress = exact - segmentIndex;
  const points = tourStops.slice(0, segmentIndex + 1).map((stop) => stop.coords);
  points.push(interpolate(tourStops[segmentIndex].coords, tourStops[segmentIndex + 1].coords, segmentProgress));
  return { points, segmentIndex };
};

const setMapPosition = (stopIndex) => {
  if (!tourMap) return;

  cancelAnimationFrame(animationFrame);
  const coords = tourStops[stopIndex].coords;
  const points = tourStops.slice(0, stopIndex + 1).map((stop) => stop.coords);
  activeRouteLine.setLatLngs(points.length > 1 ? points : [coords, coords]);
  movingMarker.setLatLng(coords);
  tourMap.flyTo(coords, stopIndex <= 2 ? 7 : 6, { duration: 0.9 });
  updateMapLabels(stopIndex);
};

const playMapAnimation = () => {
  if (!tourMap) return;

  cancelAnimationFrame(animationFrame);
  mapPlayButton.textContent = "Движение идет...";
  const duration = 9000;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const { points, segmentIndex } = buildPartialRoute(eased);
    const currentPoint = points[points.length - 1];

    activeRouteLine.setLatLngs(points);
    movingMarker.setLatLng(currentPoint);
    updateMapLabels(segmentIndex);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      setMapPosition(tourStops.length - 1);
      mapPlayButton.textContent = "Запустить движение заново";
    }
  };

  tourMap.fitBounds(routeLine.getBounds(), { padding: [34, 34] });
  animationFrame = requestAnimationFrame(tick);
};

const initTourMap = () => {
  const mapElement = document.querySelector("#tourMap");

  if (!mapElement || typeof L === "undefined") {
    return;
  }

  mapFallback.hidden = true;

  tourMap = L.map(mapElement, {
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(tourMap);

  const coords = tourStops.map((stop) => stop.coords);
  routeLine = L.polyline(coords, {
    color: "#8c1715",
    weight: 4,
    opacity: 0.32,
    dashArray: "9 10",
  }).addTo(tourMap);

  activeRouteLine = L.polyline([tourStops[0].coords, tourStops[0].coords], {
    color: "#8c1715",
    weight: 5,
    opacity: 0.95,
  }).addTo(tourMap);

  tourStops.forEach((stop, index) => {
    L.marker(stop.coords, { icon: createRouteIcon(stop.number) })
      .addTo(tourMap)
      .bindPopup(`<strong>${stop.day}: ${stop.place}</strong><br>${stop.title}<br><small>${stop.transport}</small>`);

    const button = document.createElement("button");
    button.className = "map-step";
    button.type = "button";
    button.dataset.stopIndex = String(index);
    button.innerHTML = `
      <span class="map-step-number">${stop.number}</span>
      <span>
        <strong>${stop.place}</strong>
        <span>${stop.day} · ${stop.transport}</span>
      </span>
    `;
    button.addEventListener("click", () => setMapPosition(index));
    mapSteps.appendChild(button);
  });

  movingMarker = L.marker(tourStops[0].coords, { icon: createMovingIcon(), zIndexOffset: 1000 }).addTo(tourMap);
  tourMap.fitBounds(routeLine.getBounds(), { padding: [34, 34] });
  updateMapLabels(0);
  mapPlayButton.addEventListener("click", playMapAnimation);
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

initTourMap();

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
