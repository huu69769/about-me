// ===== 我最爱的三首歌 =====
// 把你的 mp3 放到 assets/audio/，封面放到 assets/img/，改这里的路径即可
const playlist = [
  {
    title: "November Rain",
    artist: "Guns N' Roses",
    src:   "assets/audio/song1.mp3",
    cover: "assets/img/cover1.jpg"
  },
  {
    title: "Purple Rain",
    artist: "Prince and the Revolution",
    src:   "assets/audio/song2.mp3",
    cover: "assets/img/cover2.jpg"
  },
  {
    title: "歌曲三",
    artist: "歌手三",
    src:   "assets/audio/song3.mp3",
    cover: "assets/img/cover3.jpg"
  }
];

let current = 0;

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
  audio.src = t.src;
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;
  cover.src = t.cover;
  cover.style.display = '';
  progressFill.style.width = '0%';
  progressKnob.style.left = '0%';
  curTime.textContent = "00:00";
  if (autoplay) play();
}

function setPlayingUI(){
  playBtn.textContent = "⏸";
  vinyl.classList.add('playing');
  tonearm.classList.add('on');
  document.body.classList.add('playing');   // 开始下雨
}

function play(){
  audio.play().then(setPlayingUI).catch(setPlayingUI);
  // 没有音频文件时也照样转、照样下雨做演示
}

function pause(){
  audio.pause();
  playBtn.textContent = "▶";
  vinyl.classList.remove('playing');
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

// 初始化
audio.volume = volume.value / 100;
loadTrack(0, false);
