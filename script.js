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

  // scroll progress bar
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
  });

  // mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  mobileToggle.addEventListener('click', ()=>{
    mobileToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      mobileToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // reveal-on-scroll
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealEls.forEach(el=>revealObs.observe(el));

  // nav scroll state
  window.addEventListener('scroll', ()=>{
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
  });

  // animated network background (video-style plexus effect)
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let mouse = { x: null, y: null };
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const NODE_COUNT = 130;
  const LINK_DIST = 130;
  const MOUSE_DIST = 160;
  const nodes = Array.from({length:NODE_COUNT}, ()=>({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.8+0.6,
    vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35,
    c: Math.random() > 0.55 ? '124,92,252' : '0,217,200',
    flash: 0
  }));

  // canvas is now pointer-events:none (it's a fixed full-page background),
  // so track the mouse on the window instead of the canvas element.
  window.addEventListener('mousemove', (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', ()=>{ mouse.x = null; mouse.y = null; });

  // occasional "neural flash" on a random node, in the warm accent color,
  // for a livelier signal-firing feel across the whole page
  setInterval(()=>{
    const n = nodes[Math.floor(Math.random()*nodes.length)];
    n.flash = 1;
  }, 260);

  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // move nodes
    nodes.forEach(n=>{
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if(n.y < 0 || n.y > canvas.height) n.vy *= -1;
      // gentle pull toward mouse for a "reactive" feel
      if(mouse.x !== null){
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < MOUSE_DIST){
          n.x -= dx * 0.0025;
          n.y -= dy * 0.0025;
        }
      }
    });

    // draw links between close nodes
    for(let i=0; i<nodes.length; i++){
      for(let j=i+1; j<nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < LINK_DIST){
          const alpha = (1 - dist/LINK_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,217,200,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // link to mouse
      if(mouse.x !== null){
        const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < MOUSE_DIST){
          const alpha = (1 - dist/MOUSE_DIST) * 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(124,92,252,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // draw nodes on top
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${n.c},0.7)`;
      ctx.fill();

      // decay and render neural flash glow
      if(n.flash > 0){
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,107,74,${0.55 * n.flash})`;
        ctx.shadowColor = 'rgba(255,107,74,0.8)';
        ctx.shadowBlur = 10 * n.flash;
        ctx.arc(n.x, n.y, n.r + 2.5 * n.flash, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        n.flash -= 0.035;
        if(n.flash < 0) n.flash = 0;
      }
    });

    requestAnimationFrame(tick);
  }
  tick();

  // typing terminal (only present on the homepage demo section)
  const typingEl = document.getElementById('typing');
  if(typingEl){
    const lines = [
      {t:'prompt', text:'$ beacon init'},
      {t:'out', text:'✓ project scaffolded in ./beacon'},
      {t:'prompt', text:'$ beacon connect --repo github.com/acme/sdk --docs ./docs'},
      {t:'out', text:'✓ indexed 1,204 files · docs synced · ready'},
      {t:'prompt', text:'$ beacon deploy --widget'},
      {t:'out', text:'→ live at acme.com — ask it anything'},
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
  }

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