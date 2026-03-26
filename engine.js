// ===== CORE ENGINE =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 960; canvas.height = 640;
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

window.addEventListener('keydown', e => { 
    if(!keys[e.key]) keysPressed[e.key]=true; 
    keys[e.key]=true; 
    
    if(!window.bgmPlayed){
        window.bgmPlayed = true;
        window.bgm = new Audio('Hollow Throne Beneath.mp3');
        window.bgm.loop = true;
        window.bgm.volume = 0.04;
        if(window.musicEnabled) {
            window.bgm.play().catch(err => console.log('BGM Play blocked:', err));
        }
    }
    
    e.preventDefault(); 
});
window.addEventListener('keyup', e => { keys[e.key]=false; e.preventDefault(); });
function clearPressed(){ for(let k in keysPressed) delete keysPressed[k]; }

// Camera with smooth lerp
class Camera {
    constructor(){ this.x=0; this.y=0; this.tx=0; this.ty=0; }
    follow(t, mW, mH){
        this.tx = t.x+t.w/2-canvas.width/2;
        this.ty = t.y+t.h/2-canvas.height/2;
        this.tx = Math.max(0, Math.min(this.tx, mW*TILE-canvas.width));
        this.ty = Math.max(0, Math.min(this.ty, mH*TILE-canvas.height));
        this.x += (this.tx-this.x)*0.08;
        this.y += (this.ty-this.y)*0.08;
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
function isSolid(t){return t===1||t===2||t===3||t===9||t===15;}

// Tile types: 0=air,1=stone,2=crystal,3=darkrock,4=spike,5=bgdetail,6=crystalglow,
// 7=moss,8=lavaglow,9=ice,10=lava,11=poison,12=falling_platform,13=arrow_trap,
// 14=timed_spike,15=cave_top(solid+stalactite)

// Seeded random
function sRand(x,y){let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}

// Biomes
const THEMES = [
    { bg: ['#050212','#0a0520','#0d0828'], stars: '#b480ff', ambient: '123,47,255', c1: '#17102a', c2: '#1e1535', c3: '#2a1e42', c4: '#201838', c5: '#120c22' }, 
    { bg: ['#120202','#200508','#280a0a'], stars: '#ff4000', ambient: '255,64,0',   c1: '#2a1010', c2: '#351515', c3: '#421e1e', c4: '#381818', c5: '#220c0c' }, 
    { bg: ['#020812','#051020','#081828'], stars: '#80c0ff', ambient: '47,150,255', c1: '#101a2a', c2: '#152235', c3: '#1e2a42', c4: '#182038', c5: '#0c1222' }, 
    { bg: ['#021205','#05200a','#08280d'], stars: '#80ff80', ambient: '47,255,47',  c1: '#102a17', c2: '#15351e', c3: '#1e422a', c4: '#183820', c5: '#0c2212' }, 
    { bg: ['#000000','#050010','#100018'], stars: '#ff0044', ambient: '200,0,50',   c1: '#0a001a', c2: '#100020', c3: '#18002a', c4: '#100018', c5: '#060010' }  
];
function getTheme(){
    if(typeof currentLevel === 'undefined') return THEMES[0];
    if(currentLevel <= 3) return THEMES[0];
    if(currentLevel === 4) return THEMES[1];
    if(currentLevel <= 6) return THEMES[2];
    if(currentLevel <= 8) return THEMES[3];
    return THEMES[4];
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
        cx.fillStyle=th.c1;cx.fillRect(0,0,32,32);
        cx.fillStyle=th.c2;cx.fillRect(0,0,32,1);cx.fillRect(0,15,32,1);
        if(v<.5){cx.fillRect(15,0,1,16);cx.fillRect(7,15,1,17);}
        else{cx.fillRect(8,0,1,16);cx.fillRect(22,15,1,17);}
        cx.fillStyle=th.c3;cx.fillRect(0,0,32,1);
        for(let i=0;i<8;i++){cx.fillStyle=sRand(i,v*100)>.5?th.c4:th.c5;cx.fillRect(sRand(i,v*50)*30,sRand(v*50,i)*30,2,2);}
    });
    else if(t===2) tc=mkTile(cx=>{
        cx.fillStyle='#1a1030';cx.fillRect(0,0,32,32);
        cx.fillStyle='#4a2888';cx.beginPath();cx.moveTo(8+v*8,32);cx.lineTo(14+v*4,4);cx.lineTo(20+v*4,32);cx.fill();
        cx.fillStyle='#7b48cc';cx.beginPath();cx.moveTo(10+v*6,28);cx.lineTo(14+v*4,8);cx.lineTo(18+v*2,28);cx.fill();
        cx.fillStyle='#b480ff';cx.fillRect(13+v*3,10,2,6);
        if(v>.3){cx.fillStyle='#5a30aa';cx.beginPath();cx.moveTo(22+v*4,32);cx.lineTo(25+v*2,14);cx.lineTo(28,32);cx.fill();}
    });
    else if(t===3) tc=mkTile(cx=>{
        cx.fillStyle='#0d0918';cx.fillRect(0,0,32,32);
        cx.strokeStyle='#15102a';cx.lineWidth=1;cx.beginPath();cx.moveTo(v*10,0);cx.lineTo(16,16);cx.lineTo(32-v*8,32);cx.stroke();
        cx.fillStyle='#1a2a1a';for(let i=0;i<3;i++) cx.fillRect(sRand(i,v*50)*30,sRand(v*50,i)*30,3,2);
    });
    else if(t===4) tc=mkTile(cx=>{
        cx.clearRect(0,0,32,32);
        for(let i=0;i<4;i++){let sx=i*8;
        cx.fillStyle='#3a1a6a';cx.beginPath();cx.moveTo(sx+4,4);cx.lineTo(sx+8,32);cx.lineTo(sx,32);cx.fill();
        cx.fillStyle='#5a2aaa';cx.beginPath();cx.moveTo(sx+4,10);cx.lineTo(sx+6,30);cx.lineTo(sx+2,30);cx.fill();
        cx.fillStyle='#b480ff';cx.fillRect(sx+3,6,2,2);}
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
        cx.fillStyle='#17102a';cx.fillRect(0,0,32,32);
        cx.fillStyle='#1e1535';cx.fillRect(0,0,32,20);
        // stalactite shape
        cx.fillStyle='#2a1e42';cx.beginPath();cx.moveTo(0,20);cx.lineTo(8+v*6,32);cx.lineTo(24-v*6,32);cx.lineTo(32,20);cx.fill();
        cx.fillStyle='#17102a';cx.beginPath();cx.moveTo(4,20);cx.lineTo(14+v*4,30);cx.lineTo(28-v*4,20);cx.fill();
    });
    tileCache[key]=tc;
    return tc;
}

function drawTile(t,px,py,c,r){
    if(t===0||t===5||t===6||t===7||t===8) {
        if(t===6){ctx.fillStyle='#7b2fff08';ctx.fillRect(px,py,TILE,TILE);}
        if(t===8){ctx.fillStyle='#ff220008';ctx.fillRect(px,py,TILE,TILE);}
        return;
    }
    if(t===12){// falling platform (drawn in game.js)
        return;
    }
    if(t===13){// arrow trap
        ctx.fillStyle='#3a2a1a';ctx.fillRect(px,py,TILE,TILE);
        ctx.fillStyle='#5a3a2a';ctx.fillRect(px+10,py+12,12,8);
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
