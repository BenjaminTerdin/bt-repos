// Select your carousel
const myCarousel = document.querySelector('#my_slider');

// Variables to track touch positions
let startX = 0;
let endX = 0;

// Listen for touchstart and touchend events
myCarousel.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

myCarousel.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;

  // Calculate the swipe distance
  const diffX = startX - endX;

  // Swipe threshold to detect a gesture
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // Swipe left -> go to the next slide
      $('.carousel').carousel('next');
    } else {
      // Swipe right -> go to the previous slide
      $('.carousel').carousel('prev');
    }
  }
});