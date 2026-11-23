const gallery = document.querySelector(".hall-of-fame-gallery");
const track = gallery.querySelector(".hall-of-fame-track");
const slides = [...track.querySelectorAll("figure")];
const slideButtons = [...document.querySelectorAll("[data-slide-to]")];
const slideArrows = [...document.querySelectorAll("[data-slide-step]")];
const mobileLayout = window.matchMedia("(max-width: 600px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const firstSlideClone = slides[0].cloneNode(true);
const lastSlideClone = slides.at(-1).cloneNode(true);
let currentPosition = 1;
let autoplay;
let autoplayResume;

function prepareClone(clone) {
  clone.dataset.clone = "true";
  clone.inert = true;
  clone.setAttribute("aria-hidden", "true");
  clone.querySelector("img").alt = "";
}

prepareClone(firstSlideClone);
prepareClone(lastSlideClone);
track.prepend(lastSlideClone);
track.append(firstSlideClone);

function updateAccessibility() {
  const activeSlide = (currentPosition - 1 + slides.length) % slides.length;

  slides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", String(mobileLayout.matches && index !== activeSlide));
  });

  firstSlideClone.setAttribute(
    "aria-hidden",
    String(!mobileLayout.matches || currentPosition !== slides.length + 1),
  );
  lastSlideClone.setAttribute("aria-hidden", String(!mobileLayout.matches || currentPosition !== 0));
  firstSlideClone.inert = !mobileLayout.matches || currentPosition !== slides.length + 1;
  lastSlideClone.inert = !mobileLayout.matches || currentPosition !== 0;

  slideButtons.forEach((button, index) => {
    button.setAttribute("aria-pressed", String(index === activeSlide));
  });
}

function moveTo(position, animate = true) {
  currentPosition = position;
  track.style.transition = animate && !reducedMotion.matches ? "" : "none";
  track.style.transform = `translateX(-${position * 100}%)`;
  updateAccessibility();

  if (!animate || reducedMotion.matches) {
    track.getBoundingClientRect();
    track.style.transition = "";
  }
}

function resetAfterLoop() {
  if (currentPosition !== 0 && currentPosition !== slides.length + 1) return;

  track.style.transition = "none";
  currentPosition = currentPosition === 0 ? slides.length : 1;
  track.style.transform = `translateX(-${currentPosition * 100}%)`;
  updateAccessibility();
  track.getBoundingClientRect();
  track.style.transition = "";
}

function startAutoplay() {
  clearTimeout(autoplayResume);
  clearInterval(autoplay);

  if (mobileLayout.matches && !reducedMotion.matches && slides.length > 1) {
    autoplay = setInterval(() => moveTo(currentPosition + 1), 5000);
  }
}

function pauseAfterManualChange() {
  clearInterval(autoplay);
  clearTimeout(autoplayResume);

  if (mobileLayout.matches && !reducedMotion.matches) {
    autoplayResume = setTimeout(startAutoplay, 10000);
  }
}

function updateLayout() {
  clearTimeout(autoplayResume);
  clearInterval(autoplay);

  if (!mobileLayout.matches) {
    currentPosition = 1;
    track.style.transition = "none";
    track.style.transform = "";
    firstSlideClone.hidden = true;
    lastSlideClone.hidden = true;
    updateAccessibility();
    return;
  }

  firstSlideClone.hidden = false;
  lastSlideClone.hidden = false;
  moveTo(1, false);
  startAutoplay();
}

track.addEventListener("transitionend", event => {
  if (event.propertyName === "transform") resetAfterLoop();
});

slideButtons.forEach(button => {
  button.addEventListener("click", () => {
    pauseAfterManualChange();
    moveTo(Number(button.dataset.slideTo) + 1);
  });
});

slideArrows.forEach(button => {
  button.addEventListener("click", () => {
    pauseAfterManualChange();

    if (currentPosition === 0) moveTo(slides.length, false);
    if (currentPosition === slides.length + 1) moveTo(1, false);

    moveTo(currentPosition + Number(button.dataset.slideStep));
  });
});

document.querySelector(".hall-of-fame-slider-controls").addEventListener("pointerdown", pauseAfterManualChange);

mobileLayout.addEventListener("change", updateLayout);
reducedMotion.addEventListener("change", updateLayout);
updateLayout();
