// ===== GAME LOOP - Level Select, Save, Traps, Portal Exit =====
(function(){
const cam=new Camera(),particles=new ParticleSystem();
let player,enemies,currentMap,currentLevel=-1;
let gameState='title',gameTime=0,hitStop=0;
globalThis.currentLevel=-1;
let cutsceneBoss=null,cutsceneTimer=0,cutsceneAlpha=0;

// Save system
const SAVE_KEY='crystal_depths_save';
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{unlocked:15,completed:[]};}catch(e){return{unlocked:15,completed:[]};}}
function saveProg(save){localStorage.setItem(SAVE_KEY,JSON.stringify(save));}
let save=loadSave();
if(save.unlocked<15){save.unlocked=15;saveProg(save);}

// Trap state
let fallingPlats=[],timedSpikes=[],arrowTraps=[],arrows=[],items=[];
// Floating damage numbers
let dmgNumbers=[];
function spawnDmgNumber(x,y,val,color){
    if(typeof val==='number'){
        val=Math.round(val*10)/10;
        if(Math.abs(val-Math.round(val))<0.001)val=Math.round(val);
    }
    dmgNumbers.push({x:x,y:y,val:val,color:color||'#ffffff',life:50,maxLife:50,vx:(Math.random()-.5)*1.5,vy:-2.5});
}

// Transition state
let transition={active:false,fadeIn:false,fadeOut:false,alpha:0,nextLevel:-1,timer:0};
// Exit portal
let exitPortal={x:0,y:0,w:TILE*2,h:TILE*3,active:false,phase:0,playerNear:false,entering:false,enterTimer:0};

// UI
const titleScreen=document.getElementById('title-screen'),hud=document.getElementById('hud');
const pauseScreen=document.getElementById('pause-screen'),deathScreen=document.getElementById('death-screen');
const healthMaskRow=document.getElementById('health-mask-row'),areaName=document.getElementById('area-name');
const superBar=document.getElementById('super-bar'),superFill=document.getElementById('super-fill');
const levelLabel=document.getElementById('level-label'),levelSelect=document.getElementById('level-select');
const bossHud=document.getElementById('boss-hud'),bossFill=document.getElementById('boss-fill'),bossName=document.getElementById('boss-name');
const bossIcon=document.getElementById('boss-icon');
const superHint=document.getElementById('super-hint');
const loadOverlay=document.getElementById('loading-overlay');
const areaIntro=document.getElementById('area-intro');
let areaIntroTimer=null;
let healthMaskEls=[];
let hudAccentColor='#8fd7ff',hudReadyColor='#6cff9a';

const MUSIC_TRACKS={
    menu:'Hollow Throne Beneath.mp3',
    boss5:'bossfase5.mp3',
    boss5Final:'bossfase5vidafinal.mp3',
    boss10:'bossfase10.mp3',
    boss15:'bossfase15.mp3'
};
function getTrackForLevel(idx){
    if(idx===4)return'boss5';
    if(idx===9)return'boss10';
    if(idx===14)return'boss15';
    return'menu';
}
function setMusicTrack(key,restart){
    let src=MUSIC_TRACKS[key]||MUSIC_TRACKS.menu;
    if(window.bgm&&window.bgm._trackKey===key&&!restart)return;
    window.bgmPlayed=true;
    let next=new Audio(src);
    next.loop=true;
    next.preload='auto';
    next.volume=key==='menu'?0.04:0.055;
    next._trackKey=key;
    if(window.bgm){window.bgm.pause();window.bgm.currentTime=0;}
    window.bgm=next;
    window.currentTrackKey=key;
    if(window.musicEnabled)window.bgm.play().catch(err=>console.log('BGM Play blocked:',err));
}
globalThis.setMusicTrack=setMusicTrack;

function buildHealthHud(){
    healthMaskRow.innerHTML='';
    healthMaskEls=[];
    if(!player)return;
    for(let i=0;i<player.maxHp;i++){
        let slot=document.createElement('div');
        slot.className='mask-slot';
        let core=document.createElement('div');
        core.className='mask-core';
        let fill=document.createElement('div');
        fill.className='mask-fill';
        let shine=document.createElement('div');
        shine.className='mask-shine';
        core.appendChild(fill);
        core.appendChild(shine);
        slot.appendChild(core);
        healthMaskRow.appendChild(slot);
        healthMaskEls.push({slot,fill});
    }
}

function hexToRgba(hex,alpha){
    if(typeof hex!=='string')return `rgba(143,215,255,${alpha})`;
    let clean=hex.trim().replace('#','');
    if(clean.length===3)clean=clean.split('').map(c=>c+c).join('');
    if(clean.length!==6)return `rgba(143,215,255,${alpha})`;
    let num=parseInt(clean,16);
    let r=(num>>16)&255,g=(num>>8)&255,b=num&255;
    return `rgba(${r},${g},${b},${alpha})`;
}

function applyHudTheme(){
    if(typeof getTheme!=='function')return;
    let theme=getTheme();
    let accent=theme.stars||'#8fd7ff';
    let bg1=theme.desert?'rgba(98,78,40,.24)':hexToRgba(theme.c5||'#081320',.34);
    let bg2=theme.desert?'rgba(255,235,190,.06)':hexToRgba(theme.c2||'#1b3150',.08);
    let shadow=theme.desert?'rgba(70,42,12,.26)':hexToRgba(theme.c5||'#081320',.44);
    let bossBase=theme.desert?'#f0cf7a':(theme.c3||accent);
    hudAccentColor=theme.desert?'#f2dc97':accent;
    hudReadyColor=theme.desert?'#fff1ad':'#7fffb8';
    [hud,runeUI].forEach(el=>{
        if(!el)return;
        el.style.setProperty('--hud-accent',accent);
        el.style.setProperty('--hud-accent-soft',hexToRgba(accent,.26));
        el.style.setProperty('--hud-accent-dim',hexToRgba(accent,.08));
        el.style.setProperty('--hud-bg-1',bg1);
        el.style.setProperty('--hud-bg-2',bg2);
        el.style.setProperty('--hud-shadow',shadow);
        el.style.setProperty('--hud-boss',bossBase);
        el.style.setProperty('--hud-boss-soft',hexToRgba(bossBase,.22));
    });
}

function getBossHudMeta(boss){
    if(!boss)return null;
    if(boss.constructor.name==='Boss1'){
        let names=['Guardiao de Cristal','Guardiao Estilhacado','Coracao da Ruina'];
        let colors=['linear-gradient(90deg,#f0f6ff 0%,#8fd7ff 45%,#4a76c8 100%)','linear-gradient(90deg,#fef0cf 0%,#ffbb84 50%,#c56e45 100%)','linear-gradient(90deg,#ffe9d0 0%,#ff9f63 45%,#9f2018 100%)'];
        let icons=['crystal','shatter','ruin'];
        let auras=['#8fd7ff','#ffbb84','#ff7d54'];
        return {name:names[boss.lifeIndex]||'Guardiao de Cristal',fill:colors[boss.lifeIndex]||colors[0],icon:icons[boss.lifeIndex]||icons[0],aura:auras[boss.lifeIndex]||auras[0]};
    }
    if(boss.constructor.name==='Boss2'){
        return boss.isPhaseTwo
            ? {name:'Kraken do Abismo',fill:'linear-gradient(90deg,#f4e3ff 0%,#d37aff 46%,#7f1fd9 100%)',icon:'kraken',aura:'#d37aff'}
            : {name:'Arauto do Vazio',fill:'linear-gradient(90deg,#f5e7ff 0%,#b68bff 46%,#6524b6 100%)',icon:'void',aura:'#b68bff'};
    }
    if(boss.constructor.name==='Boss3'){
        return boss.isPhaseTwo
            ? {name:'Rei Lagarto Carmesim',fill:'linear-gradient(90deg,#fff0cf 0%,#ff8a4a 50%,#b51e15 100%)',icon:'lizard',aura:'#ff8a4a'}
            : {name:'Basilisco Solar',fill:'linear-gradient(90deg,#fff6db 0%,#e6c56a 46%,#9b6e18 100%)',icon:'basilisk',aura:'#e6c56a'};
    }
    return {name:LEVELS[currentLevel]?.name||'Boss',fill:'linear-gradient(90deg,#eee 0%,#bbb 100%)',icon:'default',aura:'#d9f4ff'};
}

function getActiveBoss(){
    if(cutsceneBoss&&cutsceneBoss.visible!==false&&(gameState==='boss2_revive'||gameState==='boss3_revive'||gameState==='cutscene'))return cutsceneBoss;
    if(!enemies)return null;
    return enemies.find(e=>e.alive&&(e.constructor.name==='Boss1'||e.constructor.name==='Boss2'||e.constructor.name==='Boss3'))||null;
}

function freezePlayerForCutscene(){
    if(!player)return;
    player.vx=0;player.vy=0;
    player.invincible=9999;
    player.attacking=false;player.attackTimer=0;
    player.sp1Active=0;player.sp2Active=0;player.sp3Active=0;
    player.blackHole=null;
}

function beginBossPhaseTwoCutscene(boss){
    if(!boss||gameState!=='playing'||boss._phaseSequenceStarted)return false;
    let isMultiForm=boss.constructor.name==='Boss2'||boss.constructor.name==='Boss3';
    if(!isMultiForm||!boss.startPhaseTwo)return false;
    boss.startPhaseTwo=false;
    boss._phaseSequenceStarted=true;
    gameState=boss.constructor.name==='Boss3'?'boss3_revive':'boss2_revive';
    cutsceneBoss=boss;
    cutsceneTimer=0;
    cutsceneAlpha=0;
    freezePlayerForCutscene();
    return true;
}

function beginBossDefeatCutscene(boss){
    if(!boss||gameState!=='playing'||boss._deathSequenceStarted)return false;
    let isBoss=boss instanceof Boss1||boss.constructor.name==='Boss2'||boss.constructor.name==='Boss3';
    if(!isBoss||boss.alive)return false;
    boss._deathSequenceStarted=true;
    gameState='cutscene';
    cutsceneBoss=boss;
    cutsceneBoss.alive=true;
    cutsceneBoss.visible=true;
    cutsceneTimer=0;
    cutsceneAlpha=0;
    freezePlayerForCutscene();
    return true;
}

function scanBossSequences(){
    if(gameState!=='playing'||!enemies)return false;
    for(let e of enemies){if(beginBossPhaseTwoCutscene(e))return true;}
    for(let e of enemies){if(beginBossDefeatCutscene(e))return true;}
    return false;
}

function updateHudState(){
    if(!player)return;
    applyHudTheme();
    if(healthMaskEls.length!==player.maxHp)buildHealthHud();
    healthMaskEls.forEach((mask,idx)=>{
        let fill=Math.max(0,Math.min(1,player.hp-idx));
        mask.fill.style.transform=`scaleY(${Math.max(.08,fill)})`;
        mask.slot.classList.toggle('empty',fill<=0);
        mask.slot.classList.toggle('partial',fill>0&&fill<1);
    });

    let inBossLevel=LEVELS[currentLevel]&&LEVELS[currentLevel].boss;
    if(inBossLevel){
        superBar.classList.remove('hidden');
        let pct=Math.max(0,Math.min(1,player.spBar/player.spBarMax));
        superFill.style.width=`${pct*100}%`;
        superFill.style.filter=pct>=1?'saturate(1.35) brightness(1.2)':'';
        if(player.sp3Active>0||player.blackHole)superHint.textContent='Buraco negro ativo';
        else if(player.sp2Active>0)superHint.textContent='Escudo espectral ativo';
        else if(player.sp1Active>0)superHint.textContent='Corte ritual em curso';
        else if(pct>=1)superHint.textContent='Pressione [E] para abrir o vazio';
        else if(pct>=.7)superHint.textContent='Pressione [E] para erguer o escudo';
        else if(pct>=.3)superHint.textContent='Pressione [E] para liberar o golpe';
        else superHint.textContent='A energia desperta ao ferir o boss';
    }else{
        superBar.classList.add('hidden');
    }

    let boss=getActiveBoss();
    if(boss&&inBossLevel){
        let meta=getBossHudMeta(boss);
        bossHud.classList.remove('hidden');
        bossName.textContent=meta.name;
        bossIcon.dataset.icon=meta.icon||'default';
        bossHud.style.setProperty('--hud-boss',meta.aura||hudAccentColor);
        bossHud.style.setProperty('--hud-boss-soft',hexToRgba(meta.aura||hudAccentColor,.22));
        bossFill.style.width=`${Math.max(0,Math.min(1,boss.hp/boss.maxHp))*100}%`;
        bossFill.style.background=meta.fill;
    }else{
        bossHud.classList.add('hidden');
        bossIcon.dataset.icon='default';
    }
}

function buildLevelSelect(){
    levelSelect.innerHTML='';
    save=loadSave();
    LEVELS.forEach((lv,i)=>{
        let card=document.createElement('div');
        card.className='level-card';
        if(lv.boss)card.classList.add('boss-card');
        if(i>=save.unlocked)card.classList.add('locked');
        if(save.completed.includes(i))card.classList.add('completed');
        card.innerHTML=`<span class="lv-num">${i+1}</span><span class="lv-name">${lv.name}</span>`;
        if(i<save.unlocked)card.onclick=()=>startLevel(i);
        levelSelect.appendChild(card);
    });
}

document.getElementById('btn-controls').onclick=()=>{
    let panel=document.getElementById('keybind-panel');
    let info=document.getElementById('controls-info');
    if(panel.classList.contains('hidden')){panel.classList.remove('hidden');info.classList.remove('hidden');buildKeybindUI();}
    else{panel.classList.add('hidden');info.classList.add('hidden');}
};
document.getElementById('btn-keybind-close').onclick=()=>{document.getElementById('keybind-panel').classList.add('hidden');document.getElementById('controls-info').classList.add('hidden');};
document.getElementById('btn-keybind-reset').onclick=()=>{keyBinds=JSON.parse(JSON.stringify(KB_DEFAULTS));saveKeyBinds();buildKeybindUI();};
document.getElementById('btn-resume').onclick=()=>{pauseScreen.classList.add('hidden');gameState='playing';};
document.getElementById('btn-retry').onclick=()=>startLevel(currentLevel);
document.getElementById('btn-quit').onclick=()=>goToMenu();
document.getElementById('btn-quit2').onclick=()=>goToMenu();
document.getElementById('btn-reset').onclick=()=>{if(confirm('Resetar todo o progresso?')){localStorage.removeItem(SAVE_KEY);save=loadSave();buildLevelSelect();}};
document.getElementById('btn-music').onclick=()=>{
    window.musicEnabled = !window.musicEnabled;
    let btn = document.getElementById('btn-music');
    if(window.musicEnabled){
        btn.textContent = 'MÚSICA: LIGADA';
        if(window.bgm) window.bgm.play().catch(e=>console.log(e));
        else setMusicTrack(getTrackForLevel(currentLevel));
    } else {
        btn.textContent = 'MÚSICA: DESLIGADA';
        if(window.bgm) window.bgm.pause();
    }
};

function goToMenu(){
    gameState='title';hud.classList.add('hidden');runeUI.classList.add('hidden');pauseScreen.classList.add('hidden');deathScreen.classList.add('hidden');
    globalThis.currentLevel=-1;
    cutsceneBoss=null;cutsceneTimer=0;cutsceneAlpha=0;
    bossHud.classList.add('hidden');
    bossIcon.dataset.icon='default';
    if(areaIntroTimer){clearTimeout(areaIntroTimer);areaIntroTimer=null;}
    areaIntro.classList.remove('active');
    areaIntro.classList.add('hidden');
    setMusicTrack('menu');
    titleScreen.classList.remove('hidden');buildLevelSelect();
}

function spawnEnemies(lvDef){
    let list=[];
    lvDef.enemies.forEach(e=>{
        let en;
        if(e.type==='crawler')en=new Crawler(e.x,e.y,e.p||4);
        else if(e.type==='bat')en=new Bat(e.x,e.y);
        else if(e.type==='golem')en=new Golem(e.x,e.y);
        else if(e.type==='boss1')en=new Boss1(e.x,e.y);
        else if(e.type==='boss2')en=new Boss2(e.x,e.y);
        else if(e.type==='boss3')en=new Boss3(e.x,e.y);
        if(en)list.push(en);
    });
    return list;
}

const runeUI = document.getElementById('rune-ui');
const runeCountText = document.getElementById('rune-count');
let runes = [];

function initTraps(lvDef){
    fallingPlats=[];timedSpikes=[];arrowTraps=[];arrows=[];
    if(!lvDef.traps)return;
    lvDef.traps.falling.forEach(f=>{fallingPlats.push({col:f[0],row:f[1],w:f[2]||1,triggered:false,fallDelay:0,vy:0,yOff:0,respawn:0});});
    lvDef.traps.timed.forEach(t=>{timedSpikes.push({col:t[0],row:t[1],active:false,phase:Math.random()*120});});
    lvDef.traps.arrows.forEach(a=>{arrowTraps.push({col:a[0],row:a[1],dir:a[2]||1,cooldown:0});});
}

function initRunes(lvDef){
    runes = [];
    player.runesCollected = 0;
    player.runesRequired = lvDef.runes ? lvDef.runes.length : 0;
    if(lvDef.runes){
        lvDef.runes.forEach(r => {
            runes.push({x: r[0]*TILE+8, y: r[1]*TILE+8, baseY: r[1]*TILE+8, w:16, h:16, collected:false, phase:Math.random()*6});
        });
    }
}

function startLevel(idx){
    currentLevel=idx;globalThis.currentLevel=idx;let lv=LEVELS[idx];
    cutsceneBoss=null;cutsceneTimer=0;cutsceneAlpha=0;
    // Clear tile cache so theme-specific tiles re-render
    for(let k in tileCache) delete tileCache[k];
    currentMap=lv.build();
    player=new Player(lv.spawn.x,lv.spawn.y);
    buildHealthHud();
    enemies=spawnEnemies(lv);
    initTraps(lv);
    initRunes(lv);
    dmgNumbers=[];items=[];
    // Snap enemies to ground
    enemies.forEach(e=>{for(let dy=0;dy<15*TILE;dy++){let row=Math.floor((e.y+dy+e.h)/TILE),col=Math.floor((e.x+e.w/2)/TILE);if(isSolid(getTile(currentMap,col,row))){e.y=row*TILE-e.h;break;}}});
    // Setup exit portal
    if(lv.exit){
        let cx=lv.exit.col*TILE+TILE,cy=lv.exit.row*TILE+TILE;
        exitPortal={x:cx-TILE,y:cy-TILE,w:TILE*2,h:TILE*2,cx:cx,cy:cy,radius:28,active:true,phase:0,playerNear:false,entering:false,enterTimer:0,suckScale:1,deniedTimer:0};
    }else{
        exitPortal={x:0,y:0,w:0,h:0,cx:0,cy:0,radius:28,active:false,phase:0,playerNear:false,entering:false,enterTimer:0,suckScale:1,deniedTimer:0};
    }
    transition={active:false,fadeIn:true,fadeOut:false,alpha:1,nextLevel:-1,timer:0};
    titleScreen.classList.add('hidden');deathScreen.classList.add('hidden');pauseScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    applyHudTheme();
    if(lv.boss) {
        superBar.classList.add('hidden');
        runeUI.classList.add('hidden');
    } else {
        superBar.classList.add('hidden'); runeUI.classList.remove('hidden');
        runeCountText.innerText = `${player.runesCollected} / ${player.runesRequired}`;
        runeCountText.style.color = hudAccentColor;
    }
    levelLabel.textContent=`Fase ${idx+1}: ${lv.name}`;
    showAreaName(lv.name);
    setMusicTrack(getTrackForLevel(idx));
    updateHudState();
    gameState='playing';
}

function showAreaName(name){
    if(areaIntroTimer){clearTimeout(areaIntroTimer);areaIntroTimer=null;}
    areaName.textContent=name;
    areaIntro.classList.remove('hidden');
    areaIntro.classList.remove('active');
    areaIntro.offsetHeight;
    areaIntro.classList.add('active');
    areaIntroTimer=setTimeout(()=>{
        areaIntro.classList.remove('active');
        areaIntro.classList.add('hidden');
        areaIntroTimer=null;
    },2200);
}

function completeLevel(){
    save=loadSave();
    if(!save.completed.includes(currentLevel))save.completed.push(currentLevel);
    if(currentLevel+1<LEVELS.length&&save.unlocked<=currentLevel+1)save.unlocked=currentLevel+2;
    saveProg(save);
}

// ---- UPDATE ----
function update(){
    // Handle transitions
    if(transition.fadeIn){transition.alpha-=.02;if(transition.alpha<=0){transition.alpha=0;transition.fadeIn=false;}return;}
    if(transition.fadeOut){
        transition.alpha+=.02;
        if(transition.alpha>=1){
            transition.fadeOut=false;transition.active=false;
            completeLevel();
            gameState='victory';
        }
        return;
    }
    
    // Boss Death Cutscene Logic
    if(gameState==='boss2_revive'){
        gameTime++; cutsceneTimer++;
        particles.update();
        let bx=cutsceneBoss.x+cutsceneBoss.w/2, by=cutsceneBoss.y+cutsceneBoss.h/2;
        if(cutsceneTimer<180){ // 3 seconds gathering energy
            cutsceneBoss.y-=0.3; // slowly rises
            if(cutsceneTimer%4===0){
                let ang=Math.random()*Math.PI*2;
                particles.emit(bx+Math.cos(ang)*100,by+Math.sin(ang)*100,2,'#a000a0',40,-2.5,15,3);
            }
        }else if(cutsceneTimer===180){ // Shockwave Explosion
                    sfx('explosion');
                    cutsceneBoss.shockRadius=10;
                    particles.emit(bx,by,80,'#ffffff',120,8,60,6);
                    cam.x+=(Math.random()-.5)*20; cam.y+=(Math.random()-.5)*20; // Big shake
        }else if(cutsceneTimer>180 && cutsceneTimer<240){
            cutsceneBoss.shockRadius+=15; // Expanding shockwave logic
            let px=player.x+player.w/2, py=player.y+player.h/2;
            let dist=Math.sqrt((bx-px)**2+(by-py)**2);
            if(dist<cutsceneBoss.shockRadius && dist>cutsceneBoss.shockRadius-20 && !player.shocked){
                player.shocked=true; // Custom flag for visual hit
                particles.emit(px,py,30,'#ffff00',40,4,20,4);
            }
        }
        if(cutsceneTimer>=180 && cutsceneTimer<330){ // 2.5s stun!
            if(cutsceneTimer%3===0) particles.emit(bx,by,5,'#ff0033',80,4,30,5);
        }else if(cutsceneTimer===330){
            particles.emit(bx,by,100,'#ff0000',100,10,60,8);
            cutsceneBoss.isPhaseTwo=true;
            cutsceneBoss.hp=GAME_TUNING.hp.boss2PhaseTwo;
            cutsceneBoss.maxHp=GAME_TUNING.hp.boss2PhaseTwo;
            cutsceneBoss.contactDamage=GAME_TUNING.damage.boss2PhaseTwo;
            gameState='playing';
            player.shocked=false;
            player.invincible=60;
        }
        return;
    }
    if(gameState==='boss3_revive'){
        gameTime++; cutsceneTimer++;
        particles.update();
        let bx=cutsceneBoss.x+cutsceneBoss.w/2, by=cutsceneBoss.y+cutsceneBoss.h/2;
        if(cutsceneTimer<180){
            cutsceneBoss.y-=0.3;
            if(cutsceneTimer%4===0){
                let ang=Math.random()*Math.PI*2;
                particles.emit(bx+Math.cos(ang)*100,by+Math.sin(ang)*100,2,'#e8c840',40,-2.5,15,3);
            }
            if(cutsceneTimer%6===0) particles.emit(bx,by,3,'#ffffff',30,3,20,4);
        }else if(cutsceneTimer===180){
            sfx('explosion');
            cutsceneBoss.shockRadius=10;
            particles.emit(bx,by,80,'#e8c840',120,8,60,6);
            particles.emit(bx,by,40,'#ffffff',100,6,50,5);
            cam.x+=(Math.random()-.5)*20; cam.y+=(Math.random()-.5)*20;
        }else if(cutsceneTimer>180 && cutsceneTimer<240){
            cutsceneBoss.shockRadius+=15;
            let px=player.x+player.w/2, py=player.y+player.h/2;
            let dist=Math.sqrt((bx-px)**2+(by-py)**2);
            if(dist<cutsceneBoss.shockRadius && dist>cutsceneBoss.shockRadius-20 && !player.shocked){
                player.shocked=true;
                particles.emit(px,py,30,'#ff4400',40,4,20,4);
            }
        }
        if(cutsceneTimer>=180 && cutsceneTimer<330){
            if(cutsceneTimer%3===0) particles.emit(bx,by,5,'#ff4400',80,4,30,5);
        }else if(cutsceneTimer===330){
            particles.emit(bx,by,100,'#ff4400',100,10,60,8);
            cutsceneBoss.isPhaseTwo=true;
            cutsceneBoss.hp=GAME_TUNING.hp.boss3PhaseTwo;
            cutsceneBoss.maxHp=GAME_TUNING.hp.boss3PhaseTwo;
            cutsceneBoss.contactDamage=GAME_TUNING.damage.boss3PhaseTwo;
            cutsceneBoss.beamActive=false;
            cutsceneBoss.projectiles=[];
            cutsceneBoss.slamWaves=[];
            cutsceneBoss.sunPillars=[];
            cutsceneBoss.afterimages=[];
            cutsceneBoss.attackCooldown=80;
            cutsceneBoss.attackType=-1;
            cutsceneBoss.phase=0;
            cutsceneBoss.phaseTimer=0;
            cutsceneBoss.beamCharge=0;
            gameState='playing';
            player.shocked=false;
            player.invincible=60;
        }
        return;
    }
    if(gameState==='boss3_finale'){
        gameTime++;cutsceneTimer++;
        if(cutsceneTimer===18)sfx('pickup');
        if(cutsceneTimer===96){sfx('bossSlam');sfx('explosion');}
        if(cutsceneTimer===220)sfx('orb');
        if(cutsceneTimer===360)sfx('super');
        if(cutsceneTimer===520){sfx('explosion');setTimeout(()=>sfx('bossSlam'),180);}
        if(cutsceneTimer>=720){
            if(keysPressed['Enter']||keysPressed['Escape']){gameState='title';goToMenu();clearPressed();}
        }
        clearPressed();return;
    }
    if(gameState==='cutscene'){
        gameTime++; cutsceneTimer++;
        particles.update();
        if(cutsceneBoss){
            let bx=cutsceneBoss.x+cutsceneBoss.w/2, by=cutsceneBoss.y+cutsceneBoss.h/2;
            
            if(cutsceneBoss.constructor.name === 'Boss3'){
                // EPIC FINALE: Boss shatters, transition to boss3_finale
                if(cutsceneTimer<120){
                    // Boss convulses and cracks appear
                    cutsceneBoss.y -= 0.2;
                    cam.x+=(Math.random()-.5)*(cutsceneTimer/30); cam.y+=(Math.random()-.5)*(cutsceneTimer/30);
                    if(cutsceneTimer%4===0){
                        particles.emit(bx+(Math.random()-.5)*40,by+(Math.random()-.5)*40,6,'#e8c840',20,2,20,3);
                        particles.emit(bx+(Math.random()-.5)*30,by+(Math.random()-.5)*30,4,'#ff4400',15,1.5,18,2);
                    }
                }else if(cutsceneTimer===120){
                    sfx('explosion');setTimeout(()=>sfx('explosion'),150);setTimeout(()=>sfx('bossSlam'),300);
                    setTimeout(()=>sfx('explosion'),500);setTimeout(()=>sfx('bossSlam'),700);
                    particles.emit(bx,by,150,'#e8c840',200,8,80,10);
                    particles.emit(bx,by,100,'#ff4400',180,10,60,8);
                    particles.emit(bx,by,80,'#ffffff',150,12,50,6);
                    cutsceneBoss.visible=false;
                }else if(cutsceneTimer>120&&cutsceneTimer<180){
                    // White flash expanding
                    cutsceneAlpha=Math.min(1,(cutsceneTimer-120)/40);
                    cam.x+=(Math.random()-.5)*6;cam.y+=(Math.random()-.5)*6;
                }else if(cutsceneTimer===180){
                    completeLevel();
                    gameState='boss3_finale';
                    cutsceneTimer=0;
                }
            }else if(cutsceneBoss.constructor.name === 'Boss2'){
                // Shadow Lord Cutscene: Floats up and dissolves into light
                if(cutsceneTimer<180){
                    cutsceneBoss.y -= 0.6; // Float up
                    if(cutsceneTimer%3===0){
                        particles.emit(bx+(Math.random()-.5)*60, cutsceneBoss.y+cutsceneBoss.h, 12, '#8844ff', 80, 2, 30, 4);
                        particles.emit(bx+(Math.random()-.5)*60, cutsceneBoss.y+cutsceneBoss.h, 6, '#ffffff', 60, 1, 25, 3);
                    }
                    cam.x+=(Math.random()-.5)*3; cam.y+=(Math.random()-.5)*3; // Slight shake
                }else if(cutsceneTimer===180){
                    // Purified in light - explosion sound + item drops
                    sfx('explosion');
                    setTimeout(()=>sfx('explosion'),200);
                    setTimeout(()=>sfx('bossSlam'),400);
                    particles.emit(bx,cutsceneBoss.y+cutsceneBoss.h/2,100,'#ffffff',150,6,100,8);
                    particles.emit(bx,cutsceneBoss.y+cutsceneBoss.h/2,80,'#d4b0ff',180,10,120,10);
                    cutsceneBoss.visible=false; // Instead of null, hide him
                    // Spawn item drops raining down
                    let types=['hp','hp','speed','jump','hp'];
                    for(let i=0;i<5;i++){
                        let ix=bx-100+(i*50);
                        items.push({x:ix,y:cutsceneBoss.y-50,w:16,h:16,vy:-3-Math.random()*2,type:types[i],life:900});
                    }
                }else if(cutsceneTimer>220&&cutsceneTimer<340){
                    cutsceneAlpha=Math.min(1,(cutsceneTimer-220)/60);
                }else if(cutsceneTimer===340){
                    completeLevel();
                    gameState='true_ending';
                    cutsceneTimer=0; // Reuse timer for ending
                }
            }else{
                // Boss 1 Cutscene: Violent shaking and explosion
                if(cutsceneTimer<120){
                    // Tremble and emit energy
                    let p=cutsceneTimer/120;
                    if(cutsceneTimer%4===0)particles.emit(bx+(Math.random()-.5)*80,by+(Math.random()-.5)*80,8,'#ff8844',40,4,30,5);
                    cam.x+=(Math.random()-.5)*12*p;cam.y+=(Math.random()-.5)*12*p;
                }else if(cutsceneTimer===120){
                    // Massive Explosion
                    sfx('explosion');
                    setTimeout(()=>sfx('bossSlam'),150);
                    setTimeout(()=>sfx('explosion'),350);
                    particles.emit(bx,by,250,'#ffffff',120,10,100,8);
                    particles.emit(bx,by,150,'#ffaa44',150,12,120,10);
                    // Spawn item drops for Boss 1 too
                    let b1types=['hp','speed','jump'];
                    for(let i=0;i<3;i++){
                        items.push({x:bx-40+(i*40),y:by-60,w:16,h:16,vy:-2-Math.random(),type:b1types[i],life:900});
                    }
                }else if(cutsceneTimer>180&&cutsceneTimer<300){
                    // Screen fades to white
                    cutsceneAlpha=Math.min(1,(cutsceneTimer-180)/60);
                }else if(cutsceneTimer===300){
                    completeLevel();
                    gameState='victory';
                }
            }
        }
        return;
    }

    if(gameState==='true_ending'){
        gameTime++; cutsceneTimer++;
        if(keysPressed['Enter'] && cutsceneTimer > 500) {
            goToMenu(); clearPressed();
        }
        return;
    }

    if(gameState==='playing' && hitStop > 0){ hitStop--; return; }
    if(gameState!=='playing')return;
    gameTime++;
    if(keysPressed['Escape']){goToMenu();clearPressed();return;}

    // Exit portal entering
    if(exitPortal.entering){
        exitPortal.enterTimer++;
        exitPortal.suckScale=Math.max(0,1-exitPortal.enterTimer/50);
        // Pull player toward portal center
        let dx=exitPortal.cx-player.x-player.w/2;
        let dy=exitPortal.cy-player.y-player.h/2;
        player.x+=dx*.1;player.y+=dy*.1;
        player.vx=0;player.vy=0;
        if(exitPortal.enterTimer>55){
            transition.fadeOut=true;transition.alpha=0;
            exitPortal.entering=false;
        }
        clearPressed();return;
    }

    player.update(currentMap, particles);particles.update();
    gameTime++;
    if(gameTime%600===0){
        // All levels drop hp; boss levels also randomly drop speed/jump power-ups
        let isBoss = LEVELS[currentLevel] && LEVELS[currentLevel].boss;
        let t = isBoss ? ['hp','speed','jump'][Math.floor(Math.random()*3)] : 'hp';
        let px=Math.max(TILE*2,Math.min(currentMap[0].length*TILE-TILE*3,player.x+(Math.random()>.5?80:-80)));
        let py=Math.max(TILE*2,player.y-250);
        items.push({x:px,y:py,w:16,h:16,vy:0,type:t,life:600});
    }
    
    // Boss adds spawning (relentless minion/item drops)
    if(LEVELS[currentLevel].boss && !player.dead && gameTime%480===0){
        let b1Alive = enemies.some(e => e.constructor.name === 'Boss1' && e.alive);
        let b2Alive = enemies.some(e => e.constructor.name === 'Boss2' && e.alive);
        let b3Alive = enemies.some(e => e.constructor.name === 'Boss3' && e.alive);
        
        // Limit active minions to exactly 2
        let minionCount = enemies.filter(e => e.alive && e.constructor.name !== 'Boss1' && e.constructor.name !== 'Boss2' && e.constructor.name !== 'Boss3').length;
        let toSpawn = Math.max(0, 2 - minionCount);
        
        for(let i=0; i<toSpawn; i++){
            let bx = Math.max(TILE*2, Math.min(currentMap[0].length*TILE-TILE*3, player.x + (Math.random()>.5?250:-250) + (i*60)));
            if(b1Alive){
                let dropBat = new Bat(bx, TILE*2);
                dropBat.aggroRange = 9999;
                enemies.push(dropBat);
                particles.emit(bx+12, TILE*2+8, 20, '#5a3a7a', 25, 4, 15, 3);
            }else if(b2Alive){
                if(Math.random() > 0.4){
                    let dropG = new Golem(bx, TILE*2);
                    dropG.aggroRange = 9999;
                    enemies.push(dropG);
                }else{
                    let types=['hp','speed','jump'];
                    let t=types[Math.floor(Math.random()*types.length)];
                    items.push({x:bx,y:TILE*2,w:16,h:16,vy:0,type:t,life:600});
                }
                particles.emit(bx+16, TILE*2+16, 25, '#ff0000', 30, 4, 20, 3);
            }else if(b3Alive){
                if(Math.random() > 0.5){
                    let dropBat = new Bat(bx, TILE*2);
                    dropBat.aggroRange = 9999;
                    enemies.push(dropBat);
                }else{
                    let types=['hp','speed','jump'];
                    let t=types[Math.floor(Math.random()*types.length)];
                    items.push({x:bx,y:TILE*2,w:16,h:16,vy:0,type:t,life:600});
                }
                particles.emit(bx+12, TILE*2+8, 20, '#ffd700', 25, 4, 15, 3);
            }
        }
    }

    items=items.filter(it=>{
        it.vy+=0.1;it.vy=Math.min(it.vy,2.5);it.y+=it.vy;
        let r=Math.floor((it.y+it.h)/TILE),c=Math.floor((it.x+it.w/2)/TILE);
        if(isSolid(getTile(currentMap,c,r))){it.y=r*TILE-it.h;it.vy=0;}
        it.life--;
        if(rectCollide(player,it)){
            sfx('pickup');
            if(it.type==='hp'){player.hp=Math.min(player.maxHp,player.hp+2);spawnDmgNumber(player.x+player.w/2,player.y,'+HP','#44ff44');}
            else if(it.type==='speed'){player.speed=GAME_TUNING.player.speedBoost;setTimeout(()=>{player.speed=GAME_TUNING.player.baseSpeed;},4000);spawnDmgNumber(player.x+player.w/2,player.y,'SPD','#ffff00');}
            else if(it.type==='jump'){player.jumpPow=GAME_TUNING.player.jumpBoost;setTimeout(()=>{player.jumpPow=GAME_TUNING.player.jumpPow;},4000);spawnDmgNumber(player.x+player.w/2,player.y,'JMP','#00ffff');}
            particles.emit(it.x+it.w/2,it.y+it.h/2,20,'#ffffff',15,3,20,5);
            return false;
        }
        return it.life>0;
    });

    enemies.forEach(e=>{
        if(e.update.length>=3)e.update(currentMap,player,particles);
        else if(e.update.length>=2)e.update(currentMap,player);
        else e.update(currentMap);
    });

    // --- TRAPS ---
    fallingPlats.forEach(fp=>{
        if(fp.respawn>0){fp.respawn--;if(fp.respawn<=0){fp.triggered=false;fp.vy=0;fp.yOff=0;fp.fallDelay=0;}return;}
        if(!fp.triggered){
            for(let c=fp.col;c<fp.col+fp.w;c++){
                let py=fp.row*TILE,px=c*TILE;
                if(player.y+player.h>=py-2&&player.y+player.h<=py+8&&player.x+player.w>px&&player.x<px+TILE){fp.triggered=true;fp.fallDelay=30;break;}
            }
        }else if(fp.fallDelay>0){
            fp.fallDelay--;
            for(let c=fp.col;c<fp.col+fp.w;c++){
                let py=fp.row*TILE+fp.yOff,px=c*TILE;
                if(player.y+player.h>=py-2&&player.y+player.h<=py+8&&player.x+player.w>px&&player.x<px+TILE){player.onGround=true;player.vy=0;player.y=py-player.h;}
            }
        }else{fp.vy+=.3;fp.yOff+=fp.vy;if(fp.yOff>TILE*8)fp.respawn=180;}
    });
    timedSpikes.forEach(ts=>{
        let px=ts.col*TILE,py=ts.row*TILE;
        if(ts.active){
            ts.phase++;
            if(ts.phase < 15){
                if(ts.phase%3===0) particles.emit(px+16,py+32,2,'#8822ff',15,2,10,2);
            }else if(ts.phase === 15){
                particles.emit(px+16,py+32,20,'#ff00ff',25,5,20,4);
            }else if(ts.phase > 15 && ts.phase < 45){
                if(rectCollide(player,{x:px,y:py-TILE*2,w:TILE,h:TILE*3})){player.takeDamage(GAME_TUNING.damage.trap);spawnDmgNumber(player.x+player.w/2,player.y,-GAME_TUNING.damage.trap,'#ff4444');} 
            }else if(ts.phase >= 45){
                ts.active = false; ts.cooldown = 120;
            }
        }else{
            if(ts.cooldown>0) ts.cooldown--;
            else{
                if(Math.abs(player.x+player.w/2 - (px+16)) < TILE*3 && Math.abs(player.y+player.h/2 - (py+16)) < TILE*4){
                    ts.active = true; ts.phase = 0;
                }
            }
        }
    });
    arrowTraps.forEach(at=>{
        if(at.cooldown>0){at.cooldown--;return;}
        let px=at.col*TILE,py=at.row*TILE;
        let inRange=Math.abs(player.y-py)<TILE*2;
        if(at.dir>0)inRange=inRange&&player.x>px&&player.x<px+TILE*15;
        else inRange=inRange&&player.x<px&&player.x>px-TILE*15;
        if(inRange){arrows.push({x:px+TILE/2,y:py+TILE/2,vx:at.dir*3.4,w:12,h:4,life:90});at.cooldown=84;}
    });
    arrows=arrows.filter(a=>{
        a.x+=a.vx;a.life--;if(a.life<=0)return false;
        if(isSolid(getTile(currentMap,Math.floor(a.x/TILE),Math.floor(a.y/TILE)))){particles.emit(a.x,a.y,4,'#aa6633',6,2,12);return false;}
        if(rectCollide(player,a)){player.takeDamage(GAME_TUNING.damage.arrow);spawnDmgNumber(player.x+player.w/2,player.y,-GAME_TUNING.damage.arrow,'#ff4444');particles.emit(a.x,a.y,6,'#ff4444',8,2,15);return false;}
        return true;
    });

    // --- RUNES ---
    runes.forEach(r => {
        if(r.collected) return;
        r.phase += 0.05; r.y = r.baseY + Math.sin(r.phase)*6;
        if(rectCollide(player, r)){
            r.collected = true;
            player.runesCollected++;
            particles.emit(r.x+8, r.y+8, 40, '#00ffff', 40, 5, 30, 4);
            runeCountText.innerText = `${player.runesCollected} / ${player.runesRequired}`;
            if(player.runesCollected >= player.runesRequired) runeCountText.style.color = hudReadyColor;
            else runeCountText.style.color = hudAccentColor;
        }
    });

    // --- EXIT PORTAL ---
    if(exitPortal.active){
        exitPortal.phase+=.04;
        if(exitPortal.deniedTimer>0) exitPortal.deniedTimer--;
        let pcx=player.x+player.w/2, pcy=player.y+player.h/2;
        let dist=Math.sqrt((pcx-exitPortal.cx)**2+(pcy-exitPortal.cy)**2);
        exitPortal.playerNear=dist<TILE*2;
        if(exitPortal.playerNear&&kbPressed('jump')){
            if(player.runesCollected >= player.runesRequired){
                exitPortal.entering=true;exitPortal.enterTimer=0;exitPortal.suckScale=1;
            }else if(exitPortal.deniedTimer<=0){
                exitPortal.deniedTimer=45;
                particles.emit(exitPortal.cx, exitPortal.cy, 15, '#ff0000', 30, 3, 20, 3);
                runeCountText.style.color='#ff0000';
                setTimeout(()=>{if(!player.dead && player.runesCollected < player.runesRequired) runeCountText.style.color=hudAccentColor;}, 400);
            }
        }
    }

    // Player attack vs enemies
    let atk=player.getAttackBox();
    if(atk){
        enemies.forEach(e=>{
            if(!e.alive)return;
            if(rectCollide(atk,e)){
                if((e.hurtTimer||0)<=0 && (e.invincible||0)<=0){
                    let dmg=atk.super?3:2;
                    if(!atk.super)player.super=Math.min(player.maxSuper,player.super+10);
                    e.takeDamage(dmg);
                    spawnDmgNumber(e.x+e.w/2,e.y,dmg,atk.super?'#00ffff':'#ffcc00');
                    // Charge unified SP bar on boss fights
                    if(LEVELS[currentLevel]&&LEVELS[currentLevel].boss){
                        player.spBar=Math.min(player.spBarMax,player.spBar+(atk.super?10:6));
                    }
                    particles.emit(e.x+e.w/2,e.y+e.h/2,15,'#b480ff',15,3,20,4);
                    // Hit-stop and camera shake for impact
                    hitStop = 3;
                    cam.x += (Math.random()-.5)*8; cam.y += (Math.random()-.5)*8;
                    
                    if(!e.alive)particles.emit(e.x+e.w/2,e.y+e.h/2,25,'#7b2fff',24,3.5,30,4);
                    beginBossPhaseTwoCutscene(e);
                    beginBossDefeatCutscene(e);
                }
            }
        });
    }

    // Enemy vs player
    enemies.forEach(e=>{
        if(!e.alive)return;
        let dmg = typeof e.contactDamage === 'number' ? e.contactDamage :
                  (e.constructor.name === 'Bat') ? GAME_TUNING.damage.bat :
                  (e.constructor.name === 'Golem') ? GAME_TUNING.damage.golem :
                  (e.constructor.name === 'Boss1') ? GAME_TUNING.damage.boss1 :
                  (e.constructor.name === 'Boss3') ? (e.isPhaseTwo ? GAME_TUNING.damage.boss3PhaseTwo : GAME_TUNING.damage.boss3) :
                  GAME_TUNING.damage.crawler;
        let specialHit=false;
        if(e.getAttackBox){
            let ea=e.getAttackBox();
            if(ea&&rectCollide(player,ea)){player.takeDamage(dmg);spawnDmgNumber(player.x+player.w/2,player.y,-dmg,'#ff6644');particles.emit(player.x+player.w/2,player.y+player.h/2,10,'#ff6644',12,2.5,20);specialHit=true;}
        }
        if(!specialHit&&rectCollide(player,e)){player.takeDamage(dmg);spawnDmgNumber(player.x+player.w/2,player.y,-dmg,'#ff4444');particles.emit(player.x+player.w/2,player.y+player.h/2,8,'#ff4444',10,2,18);}
        if(e.projectiles&&!e.handlesProjectileDamage){e.projectiles.forEach(p=>{if(p.alive&&!p.noCol&&rectCollide(player,{x:p.x,y:p.y,w:p.w,h:p.h})){player.takeDamage(p.damage||dmg);spawnDmgNumber(player.x+player.w/2,player.y,-(p.damage||dmg),'#ff4444');p.alive=false;particles.emit(p.x,p.y,8,'#b480ff',10,2,18);}});}
    });

    if(player.dead){gameState='dead';setTimeout(()=>deathScreen.classList.remove('hidden'),600);}
    if(player.y>currentMap.length*TILE+100)player.takeDamage(player.maxHp);

    hud.classList.remove('hidden');
    cam.follow(player,currentMap[0].length,currentMap.length);
    if(player.dashTimer>0)particles.emit(player.x+player.w/2,player.y+player.h/2,2,'#b480ff',6,1,14,3);
    if(player.wallSlide)particles.emit(player.wallDir>0?player.x+player.w:player.x,player.y+player.h/2,1,'#8a7aaa',4,.8,12,2);

    // Special abilities on boss fights - fires highest available threshold
    if(LEVELS[currentLevel]&&LEVELS[currentLevel].boss){
        let pct=player.spBar/player.spBarMax*100;
        // Active ability timers
        if(player.sp1Active>0){player.sp1Active--;player.invincible=Math.max(player.invincible,2);}
        if(player.sp2Active>0){
            player.sp2Active--;player.invincible=Math.max(player.invincible,2);
            // Mirror shield: reflect boss projectiles
            enemies.forEach(e=>{if(e.projectiles)e.projectiles.forEach(p=>{
                if(p.alive&&!p.reflected){
                    let dist=Math.hypot(p.x-player.x-player.w/2,p.y-player.y-player.h/2);
                    if(dist<56){p.vx=-p.vx;p.vy=-Math.abs(p.vy)-1.4;p.reflected=true;p.noCol=true;
                        particles.emit(p.x,p.y,10,'#e8a028',10,3,15,3);
                        if(e.alive){e.takeDamage(1.5);spawnDmgNumber(e.x+e.w/2,e.y,1.5,'#e8a028');}
                    }
                }
            });});
            if(player.sp2Active%4===0)particles.emit(player.x+player.w/2,player.y+player.h/2,3,'#e8a028',30,2,15,4);
        }
        if(player.sp3Active>0){
            player.sp3Active--;
            // sp3Active just tracks timer; blackHole object has the fixed position
        }
        // BLACK HOLE: placed entity that stays at fixed position, pulls boss, deals damage
        if(player.blackHole){
            player.blackHole.timer--;
            let bhx=player.blackHole.x, bhy=player.blackHole.y;
            enemies.forEach(e=>{if(e.alive){
                let edx=bhx-(e.x+e.w/2), edy=bhy-(e.y+e.h/2);
                let dist=Math.hypot(edx,edy);
                // Pull boss toward black hole if within range
                if(dist<220&&dist>28){
                    let pull=2.8/(dist/90);
                    e.x+=edx/dist*pull; e.y+=edy/dist*pull;
                    if(e.targetX!==undefined){e.targetX=e.x;e.targetY=e.y;}
                }
                // Deal damage every 8 frames + steal HP + recharge SP
                if(player.blackHole.timer%12===0&&dist<92){
                    e.takeDamage(1.25);spawnDmgNumber(e.x+e.w/2,e.y,1.25,'#6600cc');
                    particles.emit(e.x+e.w/2,e.y+e.h/2,5,'#8833ff',12,2,12,3);
                    // Steal life from boss
                    player.hp=Math.min(player.maxHp,player.hp+0.12);
                    if(player.blackHole.timer%24===0)spawnDmgNumber(player.x+player.w/2,player.y-10,'+HP','#44ff44');
                    // Partially recharge SP
                    player.spBar=Math.min(player.spBarMax,player.spBar+0.35);
                }
            }});
            // Black hole visual particles (spiraling inward)
            for(let i=0;i<2;i++){
                let ang=player.blackHole.timer*.12+i*Math.PI;
                let rd=60+Math.sin(player.blackHole.timer*.08)*20;
                particles.emit(bhx+Math.cos(ang)*rd,bhy+Math.sin(ang)*rd,1,'#6600cc',15,1,10,3);
            }
            particles.emit(bhx+(Math.random()-.5)*100,bhy+(Math.random()-.5)*100,1,'#330066',20,1.5,12,4);
            cam.x+=(Math.random()-.5)*1;cam.y+=(Math.random()-.5)*1;
            if(player.blackHole.timer<=0){player.blackHole=null;player.sp3Active=0;}
        }
        // Manual fire: press E (special keybind) to fire the HIGHEST available threshold
        if(kbPressed('special')&&player.sp1Active<=0&&player.sp2Active<=0&&player.sp3Active<=0&&!player.blackHole&&pct>=30){
            // SP3 at 100% — Black Hole (placed at player position, pulls boss)
            if(pct>=100){
                player.sp3Active=130;
                let px=player.x+player.w/2,py=player.y+player.h/2;
                player.blackHole={x:px,y:py,timer:130};
                sfx('explosion');setTimeout(()=>sfx('bossSlam'),100);
                particles.emit(px,py,60,'#6600cc',40,6,30,8);
                particles.emit(px,py,40,'#330066',50,8,25,5);
                spawnDmgNumber(px,py-30,'BURACO NEGRO!','#6600cc');
                cam.x+=(Math.random()-.5)*8;cam.y+=(Math.random()-.5)*8;
                player.spBar=0;
            }
            // SP2 at 70% — Mirror Shield (reflect projectiles)
            else if(pct>=70){
                player.sp2Active=70;
                sfx('pickup');
                particles.emit(player.x+player.w/2,player.y+player.h/2,30,'#e8a028',25,4,20,5);
                spawnDmgNumber(player.x+player.w/2,player.y-20,'ESCUDO!','#e8a028');
                player.spBar=0;
            }
            // SP1 at 30% — Blade Wave (AoE slash)
            else if(pct>=30){
                player.sp1Active=14;
                sfx('super');
                let px=player.x+player.w/2,py=player.y+player.h/2;
                particles.emit(px,py,40,'#e8c840',30,5,25,6);
                enemies.forEach(e=>{if(e.alive){
                    let dist=Math.hypot(e.x+e.w/2-px,e.y+e.h/2-py);
                    if(dist<180){e.takeDamage(4);spawnDmgNumber(e.x+e.w/2,e.y,4,'#e8c840');
                        particles.emit(e.x+e.w/2,e.y+e.h/2,15,'#e8c840',20,4,20,5);}
                }});
                spawnDmgNumber(px,py-20,'LÂMINA!','#e8c840');
                player.spBar=0;
            }
        }
    }

    if(scanBossSequences()){clearPressed();return;}

    // Update floating damage numbers
    dmgNumbers.forEach(d=>{d.x+=d.vx;d.y+=d.vy;d.vy+=0.03;d.life--;});
    dmgNumbers=dmgNumbers.filter(d=>d.life>0);
    clearPressed();
}

// ---- DRAW ----
function draw(){
    drawBackground(cam,gameTime);
    if(gameState==='title')return;
    updateHudState();
    drawMap(currentMap,cam);

    // Draw falling platforms
    fallingPlats.forEach(fp=>{
        if(fp.respawn>0)return;
        let dth=getTheme().desert;
        for(let c=fp.col;c<fp.col+fp.w;c++){
            let px=Math.round(c*TILE-cam.x),py=Math.round(fp.row*TILE+fp.yOff-cam.y);
            let sh=fp.triggered&&fp.fallDelay>0?(Math.random()-.5)*3:0;
            ctx.fillStyle=dth?'#A08060':'#2a2040';ctx.fillRect(px+sh,py,TILE,8);
            ctx.fillStyle=dth?'#C2A278':'#3a3060';ctx.fillRect(px+2+sh,py+1,TILE-4,4);
            ctx.fillStyle=dth?'#D2B48C':'#4a4080';ctx.fillRect(px+TILE/2-2+sh,py+2,4,3);
        }
    });
    // Draw Proximity Eruption Spikes
    timedSpikes.forEach(ts=>{
        let px=Math.round(ts.col*TILE-cam.x),py=Math.round(ts.row*TILE-cam.y);
        let dth=getTheme().desert;
        ctx.fillStyle=dth?'#8B7355':'#2a1a3a';ctx.fillRect(px,py+TILE-6,TILE,6);
        if(ts.active){
            if(ts.phase < 15){
                let sh = (Math.random()-.5)*4;
                ctx.fillStyle=dth?'#D2691E':'#ff00ff';ctx.fillRect(px+12+sh,py+TILE-10,8,4);
            }else if(ts.phase < 45){
                let h = Math.min(TILE*3, Math.max(0,(ts.phase-15)*8));
                ctx.fillStyle=dth?'#8B4513':'#aa22ff';ctx.beginPath();ctx.moveTo(px,py+TILE);ctx.lineTo(px+TILE/2,py+TILE-h);ctx.lineTo(px+TILE,py+TILE);ctx.fill();
                ctx.fillStyle=dth?'#D2691E':'#ff88ff';ctx.fillRect(px+TILE/2-2,py+TILE-h+4,4,h-4);
            }else{
                ctx.fillStyle=dth?'#A08060':'#3a2a4a';for(let i=0;i<4;i++)ctx.fillRect(px+i*8+3,py+TILE-4,2,3);
            }
        }else{
            ctx.fillStyle=dth?'#A08060':'#3a2a4a';for(let i=0;i<4;i++)ctx.fillRect(px+i*8+3,py+TILE-4,2,3);
            if(ts.cooldown > 0){ ctx.fillStyle='#ff0000'; ctx.fillRect(px+14,py+TILE-4,4,2); } 
        }
    });
    // Draw arrows
    arrows.forEach(a=>{let ax=Math.round(a.x-cam.x),ay=Math.round(a.y-cam.y);ctx.fillStyle='#cc6633';ctx.fillRect(ax,ay,a.w,a.h);ctx.fillStyle='#ff3333';ctx.fillRect(a.vx>0?ax+a.w-3:ax,ay,3,a.h);});

    // Draw exit portal (black hole vortex)
    if(exitPortal.active){
        let px=Math.round(exitPortal.cx-cam.x),py=Math.round(exitPortal.cy-cam.y);
        let p=exitPortal.phase, pulse=Math.sin(p)*.3+.7;
        let r=exitPortal.radius;
        // Outer glow
        ctx.save();
        ctx.globalAlpha=.12*pulse;
        let og=ctx.createRadialGradient(px,py,0,px,py,r*3);
        og.addColorStop(0,'#7b2fff');og.addColorStop(.4,'#4a0aaa');og.addColorStop(1,'transparent');
        ctx.fillStyle=og;ctx.fillRect(px-r*3,py-r*3,r*6,r*6);
        ctx.restore();
        // Spinning rings (3 concentric)
        for(let ring=0;ring<3;ring++){
            let rr=r-ring*6, segs=8+ring*4, speed=(ring%2===0?1:-1)*(1+ring*.3);
            ctx.strokeStyle=`rgba(${120+ring*40},${30+ring*20},${200+ring*20},${(.35-ring*.08)*pulse})`;
            ctx.lineWidth=2-ring*.4;
            ctx.beginPath();
            for(let i=0;i<=segs;i++){
                let a=(i/segs)*Math.PI*2+p*speed;
                let wobble=Math.sin(a*3+p*2)*(2+ring);
                let cx2=px+Math.cos(a)*(rr+wobble), cy2=py+Math.sin(a)*(rr+wobble);
                if(i===0)ctx.moveTo(cx2,cy2);else ctx.lineTo(cx2,cy2);
            }
            ctx.stroke();
        }
        // Center void (dark hole)
        let cg=ctx.createRadialGradient(px,py,0,px,py,r*.7);
        cg.addColorStop(0,'rgba(0,0,0,.9)');cg.addColorStop(.5,'rgba(20,5,40,.7)');
        cg.addColorStop(1,'rgba(80,20,160,.1)');
        ctx.fillStyle=cg;ctx.beginPath();ctx.arc(px,py,r*.7,0,Math.PI*2);ctx.fill();
        // Event horizon bright ring
        let enoughRunes = player.runesCollected >= player.runesRequired;
        ctx.strokeStyle=enoughRunes?`rgba(0,255,255,${pulse})`:`rgba(180,128,255,${pulse*.6})`;
        ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(px,py,r*.72,0,Math.PI*2);ctx.stroke();
        if(!enoughRunes && exitPortal.deniedTimer>0){
            ctx.fillStyle=`rgba(255,0,0,${exitPortal.deniedTimer/45})`;
            ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
        }
        // Orbiting debris
        for(let i=0;i<10;i++){
            let a=p*(.8+i*.15)+i*Math.PI*.62;
            let dr=r*(.4+Math.sin(p+i*1.3)*.4);
            let dx=px+Math.cos(a)*dr, dy=py+Math.sin(a)*dr;
            let sz=1+Math.sin(p*2+i);
            ctx.fillStyle=`rgba(${180+i*7},${100+i*10},255,${.4+Math.sin(p+i)*.2})`;
            ctx.fillRect(dx-sz/2,dy-sz/2,sz,sz);
        }
        // Streaks being sucked in
        for(let i=0;i<6;i++){
            let a=p*1.2+i*1.05;
            let startR=r*(1.5+Math.sin(p*.5+i)*.5);
            let endR=r*.4;
            ctx.strokeStyle=`rgba(160,100,255,${.15+Math.sin(p+i*2)*.1})`;
            ctx.lineWidth=1;
            ctx.beginPath();
            ctx.moveTo(px+Math.cos(a)*startR,py+Math.sin(a)*startR);
            ctx.lineTo(px+Math.cos(a+.2)*endR,py+Math.sin(a+.2)*endR);
            ctx.stroke();
        }
        // Player being sucked in (shrinking during enter)
        if(exitPortal.entering){
            ctx.save();
            ctx.globalAlpha=exitPortal.suckScale;
            let sc=exitPortal.suckScale;
            ctx.translate(px,py);ctx.scale(sc,sc);ctx.rotate(exitPortal.enterTimer*.1);
            ctx.translate(-px,-py);
            player.draw(cam);
            ctx.restore();
        }
        // Interaction prompt
        if(exitPortal.playerNear&&!exitPortal.entering){
            ctx.save();ctx.globalAlpha=.5+Math.sin(gameTime*.08)*.3;
            ctx.fillStyle='#c8b0ff';ctx.font='8px "Press Start 2P"';ctx.textAlign='center';
            ctx.fillText('↑ ENTRAR',px,py-r-14);ctx.textAlign='left';ctx.restore();
        }
    }

    drawAmbientLights(currentMap,cam,gameTime);
    
    // Draw Runes
    runes.forEach(r => {
        if(r.collected) return;
        let rx = Math.round(r.x-cam.x), ry = Math.round(r.y-cam.y);
        let dth=getTheme().desert;
        ctx.save();
        ctx.translate(rx+8, ry+8);
        ctx.rotate(r.phase*.5);
        ctx.globalAlpha = 0.8 + Math.sin(r.phase*2)*0.2;
        ctx.shadowColor = dth?'#00fff0':'#00ffff'; ctx.shadowBlur = dth?20:15;
        ctx.fillStyle = '#091018';
        ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(11, 0); ctx.lineTo(0, 11); ctx.lineTo(-11, 0); ctx.fill();
        ctx.fillStyle = dth?'#00fff0':'#00ffff';
        ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9, 0); ctx.lineTo(0, 9); ctx.lineTo(-9, 0); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.fill();
        ctx.restore();
    });

    // Draw revive energy connecting to boss
    if(gameState==='boss2_revive'){
        let bx=Math.round(cutsceneBoss.x+cutsceneBoss.w/2-cam.x),by=Math.round(cutsceneBoss.y+cutsceneBoss.h/2-cam.y);
        if(cutsceneTimer<180){
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle=`rgba(200,0,255,${Math.random()*.5+.5})`;ctx.lineWidth=2;
            for(let i=0;i<3;i++){
                ctx.beginPath();ctx.moveTo(bx,by);
                let ang=Math.random()*Math.PI*2;
                ctx.lineTo(bx+Math.cos(ang)*(100+Math.random()*50),by+Math.sin(ang)*(100+Math.random()*50));
                ctx.stroke();
            }
            ctx.restore();
        }else if(cutsceneTimer>=180 && cutsceneBoss.shockRadius){
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=10;
            ctx.beginPath();ctx.arc(bx,by,cutsceneBoss.shockRadius,0,Math.PI*2);ctx.stroke();
            ctx.strokeStyle='rgba(255,100,255,0.4)'; ctx.lineWidth=20;
            ctx.beginPath();ctx.arc(bx,by,cutsceneBoss.shockRadius-5,0,Math.PI*2);ctx.stroke();
            ctx.restore();
        }
    }
    if(gameState==='boss3_revive'){
        let bx=Math.round(cutsceneBoss.x+cutsceneBoss.w/2-cam.x),by=Math.round(cutsceneBoss.y+cutsceneBoss.h/2-cam.y);
        if(cutsceneTimer<180){
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle=`rgba(232,200,64,${Math.random()*.5+.5})`;ctx.lineWidth=2;
            for(let i=0;i<4;i++){
                ctx.beginPath();ctx.moveTo(bx,by);
                let ang=Math.random()*Math.PI*2;
                ctx.lineTo(bx+Math.cos(ang)*(100+Math.random()*50),by+Math.sin(ang)*(100+Math.random()*50));
                ctx.stroke();
            }
            ctx.strokeStyle=`rgba(255,255,255,${Math.random()*.3+.3})`;ctx.lineWidth=1;
            for(let i=0;i<2;i++){
                ctx.beginPath();ctx.moveTo(bx,by);
                ctx.lineTo(bx+(Math.random()-.5)*200,by-100-Math.random()*100);
                ctx.stroke();
            }
            ctx.restore();
        }else if(cutsceneTimer>=180 && cutsceneBoss.shockRadius){
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle='rgba(232,200,64,0.7)'; ctx.lineWidth=10;
            ctx.beginPath();ctx.arc(bx,by,cutsceneBoss.shockRadius,0,Math.PI*2);ctx.stroke();
            ctx.strokeStyle='rgba(255,68,0,0.4)'; ctx.lineWidth=20;
            ctx.beginPath();ctx.arc(bx,by,cutsceneBoss.shockRadius-5,0,Math.PI*2);ctx.stroke();
            ctx.restore();
        }
    }

    items.forEach(it=>{
        let iX=Math.round(it.x-cam.x),iY=Math.round(it.y-cam.y);
        ctx.fillStyle=it.type==='hp'?'#ff4444':it.type==='speed'?'#ffff00':'#44ff44';
        ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
        ctx.fillRect(iX,iY,it.w,it.h);
        ctx.fillStyle='#ffffff';ctx.fillRect(iX+4,iY+4,it.w-8,it.h-8);
        ctx.shadowBlur=0;
    });
    enemies.forEach(e=>e.draw(cam));
    if(!player.dead&&!exitPortal.entering)player.draw(cam);
    particles.draw(cam);
    if(typeof drawAtmosphereOverlay==='function')drawAtmosphereOverlay(cam,gameTime);

    // Draw floating damage numbers
    dmgNumbers.forEach(d=>{
        let dx=Math.round(d.x-cam.x),dy=Math.round(d.y-cam.y);
        let alpha=Math.min(1,d.life/15);
        let scale=typeof d.val==='string'?1.2:Math.min(1.5,1+Math.abs(d.val)*0.1);
        ctx.save();ctx.globalAlpha=alpha;
        ctx.font=`bold ${Math.round(14*scale)}px "Press Start 2P"`;ctx.textAlign='center';
        let txt=typeof d.val==='string'?d.val:(d.val>0?'+'+d.val:''+d.val);
        // Outline
        ctx.strokeStyle='#000000';ctx.lineWidth=3;ctx.strokeText(txt,dx,dy);
        // Fill
        ctx.fillStyle=d.color;ctx.shadowColor=d.color;ctx.shadowBlur=8;
        ctx.fillText(txt,dx,dy);
        ctx.shadowBlur=0;ctx.restore();
    });

    // Vignette
    let vG=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*.35,canvas.width/2,canvas.height/2,canvas.width*.7);
    let vigCol=currentLevel>=10?'rgba(60,40,10,.25)':'rgba(5,2,18,.4)';
    vG.addColorStop(0,'transparent');vG.addColorStop(1,vigCol);ctx.fillStyle=vG;ctx.fillRect(0,0,canvas.width,canvas.height);

    // Special ability HUD - single unified bar on boss fights
    if(false&&LEVELS[currentLevel]&&LEVELS[currentLevel].boss&&gameState==='playing'){
        let barW=300, barH=18;
        let bx=canvas.width/2-barW/2, by=canvas.height-44;
        let pct=player.spBar/player.spBarMax;
        ctx.save();
        // Bar background
        ctx.fillStyle='#1a1008';ctx.fillRect(bx-1,by-1,barW+2,barH+2);
        ctx.fillStyle='#0a0804';ctx.fillRect(bx,by,barW,barH);
        // Filled portion with gradient
        if(pct>0){
            let grd=ctx.createLinearGradient(bx,0,bx+barW*pct,0);
            grd.addColorStop(0,'#e8a028');grd.addColorStop(.5,'#e8c840');grd.addColorStop(1,pct>=1?'#6600cc':'#e8a028');
            ctx.fillStyle=grd;ctx.fillRect(bx,by,barW*pct,barH);
        }
        // Threshold markers at 30%, 70%, 100%
        let thresholds=[{p:.3,lbl:'LÂMINA',col:'#e8c840'},{p:.7,lbl:'ESCUDO',col:'#e8a028'},{p:1,lbl:'B.NEGRO',col:'#6600cc'}];
        thresholds.forEach(th=>{
            let tx=bx+barW*th.p;
            ctx.strokeStyle=pct>=th.p?th.col:'#44332266';ctx.lineWidth=2;
            ctx.beginPath();ctx.moveTo(tx,by-3);ctx.lineTo(tx,by+barH+3);ctx.stroke();
            // Small label above threshold
            ctx.font='5px "Press Start 2P"';ctx.textAlign='center';
            ctx.fillStyle=pct>=th.p?th.col:'#665544';
            ctx.fillText(th.lbl,tx,by-5);
        });
        // Glow pulse when an ability is active
        let anyActive=player.sp1Active>0||player.sp2Active>0||player.sp3Active>0;
        if(anyActive){
            ctx.globalAlpha=.3+Math.sin(gameTime*.15)*.2;
            ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.strokeRect(bx-2,by-2,barW+4,barH+4);
            ctx.globalAlpha=1;
        }
        // Bar label + key hint
        ctx.font='6px "Press Start 2P"';ctx.textAlign='center';
        if(pct>=.3&&!anyActive){
            ctx.fillStyle='#ffe880';ctx.fillText('PODER ESPECIAL — [E] ATIVAR',canvas.width/2,by+barH+10);
        }else{
            ctx.fillStyle='#ccaa77';ctx.fillText('PODER ESPECIAL [E]',canvas.width/2,by+barH+10);
        }
        ctx.restore();
        // Draw shield bubble around player
        if(player.sp2Active>0){
            let px=Math.round(player.x+player.w/2-cam.x),py=Math.round(player.y+player.h/2-cam.y);
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle=`rgba(232,160,40,${.3+Math.sin(gameTime*.2)*.2})`;ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(px,py,30+Math.sin(gameTime*.1)*4,0,Math.PI*2);ctx.stroke();
            ctx.restore();
        }
        // Draw black hole vortex at placed position (not on player)
        if(player.blackHole){
            let px=Math.round(player.blackHole.x-cam.x),py=Math.round(player.blackHole.y-cam.y);
            // Dark void center
            let r=55+Math.sin(gameTime*.06)*15;
            let bhG=ctx.createRadialGradient(px,py,0,px,py,r);
            bhG.addColorStop(0,'rgba(0,0,0,.7)');bhG.addColorStop(.3,'rgba(30,0,60,.4)');bhG.addColorStop(.6,'rgba(100,0,200,.15)');bhG.addColorStop(1,'rgba(100,0,200,0)');
            ctx.fillStyle=bhG;ctx.fillRect(px-r,py-r,r*2,r*2);
            // Spinning rings
            ctx.save();ctx.globalCompositeOperation='lighter';
            for(let ring=0;ring<3;ring++){
                let rr=r*.4+ring*15;
                ctx.strokeStyle=`rgba(100,0,204,${.35-ring*.08})`;ctx.lineWidth=2;
                ctx.beginPath();
                for(let s=0;s<=16;s++){
                    let a=(s/16)*Math.PI*2+gameTime*.04*(ring%2?1:-1);
                    let wobble=Math.sin(a*3+gameTime*.02)*4;
                    let cx2=px+Math.cos(a)*(rr+wobble),cy2=py+Math.sin(a)*(rr+wobble);
                    if(s===0)ctx.moveTo(cx2,cy2);else ctx.lineTo(cx2,cy2);
                }
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    if(LEVELS[currentLevel]&&LEVELS[currentLevel].boss&&gameState==='playing'){
        if(player.sp2Active>0){
            let px=Math.round(player.x+player.w/2-cam.x),py=Math.round(player.y+player.h/2-cam.y);
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle=`rgba(232,160,40,${.3+Math.sin(gameTime*.2)*.2})`;ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(px,py,30+Math.sin(gameTime*.1)*4,0,Math.PI*2);ctx.stroke();
            ctx.restore();
        }
        if(player.blackHole){
            let px=Math.round(player.blackHole.x-cam.x),py=Math.round(player.blackHole.y-cam.y);
            let r=55+Math.sin(gameTime*.06)*15;
            let bhG=ctx.createRadialGradient(px,py,0,px,py,r);
            bhG.addColorStop(0,'rgba(0,0,0,.7)');bhG.addColorStop(.3,'rgba(30,0,60,.4)');bhG.addColorStop(.6,'rgba(100,0,200,.15)');bhG.addColorStop(1,'rgba(100,0,200,0)');
            ctx.fillStyle=bhG;ctx.fillRect(px-r,py-r,r*2,r*2);
            ctx.save();ctx.globalCompositeOperation='lighter';
            for(let ring=0;ring<3;ring++){
                let rr=r*.4+ring*15;
                ctx.strokeStyle=`rgba(100,0,204,${.35-ring*.08})`;ctx.lineWidth=2;
                ctx.beginPath();
                for(let s=0;s<=16;s++){
                    let a=(s/16)*Math.PI*2+gameTime*.04*(ring%2?1:-1);
                    let wobble=Math.sin(a*3+gameTime*.02)*4;
                    let cx2=px+Math.cos(a)*(rr+wobble),cy2=py+Math.sin(a)*(rr+wobble);
                    if(s===0)ctx.moveTo(cx2,cy2);else ctx.lineTo(cx2,cy2);
                }
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // Fade transition overlay (black)
    if(transition.fadeIn||transition.fadeOut||transition.alpha>0){
        ctx.save();ctx.globalAlpha=transition.alpha;ctx.fillStyle='#050212';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();
    }

    // Cutscene whiteout flash
    if(gameState==='cutscene'&&cutsceneAlpha>0){
        ctx.save();ctx.globalAlpha=cutsceneAlpha;
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    }

    if(gameState==='boss3_finale'){
        let t=cutsceneTimer, W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
        ctx.save();

        let dusk=Math.min(1,t/180);
        let sky=ctx.createLinearGradient(0,0,0,H);
        sky.addColorStop(0,`rgba(${14+Math.floor(dusk*18)},${28+Math.floor(dusk*12)},${34+Math.floor(dusk*10)},1)`);
        sky.addColorStop(.42,`rgba(${178+Math.floor(dusk*26)},${164-Math.floor(dusk*24)},${110-Math.floor(dusk*12)},1)`);
        sky.addColorStop(1,`rgba(${236-Math.floor(dusk*22)},${196-Math.floor(dusk*28)},${138-Math.floor(dusk*36)},1)`);
        ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

        let sunX=W*.77,sunY=H*.22;
        let eclipse=Math.min(1,Math.max(0,(t-70)/180));
        let sun=ctx.createRadialGradient(sunX,sunY,10,sunX,sunY,140);
        sun.addColorStop(0,`rgba(255,248,208,${.92-.28*eclipse})`);
        sun.addColorStop(.35,`rgba(255,214,110,${.55-.2*eclipse})`);
        sun.addColorStop(1,'rgba(255,214,110,0)');
        ctx.fillStyle=sun;ctx.fillRect(sunX-150,sunY-150,300,300);
        if(eclipse>0){
            ctx.save();ctx.globalCompositeOperation='multiply';
            ctx.fillStyle=`rgba(19,12,10,${.7*eclipse})`;
            ctx.beginPath();ctx.arc(sunX-18*eclipse,sunY+8*eclipse,44+20*eclipse,0,Math.PI*2);ctx.fill();
            ctx.restore();
            ctx.strokeStyle=`rgba(255,232,166,${.55*eclipse})`;ctx.lineWidth=3;
            ctx.beginPath();ctx.arc(sunX,sunY,58+eclipse*10,0,Math.PI*2);ctx.stroke();
        }

        for(let layer=0;layer<4;layer++){
            let baseY=H*.66+layer*34;
            let offset=(t*.18*(layer+1))%(W+220)-110;
            ctx.fillStyle=`rgba(${188-layer*18},${156-layer*16},${105-layer*10},${.22+layer*.08})`;
            for(let i=0;i<4;i++){
                let dx=offset+i*290-layer*40;
                let dw=260-layer*18,dh=48+layer*18;
                ctx.beginPath();
                ctx.moveTo(dx,baseY);
                ctx.quadraticCurveTo(dx+dw*.45,baseY-dh,dx+dw,baseY);
                ctx.fill();
            }
        }

        if(t<240){
            let storm=Math.min(1,t/180);
            for(let i=0;i<18;i++){
                let y=H*.38+i*18+Math.sin(t*.03+i)*6;
                ctx.strokeStyle=`rgba(255,235,190,${.03+storm*.035})`;
                ctx.lineWidth=10+(i%3)*3;
                ctx.beginPath();
                ctx.moveTo(-40,y);
                ctx.quadraticCurveTo(W*.35,y-14-Math.sin(i+t*.02)*8,W+40,y+10);
                ctx.stroke();
            }

            let sink=Math.min(1,t/240);
            let bodyY=H*.58+sink*42;
            ctx.save();
            ctx.globalAlpha=1-sink*.82;
            ctx.fillStyle='rgba(42,24,10,.85)';
            ctx.beginPath();
            ctx.moveTo(cx-116,bodyY+14);
            ctx.quadraticCurveTo(cx-40,bodyY-38,cx+44,bodyY-10);
            ctx.quadraticCurveTo(cx+96,bodyY-4,cx+122,bodyY-28);
            ctx.quadraticCurveTo(cx+158,bodyY-44,cx+176,bodyY-10);
            ctx.quadraticCurveTo(cx+124,bodyY+4,cx+112,bodyY+34);
            ctx.quadraticCurveTo(cx+42,bodyY+58,cx-52,bodyY+42);
            ctx.quadraticCurveTo(cx-108,bodyY+36,cx-116,bodyY+14);
            ctx.fill();
            ctx.fillStyle='rgba(23,13,7,.92)';
            ctx.beginPath();
            ctx.moveTo(cx+172,bodyY-10);ctx.lineTo(cx+230,bodyY-38);ctx.lineTo(cx+250,bodyY-28);ctx.lineTo(cx+196,bodyY+6);ctx.fill();
            for(let i=0;i<7;i++){
                let bx=cx-62+i*34;
                ctx.fillStyle='rgba(10,7,6,.86)';
                ctx.fillRect(bx,bodyY+10+Math.abs(Math.sin(i))*3,10,18+(i%2)*6);
            }
            ctx.restore();
        }else if(t<470){
            let rise=(t-240)/230;
            let monolithY=H+120-rise*300;
            ctx.fillStyle='rgba(61,39,22,.72)';
            ctx.beginPath();ctx.moveTo(cx-180,H);ctx.quadraticCurveTo(cx-40,H-90,cx+160,H);ctx.fill();

            ctx.save();
            ctx.translate(cx,monolithY);
            ctx.fillStyle='#4b341f';
            ctx.beginPath();ctx.moveTo(-52,126);ctx.lineTo(-34,-92);ctx.lineTo(34,-92);ctx.lineTo(52,126);ctx.fill();
            ctx.fillStyle='#7d5c33';
            ctx.beginPath();ctx.moveTo(-28,116);ctx.lineTo(-16,-112);ctx.lineTo(16,-112);ctx.lineTo(28,116);ctx.fill();
            ctx.fillStyle='#a6f9ff';
            ctx.beginPath();ctx.moveTo(0,-132);ctx.lineTo(18,-102);ctx.lineTo(0,-70);ctx.lineTo(-18,-102);ctx.fill();
            ctx.fillStyle='rgba(160,250,255,.25)';
            ctx.fillRect(-8,-104,16,124);
            ctx.restore();

            ctx.save();ctx.globalCompositeOperation='lighter';
            for(let i=0;i<5;i++){
                let ang=t*.02+i*Math.PI*2/5;
                let rx=cx+Math.cos(ang)*(70+Math.sin(t*.015+i)*12);
                let ry=monolithY-88+Math.sin(ang*1.4)*22;
                ctx.fillStyle=i%2===0?'rgba(255,214,88,.75)':'rgba(96,248,255,.7)';
                ctx.beginPath();ctx.arc(rx,ry,5+(i%2),0,Math.PI*2);ctx.fill();
            }
            ctx.restore();

            let heroX=cx-190,heroY=H*.67-Math.sin(t*.06)*2;
            ctx.fillStyle='rgba(18,16,18,.9)';
            ctx.fillRect(heroX,heroY,14,24);
            ctx.fillRect(heroX+3,heroY-9,8,9);
            ctx.fillRect(heroX-5,heroY+6,5,12);
            ctx.fillRect(heroX+14,heroY+6,5,12);
            ctx.fillStyle='rgba(93,247,255,.7)';
            ctx.fillRect(heroX+9,heroY+6,2,3);
        }else{
            let calm=Math.min(1,(t-470)/170);
            ctx.save();ctx.globalCompositeOperation='screen';
            for(let i=0;i<14;i++){
                let px=(i*73+30)%W;
                let py=(i*41+Math.sin(t*.02+i)*18)%(H*.55);
                ctx.fillStyle=i%3===0?'rgba(255,224,140,.4)':'rgba(150,250,255,.3)';
                ctx.beginPath();ctx.arc(px,py,1+(i%2),0,Math.PI*2);ctx.fill();
            }
            ctx.restore();

            let constellation=[
                {x:cx-150,y:cy-80},{x:cx-110,y:cy-110},{x:cx-50,y:cy-98},{x:cx+4,y:cy-72},
                {x:cx+56,y:cy-58},{x:cx+118,y:cy-72},{x:cx+160,y:cy-36},{x:cx+112,y:cy+4},
                {x:cx+38,y:cy+18},{x:cx-18,y:cy+34},{x:cx-88,y:cy+22},{x:cx-146,y:cy+2}
            ];
            let visible=Math.floor(constellation.length*calm);
            ctx.strokeStyle='rgba(120,245,255,.32)';ctx.lineWidth=1.4;
            for(let i=1;i<visible;i++){
                ctx.beginPath();ctx.moveTo(constellation[i-1].x,constellation[i-1].y);ctx.lineTo(constellation[i].x,constellation[i].y);ctx.stroke();
            }
            for(let i=0;i<visible;i++){
                let p=constellation[i];
                ctx.fillStyle=i%4===0?'#ffe08e':'#8bf7ff';
                ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
            }

            let textAlpha=Math.min(1,(t-540)/80);
            if(textAlpha>0){
                ctx.textAlign='center';
                ctx.globalAlpha=textAlpha;
                ctx.shadowColor='#8bf7ff';ctx.shadowBlur=22;
                ctx.fillStyle='#d9ffff';ctx.font='bold 30px "Press Start 2P"';
                ctx.fillText('TRONO ESTILHACADO',cx,cy-18);
                ctx.shadowBlur=0;
                ctx.fillStyle='#ffdf9a';ctx.font='10px "Press Start 2P"';
                ctx.fillText('O deserto respira outra vez.',cx,cy+30);
                ctx.fillStyle='#9fefff';ctx.font='8px "Press Start 2P"';
                ctx.fillText('O basilisco virou poeira e mito.',cx,cy+62);
                ctx.globalAlpha=1;
            }
            if(t>=720){
                ctx.globalAlpha=Math.abs(Math.sin(t*.05));
                ctx.fillStyle='#d2ffff';ctx.font='8px "Press Start 2P"';ctx.textAlign='center';
                ctx.fillText('[ ENTER / ESC para voltar ]',cx,H-28);
                ctx.globalAlpha=1;
            }
        }

        ctx.restore();ctx.textAlign='left';
        return;
    }

    // Boss3 Epic Finale Cutscene (~11 seconds)
    if(false&&gameState==='boss3_finale'){
        let t=cutsceneTimer, W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
        ctx.save();

        // Phase 1 (0-90): White void fading to deep space, shards falling
        if(t<90){
            let fade=1-t/90;
            ctx.fillStyle=`rgba(255,255,255,${fade})`;ctx.fillRect(0,0,W,H);
            ctx.fillStyle=`rgba(2,2,8,${1-fade})`;ctx.fillRect(0,0,W,H);
            // Falling crystal shards
            for(let i=0;i<15;i++){
                let sx=(i*67+t*2)%W, sy=(i*43+t*3)%H;
                let a=Math.min(1,t/30)*(1-fade);
                ctx.globalAlpha=a*.6;ctx.fillStyle=i%3===0?'#e8c840':i%3===1?'#ff4400':'#ffffff';
                ctx.save();ctx.translate(sx,sy);ctx.rotate(t*.02+i);
                ctx.fillRect(-3,-8,6,16);ctx.restore();
            }
            ctx.globalAlpha=1;
        }
        // Phase 2 (90-210): Player silhouette ascending through color bands
        else if(t<210){
            ctx.fillStyle='#020208';ctx.fillRect(0,0,W,H);
            // Horizontal color bands scrolling up
            let bandY=H-((t-90)/120)*H*1.5;
            let bandColors=['#e8c84020','#ff440018','#e8a02815','#ffcc0012','#aa440018'];
            for(let i=0;i<5;i++){
                let by=bandY+i*80;
                ctx.fillStyle=bandColors[i];ctx.fillRect(0,by,W,40);
            }
            // Small stars appearing
            for(let i=0;i<40;i++){
                let sx=(i*97+13)%W, sy=(i*61+7)%H;
                let twinkle=Math.sin(t*.05+i*1.7)*.5+.5;
                ctx.globalAlpha=twinkle*.4;ctx.fillStyle='#ffffff';
                ctx.fillRect(sx,sy,1+i%2,1+i%2);
            }
            ctx.globalAlpha=1;
            // Player silhouette rising
            let py=H*.7-((t-90)/120)*H*.5;
            ctx.fillStyle='#e8c840';ctx.globalAlpha=.8;
            // Simple character shape
            ctx.fillRect(cx-6,py,12,20); // body
            ctx.fillRect(cx-4,py-8,8,8); // head
            ctx.fillRect(cx-10,py+4,4,12); // left arm
            ctx.fillRect(cx+6,py+4,4,12); // right arm
            // Glow around player
            let grd=ctx.createRadialGradient(cx,py+10,5,cx,py+10,60);
            grd.addColorStop(0,'rgba(232,200,64,.3)');grd.addColorStop(1,'rgba(232,200,64,0)');
            ctx.globalAlpha=.6+Math.sin(t*.1)*.2;ctx.fillStyle=grd;ctx.fillRect(cx-60,py-50,120,120);
            ctx.globalAlpha=1;
            // Rising light trail
            ctx.strokeStyle='#e8c84044';ctx.lineWidth=2;
            ctx.beginPath();ctx.moveTo(cx,py+20);ctx.lineTo(cx+Math.sin(t*.08)*20,H);ctx.stroke();
        }
        // Phase 3 (210-330): Cosmic nebula explosion from center
        else if(t<330){
            ctx.fillStyle='#020208';ctx.fillRect(0,0,W,H);
            // Stars
            for(let i=0;i<60;i++){
                let sx=(i*97+13)%W, sy=(i*61+7)%H;
                ctx.globalAlpha=.3+Math.sin(t*.03+i)*.2;ctx.fillStyle='#ffffff';
                ctx.fillRect(sx,sy,1+i%2,1+i%2);
            }
            ctx.globalAlpha=1;
            // Expanding nebula rings
            let expand=(t-210)/120;
            for(let ring=0;ring<5;ring++){
                let r=(expand*300+ring*40)*(.8+ring*.1);
                let a=Math.max(0,.5-expand*.3-ring*.05);
                ctx.globalAlpha=a;
                ctx.strokeStyle=['#e8c840','#ff4400','#e8a028','#ffcc00','#aa4400'][ring];
                ctx.lineWidth=3-ring*.4;
                ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
            }
            // Central bright point
            let coreSize=20+Math.sin(t*.15)*8;
            let coreG=ctx.createRadialGradient(cx,cy,0,cx,cy,coreSize);
            coreG.addColorStop(0,'rgba(255,255,255,.9)');coreG.addColorStop(.3,'rgba(232,200,64,.5)');coreG.addColorStop(1,'rgba(232,200,64,0)');
            ctx.globalAlpha=Math.max(0,1-expand*.8);ctx.fillStyle=coreG;ctx.fillRect(cx-coreSize,cy-coreSize,coreSize*2,coreSize*2);
            ctx.globalAlpha=1;
            // Radial light rays
            ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15;
            for(let i=0;i<12;i++){
                let ang=i*Math.PI/6+t*.005;
                let len=expand*400;
                ctx.strokeStyle=i%2?'#e8c840':'#ff4400';ctx.lineWidth=2;
                ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ang)*len,cy+Math.sin(ang)*len);ctx.stroke();
            }
            ctx.restore();
        }
        // Phase 4 (330-480): Constellation forming - stars connect with lines
        else if(t<480){
            ctx.fillStyle='#020208';ctx.fillRect(0,0,W,H);
            // Dense star field
            for(let i=0;i<100;i++){
                let sx=(i*73+23)%W, sy=(i*47+11)%H;
                let twinkle=Math.sin(t*.04+i*2.1)*.5+.5;
                ctx.globalAlpha=.1+twinkle*.5;ctx.fillStyle=i%10===0?'#e8c840':i%15===0?'#ff4400':'#ffffff';
                let sz=i%7===0?2:1;
                ctx.fillRect(sx,sy,sz,sz);
            }
            ctx.globalAlpha=1;
            // Constellation points
            let constel=[
                {x:cx-120,y:cy-80},{x:cx-60,y:cy-110},{x:cx,y:cy-90},{x:cx+50,y:cy-120},
                {x:cx+110,y:cy-70},{x:cx+80,y:cy-20},{x:cx+30,y:cy+10},{x:cx-20,y:cy},
                {x:cx-80,y:cy+30},{x:cx-130,y:cy-10},{x:cx,y:cy+60},{x:cx+60,y:cy+50}
            ];
            let progress=Math.min(1,(t-330)/100);
            let visibleCount=Math.floor(constel.length*progress);
            // Draw connecting lines
            ctx.strokeStyle='#e8c84044';ctx.lineWidth=1;
            for(let i=1;i<visibleCount;i++){
                let lineP=Math.min(1,(progress*constel.length-i+1));
                if(lineP<=0)continue;
                ctx.globalAlpha=lineP*.5;
                ctx.beginPath();ctx.moveTo(constel[i-1].x,constel[i-1].y);ctx.lineTo(constel[i].x,constel[i].y);ctx.stroke();
            }
            // Draw constellation stars
            for(let i=0;i<visibleCount;i++){
                let p=constel[i];
                let appear=Math.min(1,(progress*constel.length-i));
                ctx.globalAlpha=appear;
                ctx.fillStyle='#e8c840';ctx.shadowColor='#e8c840';ctx.shadowBlur=10;
                ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
                ctx.shadowBlur=0;
            }
            ctx.globalAlpha=1;
            // Fading text below constellation
            if(t>400){
                let tAlpha=Math.min(1,(t-400)/60);
                ctx.globalAlpha=tAlpha;ctx.fillStyle='#8a7aaa';ctx.textAlign='center';
                ctx.font='10px "Press Start 2P"';
                ctx.fillText('As areias do tempo se dissolvem...',cx,cy+120);
                ctx.globalAlpha=1;
            }
        }
        // Phase 5 (480-660): Final crystal rain + title reveal
        else{
            ctx.fillStyle='#020208';ctx.fillRect(0,0,W,H);
            // Parallax star layers
            for(let layer=0;layer<3;layer++){
                let speed=.5+layer*.5;
                for(let i=0;i<30;i++){
                    let sx=(i*83+layer*31+23)%W;
                    let sy=((i*59+layer*17+t*speed)%(H+40))-20;
                    ctx.globalAlpha=.1+layer*.15;ctx.fillStyle=layer===0?'#e8c840':layer===1?'#ff4400':'#ffffff';
                    ctx.fillRect(sx,sy,1,1+layer);
                }
            }
            ctx.globalAlpha=1;
            // Crystal shards raining down (rotating)
            for(let i=0;i<12;i++){
                let sx=(i*79+t*.8)%W;
                let sy=((i*53+t*1.5)%(H+60))-30;
                let rot=t*.03+i*1.1;
                ctx.save();ctx.translate(sx,sy);ctx.rotate(rot);
                ctx.globalAlpha=.4;ctx.fillStyle=i%3===0?'#e8c840':i%3===1?'#ff4400':'#ffffff';
                ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,0);ctx.lineTo(0,6);ctx.lineTo(-4,0);ctx.fill();
                ctx.restore();
            }
            // Title reveal
            let titleProgress=Math.min(1,(t-500)/80);
            if(titleProgress>0){
                ctx.globalAlpha=titleProgress;ctx.textAlign='center';
                // Main title with glow
                ctx.shadowColor='#e8c840';ctx.shadowBlur=30;
                ctx.fillStyle='#e8c840';ctx.font='bold 36px "Press Start 2P"';
                ctx.fillText('CRYSTAL DEPTHS',cx,cy-30);
                ctx.shadowBlur=0;
                // Subtitle
                let subP=Math.min(1,(t-560)/60);
                if(subP>0){
                    ctx.globalAlpha=subP;
                    ctx.fillStyle='#ff4400';ctx.font='12px "Press Start 2P"';
                    ctx.fillText('O trono das areias foi destruído.',cx,cy+20);
                    ctx.fillStyle='#aa8855';ctx.font='10px "Press Start 2P"';
                    ctx.fillText('Você transcendeu as profundezas.',cx,cy+50);
                }
                // Credits line
                let credP=Math.min(1,(t-620)/40);
                if(credP>0){
                    ctx.globalAlpha=credP;
                    ctx.fillStyle='#555';ctx.font='8px "Press Start 2P"';
                    ctx.fillText('Obrigado por jogar.',cx,cy+90);
                }
                ctx.globalAlpha=1;
            }
            // Press enter prompt
            if(t>=660){
                ctx.globalAlpha=Math.abs(Math.sin(t*.05));
                ctx.fillStyle='#555';ctx.font='8px "Press Start 2P"';ctx.textAlign='center';
                ctx.fillText('[ ENTER / ESC para voltar ]',cx,H-30);
                ctx.globalAlpha=1;
            }
        }

        ctx.restore();ctx.textAlign='left';
    }

    // True Ending 
    if(gameState==='true_ending'){
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#000000';ctx.textAlign='center';
        
        // Fading text sequence
        let drawText = (str, startT, endT, y) => {
            if(cutsceneTimer > startT) {
                let alpha = 1;
                if(cutsceneTimer < startT+60) alpha = (cutsceneTimer-startT)/60;
                if(endT && cutsceneTimer > endT-60) alpha = Math.max(0, (endT - cutsceneTimer)/60);
                if(endT && cutsceneTimer > endT) alpha = 0;
                ctx.save(); ctx.globalAlpha = alpha;
                ctx.font='20px Courier New'; ctx.fillText(str, canvas.width/2, y);
                ctx.restore();
            }
        };

        if(currentLevel===14){
            drawText("O trono das areias foi destruído...", 60, 300, canvas.height/2 - 40);
            drawText("O deserto finalmente descansa.", 180, 420, canvas.height/2);
        }else{
            drawText("The shadows have been purified...", 60, 300, canvas.height/2 - 40);
            drawText("The depths are finally quiet.", 180, 420, canvas.height/2);
        }
        
        if(cutsceneTimer > 400) {
            ctx.fillStyle='#8822ff';
            ctx.font='bold 32px Courier New';
            ctx.globalAlpha = Math.min(1, (cutsceneTimer-400)/100);
            ctx.shadowColor='#d4b0ff';ctx.shadowBlur=10;
            ctx.fillText("CRYSTAL DEPTHS", canvas.width/2, canvas.height/2 - 20);
            ctx.shadowBlur=0;
            ctx.fillStyle='#222';
            ctx.font='16px Courier New';
            ctx.fillText("Thank you for playing.", canvas.width/2, canvas.height/2 + 40);
        }
        if(cutsceneTimer > 600) {
            ctx.globalAlpha = Math.abs(Math.sin(gameTime*.05));
            ctx.font='14px Courier New';
            ctx.fillStyle='#555';
            ctx.fillText("[ Press ENTER to Return ]", canvas.width/2, canvas.height - 40);
        }
        ctx.globalAlpha=1;
    }

    // Victory screen
    if(gameState==='victory'){
        ctx.fillStyle='rgba(5,2,18,.8)';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#b480ff';ctx.font='28px "Press Start 2P"';ctx.textAlign='center';
        ctx.shadowColor='#7b2fff';ctx.shadowBlur=20;
        ctx.fillText('VITÓRIA!',canvas.width/2,canvas.height/2-40);ctx.shadowBlur=0;
        ctx.font='11px "Press Start 2P"';ctx.fillStyle='#8a7aaa';
        if(currentLevel===14)ctx.fillText('Você conquistou o Trono das Areias!',canvas.width/2,canvas.height/2+10);
        else if(currentLevel===9)ctx.fillText('Você dominou Crystal Depths!',canvas.width/2,canvas.height/2+10);
        else ctx.fillText(`Fase ${currentLevel+1} completa!`,canvas.width/2,canvas.height/2+10);
        ctx.fillText('ENTER - Próxima Fase  |  ESC - Menu',canvas.width/2,canvas.height/2+45);
        ctx.textAlign='left';
        if(keysPressed['Enter']){
            save=loadSave();
            if(currentLevel+1<LEVELS.length&&currentLevel+1<save.unlocked)startLevel(currentLevel+1);
            else goToMenu();
            clearPressed();
        }
        if(keysPressed['Escape']){goToMenu();clearPressed();}
    }
}

function gameLoop(){update();draw();requestAnimationFrame(gameLoop);}
buildLevelSelect();
gameLoop();

// Loading screen fade out
setTimeout(()=>{
    loadOverlay.style.opacity='0';
    setTimeout(()=>loadOverlay.classList.add('hidden'), 800);
}, 5500);
})();
