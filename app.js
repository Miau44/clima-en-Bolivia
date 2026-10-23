/* ATMOS Bolivia - original interface and atmospheric effects.
   No framework, no build step, no API key. Demo values are always labelled.
   Optional embedded assets make the single-file edition work offline. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const asset = path => (window.ATMOS_ASSETS && window.ATMOS_ASSETS[path]) || path;
  const svg = inner => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  const cloud = '<path d="M6 17a4 4 0 1 1 .8-7.9A5.5 5.5 0 0 1 17.5 10 3.5 3.5 0 1 1 18 17Z"/>';
  const icons = {
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>'),
    storm: svg('<path d="M6 15a4 4 0 1 1 1-7.8A5 5 0 0 1 17 8a3.5 3.5 0 1 1 1 7"/><path d="m13 12-4 6h4l-2 5 6-8h-4l2-3"/>'),
    rain: svg('<path d="M6 14a4 4 0 1 1 1-7.8A5 5 0 0 1 17 7a3.5 3.5 0 1 1 1 7"/><path d="m8 17-1 3m6-3-1 3m6-3-1 3"/>'),
    wind: svg('<path d="M2 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M2 16h7a2 2 0 1 1-2 2"/>'),
    cloud: svg(cloud),
    night: svg('<path d="M20 15A8.5 8.5 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z"/><path d="M17 3v4m-2-2h4"/>'),
    snow: svg('<path d="M6 13a4 4 0 1 1 1-7.8A5 5 0 0 1 17 6a3.5 3.5 0 1 1 1 7"/><path d="M7 16v6m-2-4 4 2m-4 0 4-2m8-2v6m-2-4 4 2m-4 0 4-2"/>'),
    fog: svg('<path d="M6 11a4 4 0 1 1 1-7.8A5 5 0 0 1 17 4a3.5 3.5 0 1 1 1 7M3 15h18M5 19h14"/>'),
    drop: svg('<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/>')
  };
  const cities = {
    lapaz:{name:'La Paz',region:'LA PAZ',lat:-16.4897,lon:-68.1193,description:'Cold, rainy and cloudy with thunderstorms.',effect:'storm',temp:12,number:'01',tag:'ALTITUDE & ATMOSPHERE'},
    cocha:{name:'Cochabamba',region:'COCHABAMBA',lat:-17.3895,lon:-66.1568,description:'Warm, sunny skies over the valley.',effect:'sun',temp:27,number:'02',tag:'VALLEY & LIGHT'},
    santacruz:{name:'Santa Cruz',region:'SANTA CRUZ',lat:-17.7833,lon:-63.1821,description:'Hot and windy, with leaves moving in the breeze.',effect:'wind',temp:31,number:'03',tag:'BREEZE & MOVEMENT'}
  };
  const sceneCopy = {storm:'Clouds, rain and electricity.',sun:'Light moving with you.',wind:'Gusts, leaves and lively air.',rain:'The rhythm of the rain.',cloud:'The sky in motion.',night:'Calm as night falls.',snow:'Small winter particles.',fog:'A landscape in the mist.'};
  const sceneNames = {storm:'Thunderstorm',sun:'Sunny',wind:'Windy',rain:'Rainy',cloud:'Cloudy',night:'Clear night',snow:'Snow',fog:'Fog'};
  const backgrounds = {storm:'tormenta',sun:'sol',wind:'viento',rain:'tormenta',cloud:'tormenta',night:'tormenta',snow:'tormenta',fog:'tormenta'};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {city:'lapaz',mode:'demo',effect:'storm',fahrenheit:false,paused:reducedMotion.matches,cinema:false,intensity:.65,data:null,cache:{},customVideos:{},requestId:0,abort:null,entered:false,soundEnabled:true,volume:.25};
  const audioNodes=[$('weatherAudioA'),$('weatherAudioB')];
  const audioFiles={storm:'assets/tormenta.mp3',rain:'assets/tormenta.mp3',sun:'assets/sol.mp3',wind:'assets/viento.mp3'};
  let activeAudio=null,audioFrame=0,audioGeneration=0,audioTarget='';
  const presenterLines={lapaz:'There are many buildings in the city. People are walking with umbrellas.',cocha:'There are beautiful parks and restaurants. Families are enjoying the sunshine.',santacruz:'There are many trees and shopping centers. The wind is blowing.'};
  let toastTimer, videoSequence = 0, frontVideo = $('videoA'), currentAsset = '', lastScene = '';
  function updateSoundControls() {
    const label=state.soundEnabled?'Sound ON':'Sound OFF';
    $('soundBtn').title=label;$('soundBtn').setAttribute('aria-label',state.soundEnabled?'Turn sound off':'Turn sound on');
    $('soundBtn').setAttribute('aria-pressed',state.soundEnabled);$('soundBtn').classList.toggle('is-muted',!state.soundEnabled);
    $('volumeControl').value=Math.round(state.volume*100);$('volumeValue').textContent=Math.round(state.volume*100)+'%';
  }
  function stopAmbientSound() {
    audioGeneration++;cancelAnimationFrame(audioFrame);audioNodes.forEach(node=>{node.volume=0;node.pause();});activeAudio=null;audioTarget='';
  }
  function fadeAmbientOut() {
    if(!activeAudio)return;const old=activeAudio,generation=++audioGeneration;cancelAnimationFrame(audioFrame);
    const began=performance.now(),duration=1000;
    const fade=now=>{if(generation!==audioGeneration)return;const progress=Math.min(1,(now-began)/duration);old.volume=state.volume*(1-progress);if(progress<1)audioFrame=requestAnimationFrame(fade);else{old.pause();old.volume=0;activeAudio=null;audioTarget='';}};
    audioFrame=requestAnimationFrame(fade);
  }
  function setAmbientSound() {
    if(!state.entered||!state.soundEnabled||state.volume===0){stopAmbientSound();return;}
    if(!audioFiles[state.effect]){fadeAmbientOut();return;}
    const path=asset(audioFiles[state.effect]);
    if(activeAudio&&activeAudio.src===new URL(path,document.baseURI).href&& !activeAudio.paused){activeAudio.volume=state.volume;return;}
    const generation=++audioGeneration;cancelAnimationFrame(audioFrame);audioTarget=path;
    const old=activeAudio, next=old===audioNodes[0]?audioNodes[1]:audioNodes[0];
    next.pause();next.src=path;next.preload='auto';next.currentTime=0;next.volume=0;next.load();
    const start=()=>{
      if(generation!==audioGeneration)return;
      next.play().then(()=>{
        if(generation!==audioGeneration){if(audioTarget!==path)next.pause();return;}
        activeAudio=next;const began=performance.now(),duration=1400;
        const fade=now=>{
          if(generation!==audioGeneration)return;
          const progress=Math.min(1,(now-began)/duration);
          next.volume=state.volume*progress;if(old)old.volume=state.volume*(1-progress);
          if(progress<1)audioFrame=requestAnimationFrame(fade);else if(old){old.pause();old.volume=0;}
        };
        audioFrame=requestAnimationFrame(fade);
      }).catch(()=>{if(generation===audioGeneration){state.soundEnabled=false;updateSoundControls();toast('Ambient playback was blocked. Press Sound ON to retry.');}});
    };
    start();
  }
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const num = (value,digits=0) => finite(value) ? value.toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits}) : '\u2014';
  const temperature = value => finite(value) ? `${Math.round(state.fahrenheit ? value*9/5+32 : value)}\u00b0` : '\u2014';
  const nowInBolivia = date => new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/La_Paz'}).format(date || new Date());
  function toast(message) { $('toast').textContent=message; $('toast').classList.add('is-shown'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('is-shown'),4500); }
  function updateClock() { $('localTime').textContent=nowInBolivia(); $('todayDate').textContent=new Intl.DateTimeFormat('en-US',{day:'numeric',month:'short',timeZone:'America/La_Paz'}).format(new Date()); }
  function getDemoData(cityId,effect) {
    const c=cities[cityId]; const offsets={storm:-5,rain:-3,sun:0,wind:2};
    const temp=effect===c.effect?c.temp:(cityId==='lapaz'?16:cityId==='cocha'?26:29)+(offsets[effect]||0);
    const values={storm:[82,2.4,18,28,45],sun:[34,0,8,14,320],wind:[48,0,34,52,25],rain:[91,3.8,15,24,150]};
    const [humidity,precip,wind,gust,direction]=values[effect]||values.sun;
    const probs={storm:[85,90,80,60,40,25],rain:[80,85,70,65,55,40],sun:[0,0,5,5,10,10],wind:[10,10,15,10,20,15]};
    const hourly=Array.from({length:6},(_,i)=>({label: i===0?'Now':nowInBolivia(new Date(Date.now()+i*3600000)),temp:temp+[0,1,1,-1,-2,-3][i],prob:(probs[effect]||probs.sun)[i],scene:i>=4&&effect==='storm'?'rain':effect}));
    return {temp,feels:temp+(effect==='sun'?1:effect==='storm'?-3:effect==='wind'?-2:-1),min:temp-6,max:temp+3,humidity,precip,wind,gust,direction,sunset:cityId==='lapaz'?'18:38':cityId==='cocha'?'18:26':'18:19',scene:effect,isDay:true,hourly,condition:sceneNames[effect]};
  }
  function sceneFor(code,wind=0,gust=0,isDay=true) {
    if(code>=95) return 'storm';
    if([71,73,75,77,85,86].includes(code)) return 'snow';
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'rain';
    if(code===45||code===48) return 'fog';
    if(wind>=25||gust>=40) return 'wind';
    if(code===2||code===3) return 'cloud';
    return isDay ? 'sun':'night';
  }
  function conditionFor(code,scene) {
    if(scene==='wind') return 'Windy';
    const names={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Freezing fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',56:'Freezing drizzle',57:'Heavy freezing drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',66:'Freezing rain',67:'Heavy freezing rain',71:'Light snow',73:'Snowfall',75:'Heavy snow',77:'Snow grains',80:'Light showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm with hail',99:'Thunderstorm with heavy hail'};
    return names[code]||sceneNames[scene]||'Condition unavailable';
  }
  function normalizeWeather(raw) {
    const c=raw.current, h=raw.hourly, d=raw.daily;
    if(!c || !finite(c.temperature_2m) || !finite(c.weather_code)) throw new Error('Incomplete weather response');
    const isDay=c.is_day===1, scene=sceneFor(c.weather_code,c.wind_speed_10m,c.wind_gusts_10m,isDay);
    const hourly=[{label:'Now',temp:c.temperature_2m,prob:null,scene}];
    if(h&&Array.isArray(h.time)) {
      let start=h.time.findIndex(t=>t>c.time); if(start<0) start=h.time.length;
      const currentHour=h.time.findIndex(t=>t.slice(0,13)===c.time.slice(0,13));
      if(currentHour>=0) hourly[0].prob=h.precipitation_probability?.[currentHour];
      for(let i=start;i<Math.min(start+5,h.time.length);i++) {
        const day=h.is_day?.[i]===1;
        hourly.push({label:h.time[i].slice(11,16),temp:h.temperature_2m?.[i],prob:h.precipitation_probability?.[i],scene:sceneFor(h.weather_code?.[i],0,0,day)});
      }
    }
    return {temp:c.temperature_2m,feels:c.apparent_temperature,min:d?.temperature_2m_min?.[0],max:d?.temperature_2m_max?.[0],humidity:c.relative_humidity_2m,precip:c.precipitation,wind:c.wind_speed_10m,gust:c.wind_gusts_10m,direction:c.wind_direction_10m,sunset:d?.sunset?.[0]?.slice(11,16)||'\u2014',scene,isDay,hourly,condition:conditionFor(c.weather_code,scene),modelTime:c.time};
  }
  function directionName(degrees) {
    if(!finite(degrees))return '\u2014';
    const names=['north','northeast','east','southeast','south','southwest','west','northwest'];
    return 'From the '+names[Math.round(degrees/45)%8];
  }
  function renderTabs() {
    document.querySelectorAll('[data-temp-city]').forEach(el=>{
      const id=el.dataset.tempCity;
      el.textContent=temperature(state.mode==='demo'?(id===state.city?state.data?.temp:cities[id].temp):state.cache[id]?.data.temp);
    });
    document.querySelectorAll('.city-tab').forEach(el=>{const on=el.dataset.city===state.city;el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',on);});
  }
  function renderData(data) {
    state.data=data;
    const t=temperature(data?.temp); $('temperature').innerHTML= t==='\u2014'?'\u2014':`${t.slice(0,-1)}<span>\u00b0</span>`;
    $('condition').textContent=data?.condition||'Weather check'; $('conditionIcon').innerHTML=icons[data?.scene||'cloud'];
    $('feelsLike').textContent=temperature(data?.feels); $('minTemp').textContent=temperature(data?.min); $('maxTemp').textContent=temperature(data?.max);
    $('windSpeed').textContent=num(data?.wind); $('gustSpeed').textContent=finite(data?.gust)?`${num(data.gust)} km/h`:'\u2014';
    $('windDirection').textContent=directionName(data?.direction); $('compassArrow').style.transform=`rotate(${data?.direction||0}deg)`;
    $('humidity').innerHTML=finite(data?.humidity)?`${num(data.humidity)}<span>%</span>`:'\u2014';
    $('precipitation').innerHTML=finite(data?.precip)?`${num(data.precip,1)}<span>mm</span>`:'\u2014'; $('sunset').textContent=data?.sunset||'\u2014';
    const hours=data?.hourly||Array.from({length:6},()=>({label:'\u2014',temp:null,prob:null,scene:'cloud'}));
    $('hourlyList').innerHTML=hours.map((hour,i)=>`<div class="hour ${i===0?'is-now':''}"><span class="hour-time">${hour.label}</span>${icons[hour.scene]||icons.cloud}<strong>${temperature(hour.temp)}</strong><span class="rain-prob" title="Precipitation probability">${icons.drop}${finite(hour.prob)?Math.round(hour.prob)+'%':'\u2014'}</span></div>`).join('');
    $('forecastTitle').innerHTML=state.mode==='demo'?'NEXT HOURS <span class="muted">/ DEMO</span>':'NEXT HOURS <span class="muted">/ FORECAST</span>';
    $('panelCaption').textContent=state.mode==='demo'?'Visual scene for your presentation.':'Open-Meteo estimate for a location in this city.';
    renderTabs();
    if(data) {state.effect=data.scene; applyScene();}
  }
  function setStatus(kind,message) { $('dataStatus').className='data-status '+(kind?'is-'+kind:''); $('statusText').textContent=message; $('refreshBtn').hidden=state.mode!=='live'; }
  function setMode(mode) {
    state.mode=mode;
    $('demoBtn').classList.toggle('is-active',mode==='demo'); $('demoBtn').setAttribute('aria-pressed',mode==='demo');
    $('liveBtn').classList.toggle('is-active',mode==='live'); $('liveBtn').setAttribute('aria-pressed',mode==='live');
    if(mode==='demo') {
      state.requestId++;state.abort?.abort();state.effect=cities[state.city].effect;
      renderData(getDemoData(state.city,state.effect));setStatus('','DEMO WEATHER \u00b7 SIMULATED CONDITIONS');
    } else loadWeather();
  }
  async function loadWeather(force=false) {
    const id=++state.requestId;state.abort?.abort();const cityId=state.city;const city=cities[cityId];const cached=state.cache[cityId];
    if(!force&&cached&&Date.now()-cached.time<600000) {renderData(cached.data);setStatus('live',`LIVE WEATHER \u00b7 ${cached.data.modelTime.slice(11,16)} BOT \u00b7 OPEN-METEO`);return;}
    renderData(null);setStatus('loading','CHECKING OPEN-METEO...');
    const controller=new AbortController();state.abort=controller;const timer=setTimeout(()=>controller.abort(),14000);
    const params=new URLSearchParams({latitude:city.lat,longitude:city.lon,current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',hourly:'temperature_2m,precipitation_probability,weather_code,is_day',daily:'temperature_2m_max,temperature_2m_min,sunset',timezone:'America/La_Paz',forecast_days:'2',wind_speed_unit:'kmh'});
    try {
      const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{signal:controller.signal});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data=normalizeWeather(await response.json());
      if(id!==state.requestId||state.mode!=='live'||state.city!==cityId) return;
      state.cache[cityId]={data,time:Date.now()};renderData(data);setStatus('live',`LIVE WEATHER \u00b7 ${data.modelTime.slice(11,16)} BOT \u00b7 OPEN-METEO`);
    } catch(error) {
      if(id!==state.requestId||state.mode!=='live')return;
      renderData(null);setStatus('error','OFFLINE \u00b7 LIVE DATA UNAVAILABLE');
      $('condition').textContent='Weather could not be retrieved';
      toast('Open-Meteo could not be reached. Try again or use Explore for the demo.');
    } finally { clearTimeout(timer); }
  }
  function setCity(id) {
    if(!cities[id])return;state.city=id;const c=cities[id];
    document.body.dataset.city=id;$('cityName').textContent=c.name;const dot=document.createElement('span');dot.className='city-period';dot.textContent='.';$('cityName').append(dot);
    $('regionLabel').textContent=c.region; $('cityDescription').textContent=c.description; $('coordinate').textContent=`${Math.abs(c.lat).toFixed(4)}\u00b0 S   ${Math.abs(c.lon).toFixed(4)}\u00b0 W`;
    $('sceneNumber').textContent=c.number;$('sceneName').textContent=c.tag;$('cinemaCity').textContent=c.name;$('uploadCity').textContent=c.name.toUpperCase();$('resetVideo').hidden=!state.customVideos[id];
    $('landscape').innerHTML=landscapeFor(id);renderTabs();$('presenterNote').textContent=presenterLines[id];
    if(state.mode==='demo') {state.effect=c.effect;renderData(getDemoData(id,state.effect));setStatus('','DEMO WEATHER \u00b7 SIMULATED CONDITIONS');}
    else {state.data=null;state.effect=c.effect;applyScene();loadWeather();}
  }
  function applyScene() {
    const effect=state.effect, b=backgrounds[effect]||'tormenta';
    document.body.dataset.weather=effect;document.body.dataset.night=state.data?.isDay===false?'true':'false';
    $('sceneSub').textContent=sceneCopy[effect]||sceneCopy.cloud;
    document.querySelectorAll('.effect-button').forEach(el=>{const on=el.dataset.effect===effect;el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',on);});
    const custom=state.customVideos[state.city];
    $('videoLabel').textContent=custom?'YOUR VIDEO \u00b7 LOCAL':'3D ANIMATED BACKGROUND';
    $('poster').style.backgroundImage=`url("${asset('assets/'+b+'.jpg')}")`;
    const src=custom?.url||asset('assets/'+b+'.mp4');
    changeVideo(src,asset('assets/'+b+'.jpg'));
    setAmbientSound();
    if(lastScene!==effect){lastScene=effect;resetParticles();}
  }
  function changeVideo(src,poster) {
    if(src===currentAsset) return;currentAsset=src;const sequence=++videoSequence;
    const next=frontVideo===$('videoA')?$('videoB'):$('videoA');
    next.pause();next.muted=true;next.poster=poster;next.src=src;next.preload='auto';
    const reveal=()=>{
      if(sequence!==videoSequence)return;
      next.classList.add('is-visible');const old=frontVideo;old.classList.remove('is-visible');frontVideo=next;
      if(!state.paused&&!document.hidden) next.play().catch(()=>toast('Press the motion button to play the background.'));
      else next.pause();
      setTimeout(()=>{if(old!==frontVideo)old.pause();},1500);
    };
    next.addEventListener('loadeddata',reveal,{once:true});
    next.addEventListener('error',()=>{if(sequence===videoSequence){currentAsset='';toast('This video could not be played. The poster image remains visible.');}},{once:true});
    next.load();
  }
  function setPaused(paused,notify=false) {
    state.paused=paused;document.body.classList.toggle('is-paused',paused);$('motionBtn').setAttribute('aria-pressed',paused);
    const text=paused?'Resume animations':'Pause animations';$('motionBtn').title=text;$('motionBtn').setAttribute('aria-label',text);
    $('motionBtn').innerHTML=svg(paused?'<path d="m8 4 12 8-12 8Z"/>':'<path d="M8 5v14M16 5v14"/>');
    if(paused){$('videoA').pause();$('videoB').pause();ctx.clearRect(0,0,canvas.width,canvas.height);}
    else if(!document.hidden)frontVideo.play().catch(()=>{});
    if(notify)toast(paused?'Motion paused.':'Atmosphere in motion.');
  }
  function setCinema(on) {
    state.cinema=on;document.body.classList.toggle('cinema',on);$('cinemaControls').hidden=!on;$('cinemaBtn').setAttribute('aria-pressed',on);
    document.querySelector('.interface').inert=on;
    if(on)$('exitCinema').focus();else $('cinemaBtn').focus();
  }
  function landscapeFor(city) {
    const start='<svg viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true">';
    if(city==='lapaz') return start+'<path class="ridge-back" d="M0 220 100 193 170 215 300 164 370 183 480 143 580 171 720 85 776 122 852 30 889 84 927 65 980 122 1090 66 1180 166 1250 145 1380 218 1510 158 1600 204V300H0Z"/><path class="ridge-mid" d="M0 202 150 250 340 179 500 232 660 182 820 214 980 173 1180 240 1390 195 1600 227V300H0Z"/><path class="ridge-front" d="M0 254 100 240 260 274 390 252 560 280 730 242 910 267 1160 247 1330 271 1490 236 1600 256V300H0Z"/><g class="cable"><path d="M20 155Q300 190 590 224M20 159Q300 194 590 228"/><path d="M210 176v16m260 18v16"/></g><g class="landmark"><rect x="200" y="190" width="19" height="17" rx="4"/><rect x="461" y="225" width="18" height="16" rx="4"/></g></svg>';
    if(city==='cocha') return start+'<path class="ridge-back" d="M0 165 100 120 260 150 400 100 570 155 750 90 900 149 1080 85 1270 162 1410 112 1600 155V300H0Z"/><path class="ridge-mid" d="M0 210 170 190 340 242 520 191 750 242 990 164 1160 225 1380 179 1600 228V300H0Z"/><path class="ridge-front" d="M0 258 200 270 360 247 510 271 700 252 970 272 1130 244 1300 268 1450 215 1600 238V300H0Z"/><g class="landmark"><path d="M1435 216h30v-6h-30Z M1445 210l2-24h6l2 24Z M1447 187v-12h6v12Z M1428 180h44v4h-44Z"/><circle cx="1450" cy="172" r="4"/></g></svg>';
    return start+'<path class="ridge-back" d="M0 240Q300 195 540 242T1000 224 1600 235V300H0Z"/><path class="ridge-front" d="M0 275H120v-19h40v19h55v-33h24v33h100v-21h80v21h510v-28h40v28h100v-20h70v20h140v-30h30v30h291V300H0Z"/><g class="landmark"><path d="M1048 280v-49h27v-32h16v-15h6v15h16v32h65v-32h16v-15h6v15h16v32h27v49Z"/><path d="M1113 232q33-38 65 0Z"/><path d="M1080 199h28l-14-21ZM1189 199h24l-12-21Z"/></g><g class="landmark"><path d="M263 280Q275 225 263 164h5q19 61 7 116Z"/><g class="palm-leaves"><path d="M266 168q-47-22-70 5 34-13 70 0-18-39-50-38 31 8 50 38 2-51 20-61-8 24-17 58 42-35 69-14-35-5-69 19 46-6 58 15-27-10-58-15Z"/></g><path d="M1493 300q-15-60-5-121h5q-4 61 11 121Z"/><g class="palm-leaves"><path d="M1491 183q-43-22-67 4 37-10 67 1-18-37-46-35 30 9 47 34 1-42 18-54-9 25-14 53 37-29 62-8-30-8-62 14 39-2 53 17-28-10-54-18Z"/></g></g></svg>';
  }

  // Atmospheric layers: modest lightning, depth-aware rain, windborne leaves.
  const canvas=$('weatherCanvas'), ctx=canvas.getContext('2d');
  let width=innerWidth,height=innerHeight,dpr=1,particles=[],lastFrame=0,elapsed=0,nextBolt=3,bolt=null;
  function resizeCanvas(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);resetParticles();}
  function newParticle(randomY=true){return {x:Math.random()*width,y:randomY?Math.random()*height:-30,z:.3+Math.random()*.7,s:2+Math.random()*6,r:Math.random()*Math.PI*2,seed:Math.random()*100,shape:Math.floor(Math.random()*3)};}
  function resetParticles(){particles=Array.from({length:state.effect==='wind'?44:state.effect==='sun'?30:150},()=>newParticle());bolt=null;nextBolt=elapsed+3+Math.random()*6;}
  function makeBolt(){const x=width*(.52+Math.random()*.30), points=[[x,height*.14]];let px=x,py=height*.14;for(let i=0;i<12;i++){px+=(Math.random()-.52)*28;py+=height*.027;points.push([px,py]);}return {points,life:0,duration:.52};}
  function drawLightning(dt){
    if(state.effect!=='storm')return;
    if(elapsed>nextBolt){bolt=makeBolt();nextBolt=elapsed+10+Math.random()*9;}
    if(!bolt)return;bolt.life+=dt;if(bolt.life>bolt.duration){bolt=null;return;}
    const alpha=Math.sin(Math.PI*bolt.life/bolt.duration)*.50*state.intensity;
    const grad=ctx.createRadialGradient(width*.7,height*.2,10,width*.7,height*.2,width*.58);grad.addColorStop(0,`rgba(191,213,255,${alpha*.24})`);grad.addColorStop(1,'rgba(191,213,255,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,width,height);
    ctx.save();ctx.strokeStyle=`rgba(219,229,255,${alpha})`;ctx.lineWidth=1.1;ctx.shadowColor='#c0d8ff';ctx.shadowBlur=14;ctx.beginPath();bolt.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.lineWidth=.6;ctx.beginPath();const p=bolt.points[5];ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+35,p[1]+19);ctx.lineTo(p[0]+22,p[1]+44);ctx.lineTo(p[0]+48,p[1]+58);ctx.stroke();ctx.restore();
  }
  function drawLeaf(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);const scale=p.z*(1+state.intensity*.4);ctx.scale(scale,scale*(.4+.6*Math.abs(Math.sin(p.r*.7))));ctx.fillStyle=p.shape===0?'rgba(168,153,98,.55)':p.shape===1?'rgba(145,165,123,.62)':'rgba(213,191,137,.58)';ctx.beginPath();ctx.moveTo(-p.s*1.5,0);ctx.bezierCurveTo(-p.s,-p.s,p.s,-p.s*.8,p.s*1.5,0);ctx.bezierCurveTo(p.s,p.s,-p.s*.9,p.s*.5,-p.s*1.5,0);ctx.fill();ctx.strokeStyle='rgba(237,221,173,.28)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-p.s*1.4,0);ctx.lineTo(p.s*1.4,0);ctx.stroke();ctx.restore();}
  function animate(timestamp){
    const dt=Math.min((timestamp-lastFrame)/1000||.016,.045);lastFrame=timestamp;
    if(!state.paused&&!document.hidden){
      elapsed+=dt;ctx.clearRect(0,0,width,height);const e=state.effect, intensity=state.intensity;
      const count=Math.floor(particles.length*(.28+intensity*.72));const speed=finite(state.data?.wind)?state.data.wind:18;
      for(let i=0;i<count;i++){
        const p=particles[i];
        if(e==='rain'||e==='storm'){
          p.x+=dt*(28+speed*2)*p.z;p.y+=dt*(370+p.z*480)*(.7+intensity*.5);
          if(p.y>height+30||p.x>width+30){Object.assign(p,newParticle(false));}
          ctx.strokeStyle=`rgba(198,220,236,${(.10+p.z*.15)*intensity})`;ctx.lineWidth=.4+p.z*.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+1.8+p.z*3,p.y+10+p.z*16);ctx.stroke();
        }else if(e==='wind'){
          const gust=1+Math.sin(elapsed*1.5+p.seed*.02)*.22;
          p.x+=dt*(70+speed*4)*p.z*gust*(.6+intensity);p.y+=dt*(Math.sin(elapsed*1.8+p.seed)*26+7)*p.z;p.r+=dt*(1.3+p.z*2.2);
          if(p.x>width+40){p.x=-40;p.y=Math.random()*height;}if(p.y>height+20)p.y=-20;if(p.y< -30)p.y=height+10;
          if(p.shape!==2||p.z>.6)drawLeaf(p);else{ctx.strokeStyle='rgba(215,232,217,.13)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x+30,p.y-4,p.x+65,p.y-2);ctx.stroke();}
        }else if(e==='sun'){
          p.x+=Math.sin(elapsed*.3+p.seed)*dt*3;p.y-=dt*(3+p.z*5);if(p.y< -8)p.y=height+8;
          ctx.fillStyle=`rgba(255,234,180,${.07+Math.sin(elapsed+p.seed)**2*.16})`;ctx.beginPath();ctx.arc(p.x,p.y,.7+p.z,0,Math.PI*2);ctx.fill();
        }else if(e==='snow'){
          p.x+=Math.sin(elapsed+p.seed)*dt*12;p.y+=dt*(20+p.z*30);if(p.y>height+4)Object.assign(p,newParticle(false));ctx.fillStyle=`rgba(235,244,249,${p.z*.7})`;ctx.beginPath();ctx.arc(p.x,p.y,1+p.z*2,0,Math.PI*2);ctx.fill();
        }else if(e==='night'&&p.z>.6){ctx.fillStyle=`rgba(234,240,247,${(.1+Math.sin(elapsed*.3+p.seed)**2*.14)*intensity})`;ctx.beginPath();ctx.arc(p.x,p.y*.4,.7,0,Math.PI*2);ctx.fill();}
      }
      drawLightning(dt);
    }
    requestAnimationFrame(animate);
  }

  // Controls and keyboard-safe native dialog.
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icons[el.dataset.icon]);
  document.querySelectorAll('.city-tab').forEach(el=>el.addEventListener('click',()=>setCity(el.dataset.city)));
  document.querySelectorAll('.effect-button').forEach(el=>el.addEventListener('click',()=>{
    if(state.mode!=='demo'){setMode('demo');toast('Demo Weather: these conditions are simulated.');}
    state.effect=el.dataset.effect;renderData(getDemoData(state.city,state.effect));setStatus('','DEMO WEATHER \u00b7 SIMULATED CONDITIONS');
  }));
  $('demoBtn').addEventListener('click',()=>setMode('demo'));$('liveBtn').addEventListener('click',()=>setMode('live'));$('refreshBtn').addEventListener('click',()=>loadWeather(true));
  $('unitBtn').addEventListener('click',()=>{state.fahrenheit=!state.fahrenheit;$('unitBtn').innerHTML=state.fahrenheit?'\u00b0F <span>/ \u00b0C</span>':'\u00b0C <span>/ \u00b0F</span>';$('unitBtn').setAttribute('aria-label',state.fahrenheit?'Switch to Celsius':'Switch to Fahrenheit');renderData(state.data);});
  $('intensity').addEventListener('input',event=>{state.intensity=Number(event.target.value)/100;$('intensityValue').textContent=event.target.value+'%';});
  $('motionBtn').addEventListener('click',()=>setPaused(!state.paused,true));$('cinemaBtn').addEventListener('click',()=>setCinema(true));$('exitCinema').addEventListener('click',()=>setCinema(false));
  $('brandLink').addEventListener('click',event=>{event.preventDefault();setMode('demo');setCity('lapaz');});
  $('enterExperience').addEventListener('click',()=>{
    state.entered=true;$('welcomeScreen').classList.add('is-exiting');
    document.body.classList.remove('is-welcome');setTimeout(()=>$('welcomeScreen').classList.add('is-hidden'),reducedMotion.matches?0:850);
    updateSoundControls();setAmbientSound();if(!state.paused)frontVideo.play().catch(()=>{});
  });
  $('welcomeBack').addEventListener('click',()=>{document.body.classList.add('is-welcome');$('welcomeScreen').classList.remove('is-hidden','is-exiting');stopAmbientSound();clearInterval(timerInterval);timerInterval=null;$('timerStart').disabled=false;$('timerPause').disabled=true;});
  $('soundBtn').addEventListener('click',()=>{state.soundEnabled=!state.soundEnabled;updateSoundControls();setAmbientSound();});
  $('volumeControl').addEventListener('input',event=>{state.volume=Number(event.target.value)/100;updateSoundControls();if(state.volume===0){stopAmbientSound();return;}setAmbientSound();});
  $('nextCity').addEventListener('click',()=>{const order=Object.keys(cities),index=order.indexOf(state.city);setCity(order[(index+1)%order.length]);});
  let timerSeconds=180,timerInterval=null;
  const updateTimer=()=>{$('timerDisplay').textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`;};
  $('timerStart').addEventListener('click',()=>{if(timerInterval||timerSeconds<=0)return;$('timerStart').disabled=true;$('timerPause').disabled=false;timerInterval=setInterval(()=>{timerSeconds=Math.max(0,timerSeconds-1);updateTimer();if(timerSeconds===0){clearInterval(timerInterval);timerInterval=null;$('timerStart').disabled=false;$('timerPause').disabled=true;toast('Presentation time is up.');}},1000);});
  $('timerPause').addEventListener('click',()=>{clearInterval(timerInterval);timerInterval=null;$('timerStart').disabled=false;$('timerPause').disabled=true;});
  $('timerReset').addEventListener('click',()=>{clearInterval(timerInterval);timerInterval=null;timerSeconds=180;updateTimer();$('timerStart').disabled=false;$('timerPause').disabled=true;});
  $('notesToggle').addEventListener('click',()=>{const show=$('presenterNotes').hidden;$('presenterNotes').hidden=!show;$('notesToggle').textContent=show?'Hide Presenter Notes':'Show Presenter Notes';$('notesToggle').setAttribute('aria-pressed',show);});
  $('fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{toast('Full screen is not available in this browser.');}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreenBtn').textContent=document.fullscreenElement?'Exit Full Screen':'Full Screen';});
  function openSettings(){$('uploadCity').textContent=cities[state.city].name.toUpperCase();$('resetVideo').hidden=!state.customVideos[state.city];$('settingsDialog').showModal();}
  $('settingsBtn').addEventListener('click',openSettings);$('creditsBtn').addEventListener('click',openSettings);$('closeDialog').addEventListener('click',()=>$('settingsDialog').close());
  $('settingsDialog').addEventListener('click',event=>{if(event.target===$('settingsDialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
  $('customVideo').addEventListener('change',event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(!['video/mp4','video/webm'].includes(file.type)&&!/\.(mp4|webm)$/i.test(file.name)){toast('Choose an MP4 or WebM file.');return;}
    const old=state.customVideos[state.city];if(old)URL.revokeObjectURL(old.url);
    state.customVideos[state.city]={url:URL.createObjectURL(file),name:file.name};$('resetVideo').hidden=false;applyScene();toast('Your video is applied to '+cities[state.city].name+'. It is used for this session only.');
  });
  $('resetVideo').addEventListener('click',()=>{const old=state.customVideos[state.city];if(old)URL.revokeObjectURL(old.url);delete state.customVideos[state.city];$('resetVideo').hidden=true;$('customVideo').value='';applyScene();toast('Included background restored.');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.cinema)setCinema(false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){$('videoA').pause();$('videoB').pause();stopAmbientSound();}else {if(!state.paused)frontVideo.play().catch(()=>{});setAmbientSound();}});
  reducedMotion.addEventListener('change',event=>setPaused(event.matches));
  window.addEventListener('resize',resizeCanvas);
  window.addEventListener('beforeunload',()=>{stopAmbientSound();clearInterval(timerInterval);Object.values(state.customVideos).forEach(v=>URL.revokeObjectURL(v.url));});
  // The first visible video is explicitly loaded for offline and embedded editions.
  frontVideo.src=asset('assets/tormenta.mp4');frontVideo.poster=asset('assets/tormenta.jpg');frontVideo.muted=true;currentAsset=frontVideo.src;
  resizeCanvas();setCity('lapaz');setPaused(state.paused);updateSoundControls();updateClock();setInterval(updateClock,30000);requestAnimationFrame(animate);
})();
