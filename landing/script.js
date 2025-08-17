// Header shadow on scroll
const header = document.querySelector('.nav');
const onScroll = () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle('scrolled', y > 6);
};
window.addEventListener('scroll', onScroll);
onScroll();

// Focus search when pressing "/"
const search = document.getElementById('search');
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== search) {
    e.preventDefault();
    search.focus();
  }
});

// Progressive pin reveal if prefers-reduced-motion is off
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  const pins = document.querySelectorAll('.pin');
  pins.forEach((pin, i) => {
    pin.style.setProperty('--d', `${i * 140}ms`);
  });
}
// IntersectionObserver to reveal cards on scroll
(() => {
  const els = document.querySelectorAll('.will-reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    // Fallback: show immediately
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.2});
  els.forEach(el => io.observe(el));
})();
// Reveal on scroll (reuse if already present)
(() => {
  const els = document.querySelectorAll('#recommendations .will-reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.18});
  els.forEach(el => io.observe(el));
})();

// Light tilt/parallax for cards on mouse move
(() => {
  const area = document.querySelector('#recommendations .recos__cards');
  if (!area) return;
  const cards = area.querySelectorAll('[data-tilt]');
  const max = 8; // max degrees
  const setTilt = (el, x, y, rect) => {
    const px = (x - rect.left) / rect.width;
    const py = (y - rect.top) / rect.height;
    const rx = (py - .5) * -2 * max; // rotateX
    const ry = (px - .5) * 2 * max;  // rotateY
    el.style.setProperty('--rx', rx.toFixed(2));
    el.style.setProperty('--ry', ry.toFixed(2));
    el.style.setProperty('--r', `${(ry/10).toFixed(2)}deg`);
    el.style.transform += ` rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  area.addEventListener('mousemove', (e) => {
    const rect = area.getBoundingClientRect();
    cards.forEach(el => {
      // reset base rotation set in CSS, then apply tilt
      el.style.transform = el.classList.contains('rec-card--green') ? 'rotate(3deg)' : 'rotate(-4deg)';
      setTilt(el, e.clientX, e.clientY, rect);
    });
  });
  area.addEventListener('mouseleave', () => {
    cards.forEach(el => el.style.transform = el.classList.contains('rec-card--green') ? 'rotate(3deg)' : 'rotate(-4deg)');
  });
})();
// Enhanced image and text animations for the journeys section
(() => {
  const imgs = document.querySelectorAll('.journeys__images .journey-img');
  const paras = document.querySelectorAll('.journeys__desc');
  const journeysSection = document.querySelector('.journeys__grid');
  if (!imgs.length || !paras.length || !journeysSection) return;

  // Track mouse movement for parallax effect
  journeysSection.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = journeysSection.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    imgs.forEach((img, i) => {
      const isActive = img.classList.contains('active');
      const strength = isActive ? 15 : 8;
      const translateX = (x - 0.5) * strength;
      const translateY = (y - 0.5) * strength;
      img.style.transform = `
        scale(${isActive ? 1 : 0.95}) 
        translate3d(${translateX}px, ${translateY}px, 0)
        rotateX(${(y - 0.5) * -5}deg)
        rotateY(${(x - 0.5) * 5}deg)
      `;
    });
  });

  // Smooth scroll-based activation
  const setActivePair = () => {
    let focusIdx = 0;
    const winMid = window.innerHeight * 0.45;
    let minDist = Infinity;

    imgs.forEach((img, i) => {
      const rect = img.getBoundingClientRect();
      const center = (rect.top + rect.bottom) / 2;
      const dist = Math.abs(center - winMid);
      if (dist < minDist) {
        minDist = dist;
        focusIdx = i;
      }
    });

    imgs.forEach((img, i) => {
      const shouldBeActive = i === focusIdx;
      if (shouldBeActive !== img.classList.contains('active')) {
        img.classList.toggle('active', shouldBeActive);
        // Add a small delay for each image
        setTimeout(() => {
          paras[i].classList.toggle('active', shouldBeActive);
        }, i * 100);
      }
    });
  };

  // Smooth scroll handler with throttling
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setActivePair();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setActivePair);
  
  // Initial setup with a small delay for smooth page load
  setTimeout(setActivePair, 300);

  // Reset transforms when mouse leaves section
  journeysSection.addEventListener('mouseleave', () => {
    imgs.forEach(img => {
      const isActive = img.classList.contains('active');
      img.style.transform = `scale(${isActive ? 1 : 0.95}) translate3d(0, 0, 0)`;
    });
  });
})();
// Simple fade/slide review carousel, keyboard & swipe support
(() => {
  const track = document.querySelector('.reviews-slider .slider-track');
  const reviews = Array.from(track.children);
  const prevBtn = document.querySelector('.slider-arrow--left');
  const nextBtn = document.querySelector('.slider-arrow--right');
  let idx = 0;
  if (!reviews.length) return;

  function show(i) {
    reviews.forEach((c, j) => c.classList.toggle('active', j === i));
    idx = i;
  }
  show(0);

  prevBtn.addEventListener('click', () => show((idx - 1 + reviews.length) % reviews.length));
  nextBtn.addEventListener('click', () => show((idx + 1) % reviews.length));
  // Keyboard support & click focus
  const slider = document.querySelector('.reviews-slider');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
  // Optional: swipeable
  let startX = 0;
  slider.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  slider.addEventListener('touchend', e => {
    const endX = e.changedTouches.clientX;
    if (startX - endX > 40) nextBtn.click();
    if (endX - startX > 40) prevBtn.click();
  });
})();
// Reveal on scroll (reuseable)
(() => {
  const els = document.querySelectorAll('#latest .will-reveal, #latest .news-mini');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el=>el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.16});
  els.forEach(el=>io.observe(el));
})();
// Community CTA: soft reveal on scroll
(() => {
  const el = document.querySelector('.community-cta');
  if (!el) return;
  const reveal = () => el.classList.add('reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ reveal(); obs.unobserve(e.target);} });
    }, {threshold:.2});
    io.observe(el);
  } else reveal();
})();

