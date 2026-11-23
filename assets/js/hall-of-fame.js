const gallery = document.querySelector(".hall-of-fame-gallery");
const track = gallery.querySelector(".hall-of-fame-track");
const slides = [...track.querySelectorAll("figure")];
const slideButtons = [...document.querySelectorAll("[data-slide-to]")];
const mobileLayout = window.matchMedia("(max-width: 600px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const firstSlideClone = slides[0].cloneNode(true);
let currentPosition = 0;
let autoplay;

firstSlideClone.dataset.clone = "true";
firstSlideClone.inert = true;
firstSlideClone.setAttribute("aria-hidden", "true");
firstSlideClone.querySelector("img").alt = "";
track.append(firstSlideClone);

function updateAccessibility() {
  const activeSlide = currentPosition % slides.length;

  slides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", String(mobileLayout.matches && index !== activeSlide));
  });

  firstSlideClone.setAttribute("aria-hidden", String(!mobileLayout.matches || currentPosition !== slides.length));

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
  if (currentPosition !== slides.length) return;

  track.style.transition = "none";
  currentPosition = 0;
  track.style.transform = "translateX(0)";
  updateAccessibility();
  track.getBoundingClientRect();
  track.style.transition = "";
}

function updateLayout() {
  clearInterval(autoplay);

  if (!mobileLayout.matches) {
    currentPosition = 0;
    track.style.transition = "none";
    track.style.transform = "";
    firstSlideClone.hidden = true;
    updateAccessibility();
    return;
  }

  firstSlideClone.hidden = false;
  moveTo(0, false);

  if (!reducedMotion.matches && slides.length > 1) {
    autoplay = setInterval(() => moveTo(currentPosition + 1), 5000);
  }
}

track.addEventListener("transitionend", event => {
  if (event.propertyName === "transform") resetAfterLoop();
});

slideButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = Number(button.dataset.slideTo);
    moveTo(target);
  });
});

mobileLayout.addEventListener("change", updateLayout);
reducedMotion.addEventListener("change", updateLayout);
updateLayout();
