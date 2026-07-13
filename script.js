// custom crosshair cursor
  const lineV = document.getElementById('lineV');
  const lineH = document.getElementById('lineH');
  const crossCenter = document.getElementById('crossCenter');
  const coordLabel = document.getElementById('coordLabel');
  const crosshairEls = [lineV, lineH, crossCenter, coordLabel];

  window.addEventListener('mousemove', (e)=>{
    const x = e.clientX, y = e.clientY;
    lineV.style.left = x + 'px';
    lineH.style.top = y + 'px';
    crossCenter.style.left = x + 'px';
    crossCenter.style.top = y + 'px';
    coordLabel.style.left = x + 'px';
    coordLabel.style.top = y + 'px';
    coordLabel.textContent = `X: ${x.toString().padStart(4,'0')}  Y: ${y.toString().padStart(4,'0')}`;
  });

  const hoverables = document.querySelectorAll('a, button, .btn, .price-card, .bento-card, input');
  hoverables.forEach(el=>{
    el.addEventListener('mouseenter', ()=> crosshairEls.forEach(c=>c.classList.add('hovered')));
    el.addEventListener('mouseleave', ()=> crosshairEls.forEach(c=>c.classList.remove('hovered')));
  });
  document.body.addEventListener('mouseleave', ()=> crosshairEls.forEach(c=> c.style.opacity='0'));
  document.body.addEventListener('mouseenter', ()=> crosshairEls.forEach(c=> c.style.opacity='1'));

  // nav scroll state
  window.addEventListener('scroll', ()=>{
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
  });

  // particles canvas
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  const particles = Array.from({length:70}, ()=>({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.6+0.4, vx:(Math.random()-0.5)*0.15, vy:(Math.random()-0.5)*0.15,
    c: Math.random() > 0.5 ? '124,92,252' : '0,217,200'
  }));
  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(${p.c},0.5)`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();

  // typing terminal
  const typingEl = document.getElementById('typing');
  const lines = [
    {t:'prompt', text:'$ circuit init support-triage'},
    {t:'out', text:'✓ pipeline scaffolded in ./support-triage'},
    {t:'prompt', text:'$ circuit connect gpt-4.1 → postgres → slack'},
    {t:'out', text:'✓ 3 nodes wired · retries: on · cost cap: $50/day'},
    {t:'prompt', text:'$ circuit run --watch'},
    {t:'out', text:'→ listening for events...'},
  ];
  let li=0, ci=0;
  function typeLine(){
    if(li>=lines.length){ typingEl.innerHTML += '<div><span class="caret"></span></div>'; return; }
    const line = lines[li];
    if(ci===0){ typingEl.innerHTML += `<div class="line-${li}"></div>`; }
    const el = typingEl.querySelector(`.line-${li}`);
    el.innerHTML = `<span class="${line.t==='prompt'?'prompt':'out'}">${line.text.slice(0,ci)}</span><span class="caret"></span>`;
    if(ci < line.text.length){ ci++; setTimeout(typeLine, 22); }
    else { ci=0; li++; setTimeout(typeLine, 380); }
  }
  setTimeout(typeLine, 500);

  // number ticker on scroll into view
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const decimal = el.dataset.decimal === 'true';
        const suffix = el.dataset.suffix || '';
        let cur = 0;
        const step = target/60;
        function upd(){
          cur += step;
          if(cur >= target){ cur = target; }
          el.textContent = (decimal ? cur.toFixed(2) : Math.floor(cur).toLocaleString()) + suffix;
          if(cur < target) requestAnimationFrame(upd);
        }
        upd();
        obs.unobserve(el);
      }
    });
  }, {threshold:0.5});
  nums.forEach(n=>obs.observe(n));
