/* Pam · Mi visión */
(()=>{'use strict';
const D=window.PAM_DATA, AUDIO=window.PAM_AUDIO, KEY='pam_mi_vision_v2_alfa';
const defaultState={theme:'light',paletteVersion:3,font:1,route:'home',lastProgram:'prog-1',lastChapter:0,completed:[],sessions:[],journal:[],evidences:D.evidences.map(x=>({...x})),applications:[],firstWeek:D.firstWeekPlan.map(x=>({...x})),vision:'Vivo mi presente con dignidad y dirección. Puedo postularme a Fórmula 1 desde hoy y seguir creciendo mediante oportunidades profesionales compatibles con mi experiencia.',woop:{wish:'Trabajar en Fórmula 1 en comunicación, alianzas, eventos o gestión comercial.',outcome:'Aportar mi experiencia a un equipo internacional y desarrollar nuevas capacidades.',obstacle:'Esperar a sentir que mi CV es perfecto.',plan:'Si aparece esa duda, dedicaré quince minutos a preparar o enviar una candidatura.'},mood:[],meditationResume:null,voiceMuted:false};
const clone=x=>JSON.parse(JSON.stringify(x));let state=clone(defaultState);let migrateChapter=false;try{const old=JSON.parse(localStorage.getItem(KEY)||'null');if(old&&typeof old==='object'){migrateChapter=old.paletteVersion!==3;state={...state,...old,theme:migrateChapter?'light':old.theme,woop:{...state.woop,...old.woop}};}else{const legacy=JSON.parse(localStorage.getItem('pam_mi_vision_calm_v3')||'null');if(legacy){migrateChapter=true;state.journal=legacy.journalEntries||[];state.evidences=legacy.evidences||[];state.applications=legacy.applications||[];state.firstWeek=legacy.firstWeek||state.firstWeek;state.vision=legacy.visionStatement||state.vision;state.completed=legacy.completedPrograms||[];state.lastProgram=legacy.lastSession?.programId||'prog-1';state.lastChapter=legacy.lastSession?.chapterIdx||0;state.woop={wish:legacy.woopWish||state.woop.wish,outcome:state.woop.outcome,obstacle:legacy.woopObstacle||state.woop.obstacle,plan:`Si ${legacy.woopIf||'surge la duda'}, entonces ${legacy.woopThen||'haré una acción concreta'}.`};}}}catch(e){console.warn('No se pudo recuperar almacenamiento',e)}
if (migrateChapter && !state.meditationResume && state.lastChapter > 0 && !state.completed.includes(state.lastProgram)) {
  const resumeAt = AUDIO[state.lastProgram]?.chapters?.[state.lastChapter];
  if (Number.isFinite(resumeAt)) state.meditationResume = {id: state.lastProgram, seconds: resumeAt};
}
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const uid=()=>String(Date.now())+Math.random().toString(36).slice(2,7);const today=()=>new Date().toLocaleDateString('en-CA');const dateFmt=d=>{try{return new Date(`${d}T12:00:00`).toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}catch{return d}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){toast('Almacenamiento lleno. Exporta un respaldo.');return false}}
function toast(msg){const e=$('#toast');e.textContent=msg;e.classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('visible'),2800)}
function applyPrefs(){document.documentElement.classList.toggle('light',state.theme==='light');document.documentElement.style.setProperty('--scale',String(state.font));document.documentElement.classList.toggle('reading-mode',state.readMode)}
function wrap(head,body,subtitle=''){return `<div class="section-head"><div><div class="eyebrow">${head}</div>${subtitle?`<p class="muted small">${subtitle}</p>`:''}</div></div>${body}`}
let current = 'home';
let selectedTrack = 'all';
let diaryTab = 'all';
let session = null;
let narrating = false;
let speechToken = 0;
const defaultProgram = D.programs[0];
const trackVersion = 3;

function stopSpeech() {
  speechToken++;
  narrating = false;
  window.speechSynthesis?.cancel();
}

function speak(text) {
  stopSpeech();
  if (!('speechSynthesis' in window)) return toast('La lectura en voz alta no está disponible.');
  const token = speechToken;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = .88;
  utterance.onend = utterance.onerror = () => {
    if (token === speechToken) narrating = false;
  };
  narrating = true;
  speechSynthesis.speak(utterance);
}

function openDialog(title, html) {
  $('#dialogTitle').textContent = title;
  $('#dialogBody').innerHTML = html;
  $('#dialog').hidden = false;
  $('#closeDialog').focus();
}

function closeDialog() {
  $('#dialog').hidden = true;
  $('#dialogBody').innerHTML = '';
}

function setView(name) {
  document.body.dataset.view = name;
  const main = $('#view');
  main.focus({preventScroll: true});
  window.scrollTo({top: 0, behavior: 'instant'});
}

function nav(route) {
  closeSession();
  stopSpeech();
  current = route;
  state.route = route;
  save();
  $$('.nav-item').forEach(button => {
    const isCurrent = button.dataset.route === route;
    button.classList.toggle('active', isCurrent);
    if (isCurrent) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const views = {home: homeView, meditate: meditateView, route: careerView, journal: journalView, vision: visionView};
  $('#view').innerHTML = views[route]();
  setView(route);
  bindView();
}

function resumePoint() {
  const point = state.meditationResume;
  const timeline = point && Object.hasOwn(AUDIO, point.id) ? AUDIO[point.id] : null;
  if (!timeline || !Number.isFinite(point.seconds) || point.seconds <= 0) return null;
  // The new recording has a different pace. Older checkpoints resume at the matching chapter.
  const seconds = point.trackVersion === trackVersion ? point.seconds :
    (timeline.chapters[state.lastChapter] ?? 0);
  return seconds < timeline.duration - 1 ? {id: point.id, seconds} : null;
}

function durationLabel(program) {
  return `${Math.max(1, Math.round(AUDIO[program.id].duration / 60))} min`;
}

function timeLabel(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function atmosphere(className = '') {
  return `<div class="meditation-atmosphere ${className}" aria-hidden="true">
    <div class="meditation-rings"></div><div class="meditation-orb"></div>
  </div>`;
}

function homeView() {
  const resume = resumePoint();
  const program = D.programs.find(item => item.id === resume?.id) || defaultProgram;
  return `<section class="meditation-home">
    ${atmosphere()}
    <h1>Este momento es tuyo, Pam.</h1>
    <p class="session-caption">${esc(program.title)} <span aria-hidden="true">·</span> ${durationLabel(program)}</p>
    <div class="home-start">
      <button class="btn primary play-button" data-action="open-last">${resume ? 'Continuar' : 'Iniciar'}</button>
      ${resume ? '<button class="quiet-button" data-action="restart">Empezar de nuevo</button>' : ''}
    </div>
    <details class="home-more">
      <summary>Más opciones</summary>
      <div class="home-links">
        <button class="quiet-button" data-route="meditate">Otras meditaciones</button>
        <button class="quiet-button" data-route="journal">Diario</button>
        <button class="quiet-button" data-route="route">Mi camino</button>
        <button class="quiet-button" data-route="vision">Mi visión</button>
      </div>
    </details>
  </section>`;
}

function meditateView() {
  return `<section class="meditation-library">
    <h1>Meditaciones</h1>
    <div class="grid">${D.programs.map(program => `<article class="card program-card">
      <div><h2>${esc(program.title)}</h2><p>${esc(program.subtitle)}</p></div>
      <div class="row">
        <span class="tag">${durationLabel(program)}</span>
        <button class="btn primary" data-program="${program.id}" aria-label="Escuchar ${esc(program.title)}">Escuchar</button>
      </div>
    </article>`).join('')}</div>
  </section>`;
}

function savePosition(entry, force = false) {
  const position = entry.audio.currentTime;
  if (!entry.positionReady || !Number.isFinite(position) || position < 1 ||
      (entry.audio.ended && !force)) return;
  if (!force && Math.abs(position - entry.savedAt) < 5) return;
  entry.savedAt = position;
  state.meditationResume = {id: entry.program.id, seconds: position, trackVersion};
  state.lastProgram = entry.program.id;
  state.lastChapter = entry.chapter;
  save();
}

function closeSession(keepPosition = true) {
  if (!session) return;
  const entry = session;
  session = null;
  if (keepPosition) savePosition(entry, true);
  for (const track of [entry.audio, entry.music]) {
    track.pause();
    track.removeAttribute('src');
    track.load();
  }
}

function refreshPlayback(entry, status = '') {
  if (session !== entry) return;
  const {audio, timeline} = entry;
  const button = $('#togglePlayback');
  const loading = status === 'Preparando audio…';
  button.textContent = audio.paused ? 'Continuar' : 'Pausar';
  button.disabled = loading && audio.paused;
  $('#playerStatus').textContent = status;
  const progress = $('#playerProgress');
  progress.value = Math.min(audio.currentTime, timeline.duration);
  $('#elapsed').textContent = timeLabel(audio.currentTime);
  $('.meditation-atmosphere', $('#view')).classList.toggle('is-playing', !audio.paused && !loading);
}

function updateTranscript(entry) {
  const now = entry.positionReady ? entry.audio.currentTime : entry.seekTo;
  const chapterIndex = Math.max(0, entry.timeline.chapters.filter(time => time <= now).length - 1);
  const phrases = entry.timeline.phrases[chapterIndex];
  const phraseIndex = Math.max(0, phrases.filter(phrase => phrase.at <= now).length - 1);
  if (chapterIndex === entry.chapter && phraseIndex === entry.phrase) return;
  entry.chapter = chapterIndex;
  entry.phrase = phraseIndex;
  $('#chapterTitle').textContent = entry.program.chapters[chapterIndex].title.replace(/^\d+\.\s*/, '');
  $('#phraseText').textContent = phrases[phraseIndex].text;
}

function syncMusic(entry) {
  const {audio, music} = entry;
  if (!entry.positionReady || !music.readyState) return;
  const target = Math.min(audio.currentTime, music.duration);
  if (Math.abs(music.currentTime - target) > .35) music.currentTime = target;
}

function playMusic(entry) {
  if (!entry.music.paused || entry.musicStarting) return;
  entry.musicStarting = true;
  entry.music.play().catch(error => {
    if (session === entry && error.name !== 'AbortError') toast('La música no está disponible.');
  }).finally(() => {
    entry.musicStarting = false;
  });
}

function playSession(entry) {
  if (entry.audio.error) {
    entry.seekTo = entry.positionReady ? entry.audio.currentTime : entry.seekTo;
    entry.positionReady = entry.seekTo === 0;
    entry.audio.load();
  }
  if (entry.music.error) entry.music.load();
  refreshPlayback(entry, 'Preparando audio…');
  entry.audio.play().catch(error => {
    if (session !== entry || error.name === 'AbortError') return;
    entry.music.pause();
    refreshPlayback(entry, 'No se pudo reproducir. Puedes volver a intentarlo.');
  });
  syncMusic(entry);
  playMusic(entry);
}

function updateVoiceButton(entry) {
  const muted = entry.audio.muted;
  const button = $('#toggleVoice');
  button.setAttribute('aria-pressed', String(muted));
  button.textContent = muted ? 'Activar voz' : 'Silenciar voz';
}

function openProgram(id, position = 0) {
  const program = D.programs.find(item => item.id === id);
  if (!program) return;
  closeSession();
  stopSpeech();
  const audio = new Audio();
  const music = new Audio();
  audio.preload = music.preload = 'auto';
  audio.muted = state.voiceMuted === true;
  const timeline = AUDIO[id];
  const seekTo = Math.min(Math.max(position, 0), timeline.duration - 1);
  const entry = {
    audio, music, program, timeline, chapter: -1, phrase: -1, seekTo,
    positionReady: seekTo === 0, savedAt: seekTo, musicStarting: false
  };
  session = entry;
  $('#view').innerHTML = `<section class="meditation-player">
    <div class="player-bar"><button id="exitPlayer" class="quiet-button">Salir</button></div>
    ${atmosphere()}
    <h1>${esc(program.title)}</h1>
    <section class="live-transcript" aria-label="Texto de la meditación">
      <h2 id="chapterTitle"></h2>
      <p id="phraseText"></p>
    </section>
    <div class="session-progress">
      <progress id="playerProgress" aria-label="Progreso de la sesión" max="${timeline.duration}" value="0"></progress>
      <div class="progress-times"><span id="elapsed">0:00</span><span>${timeLabel(timeline.duration)}</span></div>
    </div>
    <div class="meditation-controls">
      <button id="togglePlayback" class="btn primary play-button">Pausar</button>
      <button id="toggleVoice" class="btn soft voice-button" type="button">Silenciar voz</button>
    </div>
    <p id="playerStatus" class="player-status" role="status"></p>
    <details class="session-transcript full-transcript">
      <summary>Ver el texto completo</summary>
      ${program.chapters.map(chapter => `<h2>${esc(chapter.title)}</h2><p>${esc(chapter.text)}</p>`).join('')}
    </details>
  </section>`;
  setView('player');
  $('#exitPlayer').onclick = () => nav(current === 'meditate' ? 'meditate' : 'home');
  $('#togglePlayback').onclick = () => {
    if (audio.paused) playSession(entry);
    else {
      audio.pause();
      music.pause();
    }
  };
  $('#toggleVoice').onclick = () => {
    audio.muted = !audio.muted;
    state.voiceMuted = audio.muted;
    save();
    updateVoiceButton(entry);
  };
  audio.addEventListener('loadedmetadata', () => {
    if (session !== entry) return;
    if (!entry.positionReady) {
      audio.currentTime = entry.seekTo;
      entry.positionReady = true;
    }
    updateTranscript(entry);
    syncMusic(entry);
    refreshPlayback(entry, audio.paused ? '' : 'Preparando audio…');
  });
  music.addEventListener('loadedmetadata', () => {
    if (session === entry) syncMusic(entry);
  });
  audio.addEventListener('playing', () => {
    if (session !== entry) return;
    syncMusic(entry);
    playMusic(entry);
    refreshPlayback(entry);
  });
  audio.addEventListener('waiting', () => {
    if (session !== entry) return;
    if (audio.currentTime > 0) music.pause();
    refreshPlayback(entry, 'Preparando audio…');
  });
  audio.addEventListener('pause', () => {
    if (session !== entry || audio.ended) return;
    music.pause();
    savePosition(entry, true);
    refreshPlayback(entry);
  });
  audio.addEventListener('timeupdate', () => {
    if (session !== entry) return;
    updateTranscript(entry);
    if (!audio.paused && !music.paused) syncMusic(entry);
    $('#playerProgress').value = audio.currentTime;
    $('#elapsed').textContent = timeLabel(audio.currentTime);
    savePosition(entry);
  });
  audio.addEventListener('error', () => {
    if (session !== entry) return;
    music.pause();
    refreshPlayback(entry, 'Audio no disponible. Revisa tu conexión o abre el texto completo.');
  });
  audio.addEventListener('ended', () => {
    if (session !== entry) return;
    closeSession(false);
    state.meditationResume = null;
    if (!state.completed.includes(program.id)) state.completed.push(program.id);
    state.sessions.unshift({id: uid(), date: today(), program: program.title});
    save();
    renderFinish(program);
  });
  updateTranscript(entry);
  updateVoiceButton(entry);
  audio.src = `./assets/meditaciones/${timeline.voice}`;
  music.src = `./assets/meditaciones/${timeline.music}`;
  playSession(entry);
}

function renderFinish(program) {
  $('#view').innerHTML = `<section class="meditation-home meditation-finish">
    ${atmosphere()}
    <h1>Gracias por darte este momento, Pam.</h1>
    <div class="meditation-controls">
      <button id="replaySession" class="btn primary play-button" type="button">Repetir meditación</button>
      <button class="quiet-button" data-route="home" type="button">Volver al inicio</button>
    </div>
    <details class="session-transcript">
      <summary>Guardar una reflexión</summary>
      <p>${esc(program.question)}</p>
      <label class="label" for="reflectionText">Tu reflexión</label>
      <textarea id="reflectionText" class="field"></textarea>
      <button id="saveReflection" class="btn soft">Guardar en mi diario</button>
    </details>
  </section>`;
  setView('finish');
  bindGeneric();
  $('#replaySession').onclick = () => openProgram(program.id);
  $('#saveReflection').onclick = () => {
    const content = $('#reflectionText').value.trim();
    if (!content) return toast('Escribe una reflexión para guardarla.');
    state.journal.unshift({id: uid(), date: today(), category: 'Meditación', title: program.title, content});
    save();
    nav('home');
    toast('Reflexión guardada.');
  };
}

function persistSession() {
  if (session) savePosition(session, true);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) persistSession();
});
window.addEventListener('pagehide', persistSession);

function careerView(){let done=state.firstWeek.filter(x=>x.done).length;return wrap('RUTA PROFESIONAL · DOS CAMINOS',`<h1>El sueño comienza ahora.</h1><p class="lead" style="margin:16px 0 24px">No pospongas las candidaturas a Fórmula 1 hasta sentirte lista. Paralelamente, busca oportunidades que te permitan crecer, practicar y ganar estabilidad.</p><div class="split"><article class="card"><div class="eyebrow">CAMINO A · FÓRMULA 1</div><h3>Postularte desde hoy</h3><p>Comunicación, eventos, partnerships, hospitality, relaciones corporativas y operaciones comerciales.</p></article><article class="card"><div class="eyebrow">CAMINO B · CRECIMIENTO</div><h3>Experiencias que suman</h3><p>Proyectos internacionales, marketing, cuentas, eventos y equipos en los que desarrollar capacidades transferibles.</p></article></div><div class="section-head"><div><div class="eyebrow">PRIMEROS PASOS</div><h2>Tu primera semana.</h2><p class="muted">${done} de 7 acciones · un punto de partida flexible.</p></div></div><div class="progress-rail" style="margin-bottom:15px"><i style="width:${done/7*100}%"></i></div><div class="list">${state.firstWeek.map((x,i)=>`<div class="task ${x.done?'done':''}"><input type="checkbox" id="task${i}" data-task="${i}" ${x.done?'checked':''}><label for="task${i}"><strong>${esc(x.day)}</strong> · ${esc(x.task)}</label></div>`).join('')}</div><div class="section-head"><div><div class="eyebrow">SEGUIMIENTO</div><h2>Candidaturas reales.</h2></div><button class="btn primary" id="addApplication">+ Añadir</button></div><div class="filter-tabs" id="trackFilter"><button data-track="all" class="${selectedTrack==='all'?'active':''}">Todas</button><button data-track="A" class="${selectedTrack==='A'?'active':''}">Fórmula 1</button><button data-track="B" class="${selectedTrack==='B'?'active':''}">Otras</button></div><div class="stack" id="applicationList">${applicationsHTML()}</div><div class="section-head"><div><div class="eyebrow">ENLACES DE PARTIDA</div><h2>Explora equipos.</h2></div></div><div class="card">${D.f1Portals.map(x=>`<div class="external"><span><strong>${esc(x.name)}</strong><br><small class="muted">${esc(x.areas)}</small></span><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir sitio de ${esc(x.name)}">Abrir ↗</a></div>`).join('')}</div><div class="info">Son enlaces de referencia, no vacantes verificadas en tiempo real. Registra candidaturas solamente cuando realmente las envíes.</div>`)}
function applicationsHTML(){const rows=state.applications.filter(x=>selectedTrack==='all'||x.track===selectedTrack);return rows.length?rows.map(x=>`<article class="card"><div class="row start"><div><div class="eyebrow">${x.track==='A'?'CAMINO A · F1':'CAMINO B · CRECIMIENTO'}</div><h3 style="margin:6px 0">${esc(x.company)}</h3><div class="muted small">${esc(x.role)} · ${esc(x.status)}</div><div class="tiny muted">${esc(dateFmt(x.date))}</div></div><button class="linkbtn" data-delete-app="${esc(x.id)}">Eliminar</button></div>${x.url?`<a class="small" href="${esc(x.url)}" rel="noopener noreferrer" target="_blank">Ver oportunidad ↗</a>`:''}${x.note?`<p>${esc(x.note)}</p>`:''}</article>`).join(''):'<div class="card"><p>Aún no hay candidaturas registradas en este camino. Puedes añadir la primera cuando tengas una oportunidad concreta.</p></div>'}
function applicationModal(){openDialog('Añadir oportunidad',`<form id="appForm"><div class="form-group"><label class="label">Camino</label><select class="field" name="track"><option value="A">A · Fórmula 1</option><option value="B">B · Crecimiento paralelo</option></select></div><div class="form-group"><label class="label">Empresa</label><input name="company" class="field" required maxlength="120" placeholder="Nombre de la organización"></div><div class="form-group"><label class="label">Puesto</label><input name="role" class="field" required maxlength="120" placeholder="Título de la vacante"></div><div class="form-group"><label class="label">Estado</label><select class="field" name="status"><option>Por investigar</option><option>Preparando candidatura</option><option>Enviada</option><option>Entrevista</option><option>Seguimiento</option><option>Respuesta recibida</option></select></div><div class="form-group"><label class="label">Enlace (opcional)</label><input name="url" type="url" class="field" placeholder="https://..."></div><div class="form-group"><label class="label">Notas (opcional)</label><textarea name="note" class="field" maxlength="2000" placeholder="Qué aprendí o cómo voy a prepararme"></textarea></div><div class="button-row"><button class="btn primary" type="submit">Guardar oportunidad</button></div></form>`);$('#appForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.applications.unshift({id:uid(),date:today(),track:f.get('track'),company:String(f.get('company')).trim(),role:String(f.get('role')).trim(),status:f.get('status'),url:String(f.get('url')).trim(),note:String(f.get('note')).trim()});save();closeDialog();nav('route');toast('Oportunidad registrada')}}
function journalView(){let cats=['all','Reflexión','Meditación','Logro','Aprendizaje'];return wrap('DIARIO PERSONAL',`<h1>Tu historia, en tus palabras.</h1><p class="lead" style="margin:16px 0 22px">Escribe sin tener que impresionar a nadie. Guarda logros reales, dudas, recuerdos y aprendizajes que merecen ser reconocidos.</p><div class="card"><div class="eyebrow">NUEVA ENTRADA</div><div class="form-group"><label for="journalTitle" class="label">¿Qué quieres recordar?</label><input id="journalTitle" class="field" placeholder="Por ejemplo, algo que resolví hoy" maxlength="150"></div><div class="form-group"><label for="journalCat" class="label">Tipo</label><select id="journalCat" class="field"><option>Reflexión</option><option>Logro</option><option>Aprendizaje</option></select></div><div class="form-group"><label for="journalBody" class="label">Tu reflexión</label><textarea id="journalBody" class="field" placeholder="No tiene que ser perfecta. Este espacio es tuyo."></textarea></div><div class="button-row"><button class="btn primary" id="addJournal">Guardar entrada</button><button class="btn ghost" id="backupData">Respaldar mi diario</button></div></div><div class="section-head"><div><div class="eyebrow">BIBLIOTECA PERSONAL</div><h2>Mis recuerdos.</h2></div></div><div class="filter-tabs">${cats.map(x=>`<button class="${diaryTab===x?'active':''}" data-diary="${x}">${x==='all'?'Todos':x}</button>`).join('')}</div><div class="stack">${state.journal.filter(x=>diaryTab==='all'||x.category===diaryTab).map(x=>`<article class="card"><div class="row"><span class="eyebrow">${esc(x.category||'Reflexión')} · ${esc(dateFmt(x.date))}</span><button class="linkbtn" data-delete-journal="${esc(x.id)}">Eliminar</button></div><h3>${esc(x.title||'Una reflexión')}</h3><p style="white-space:pre-wrap">${esc(x.content)}</p></article>`).join('')||'<div class="card"><p>Aún no hay entradas en esta categoría.</p></div>'}</div><div class="section-head"><div><div class="eyebrow">EVIDENCIAS DE MI EXPERIENCIA</div><h2>Lo que ya he hecho.</h2></div><button id="addEvidence" class="btn soft">+ Añadir</button></div><div class="stack">${state.evidences.map(x=>`<article class="card"><div class="row"><h3>${esc(x.org)}</h3><button data-delete-evidence="${esc(x.id)}" class="linkbtn">Eliminar</button></div><p><strong>${esc(x.role)}</strong></p><p>${esc(x.fact)}</p><p class="small" style="color:var(--accent)">Capacidad transferible: ${esc(x.transferable||'')}</p></article>`).join('')||'<div class="card"><p>Este espacio puede crecer a medida que documentes tu trayectoria. Puedes añadir los datos de Trayken, Multimax, Hesta, BC Sales y otros proyectos que quieras verificar.</p></div>'}</div><div class="info">Tu información se conserva en este navegador. No se publica en GitHub, pero podría perderse si borras sus datos. Exporta un archivo JSON con regularidad. Los ejemplos de experiencia incluidos inicialmente proceden del material de partida; confirma sus detalles antes de usarlos en un CV.</div>`)}
function visionView(){let w=state.woop;return wrap('IDENTIDAD Y DIRECCIÓN',`<h1>Mi visión se practica.</h1><p class="lead" style="margin:16px 0 23px">Aquí se encuentran la reflexión personal, las ideas de tu biblioteca CEE y una estrategia concreta. Imaginar una posibilidad puede inspirar; preparar una candidatura es una acción verificable.</p><div class="card"><div class="eyebrow">MI DECLARACIÓN PERSONAL</div><h3 style="margin:10px 0">Una dirección que puedes escribir y revisar</h3><label for="visionText" class="label">Tu visión, en primera persona</label><textarea id="visionText" class="field" style="min-height:175px">${esc(state.vision)}</textarea><div class="button-row"><button class="btn primary" id="saveVision">Guardar mi declaración</button><button class="btn ghost" id="readVision">${narrating?'Detener voz':'Escuchar mi visión'}</button></div></div><div class="section-head"><div><div class="eyebrow">DE LA VISIÓN A LA ACCIÓN</div><h2>Deseo · Resultado · Obstáculo · Plan</h2></div></div><div class="card"><p class="muted small">Una adaptación práctica de contraste mental e intenciones de implementación (WOOP). No requiere fingir seguridad ni prometer resultados.</p>${[['wish','1 · Deseo — ¿qué quiero conseguir?'],['outcome','2 · Resultado — ¿por qué importa?'],['obstacle','3 · Obstáculo — ¿qué me frena hoy?'],['plan','4 · Plan — Si sucede X, entonces haré Y']].map(([key,label])=>`<div class="form-group"><label class="label" for="woop-${key}">${label}</label><textarea class="field" id="woop-${key}" rows="3">${esc(w[key])}</textarea></div>`).join('')}<div class="button-row"><button id="saveWoop" class="btn primary">Guardar mi plan</button></div></div><div class="section-head"><div><div class="eyebrow">LECTURAS CEE</div><h2>Ideas para contemplar.</h2></div></div><div class="grid"><article class="card"><span class="tag accent">Vision Statement</span><h3>Crear un espacio de intención</h3><p>Reservar momentos deliberados, escribir, revisar y conectar la visión con la práctica cotidiana.</p></article><article class="card"><span class="tag accent">Sentir es el secreto</span><h3>Imaginar una posibilidad</h3><p>Usar la imaginación y la emoción de una escena deseada como experiencia contemplativa.</p></article><article class="card"><span class="tag accent">El poder de la conciencia</span><h3>Atención e identidad</h3><p>Observar la conversación interna y revisar las creencias personales con curiosidad.</p></article><article class="card"><span class="tag accent">Siembra y cosecha</span><h3>Sembrar acciones concretas</h3><p>Una lectura simbólica: las candidaturas, el aprendizaje y las relaciones se construyen con acciones.</p></article></div><div class="info">Estas lecturas aportan ideas espirituales o filosóficas; no son pruebas científicas de que visualizar garantice un trabajo. La aplicación propone complementarlas con autocompasión, hechos personales y planificación. Puedes escribir la declaración en papel si prefieres seguir el ejercicio manuscrito de CEE.</div><div class="card" style="margin-top:17px"><div class="eyebrow">DATOS Y PRIVACIDAD</div><h3>Tu información es tuya.</h3><p>Puedes exportar e importar tus reflexiones, logros y candidaturas, así como ajustar la apariencia y el sonido.</p><div class="button-row"><button id="backupData" class="btn primary">Exportar respaldo JSON</button><button id="importData" class="btn ghost">Importar respaldo</button></div></div>`)}
function evidenceModal(){openDialog('Guardar un logro real',`<form id="evidenceForm"><div class="form-group"><label class="label">Empresa o proyecto</label><input class="field" name="org" required maxlength="150"></div><div class="form-group"><label class="label">Rol o responsabilidad</label><input class="field" name="role" required maxlength="150"></div><div class="form-group"><label class="label">¿Qué hice realmente?</label><textarea class="field" name="fact" required maxlength="2000"></textarea></div><div class="form-group"><label class="label">¿Qué habilidad me dejó?</label><textarea class="field" name="transferable" maxlength="800"></textarea></div><div class="button-row"><button class="btn primary">Guardar logro</button></div></form>`);$('#evidenceForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);state.evidences.unshift({id:uid(),org:String(f.get('org')).trim(),role:String(f.get('role')).trim(),fact:String(f.get('fact')).trim(),transferable:String(f.get('transferable')).trim()});save();closeDialog();nav('journal');toast('Evidencia registrada')}}
function backup(){const blob=new Blob([JSON.stringify({format:'pam-mi-vision',version:2,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`pam-mi-vision-v2-respaldo-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Respaldo descargado')}
function importData(){openDialog('Restaurar respaldo',`<p>Se restaurará el contenido guardado en el archivo JSON y reemplazará las entradas actuales. Antes de importar, exporta un respaldo si quieres conservarlas.</p><div class="form-group"><label for="restoreFile" class="label">Archivo de Pam · Mi visión</label><input type="file" id="restoreFile" class="field" accept="application/json,.json"></div><div class="button-row"><button class="btn primary" id="restoreConfirm">Restaurar</button></div>`);$('#restoreConfirm').onclick=async()=>{const f=$('#restoreFile').files[0];if(!f)return toast('Elige un archivo');try{const d=JSON.parse(await f.text());if(d.format!=='pam-mi-vision'||d.version!==2||!d.state||!Array.isArray(d.state.journal)||!Array.isArray(d.state.applications)||!Array.isArray(d.state.firstWeek))throw Error('Formato incompatible');state={...clone(defaultState),...d.state};save();closeDialog();applyPrefs();nav('vision');toast('Respaldo restaurado')}catch(e){toast('Archivo inválido o de otra versión')}}}
function bindGeneric(){ $$('[data-route]').forEach(b=>{b.onclick=()=>nav(b.dataset.route)});$$('[data-program]').forEach(b=>b.onclick=()=>openProgram(b.dataset.program));}
function bindView(){bindGeneric();$$('[data-task]').forEach(b=>b.onchange=e=>{state.firstWeek[Number(b.dataset.task)].done=e.target.checked;save();nav('route')});$$('[data-track]').forEach(b=>b.onclick=()=>{selectedTrack=b.dataset.track;nav('route')});$$('[data-diary]').forEach(b=>b.onclick=()=>{diaryTab=b.dataset.diary;nav('journal')});$$('[data-delete-app]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar esta oportunidad?')){state.applications=state.applications.filter(x=>x.id!==b.dataset.deleteApp);save();nav('route')}});$$('[data-delete-journal]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar esta entrada del diario?')){state.journal=state.journal.filter(x=>x.id!==b.dataset.deleteJournal);save();nav('journal')}});$$('[data-delete-evidence]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar este logro?')){state.evidences=state.evidences.filter(x=>x.id!==b.dataset.deleteEvidence);save();nav('journal')}});
if($('#addApplication'))$('#addApplication').onclick=applicationModal;if($('#addEvidence'))$('#addEvidence').onclick=evidenceModal;if($('#addJournal'))$('#addJournal').onclick=()=>{let content=$('#journalBody').value.trim();if(!content)return toast('Escribe primero una reflexión');state.journal.unshift({id:uid(),date:today(),title:$('#journalTitle').value.trim()||'Mi reflexión',category:$('#journalCat').value,content});save();nav('journal');toast('Entrada guardada')};if($('#saveVision'))$('#saveVision').onclick=()=>{state.vision=$('#visionText').value.trim();save();toast('Declaración guardada')};if($('#readVision'))$('#readVision').onclick=()=>narrating?stopSpeech():speak($('#visionText').value);if($('#saveWoop'))$('#saveWoop').onclick=()=>{for(let key of Object.keys(state.woop))state.woop[key]=$(`#woop-${key}`).value.trim();save();toast('Plan guardado')};if($('#backupData'))$('#backupData').onclick=backup;if($('#importData'))$('#importData').onclick=importData;const start = $('[data-action="open-last"]');
if (start) start.onclick = () => {
  const point = resumePoint();
  openProgram(point?.id || defaultProgram.id, point?.seconds || 0);
};
const restart = $('[data-action="restart"]');
if (restart) restart.onclick = () => {
  const point = resumePoint();
  state.meditationResume = null;
  save();
  openProgram(point?.id || defaultProgram.id);
}}
$('#brand').onclick=()=>nav('home');$('#fontToggle').onclick=()=>{const vals=[1,1.125,1.25,1.4];const i=vals.findIndex(x=>Math.abs(x-state.font)<.01);state.font=vals[(i+1)%vals.length];save();applyPrefs();toast(`Texto: ${Math.round(state.font*100)}%`)};$('#themeToggle').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();applyPrefs()};$('#closeDialog').onclick=closeDialog;$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog'))closeDialog()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#dialog').hidden)closeDialog()});applyPrefs();nav('home');if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
