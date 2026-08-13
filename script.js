const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={theme:"aurora",music:true,voice:false,photo:""};
const form=$("#wishForm"),person=$("#person"),sender=$("#sender"),date=$("#date"),message=$("#message"),photo=$("#photo");
let currentData=null,audioCtx=null,musicTimer=null;

function clean(s){return String(s??"").trim()}
function encodeData(d){return btoa(unescape(encodeURIComponent(JSON.stringify(d))))}
function decodeData(s){try{return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}}
function getLink(d){const u=new URL(location.href);u.hash="wish="+encodeData(d);return u.href}
function cleanData(d){return {person:clean(d.person),sender:clean(d.sender),date:d.date||"",message:clean(d.message),theme:["aurora","nebula","sunset"].includes(d.theme)?d.theme:"aurora",music:!!d.music,voice:!!d.voice,photo:d.photo||""}}
function toast(text){const x=$("#toast");x.textContent="✓ "+text;x.classList.add("show");clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove("show"),2200)}
function stars(){const s=$("#stars");for(let i=0;i<70;i++){const e=document.createElement("i");e.className="star";e.style.left=Math.random()*100+"%";e.style.top=Math.random()*100+"%";e.style.animationDelay=(Math.random()*3).toFixed(2)+"s";s.append(e)}}
stars();

$$(".theme").forEach(b=>b.addEventListener("click",()=>{$$(".theme").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-pressed","false")});b.classList.add("active");b.setAttribute("aria-pressed","true");state.theme=b.dataset.theme;updatePreview()}));
[person,sender,message].forEach(x=>x.addEventListener("input",updatePreview));
function updatePreview(){$("#previewName").textContent=clean(person.value)||"Your surprise";$("#previewMsg").textContent=clean(message.value)||"Your message will appear here"}

photo.addEventListener("change",async()=>{const f=photo.files&&photo.files[0];if(!f)return;$("#photoLabel").textContent=f.name;state.photo=await compressImage(f);toast("Photo added")});
function compressImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext("2d").drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.76))};im.onerror=reject;im.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}

form.addEventListener("submit",async e=>{e.preventDefault();if(!clean(person.value)){toast("Add the birthday person's name");person.focus();return}if(!date.value){toast("Choose the birthday date");date.focus();return}
const data=cleanData({person:person.value,sender:sender.value,date:date.value,message:message.value,theme:state.theme,music:$("#music").checked,voice:$("#voice").checked,photo:state.photo});
const link=getLink(data);openLinkModal(link,data);
});

function openModal(id){const m=$("#"+id);m.classList.remove("hidden");m.setAttribute("aria-hidden","false")}
function closeModal(id){const m=$("#"+id);m.classList.add("hidden");m.setAttribute("aria-hidden","true")}
$$("[data-close=modal]").forEach(x=>x.addEventListener("click",()=>closeModal("linkModal")));
$$("[data-close=qr]").forEach(x=>x.addEventListener("click",()=>closeModal("qrModal")));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal("linkModal");closeModal("qrModal")}});

let pendingLink="";
function openLinkModal(link,data){pendingLink=link;$("#linkText").textContent=link;$("#openLink").onclick=()=>{closeModal("linkModal");showMovie(data)};$("#copyLink").onclick=async()=>{const ok=await copyText(link);if(ok)toast("Link copied!");else toast("Copy unavailable — long-press the link")};openModal("linkModal")}
async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch{}const ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand("copy")}catch{}ta.remove();return ok}

function paramsData(){const h=location.hash;if(!h.startsWith("#wish="))return null;return decodeData(h.slice(6))}
function showMovie(data){currentData=data;$("#creator").classList.add("hidden");$("#movie").classList.remove("hidden");resetScenes();$("#musicBtn").textContent=data.music?"♪":"×";$("#openBtn").onclick=()=>playMovie(data);$("#creatorBtn").onclick=()=>{location.hash="";location.reload()}}
function resetScenes(){$$(".scene").forEach(s=>s.classList.remove("active"));$("#sceneIntro").classList.add("active")}
function scene(id){$$(".scene").forEach(s=>s.classList.remove("active"));$("#"+id).classList.add("active")}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function spawnParticles(n=55, kind="normal"){
 const stage=$("#movieStage");
 for(let i=0;i<n;i++){
  const p=document.createElement("i");
  p.className=kind==="big"?"confetti big":(Math.random()<.25?"confetti":"particle");
  p.style.setProperty("--x",(Math.random()*1050-525)+"px");
  p.style.setProperty("--y",(Math.random()*800-400)+"px");
  p.style.background=["#fff","#d8b4ff","#9edcff","#ffb8df","#ffd68a"][Math.floor(Math.random()*5)];
  stage.append(p);setTimeout(()=>p.remove(),2200);
 }
}
function createCuteFloaters(){
 const box=$("#floaters");if(!box)return;
 box.innerHTML="";
 const symbols=["♥","♡","✦","✧","⋆"];
 for(let i=0;i<28;i++){
  const e=document.createElement("span");
  e.className="cute-floater "+(i%4===0?"balloon":i%2?"heart":"star");
  if(!e.classList.contains("balloon"))e.textContent=symbols[i%symbols.length];
  e.style.setProperty("--left",(Math.random()*100)+"%");
  e.style.setProperty("--size",(11+Math.random()*17)+"px");
  e.style.setProperty("--dur",(6+Math.random()*5)+"s");
  e.style.setProperty("--delay",(Math.random()*2.4)+"s");
  e.style.setProperty("--drift",((Math.random()*2-1)*65)+"px");
  e.style.setProperty("--tone",["#ffb9e7","#d8b4ff","#9edcff","#ffe0a8"][i%4]);
  e.style.setProperty("--balloon1",["#c28cff","#ff9fd0","#80b7ff","#ffd17f"][i%4]);
  e.style.setProperty("--balloon2",["#7254db","#d967a8","#4d83df","#eaa74f"][i%4]);
  box.append(e);
 }
}
function fireworkBurst(){
 const field=$("#fireworkField");if(!field)return;
 field.innerHTML="";
 const colors=["#ffffff","#d8b4ff","#9edcff","#ffb8df","#ffd68a","#b8ffd8"];
 const stage=$("#movieStage");
 // Several staggered shells: a stronger, unmistakable firework climax.
 const shells=[
  {x:18,y:30,d:0},{x:50,y:20,d:180},{x:82,y:31,d:320},
  {x:31,y:48,d:470},{x:69,y:47,d:620},{x:50,y:35,d:790}
 ];
 shells.forEach((s,wi)=>{
  setTimeout(()=>{
   if(!field.isConnected)return;
   const c=colors[wi%colors.length];
   const ring=document.createElement("i");ring.className="firework-ring";
   ring.style.setProperty("--x",s.x+"%");ring.style.setProperty("--y",s.y+"%");ring.style.setProperty("--c",c);
   field.append(ring);
   // bright core
   const core=document.createElement("i");core.className="firework-core";
   core.style.setProperty("--x",s.x+"%");core.style.setProperty("--y",s.y+"%");core.style.setProperty("--c",c);
   field.append(core);
   // long radial sparks + tiny secondary sparks
   for(let k=0;k<28;k++){
    const p=document.createElement("i");p.className="firework";
    const a=(Math.PI*2*k/28)+Math.random()*.12,dist=75+Math.random()*125;
    const bx=Math.cos(a)*dist,by=Math.sin(a)*dist;
    p.style.setProperty("--x",s.x+"%");p.style.setProperty("--y",s.y+"%");p.style.setProperty("--c",c);
    p.style.setProperty("--shadow",`${bx}px ${by}px 0 0 ${c},${bx*.62}px ${by*.62}px 0 0 ${c}`);
    p.style.setProperty("--sx",bx+"px");p.style.setProperty("--sy",by+"px");
    p.style.animationDelay=(Math.random()*.09)+"s";
    field.append(p);
   }
   for(let k=0;k<12;k++){
    const p=document.createElement("i");p.className="firework-mini";
    const a=Math.random()*Math.PI*2,dist=35+Math.random()*85;
    p.style.setProperty("--x",s.x+"%");p.style.setProperty("--y",s.y+"%");p.style.setProperty("--c",colors[(wi+k+2)%colors.length]);
    p.style.setProperty("--sx",Math.cos(a)*dist+"px");p.style.setProperty("--sy",Math.sin(a)*dist+"px");
    field.append(p);
   }
  },s.d);
 });
 // Full-screen sparkle wave and a final confetti rain.
 setTimeout(()=>spawnParticles(220,"big"),450);
 setTimeout(()=>spawnParticles(180,"big"),1050);
 setTimeout(()=>{const flash=document.createElement("i");flash.className="celebration-flash";field.append(flash)},780);
 setTimeout(()=>{const ripple=document.createElement("i");ripple.className="halo-ripple";field.append(ripple)},820);
 setTimeout(()=>field.innerHTML="",4200);
}
function clearCelebration(){if($("#floaters"))$("#floaters").innerHTML="";if($("#fireworkField"))$("#fireworkField").innerHTML=""}

async function playMovie(d){
 $("#openBtn").disabled=true;
 clearCelebration();
 if(d.music)startMusic();

 // Opening: tiny hearts, balloons and stars — gentle, not childish.
 createCuteFloaters();
 scene("sceneName");
 const name=d.person;$("#nameReveal").textContent="";
 for(const ch of name){$("#nameReveal").textContent+=ch;await wait(65)}
 await wait(500);

 // Countdown: each number gets its own pulse, mini burst and rising decorations.
 scene("sceneCountdown");
 for(const n of [3,2,1]){
  $("#countNum").textContent=n;
  $("#countNum").style.animation="none";void $("#countNum").offsetWidth;
  $("#countNum").style.animation="countPulse .8s cubic-bezier(.2,.9,.25,1)";
  spawnParticles(24);
  await wait(820);
 }

 // Birthday climax: fireworks, light burst, confetti and a soft celebratory glow.
 $("#birthdayName").textContent=name;$("#finalName").textContent=name;
 $("#todayBadge").classList.toggle("hidden",!isToday(d.date));
 $("#sceneBirthday").classList.remove("celebrate-now"); void $("#sceneBirthday").offsetWidth; $("#sceneBirthday").classList.add("celebrate-now");
 const sheen=document.createElement("i");sheen.className="scene-sheen";$("#sceneBirthday").append(sheen);
 scene("sceneBirthday");
 fireworkBurst();
 await wait(2800);
 sheen.remove();

 $("#prettyDate").textContent=prettyDate(d.date);$("#dateStatus").textContent=dateStatus(d.date);renderCountdown(d.date);
 scene("sceneDate");await wait(2800);

 if(d.photo){$("#heroPhoto").src=d.photo;scene("scenePhoto");await wait(2000)}

 $("#letterText").textContent=d.message||"Wishing you a beautiful year filled with moments worth remembering.";
 $("#letterFrom").textContent=d.sender?"— "+d.sender:"";
 $("#envelope").classList.remove("open");
 scene("sceneLetter");await wait(650);$("#envelope").classList.add("open");
 if(d.voice){$("#voiceBtn").classList.remove("hidden");$("#voiceBtn").onclick=()=>speak(d.message||"Wishing you a beautiful year filled with moments worth remembering.")}
 await wait(6000);
 clearCelebration();scene("sceneFinal");spawnParticles(130,"big");
}
function isToday(s){if(!s)return false;const d=new Date(s+"T00:00:00"),n=new Date();return d.getMonth()===n.getMonth()&&d.getDate()===n.getDate()}
function prettyDate(s){return new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(new Date(s+"T00:00:00"))}
function dateStatus(s){const d=new Date(s+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);const diff=d-n;if(diff===0)return"IT'S TODAY · LET THE CELEBRATION BEGIN";return diff>0?"COUNTING DOWN TO THE SPECIAL DAY":"A DAY WORTH CELEBRATING, ALWAYS"}
function renderCountdown(s){const box=$("#countdown");if(!s)return;const target=new Date(s+"T23:59:59");const tick=()=>{const ms=target-new Date();if(ms<=0){box.innerHTML="<div><b>NOW</b><span>CELEBRATE</span></div>";return}const vals=[[Math.floor(ms/864e5),"DAYS"],[Math.floor(ms%864e5/36e5),"HOURS"],[Math.floor(ms%36e5/6e4),"MINUTES"],[Math.floor(ms%6e4/1e3),"SECONDS"]];box.innerHTML=vals.map(v=>`<div><b>${String(v[0]).padStart(2,"0")}</b><span>${v[1]}</span></div>`).join("")};tick();clearInterval(window._countdown);window._countdown=setInterval(tick,1000)}
function startMusic(){
 try{
  const audio=$("#bgMusic");
  if(!audio)return;
  audio.volume=.48;
  const p=audio.play();
  if(p&&p.catch)p.catch(()=>{});
 }catch{}
}
$("#musicBtn").addEventListener("click",()=>{
 const audio=$("#bgMusic");
 if(!audio)return;
 if(!audio.paused){audio.pause();$("#musicBtn").textContent="♪";toast("Music paused");}
 else{startMusic();$("#musicBtn").textContent="♫";toast("Music playing");}
});
function speak(text){if(!("speechSynthesis"in window)){toast("Voice is unavailable here");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=1.02;speechSynthesis.speak(u)}

$("#replay").onclick=()=>playMovie(currentData);
$("#create").onclick=()=>{location.hash="";location.reload()};
$("#share").onclick=async()=>{const link=getLink(currentData);if(navigator.share){try{await navigator.share({title:"A birthday surprise",url:link})}catch{}}else if(await copyText(link))toast("Link copied!") ;else openLinkModal(link,currentData)};
$("#qr").onclick=()=>openQR(getLink(currentData),currentData.person);
async function openQR(link,name){openModal("qrModal");$("#qrName").textContent=name||"Birthday surprise";const box=$("#qrBox");box.innerHTML="";try{const canvas=await makeQR(link);box.append(canvas);$("#qrDownload").onclick=()=>{const a=document.createElement("a");a.download="cute-wishing-qr.png";a.href=canvas.toDataURL("image/png");a.click()}}catch{box.textContent="QR is unavailable in this browser."}}
async function makeQR(text){/* Lightweight offline visual QR-like code. For reliable scanning, a standards-compliant QR library should be bundled; this fallback never calls a remote service. */const size=29,grid=Array.from({length:size},()=>Array(size).fill(false));const finder=(x,y)=>{for(let j=0;j<7;j++)for(let i=0;i<7;i++)grid[y+j][x+i]=i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4)};finder(0,0);finder(size-7,0);finder(0,size-7);let bytes=[...new TextEncoder().encode(text)],k=0;for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!grid[y][x]&&!(x<7&&y<7)&&!(x>=size-7&&y<7)&&!(x<7&&y>=size-7))grid[y][x]=((bytes[k++%bytes.length]>>((x+y)%8))&1)===1;const scale=8,c=document.createElement("canvas");c.width=c.height=size*scale;const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#090817";for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(grid[y][x])ctx.fillRect(x*scale,y*scale,scale,scale);return c}

const incoming=paramsData();if(incoming&&incoming.person){showMovie(cleanData(incoming))}else updatePreview();
