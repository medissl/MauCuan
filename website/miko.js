(() => {
  const companion = document.querySelector('.miko-companion');
  if (!companion) return;
  const picture = companion.querySelector('.miko');
  const response = document.querySelector('#miko-response');
  const preload = new Image();
  preload.src = '/assets/miko-wink.png';
  let greetingTimer;
  companion.addEventListener('click', () => {
    clearTimeout(greetingTimer);
    picture.src = preload.src;
    response.textContent = 'Miko menyapamu. Senang kamu kembali!';
    greetingTimer = setTimeout(() => {
      picture.src = '/assets/miko.png';
      response.textContent = '';
    }, 1800);
  });
  picture.addEventListener('error', () => {
    if (!picture.src.endsWith('/assets/miko.png')) picture.src = '/assets/miko.png';
  });
})();
