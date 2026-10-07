(() => {
  const track = document.querySelector('#feature-carousel');
  if (!track) return;
  const cards = [...track.querySelectorAll('.feature')];
  const controls = document.querySelector('.carousel-controls');
  const dots = [...controls.querySelectorAll('[data-slide]')];
  const arrows = [...controls.querySelectorAll('[data-direction]')];
  const mobile = matchMedia('(max-width: 900px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let frame;
  const position = index => cards[index].offsetLeft - cards[0].offsetLeft;
  function update() {
    current = cards.reduce((best, card, index) => Math.abs(position(index) - track.scrollLeft) < Math.abs(position(best) - track.scrollLeft) ? index : best, 0);
    dots.forEach((dot, index) => {
      if (index === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    arrows[0].disabled = current === 0;
    arrows[1].disabled = current === cards.length - 1;
  }
  function show(index) {
    if (!mobile.matches) return;
    track.scrollTo({left: position(Math.max(0, Math.min(cards.length - 1, index))), behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  arrows.forEach(arrow => arrow.addEventListener('click', () => show(current + Number(arrow.dataset.direction))));
  track.addEventListener('keydown', event => {
    if (!mobile.matches || event.target !== track) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame); frame = requestAnimationFrame(update);
  }, {passive: true});
  new ResizeObserver(update).observe(track);
  update();
})();
