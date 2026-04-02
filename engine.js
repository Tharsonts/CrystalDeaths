// ===== CORE ENGINE =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280; canvas.height = 720;
const TILE = 32;
const GRAVITY = 0.4;
const MAX_FALL = 10;

// --- AUDIO SYSTEM ---
const AUDIO = new (window.AudioContext || window.webkitAudioContext)();
function sfx(type){
    if(AUDIO.state==='suspended') AUDIO.resume();
    let osc=AUDIO.createOscillator(), gain=AUDIO.createGain();
    osc.connect(gain); gain.connect(AUDIO.destination);
    let t=AUDIO.currentTime;
    if(type==='hit'){ osc.type='square'; osc.frequency.setValueAtTime(150,t); osc.frequency.exponentialRampToValueAtTime(40,t+.1); gain.gain.setValueAtTime(.09,t); gain.gain.exponentialRampToValueAtTime(.001,t+.1); osc.start(t); osc.stop(t+.1); }
    else if(type==='playerHit'){ osc.type='sawtooth'; osc.frequency.setValueAtTime(300,t); osc.frequency.exponentialRampToValueAtTime(100,t+.2); gain.gain.setValueAtTime(.14,t); gain.gain.exponentialRampToValueAtTime(.001,t+.2); osc.start(t); osc.stop(t+.2); }
    else if(type==='attack'){ osc.type='sine'; osc.frequency.setValueAtTime(550,t); osc.frequency.exponentialRampToValueAtTime(140,t+.08); gain.gain.setValueAtTime(.07,t); gain.gain.linearRampToValueAtTime(.001,t+.08); osc.start(t); osc.stop(t+.08); }
    else if(type==='super'){ osc.type='sawtooth'; osc.frequency.setValueAtTime(800,t); osc.frequency.linearRampToValueAtTime(300,t+.3); gain.gain.setValueAtTime(.07,t); gain.gain.exponentialRampToValueAtTime(.001,t+.3); osc.start(t); osc.stop(t+.3); }
    else if(type==='bossHurt'){ osc.type='square'; osc.frequency.setValueAtTime(120,t); osc.frequency.exponentialRampToValueAtTime(60,t+.15); gain.gain.setValueAtTime(.12,t); gain.gain.exponentialRampToValueAtTime(.001,t+.15); osc.start(t); osc.stop(t+.15); }
    else if(type==='bossShoot'){ osc.type='triangle'; osc.frequency.setValueAtTime(400,t); osc.frequency.exponentialRampToValueAtTime(800,t+.2); gain.gain.setValueAtTime(.09,t); gain.gain.exponentialRampToValueAtTime(.001,t+.2); osc.start(t); osc.stop(t+.2); }
    else if(type==='bossSlam'){ osc.type='sine'; osc.frequency.setValueAtTime(100,t); osc.frequency.exponentialRampToValueAtTime(20,t+.4); gain.gain.setValueAtTime(.22,t); gain.gain.exponentialRampToValueAtTime(.001,t+.4); osc.start(t); osc.stop(t+.4); }
    else if(type==='bat'){ osc.type='triangle'; osc.frequency.setValueAtTime(800,t); osc.frequency.exponentialRampToValueAtTime(900,t+.1); gain.gain.setValueAtTime(.03,t); gain.gain.exponentialRampToValueAtTime(.001,t+.1); osc.start(t); osc.stop(t+.1); }
    else if(type==='golem'){ osc.type='square'; osc.frequency.setValueAtTime(60,t); osc.frequency.exponentialRampToValueAtTime(40,t+.2); gain.gain.setValueAtTime(.09,t); gain.gain.exponentialRampToValueAtTime(.001,t+.2); osc.start(t); osc.stop(t+.2); }
    else if(type==='orb'){ osc.type='sine'; osc.frequency.setValueAtTime(600,t); osc.frequency.linearRampToValueAtTime(650,t+.3); gain.gain.setValueAtTime(.07,t); gain.gain.exponentialRampToValueAtTime(.001,t+.3); osc.start(t); osc.stop(t+.3); }
    else if(type==='jump'){ osc.type='sine'; osc.frequency.setValueAtTime(180,t); osc.frequency.exponentialRampToValueAtTime(90,t+.25); gain.gain.setValueAtTime(.06,t); gain.gain.exponentialRampToValueAtTime(.001,t+.25); osc.start(t); osc.stop(t+.25); }
    else if(type==='pickup'){ osc.type='sine'; osc.frequency.setValueAtTime(500,t); osc.frequency.linearRampToValueAtTime(900,t+.15); gain.gain.setValueAtTime(.08,t); gain.gain.exponentialRampToValueAtTime(.001,t+.15); osc.start(t); osc.stop(t+.15); }
    else if(type==='explosion'){
        // Use noise-like burst: two oscillators
        osc.type='sawtooth'; osc.frequency.setValueAtTime(80,t); osc.frequency.exponentialRampToValueAtTime(15,t+.5);
        gain.gain.setValueAtTime(.35,t); gain.gain.exponentialRampToValueAtTime(.001,t+.5); osc.start(t); osc.stop(t+.5);
        let osc2=AUDIO.createOscillator(),g2=AUDIO.createGain();
        osc2.connect(g2);g2.connect(AUDIO.destination);
        osc2.type='square'; osc2.frequency.setValueAtTime(200,t); osc2.frequency.exponentialRampToValueAtTime(30,t+.35);
        g2.gain.setValueAtTime(.2,t); g2.gain.exponentialRampToValueAtTime(.001,t+.35); osc2.start(t); osc2.stop(t+.35);
    }
}

// Input
const keys = {}, keysPressed = {};
window.bgmPlayed = false;
window.musicEnabled = true;
window.bgm = null;

// --- KEYBIND SYSTEM ---
const KB_SAVE_KEY='crystal_depths_keybinds';
const KB_DEFAULTS={
    left:['ArrowLeft','a'], right:['ArrowRight','d'],
    jump:['ArrowUp',' ','w'], attack:['z','Mouse0'],
    dash:['x','Shift'], special:['e'],
    special1:['1'], special2:['2'], special3:['3']
};
let keyBinds={};
function loadKeyBinds(){
    let def=JSON.parse(JSON.stringify(KB_DEFAULTS));
    try{let s=JSON.parse(localStorage.getItem(KB_SAVE_KEY));if(s&&s.left){
        // Merge: add any new default keys missing from saved binds
        for(let act in def){if(!s[act])s[act]=def[act];
            else{def[act].forEach(k=>{if(s[act].indexOf(k)<0)s[act].push(k);});}
        }
        return s;
    }}catch(e){}
    return def;
}
function saveKeyBinds(){localStorage.setItem(KB_SAVE_KEY,JSON.stringify(keyBinds));}
keyBinds=loadKeyBinds();
function kbMatch(action,key){return keyBinds[action]&&keyBinds[action].indexOf(key)>=0;}
function kbCheck(action){for(let i=0;i<keyBinds[action].length;i++)if(keys[keyBinds[action][i]])return true;return false;}
function kbPressed(action){for(let i=0;i<keyBinds[action].length;i++)if(keysPressed[keyBinds[action][i]])return true;return false;}
function keyDisplayName(k){
    if(k===' ')return'ESPAÇO';if(k==='ArrowLeft')return'←';if(k==='ArrowRight')return'→';
    if(k==='ArrowUp')return'↑';if(k==='ArrowDown')return'↓';if(k==='Shift')return'SHIFT';
    if(k==='Control')return'CTRL';if(k==='Escape')return'ESC';if(k==='Enter')return'ENTER';
    if(k==='Mouse0')return'🖱 ESQ';if(k==='Mouse1')return'🖱 MEIO';if(k==='Mouse2')return'🖱 DIR';
    return k.toUpperCase();
}

// Keybind UI
let kbListening=null;
function buildKeybindUI(){
    let grid=document.getElementById('keybind-grid');if(!grid)return;
    grid.innerHTML='';
    let actions=[
        {id:'left',label:'ESQUERDA'},{id:'right',label:'DIREITA'},{id:'jump',label:'PULAR'},
        {id:'attack',label:'ATACAR'},{id:'dash',label:'DASH'},{id:'special',label:'ESPECIAL'}
    ];
    actions.forEach(a=>{
        let row=document.createElement('div');row.className='kb-row';
        let lbl=document.createElement('span');lbl.className='kb-label';lbl.textContent=a.label;
        let btn=document.createElement('button');btn.className='kb-btn';btn.dataset.action=a.id;
        btn.textContent=keyBinds[a.id].map(keyDisplayName).join(' / ');
        btn.onclick=function(){
            if(kbListening){document.querySelectorAll('.kb-btn').forEach(b=>b.classList.remove('listening'));}
            kbListening=a.id;btn.classList.add('listening');btn.textContent='...';
        };
        row.appendChild(lbl);row.appendChild(btn);grid.appendChild(row);
    });
}
window.addEventListener('keydown',function kbListen(e){
    if(!kbListening)return;
    if(e.key==='Escape'){kbListening=null;buildKeybindUI();return;}
    keyBinds[kbListening]=[e.key];saveKeyBinds();kbListening=null;buildKeybindUI();
});
canvas.addEventListener('mousedown',function kbMouseListen(e){
    if(!kbListening)return;
    e.preventDefault();e.stopPropagation();
    keyBinds[kbListening]=['Mouse'+e.button];saveKeyBinds();kbListening=null;buildKeybindUI();
},true);

window.addEventListener('keydown', e => { 
    if(kbListening)return;
    if(!keys[e.key]) keysPressed[e.key]=true; 
    keys[e.key]=true; 
    
    if(!window.bgmPlayed){
        window.bgmPlayed = true;
        if(globalThis.setMusicTrack)globalThis.setMusicTrack(typeof globalThis.currentLevel==='number'&&globalThis.currentLevel>=0?(globalThis.currentLevel===4?'boss5':globalThis.currentLevel===9?'boss10':globalThis.currentLevel===14?'boss15':'menu'):'menu');
    }
    
    e.preventDefault(); 
});
window.addEventListener('keyup', e => { keys[e.key]=false; e.preventDefault(); });
canvas.addEventListener('mousedown', e => {
    if(kbListening)return;
    let btn='Mouse'+e.button;
    if(!keys[btn]) keysPressed[btn]=true;
    keys[btn]=true;
    if(!window.bgmPlayed){
        window.bgmPlayed=true;
        if(globalThis.setMusicTrack)globalThis.setMusicTrack(typeof globalThis.currentLevel==='number'&&globalThis.currentLevel>=0?(globalThis.currentLevel===4?'boss5':globalThis.currentLevel===9?'boss10':globalThis.currentLevel===14?'boss15':'menu'):'menu');
    }
});
canvas.addEventListener('mouseup', e => { keys['Mouse'+e.button]=false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());
function clearPressed(){ for(let k in keysPressed) delete keysPressed[k]; }

// Camera with smooth lerp
class Camera {
    constructor(){ this.x=0; this.y=0; this.tx=0; this.ty=0; }
    follow(t, mW, mH){
        let speedX=Math.abs(t.vx||0),speedY=t.vy||0;
        let lookX=(t.facing||1)*(Math.min(76,18+speedX*30));
        if(speedX<0.18)lookX*=0.28;
        let lookY=speedY<-1.2?-30:speedY>2?20:0;
        let rawTx=t.x+t.w/2+lookX-canvas.width/2;
        let rawTy=t.y+t.h/2+lookY-canvas.height/2;
        if(Math.abs(rawTx-this.x)>8)this.tx=rawTx;
        if(Math.abs(rawTy-this.y)>6)this.ty=rawTy;
        this.tx = Math.max(0, Math.min(this.tx, mW*TILE-canvas.width));
        this.ty = Math.max(0, Math.min(this.ty, mH*TILE-canvas.height));
        this.x += (this.tx-this.x)*0.12;
        this.y += (this.ty-this.y)*0.1;
    }
}

// Particles
class Particle {
    constructor(x,y,vx,vy,life,color,size){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.life=life;this.maxLife=life;this.color=color;this.size=size;}
    update(){this.x+=this.vx;this.y+=this.vy;this.vy+=0.03;this.vx*=0.98;this.life--;}
    draw(cam){let a=this.life/this.maxLife;ctx.globalAlpha=a*0.8;ctx.fillStyle=this.color;let s=this.size*(0.3+a*0.7);ctx.fillRect(Math.round(this.x-cam.x),Math.round(this.y-cam.y),s,s);ctx.globalAlpha=1;}
}
class ParticleSystem {
    constructor(){this.particles=[];}
    emit(x,y,n,c,sp,spd,l,sz){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,s=Math.random()*spd;this.particles.push(new Particle(x+(Math.random()-.5)*sp,y+(Math.random()-.5)*sp,Math.cos(a)*s,Math.sin(a)*s,l+Math.random()*l*.5,c,sz||3));}}
    update(){this.particles=this.particles.filter(p=>{p.update();return p.life>0;});}
    draw(cam){this.particles.forEach(p=>p.draw(cam));}
}

// Collision
function rectCollide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function getTile(m,c,r){if(r<0||r>=m.length||c<0||c>=m[0].length)return 1;return m[r][c];}
function isSolid(t){return t===1||t===2||t===3||t===9||t===15||t===16;}

// Tile types: 0=air,1=stone,2=crystal,3=darkrock,4=spike,5=bgdetail,6=crystalglow,
// 7=moss,8=lavaglow,9=ice,10=lava,11=poison,12=falling_platform,13=arrow_trap,
// 14=timed_spike,15=cave_top(solid+stalactite),16=cactus_hazard

// Seeded random
function sRand(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}

// Biomes
const THEMES = [
    { bg: ['#030713','#0b1330','#121b44'], stars: '#8fd7ff', ambient: '120,210,255', c1: '#12233b', c2: '#1b3150', c3: '#35608a', c4: '#27496e', c5: '#081320' },
    { bg: ['#140403','#2a0906','#3a1209'], stars: '#ff8a38', ambient: '255,120,50', c1: '#3b140f', c2: '#562018', c3: '#8a3b22', c4: '#6c2b18', c5: '#240b07' },
    { bg: ['#03101b','#082138','#0d3253'], stars: '#b5efff', ambient: '120,220,255', c1: '#11273e', c2: '#173550', c3: '#2e6791', c4: '#214a72', c5: '#081624' },
    { bg: ['#050611','#0d0f25','#17153a'], stars: '#9f94ff', ambient: '140,120,255', c1: '#1a1c3a', c2: '#242850', c3: '#4a56a0', c4: '#333b78', c5: '#0b0d1d' },
    { bg: ['#021006','#072214','#0c331f'], stars: '#7fff95', ambient: '70,230,130', c1: '#123121', c2: '#1a452e', c3: '#3c8f63', c4: '#295e42', c5: '#081a11' },
    { bg: ['#04080a','#07141a','#0c232e'], stars: '#6bfff0', ambient: '70,240,230', c1: '#11313d', c2: '#184857', c3: '#2e8a9e', c4: '#246676', c5: '#081a21' },
    { bg: ['#080009','#120215','#22061d'], stars: '#ff5a7a', ambient: '255,70,110', c1: '#2a0a1b', c2: '#3a1026', c3: '#8a3554', c4: '#5a1c38', c5: '#160611' },
    { bg: ['#87CEEB','#D6C287','#EFD0AC'], stars: '#e8c840', ambient: '200,150,50', c1: '#D2B48C', c2: '#C2A278', c3: '#B8956A', c4: '#A08060', c5: '#8B7355', desert: true }
];
function getTheme(){
    let level = typeof globalThis.currentLevel === 'number' ? globalThis.currentLevel : -1;
    if(level < 0) return THEMES[0];
    if(level <= 2) return THEMES[0];
    if(level <= 4) return THEMES[1];
    if(level === 5) return THEMES[2];
    if(level === 6) return THEMES[3];
    if(level === 7) return THEMES[4];
    if(level === 8) return THEMES[5];
    if(level === 9) return THEMES[6];
    return THEMES[7];
}

// Tile cache
const tileCache={};
function mkTile(fn){let c=document.createElement('canvas');c.width=TILE;c.height=TILE;fn(c.getContext('2d'));return c;}

function getCachedTile(t,col,row){
    let th = getTheme();
    let thIdx = THEMES.indexOf(th);
    let v=sRand(col,row), key=thIdx+'_'+t+'_'+Math.floor(v*3);
    if(tileCache[key]) return tileCache[key];
    let tc;
    if(t===1) tc=mkTile(cx=>{
        if(th.desert){
            cx.fillStyle=th.c1;cx.fillRect(0,0,32,32);
            cx.fillStyle=th.c2;cx.fillRect(1,1,30,30);
            // Sandstone texture cracks
            cx.strokeStyle='#8B735544';cx.lineWidth=1;
            if(v<.33){cx.beginPath();cx.moveTo(0,12);cx.lineTo(18,16);cx.lineTo(32,10);cx.stroke();}
            else if(v<.66){cx.beginPath();cx.moveTo(6,0);cx.lineTo(14,18);cx.lineTo(28,32);cx.stroke();}
            else{cx.beginPath();cx.moveTo(32,6);cx.lineTo(20,14);cx.lineTo(8,32);cx.stroke();}
            // Sand grain speckles
            for(let i=0;i<5;i++){cx.fillStyle=sRand(i,v*77)>.5?'#B8956A':'#A08060';cx.fillRect(sRand(i,v*50)*28+2,sRand(v*50,i)*28+2,2,2);}
            // Subtle horizontal strata line
            cx.fillStyle='#8B735533';cx.fillRect(0,15,32,1);
        }else{
            let g=cx.createLinearGradient(0,0,0,32);
            g.addColorStop(0,th.c2);g.addColorStop(.48,th.c1);g.addColorStop(1,th.c5);
            cx.fillStyle=g;cx.fillRect(0,0,32,32);
            cx.fillStyle='rgba(255,255,255,.05)';cx.fillRect(1,1,30,6);
            cx.fillStyle=th.c3;cx.fillRect(1,1,30,2);cx.fillRect(1,1,2,30);
            cx.fillStyle=th.c5;cx.fillRect(1,29,30,2);cx.fillRect(29,1,2,30);
            cx.fillStyle=th.c4;cx.fillRect(0,15,32,1);
            cx.strokeStyle='rgba(255,255,255,.06)';cx.lineWidth=1;
            cx.beginPath();cx.moveTo(2,8+v*4);cx.lineTo(15,6+v*6);cx.lineTo(29,11+v*5);cx.stroke();
            cx.strokeStyle='rgba(0,0,0,.12)';cx.beginPath();cx.moveTo(5,22-v*4);cx.lineTo(16,16+v*5);cx.lineTo(27,25-v*2);cx.stroke();
            if(v<.5){cx.fillRect(15,2,1,12);cx.fillRect(7,16,1,13);}
            else{cx.fillRect(9,2,1,12);cx.fillRect(22,16,1,13);}
            for(let i=0;i<14;i++){cx.fillStyle=sRand(i,v*100)>.5?th.c4:th.c5;cx.fillRect(sRand(i,v*50)*28+2,sRand(v*50,i)*28+2,2,2);}
            cx.fillStyle='rgba(255,255,255,.04)';
            cx.fillRect(4,5,8,1);cx.fillRect(17,10,7,1);cx.fillRect(10,23,9,1);
        }
    });
    else if(t===2) tc=mkTile(cx=>{
        if(th.desert){
            // Cactus on sand
            cx.fillStyle='#C2B280';cx.fillRect(0,0,32,32);
            // Main cactus trunk
            cx.fillStyle='#2D5A27';cx.fillRect(13,4,6,28);
            cx.fillStyle='#3A7A32';cx.fillRect(14,5,4,26);
            // Left arm
            cx.fillStyle='#2D5A27';cx.fillRect(6,10,7,4);cx.fillRect(6,8,4,6);
            cx.fillStyle='#3A7A32';cx.fillRect(7,11,5,2);cx.fillRect(7,9,2,4);
            // Right arm
            cx.fillStyle='#2D5A27';cx.fillRect(19,14,7,4);cx.fillRect(22,12,4,6);
            cx.fillStyle='#3A7A32';cx.fillRect(20,15,5,2);cx.fillRect(23,13,2,4);
            // Cactus spines
            cx.fillStyle='#90EE90';cx.fillRect(12,8,1,1);cx.fillRect(19,12,1,1);cx.fillRect(13,20,1,1);cx.fillRect(18,24,1,1);
        }else{
            cx.fillStyle='#1a1030';cx.fillRect(0,0,32,32);
            cx.fillStyle='#4a2888';cx.beginPath();cx.moveTo(8+v*8,32);cx.lineTo(14+v*4,4);cx.lineTo(20+v*4,32);cx.fill();
            cx.fillStyle='#7b48cc';cx.beginPath();cx.moveTo(10+v*6,28);cx.lineTo(14+v*4,8);cx.lineTo(18+v*2,28);cx.fill();
            cx.fillStyle='#b480ff';cx.fillRect(13+v*3,10,2,6);
            if(v>.3){cx.fillStyle='#5a30aa';cx.beginPath();cx.moveTo(22+v*4,32);cx.lineTo(25+v*2,14);cx.lineTo(28,32);cx.fill();}
        }
    });
    else if(t===3) tc=mkTile(cx=>{
        if(th.desert){
            cx.fillStyle='#C2B28088';cx.fillRect(0,0,32,32);
            cx.strokeStyle='#A0806044';cx.lineWidth=1;cx.beginPath();cx.moveTo(v*10,0);cx.lineTo(16,16);cx.lineTo(32-v*8,32);cx.stroke();
            cx.fillStyle='#8B735544';for(let i=0;i<3;i++) cx.fillRect(sRand(i,v*50)*30,sRand(v*50,i)*30,3,2);
        }else{
            let g=cx.createLinearGradient(0,0,0,32);
            g.addColorStop(0,'#120f22');g.addColorStop(1,'#05070f');
            cx.fillStyle=g;cx.fillRect(0,0,32,32);
            cx.strokeStyle='rgba(90,90,140,.14)';cx.lineWidth=1;cx.beginPath();cx.moveTo(v*10,0);cx.lineTo(16,16);cx.lineTo(32-v*8,32);cx.stroke();
            cx.strokeStyle='rgba(255,255,255,.05)';cx.beginPath();cx.moveTo(4,9+v*2);cx.lineTo(17,7);cx.lineTo(27,12+v*4);cx.stroke();
            cx.fillStyle='#1a2a1a';for(let i=0;i<4;i++) cx.fillRect(sRand(i,v*50)*30,sRand(v*50,i)*30,3,2);
        }
    });
    else if(t===4) tc=mkTile(cx=>{
        cx.clearRect(0,0,32,32);
        if(th.desert){
            for(let i=0;i<4;i++){let sx=i*8;
            cx.fillStyle='#8B4513';cx.beginPath();cx.moveTo(sx+4,4);cx.lineTo(sx+8,32);cx.lineTo(sx,32);cx.fill();
            cx.fillStyle='#A0522D';cx.beginPath();cx.moveTo(sx+4,10);cx.lineTo(sx+6,30);cx.lineTo(sx+2,30);cx.fill();
            cx.fillStyle='#D2691E';cx.fillRect(sx+3,6,2,2);}
        }else{
            for(let i=0;i<4;i++){let sx=i*8;
            cx.fillStyle='#3a1a6a';cx.beginPath();cx.moveTo(sx+4,4);cx.lineTo(sx+8,32);cx.lineTo(sx,32);cx.fill();
            cx.fillStyle='#5a2aaa';cx.beginPath();cx.moveTo(sx+4,10);cx.lineTo(sx+6,30);cx.lineTo(sx+2,30);cx.fill();
            cx.fillStyle='#b480ff';cx.fillRect(sx+3,6,2,2);}
        }
    });
    else if(t===9) tc=mkTile(cx=>{
        cx.fillStyle='#1a3050';cx.fillRect(0,0,32,32);cx.fillStyle='#2a4a70';cx.fillRect(2,2,28,28);
        cx.strokeStyle='#4a7aaa';cx.lineWidth=1;cx.beginPath();cx.moveTo(4,4);cx.lineTo(24,16);cx.lineTo(28,28);cx.stroke();
        cx.fillStyle='#6aaaddaa';cx.fillRect(4,4,6,3);
    });
    else if(t===10) tc=mkTile(cx=>{
        cx.fillStyle='#4a1a0a';cx.fillRect(0,0,32,32);
        cx.fillStyle='#ff4400';cx.fillRect(2,2,28,28);
        cx.fillStyle='#ff8844';cx.fillRect(4+v*8,4,12,12);
        cx.fillStyle='#ffcc44';cx.fillRect(8+v*4,8,6,6);
    });
    else if(t===11) tc=mkTile(cx=>{
        cx.fillStyle='#0a2a1a';cx.fillRect(0,0,32,32);
        cx.fillStyle='#1a4a2a';cx.fillRect(2,2,28,28);
        cx.fillStyle='#2a6a3a55';cx.fillRect(6,6,20,20);
    });
    else if(t===15) tc=mkTile(cx=>{
        if(th.desert){
            cx.fillStyle=th.c1;cx.fillRect(0,0,32,32);
            cx.fillStyle=th.c2;cx.fillRect(0,0,32,20);
            // Hanging sandstone stalactite
            cx.fillStyle='#A0806088';cx.beginPath();cx.moveTo(2,20);cx.lineTo(10+v*4,32);cx.lineTo(22-v*4,32);cx.lineTo(30,20);cx.fill();
            cx.fillStyle='#B8956A55';cx.beginPath();cx.moveTo(6,20);cx.lineTo(16,30);cx.lineTo(26,20);cx.fill();
            cx.fillStyle='#D2B48C44';cx.fillRect(14,24,4,8);
        }else{
            cx.fillStyle=th.c1;cx.fillRect(0,0,32,32);
            cx.fillStyle=th.c2;cx.fillRect(0,0,32,20);
            cx.fillStyle=th.c3;cx.beginPath();cx.moveTo(0,20);cx.lineTo(8+v*6,32);cx.lineTo(24-v*6,32);cx.lineTo(32,20);cx.fill();
            cx.fillStyle=th.c5;cx.beginPath();cx.moveTo(4,20);cx.lineTo(14+v*4,30);cx.lineTo(28-v*4,20);cx.fill();
            cx.fillStyle=th.c4;cx.fillRect(0,19,32,1);
        }
    });
    else if(t===16) tc=mkTile(cx=>{
        if(th.desert){
            cx.fillStyle='#C2A278';cx.fillRect(0,24,32,8);
            cx.fillStyle='#D2B48C';cx.fillRect(2,24,28,4);
            cx.fillStyle='#2C5A22';cx.fillRect(12,4,8,24);
            cx.fillStyle='#3F7C31';cx.fillRect(14,6,4,20);
            cx.fillStyle='#2C5A22';cx.fillRect(6,10,6,4);cx.fillRect(8,10,4,8);
            cx.fillRect(20,14,6,4);cx.fillRect(20,14,4,8);
            cx.fillStyle='#d9ff9a';
            for(let i=0;i<6;i++)cx.fillRect(10+(i%3)*4,7+i*3,1,1);
            cx.fillRect(7,12,1,1);cx.fillRect(23,18,1,1);cx.fillRect(18,24,1,1);
        }else{
            cx.fillStyle='#2a1632';cx.fillRect(0,22,32,10);
            cx.fillStyle='#5a2a78';cx.beginPath();cx.moveTo(4,28);cx.lineTo(10,8);cx.lineTo(16,28);cx.fill();
            cx.beginPath();cx.moveTo(14,28);cx.lineTo(20,4);cx.lineTo(28,28);cx.fill();
            cx.fillStyle='#d8a8ff';cx.fillRect(9,12,2,2);cx.fillRect(20,10,2,2);
        }
    });
    tileCache[key]=tc;
    return tc;
}

function drawTile(t,px,py,c,r){
    if(t===0||t===5||t===6||t===7||t===8) {
        if(t===6){let th=getTheme();ctx.fillStyle=th.desert?'#D2B48C10':'#7b2fff08';ctx.fillRect(px,py,TILE,TILE);}
        if(t===8){ctx.fillStyle='#ff220008';ctx.fillRect(px,py,TILE,TILE);}
        return;
    }
    if(t===12){// falling platform (drawn in game.js)
        return;
    }
    if(t===13){// arrow trap
        let th=getTheme();
        ctx.fillStyle=th.desert?'#B8956A':'#3a2a1a';ctx.fillRect(px,py,TILE,TILE);
        ctx.fillStyle=th.desert?'#D2B48C':'#5a3a2a';ctx.fillRect(px+10,py+12,12,8);
        ctx.fillStyle='#ff4444';ctx.fillRect(px+8,py+14,4,4);
        return;
    }
    if(t===14){// timed spike (drawn dynamically in game.js)
        return;
    }
    let cached = getCachedTile(t,c,r);
    if(cached) ctx.drawImage(cached,px,py);
}

function drawMap(map,cam){
    let sc=Math.floor(cam.x/TILE),ec=sc+Math.ceil(canvas.width/TILE)+1;
    let sr=Math.floor(cam.y/TILE),er=sr+Math.ceil(canvas.height/TILE)+1;
    for(let r=sr;r<=er;r++) for(let c=sc;c<=ec;c++){
        let t=getTile(map,c,r);
        if(t!==0) drawTile(t,Math.round(c*TILE-cam.x),Math.round(r*TILE-cam.y),c,r);
    }
}

function drawAmbientLights(map,cam,time){
    let th = getTheme();
    let sc=Math.floor(cam.x/TILE)-2,ec=sc+Math.ceil(canvas.width/TILE)+4;
    let sr=Math.floor(cam.y/TILE)-2,er=sr+Math.ceil(canvas.height/TILE)+4;
    for(let r=sr;r<=er;r++) for(let c=sc;c<=ec;c++){
        let t=getTile(map,c,r);
        if(t===2){
            let px=Math.round(c*TILE-cam.x+16),py=Math.round(r*TILE-cam.y+16);
            let p=.08+Math.sin(time*.02+c*.5+r*.3)*.04;
            let rd=TILE*(2+Math.sin(time*.015+c)*.5);
            let g=ctx.createRadialGradient(px,py,0,px,py,rd);
            g.addColorStop(0,`rgba(${th.ambient},${p})`);g.addColorStop(1,`rgba(${th.ambient},0)`);
            ctx.fillStyle=g;ctx.fillRect(px-rd,py-rd,rd*2,rd*2);
        }
        if(t===10){
            let px=Math.round(c*TILE-cam.x+16),py=Math.round(r*TILE-cam.y+16);
            let p=.06+Math.sin(time*.03+c)*.03;
            let g=ctx.createRadialGradient(px,py,0,px,py,48);
            g.addColorStop(0,`rgba(255,68,0,${p})`);g.addColorStop(1,'rgba(255,0,0,0)');
            ctx.fillStyle=g;ctx.fillRect(px-48,py-48,96,96);
        }
    }
}

function drawBackground(cam,time){
    let th = getTheme();
    let g=ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0,th.bg[0]);g.addColorStop(.5,th.bg[1]);g.addColorStop(1,th.bg[2]);
    ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
    if(th.desert){
        if(globalThis.currentLevel===14){
            let sunX=canvas.width*.78-cam.x*.02, sunY=canvas.height*.2;
            let sun=ctx.createRadialGradient(sunX,sunY,12,sunX,sunY,130);
            sun.addColorStop(0,'rgba(255,247,196,.95)');
            sun.addColorStop(.35,'rgba(255,217,122,.5)');
            sun.addColorStop(1,'rgba(255,217,122,0)');
            ctx.fillStyle=sun;ctx.fillRect(sunX-140,sunY-140,280,280);
            ctx.fillStyle='rgba(120,82,46,.25)';
            for(let i=0;i<4;i++){
                let rx=(i*190+90)%(canvas.width+280)-140-cam.x*.025;
                let baseY=canvas.height*.58+(i%2)*18;
                ctx.fillRect(rx,baseY-70,16,70);
                ctx.fillRect(rx+26,baseY-110,20,110);
                ctx.fillRect(rx-10,baseY-12,70,12);
            }
            for(let i=0;i<7;i++){
                let hy=canvas.height*.24+i*34+Math.sin(time*.015+i)*6;
                ctx.fillStyle='rgba(255,240,180,.03)';
                ctx.fillRect(0,hy,canvas.width,2);
            }
        }
        // Distant sand dunes (back layer - lighter)
        ctx.fillStyle='#D2B48C88';
        for(let i=0;i<6;i++){
            let dx=(i*200+60)%(canvas.width+400)-200-cam.x*.01;
            let dw=180+(i*47)%100, dh=40+(i*29)%30;
            let dy=canvas.height*.5-dh+(i*23)%40;
            ctx.beginPath();ctx.moveTo(dx,dy+dh);ctx.quadraticCurveTo(dx+dw*.3,dy-10,dx+dw/2,dy);
            ctx.quadraticCurveTo(dx+dw*.7,dy-5,dx+dw,dy+dh);ctx.fill();
        }
        // Closer sand dunes (front layer - darker)
        ctx.fillStyle='#C2A27888';
        for(let i=0;i<5;i++){
            let dx=(i*170+100)%(canvas.width+300)-150-cam.x*.03;
            let dw=140+(i*37)%80, dh=30+(i*19)%25;
            let dy=canvas.height*.65-dh+(i*31)%30;
            ctx.beginPath();ctx.moveTo(dx,dy+dh);ctx.quadraticCurveTo(dx+dw/2,dy,dx+dw,dy+dh);ctx.fill();
        }
        // Cactus silhouettes in background
        for(let i=0;i<6;i++){
            let cx2=(i*157+80)%(canvas.width+200)-100-cam.x*.04;
            let cy2=canvas.height*.58+(i*17)%30;
            let h=20+(i*13)%20;
            ctx.fillStyle='#2D5A2766';
            // trunk
            ctx.fillRect(Math.round(cx2),Math.round(cy2-h),4,h);
            // arms
            if(i%2===0){ctx.fillStyle='#2D5A2766';ctx.fillRect(Math.round(cx2-6),Math.round(cy2-h*.6),6,3);ctx.fillRect(Math.round(cx2-6),Math.round(cy2-h*.6-5),3,8);}
            if(i%3!==1){ctx.fillRect(Math.round(cx2+4),Math.round(cy2-h*.4),6,3);ctx.fillRect(Math.round(cx2+7),Math.round(cy2-h*.4-6),3,9);}
        }
        // Floating sand dust particles
        for(let i=0;i<30;i++){
            let px=((i*83+time*.5)%(canvas.width+200))-100-cam.x*.06;
            let py=((i*59+Math.sin(time*.004+i)*25)%canvas.height);
            let colors=['#D2B48C','#C2A278','#E8C880','#B8956A','#DCC0A0'];
            ctx.fillStyle=colors[i%5]; ctx.globalAlpha=.2+Math.sin(time*.012+i)*.1;
            ctx.fillRect(Math.round(px),Math.round(py),2+i%3,2+i%3);
        }
        // Heat shimmer effect (wavy transparent lines)
        ctx.save();ctx.globalAlpha=.06;ctx.strokeStyle='#fff';ctx.lineWidth=1;
        for(let i=0;i<4;i++){
            let wy=canvas.height*.35+i*50+Math.sin(time*.008+i)*15;
            ctx.beginPath();
            for(let x=0;x<canvas.width;x+=15){
                let y=wy+Math.sin(time*.006+x*.015+i)*6;
                if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
            }
            ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha=1;
    }else{
        for(let layer=0;layer<4;layer++){
            let parallax=.012+layer*.012;
            ctx.fillStyle=`rgba(6,8,16,${.2+layer*.08})`;
            for(let i=0;i<5;i++){
                let dx=(i*250+layer*90)%(canvas.width+420)-210-cam.x*parallax;
                let dw=170+layer*25+(i*17)%60;
                let dh=90+layer*28+(i*31)%70;
                let dy=canvas.height*.54-layer*22+(i%2)*18;
                ctx.beginPath();
                ctx.moveTo(dx,dy+dh);
                ctx.quadraticCurveTo(dx+dw*.25,dy-18,dx+dw*.55,dy+dh*.14);
                ctx.quadraticCurveTo(dx+dw*.82,dy+16,dx+dw,dy+dh);
                ctx.fill();
            }
        }
        for(let i=0;i<4;i++){
            let rx=(i*230+80)%(canvas.width+320)-160-cam.x*.04;
            let ry=canvas.height*.46+(i%2)*16;
            ctx.fillStyle='rgba(18,22,34,.28)';
            ctx.fillRect(rx,ry-88,20,88);
            ctx.fillRect(rx+42,ry-68,18,68);
            ctx.fillRect(rx-12,ry-12,86,12);
            ctx.fillStyle='rgba(255,255,255,.03)';
            ctx.fillRect(rx+2,ry-80,2,68);
            ctx.fillRect(rx+46,ry-60,2,48);
        }
        for(let i=0;i<5;i++){
            let lx=(i*180+30)%(canvas.width+260)-130-cam.x*.018;
            let lg=ctx.createLinearGradient(lx,0,lx+90,canvas.height);
            lg.addColorStop(0,'rgba(255,255,255,.07)');
            lg.addColorStop(.24,'rgba(255,255,255,.02)');
            lg.addColorStop(1,'rgba(255,255,255,0)');
            ctx.fillStyle=lg;
            ctx.beginPath();
            ctx.moveTo(lx,0);ctx.lineTo(lx+90,0);ctx.lineTo(lx+20,canvas.height);ctx.lineTo(lx-30,canvas.height);ctx.fill();
        }
        ctx.fillStyle=th.c2;
        for(let i=0;i<12;i++){
            let bx=(i*137+20)%(canvas.width+200)-100-cam.x*.03;
            let bw=30+(i*23)%50, bh=60+(i*37)%120;
            if(bx>-bw&&bx<canvas.width+bw){ctx.beginPath();ctx.moveTo(bx,0);ctx.lineTo(bx+bw/2,bh);ctx.lineTo(bx+bw,0);ctx.fill();}
        }
        for(let i=0;i<30;i++){
            let px=((i*73+time*.08)%(canvas.width+100))-50-cam.x*.12;
            let py=((i*47+Math.sin(time*.005+i)*20)%canvas.height);
            ctx.fillStyle=th.stars; ctx.globalAlpha=.12+Math.sin(time*.01+i*.7)*.08;
            ctx.fillRect(Math.round(px),Math.round(py),1+i%2,1+i%2);
        }
        ctx.globalAlpha=1;
    }
}

function drawAtmosphereOverlay(cam,time){
    let th=getTheme();
    ctx.save();
    if(th.desert){
        for(let i=0;i<3;i++){
            let y=canvas.height*.68+i*42+Math.sin(time*.01+i)*6;
            let fog=ctx.createLinearGradient(0,y,0,y+46);
            fog.addColorStop(0,'rgba(255,236,190,0)');
            fog.addColorStop(.5,'rgba(255,236,190,.06)');
            fog.addColorStop(1,'rgba(255,236,190,0)');
            ctx.fillStyle=fog;ctx.fillRect(0,y-20,canvas.width,58);
        }
        ctx.globalCompositeOperation='screen';
        for(let i=0;i<4;i++){
            let baseX=((i*220+time*.7)%(canvas.width+260))-130-cam.x*.04;
            let baseY=canvas.height*.44+i*34+Math.sin(time*.013+i)*9;
            ctx.strokeStyle=`rgba(255,240,195,${.035+i*.01})`;
            ctx.lineWidth=20+i*3;
            ctx.beginPath();
            ctx.moveTo(baseX-40,baseY+18);
            ctx.quadraticCurveTo(baseX+40,baseY-12,baseX+190,baseY+12);
            ctx.stroke();
        }
        ctx.globalCompositeOperation='multiply';
        for(let i=0;i<3;i++){
            let edge=i===0?28:canvas.width-(i*46+64);
            let h=88+i*34;
            ctx.fillStyle=`rgba(120,88,52,${.08+i*.03})`;
            ctx.fillRect(edge,canvas.height-h,14,h);
            ctx.fillRect(edge+(i===0?18:-22),canvas.height-h*.72,18,h*.72);
            ctx.fillRect(edge-10,canvas.height-12,54,12);
        }
        for(let i=0;i<5;i++){
            let cx=i<3?22+i*18:canvas.width-48-(i-3)*22;
            let cy=canvas.height-46-(i%2)*12;
            let ch=28+i*5;
            ctx.fillStyle='rgba(50,78,40,.14)';
            ctx.fillRect(cx,cy-ch,5,ch);
            ctx.fillRect(cx-8,cy-ch*.58,8,4);
            ctx.fillRect(cx+5,cy-ch*.42,8,4);
            ctx.fillRect(cx-10,cy-ch*.58-8,4,12);
            ctx.fillRect(cx+9,cy-ch*.42-9,4,13);
        }
    }else{
        for(let i=0;i<4;i++){
            let y=canvas.height*.58+i*34+Math.sin(time*.012+i*1.7)*5;
            let fog=ctx.createLinearGradient(0,y,0,y+52);
            fog.addColorStop(0,'rgba(210,225,255,0)');
            fog.addColorStop(.5,`rgba(${th.ambient},${0.045+i*0.01})`);
            fog.addColorStop(1,'rgba(210,225,255,0)');
            ctx.fillStyle=fog;ctx.fillRect(0,y-18,canvas.width,60);
        }
        ctx.globalCompositeOperation='screen';
        for(let i=0;i<24;i++){
            let px=((i*79+time*.35)%(canvas.width+140))-70-cam.x*.05;
            let py=(i*41+Math.sin(time*.006+i)*32)%canvas.height;
            ctx.fillStyle=`rgba(${th.ambient},${.05+((i%5)*.01)})`;
            ctx.beginPath();ctx.arc(px,py,1+(i%3),0,Math.PI*2);ctx.fill();
        }
        ctx.globalCompositeOperation='multiply';
        for(let i=0;i<3;i++){
            let baseY=canvas.height-(64+i*30);
            let archW=230+i*36;
            let archX=(i*270+35)-cam.x*(.025+i*.004);
            ctx.fillStyle=`rgba(10,12,18,${.09+i*.03})`;
            ctx.beginPath();
            ctx.moveTo(archX,canvas.height);
            ctx.lineTo(archX+22,baseY);
            ctx.quadraticCurveTo(archX+archW*.48,baseY-58-i*10,archX+archW-18,baseY);
            ctx.lineTo(archX+archW,canvas.height);
            ctx.fill();
        }
        for(let i=0;i<6;i++){
            let x=(i*165+40)%(canvas.width+220)-110-cam.x*.045;
            let len=54+(i%3)*20;
            ctx.strokeStyle=`rgba(0,0,0,${.09+i*.012})`;
            ctx.lineWidth=2+(i%2);
            ctx.beginPath();
            ctx.moveTo(x,0);
            ctx.quadraticCurveTo(x+Math.sin(time*.01+i)*14,len*.45,x+Math.cos(time*.012+i)*8,len);
            ctx.stroke();
        }
        ctx.globalCompositeOperation='screen';
        for(let i=0;i<3;i++){
            let wx=(i*260+130)%(canvas.width+200)-100-cam.x*.028;
            let glow=ctx.createRadialGradient(wx,canvas.height*.56,0,wx,canvas.height*.56,90);
            glow.addColorStop(0,`rgba(${th.ambient},.05)`);
            glow.addColorStop(1,'rgba(255,255,255,0)');
            ctx.fillStyle=glow;
            ctx.fillRect(wx-90,canvas.height*.36,180,180);
        }
    }
    ctx.restore();
}
