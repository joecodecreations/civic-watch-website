(() => {
  const stage = document.getElementById('demo-stage');
  const cover = document.getElementById('demo-cover');
  const load = document.getElementById('load-demo');
  const stop = document.getElementById('stop-demo');
  if (!stage || !load) return;
  load.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'play/';
    frame.title = 'Civic Watch — Research Facility zombie demo';
    frame.allow = 'fullscreen; autoplay; gamepad';
    frame.allowFullscreen = true;
    cover.hidden = true;
    cover.style.display = 'none';
    stage.append(frame);
    stop.hidden = false;
    frame.focus();
  });
  stop.addEventListener('click', () => {
    stage.querySelector('iframe')?.remove();
    cover.hidden = false;
    cover.style.display = '';
    stop.hidden = true;
    load.focus();
  });
})();
