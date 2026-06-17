// ===== 我最爱的三首歌 =====
// 把你的 mp3 放到 assets/audio/，封面放到 assets/img/，改这里的路径即可
const playlist = [
  {
    title: "Purple Rain",
    artist: "Prince and the Revolution",
    src:   "assets/audio/song2.mp3?v=2",
    cover: "assets/img/cover2.jpg"
  },
  {
    title: "November Rain",
    artist: "Guns N' Roses",
    src:   "assets/audio/song1.mp3",
    cover: "assets/img/cover1.jpg"
  },
  {
    title: "ENDLESS RAIN",
    artist: "X JAPAN",
    src:   "",
    cover: "assets/img/cover3.jpg"
  }
];

let current = 0;

// 黑胶旋转状态
let vinylRot = 0, spinning = false, dragging = false, vel = 0;

const audio       = document.getElementById('audio');
const vinyl       = document.getElementById('vinyl');
const tonearm     = document.getElementById('tonearm');
const cover       = document.getElementById('cover');
const trackTitle  = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playBtn     = document.getElementById('playBtn');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const volume      = document.getElementById('volume');
const progress    = document.getElementById('progress');
const progressFill= document.getElementById('progressFill');
const progressKnob= document.getElementById('progressKnob');
const curTime     = document.getElementById('curTime');
const durTime     = document.getElementById('durTime');

function fmt(t){
  if (isNaN(t)) return "00:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}

function loadTrack(i, autoplay){
  current = (i + playlist.length) % playlist.length;
  const t = playlist[current];
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;
  cover.src = t.cover;
  cover.style.display = '';
  // 切り替え時：ジャケットの回転を 0 に戻す
  vinylRot = 0; vel = 0;
  vinyl.style.transform = 'rotate(0deg)';
  progressFill.style.width = '0%';
  progressKnob.style.left = '0%';
  curTime.textContent = "00:00";
  durTime.textContent = "00:00";
  // 音源がない曲（例：3曲目）に切り替えたら、再生せずその場で止まる
  if (!t.src){
    audio.removeAttribute('src');
    audio.load();
    pause();
    return;
  }
  audio.src = t.src;
  if (autoplay) play();
}

function setPlayingUI(){
  playBtn.textContent = "⏸";
  spinning = true;                           // 开始转
  tonearm.classList.add('on');
  document.body.classList.add('playing');    // 开始下雨
}

function play(){
  audio.play().then(setPlayingUI).catch(setPlayingUI);
  // 没有音频文件时也照样转、照样下雨做演示
}

function pause(){
  audio.pause();
  playBtn.textContent = "▶";
  spinning = false;                          // 停止自转
  tonearm.classList.remove('on');
  document.body.classList.remove('playing'); // 停止下雨
}

function togglePlay(){
  if (audio.paused) play(); else pause();
}

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', () => loadTrack(current + 1, true));
prevBtn.addEventListener('click', () => loadTrack(current - 1, true));

volume.addEventListener('input', () => { audio.volume = volume.value / 100; });

audio.addEventListener('loadedmetadata', () => { durTime.textContent = fmt(audio.duration); });
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / audio.duration) * 100 || 0;
  progressFill.style.width = pct + '%';
  progressKnob.style.left = pct + '%';
  curTime.textContent = fmt(audio.currentTime);
});
audio.addEventListener('ended', () => loadTrack(current + 1, true));

progress.addEventListener('click', (e) => {
  const rect = progress.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

// ===== 生成雨丝（一次性，靠 body.playing 控制显隐）=====
const rain = document.getElementById('rain');
if (rain){
  const DROPS = 90;
  for (let i = 0; i < DROPS; i++){
    const d = document.createElement('span');
    d.className = 'drop';
    d.style.left = (Math.random() * 100) + 'vw';
    d.style.height = (50 + Math.random() * 60) + 'px';
    d.style.animationDuration = (1.2 + Math.random() * 1.0) + 's';
    d.style.animationDelay = (-Math.random() * 2) + 's';
    d.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
    rain.appendChild(d);
  }
}

// 猫カード：タッチ端末はタップで裏返す／もう一度タップで戻す（PC はホバー）
if (!(window.matchMedia && window.matchMedia('(hover:hover)').matches)){
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

// 猫タイムライン：ドラッグ＆ホイールで横スクロール
const catLine = document.querySelector('.cat-timeline');
if (catLine){
  // マウスホイールを横スクロールに変換
  catLine.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      catLine.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive:false });

  // クリック＆ドラッグでスクロール
  let down = false, startX = 0, startLeft = 0, moved = 0;
  catLine.addEventListener('pointerdown', (e) => {
    down = true; moved = 0;
    startX = e.clientX; startLeft = catLine.scrollLeft;
    catLine.classList.add('grabbing');
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    catLine.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    down = false; catLine.classList.remove('grabbing');
  });
  // ドラッグ直後のクリックでカードが裏返らないように
  catLine.addEventListener('click', (e) => {
    if (moved > 6){ e.stopPropagation(); e.preventDefault(); }
  }, true);
}

// ===== 黑胶：自动旋转 + 手动拨动 =====
const turntable = document.querySelector('.turntable');
const DEG_PER_SEC = 12;            // 30秒一圈
let lastFrame = null;
function spinLoop(t){
  if (lastFrame == null) lastFrame = t;
  const dt = Math.min((t - lastFrame) / 1000, 0.05);
  lastFrame = t;
  if (!dragging){
    if (spinning){
      vinylRot += DEG_PER_SEC * dt;          // 播放中：稳定自转
    } else if (Math.abs(vel) > 2){
      vinylRot += vel * dt; vel *= 0.94;     // 暂停后：甩动惯性滑行
    }
    vinyl.style.transform = 'rotate(' + vinylRot + 'deg)';
  }
  requestAnimationFrame(spinLoop);
}
requestAnimationFrame(spinLoop);

function pointerAngle(x, y){
  const r = vinyl.getBoundingClientRect();
  return Math.atan2(y - (r.top + r.height/2), x - (r.left + r.width/2)) * 180 / Math.PI;
}
if (turntable){
  let prevAngle = 0, lastT = 0;
  turntable.addEventListener('pointerdown', (e) => {
    dragging = true; vel = 0;
    prevAngle = pointerAngle(e.clientX, e.clientY);
    lastT = performance.now();
    vinyl.classList.add('grabbing');
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const a = pointerAngle(e.clientX, e.clientY);
    let dA = a - prevAngle;
    dA = ((dA + 180) % 360 + 360) % 360 - 180;     // 归一化到 [-180,180]
    vinylRot += dA;
    vinyl.style.transform = 'rotate(' + vinylRot + 'deg)';
    const now = performance.now(), dT = (now - lastT) / 1000;
    if (dT > 0) vel = Math.max(-720, Math.min(720, dA / dT));
    prevAngle = a; lastT = now;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    vinyl.classList.remove('grabbing');
  });
}

// ===== 猫爪光标轨迹（仅鼠标设备）=====
if (window.matchMedia && window.matchMedia('(pointer:fine)').matches){
  let lastPaw = 0;
  window.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - lastPaw < 70) return;
    lastPaw = now;
    const p = document.createElement('span');
    p.className = 'paw';
    p.textContent = '🐾';
    p.style.left = e.clientX + 'px';
    p.style.top  = e.clientY + 'px';
    p.style.setProperty('--r', (Math.random() * 60 - 30) + 'deg');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  });
}

// ===== 滚动渐入 =====
const revealEls = document.querySelectorAll(
  '.section .sec-head, .about-wrap, .cat-timeline, .shelf-wrap, .shelf-note, .chapter, .contact-links'
);
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add('reveal-in'); io.unobserve(en.target); }
    });
  }, { threshold:0, rootMargin:'0px 0px -6% 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('reveal-in'));
}

// ===== らくがきボード（線データ方式：共有/ローカル両対応）=====
(function(){
  const canvas = document.getElementById('doodleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const noteEl = document.getElementById('dbNote');
  const PAPER = '#faf7f0';
  const LOCAL_KEY = 'rakugaki-strokes';

  let color = '#ff3b30', size = 4, erasing = false;
  let drawing = false, cur = null, lastPx = null;
  let allStrokes = [];

  const cssW = () => canvas.clientWidth;
  const cssH = () => Math.round(canvas.clientWidth * 0.55);

  function setupCanvas(){
    const dpr = window.devicePixelRatio || 1;
    canvas.style.height = cssH() + 'px';
    canvas.width  = cssW() * dpr;
    canvas.height = cssH() * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function clearPaper(){ ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cssW(), cssH()); }
  function seg(x1,y1,x2,y2,c,w,e){
    ctx.strokeStyle = e ? PAPER : c;
    ctx.lineWidth   = e ? w * 2.4 : w;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  function drawStroke(s){
    const w = cssW(), h = cssH(), p = s.p;
    if (!p || !p.length) return;
    if (p.length === 1){ seg(p[0][0]*w, p[0][1]*h, p[0][0]*w, p[0][1]*h, s.c, s.w, s.e); return; }
    for (let i = 1; i < p.length; i++) seg(p[i-1][0]*w, p[i-1][1]*h, p[i][0]*w, p[i][1]*h, s.c, s.w, s.e);
  }
  function redrawAll(){ setupCanvas(); clearPaper(); allStrokes.forEach(drawStroke); }

  const pos  = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const norm = (x,y) => [ +(x / cssW()).toFixed(4), +(y / cssH()).toFixed(4) ];

  function startDraw(e){
    drawing = true;
    const [x,y] = pos(e);
    cur = { c: color, w: size, e: erasing, p: [ norm(x,y) ] };
    lastPx = [x,y];
    seg(x,y,x,y,cur.c,cur.w,cur.e);
  }
  function moveDraw(e){
    if (!drawing) return;
    const [x,y] = pos(e);
    seg(lastPx[0], lastPx[1], x, y, cur.c, cur.w, cur.e);
    lastPx = [x,y];
    cur.p.push(norm(x,y));
  }
  function endDraw(){
    if (!drawing) return;
    drawing = false;
    if (cur && cur.p.length) commitStroke(cur);
    cur = null;
  }
  canvas.addEventListener('pointerdown', startDraw);
  canvas.addEventListener('pointermove', moveDraw);
  window.addEventListener('pointerup', endDraw);

  // 道具
  document.querySelectorAll('.db-color').forEach(b => {
    b.addEventListener('click', () => {
      color = b.dataset.color; erasing = false;
      document.querySelectorAll('.db-color').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('dbEraser').classList.remove('active');
    });
  });
  document.querySelectorAll('.db-size').forEach(b => {
    b.addEventListener('click', () => {
      size = parseInt(b.dataset.size, 10);
      document.querySelectorAll('.db-size').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
  const eraserBtn = document.getElementById('dbEraser');
  eraserBtn.addEventListener('click', () => { erasing = !erasing; eraserBtn.classList.toggle('active', erasing); });
  document.getElementById('dbSave').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'rakugaki.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redrawAll, 200); });

  /* =====================================================================
     共有 or ローカル（firebase-config.js に設定があれば自動で共有版）
     ・共有：1ストローク＝1レコードを Firebase に push、child_added で全員に同期
     ・全消しボタンは公開しない（方案A）。オーナーは Firebase コンソールから
       board/strokes を削除すれば全消しできる。
     ===================================================================== */
  const cfg = window.FIREBASE_CONFIG || {};
  const useFB = !!(cfg.apiKey && cfg.databaseURL && window.firebase);
  let fbRef = null;

  function commitStroke(s){
    if (fbRef) { fbRef.push(s); }            // child_added で描画＆配列に追加
    else { allStrokes.push(s); saveLocal(); }
  }
  function saveLocal(){ try { localStorage.setItem(LOCAL_KEY, JSON.stringify(allStrokes)); } catch(e){} }

  setupCanvas(); clearPaper();

  if (useFB){
    try {
      firebase.initializeApp(cfg);
      fbRef = firebase.database().ref('board/strokes');
      fbRef.on('child_added', (snap) => {
        const s = snap.val();
        if (s && s.p){ allStrokes.push(s); drawStroke(s); }
      });
      if (noteEl) noteEl.textContent = '※ みんなのらくがき。リアルタイムで共有されます。';
    } catch(err){
      console.warn('Firebase init failed → ローカルモード', err);
      fbRef = null; startLocal();
    }
  } else {
    startLocal();
  }

  function startLocal(){
    try { const d = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); if (Array.isArray(d)) allStrokes = d; } catch(e){}
    redrawAll();
  }
})();

// 初始化
audio.volume = volume.value / 100;
loadTrack(0, false);
