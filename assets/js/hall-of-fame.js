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
let touchStartX = null;
let touchStartY = null;
let lastSwipeAt = 0;

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

function updateLayout() {
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
}

function moveOneSlide(step) {
  if (currentPosition === 0 && step < 0) moveTo(slides.length, false);
  if (currentPosition === slides.length + 1 && step > 0) moveTo(1, false);
  moveTo(currentPosition + step);
}

function handleSwipe(startX, startY, endX, endY) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  if (Math.abs(deltaX) <= 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  if (Date.now() - lastSwipeAt < 400) return;

  lastSwipeAt = Date.now();
  moveOneSlide(deltaX < 0 ? 1 : -1);
}

track.addEventListener("transitionend", event => {
  if (event.propertyName === "transform") resetAfterLoop();
});

slideButtons.forEach(button => {
  button.addEventListener("click", () => {
    moveTo(Number(button.dataset.slideTo) + 1);
  });
});

slideArrows.forEach(button => {
  button.addEventListener("click", () => {
    moveOneSlide(Number(button.dataset.slideStep));
  });
});

gallery.addEventListener("pointerdown", event => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  touchStartX = event.clientX;
  touchStartY = event.clientY;
  gallery.setPointerCapture(event.pointerId);
});

gallery.addEventListener("pointerup", event => {
  if (touchStartX === null || touchStartY === null) return;

  handleSwipe(touchStartX, touchStartY, event.clientX, event.clientY);
  touchStartX = null;
  touchStartY = null;
});

gallery.addEventListener("pointercancel", () => {
  touchStartX = null;
  touchStartY = null;
});

gallery.addEventListener("touchstart", event => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

gallery.addEventListener("touchend", event => {
  if (touchStartX === null || touchStartY === null) return;

  const touch = event.changedTouches[0];
  handleSwipe(touchStartX, touchStartY, touch.clientX, touch.clientY);

  touchStartX = null;
  touchStartY = null;
}, { passive: true });

gallery.addEventListener("touchcancel", () => {
  touchStartX = null;
  touchStartY = null;
}, { passive: true });

mobileLayout.addEventListener("change", updateLayout);
reducedMotion.addEventListener("change", updateLayout);
updateLayout();
