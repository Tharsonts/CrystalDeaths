// ===== GAME LOOP - Level Select, Save, Traps, Portal Exit =====
(function(){
const cam=new Camera(),particles=new ParticleSystem();
let player,enemies,currentMap,currentLevel=-1;
let gameState='title',gameTime=0,hitStop=0;

// Save system
const SAVE_KEY='crystal_depths_save';
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{unlocked:1,completed:[]};}catch(e){return{unlocked:1,completed:[]};}}
function saveProg(save){localStorage.setItem(SAVE_KEY,JSON.stringify(save));}
let save=loadSave();

// Trap state
let fallingPlats=[],timedSpikes=[],arrowTraps=[],arrows=[],items=[];

// Transition state
let transition={active:false,fadeIn:false,fadeOut:false,alpha:0,nextLevel:-1,timer:0};
// Exit portal
let exitPortal={x:0,y:0,w:TILE*2,h:TILE*3,active:false,phase:0,playerNear:false,entering:false,enterTimer:0};

// UI
const titleScreen=document.getElementById('title-screen'),hud=document.getElementById('hud');
const pauseScreen=document.getElementById('pause-screen'),deathScreen=document.getElementById('death-screen');
const healthFill=document.getElementById('health-fill'),areaName=document.getElementById('area-name');
const superBar=document.getElementById('super-bar'),superFill=document.getElementById('super-fill');
const levelLabel=document.getElementById('level-label'),levelSelect=document.getElementById('level-select');
const loadOverlay=document.getElementById('loading-overlay');

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

document.getElementById('btn-controls').onclick=()=>document.getElementById('controls-info').classList.toggle('hidden');
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
    } else {
        btn.textContent = 'MÚSICA: DESLIGADA';
        if(window.bgm) window.bgm.pause();
    }
};

function goToMenu(){
    gameState='title';hud.classList.add('hidden');runeUI.classList.add('hidden');pauseScreen.classList.add('hidden');deathScreen.classList.add('hidden');
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
    currentLevel=idx;let lv=LEVELS[idx];
    currentMap=lv.build();
    player=new Player(lv.spawn.x,lv.spawn.y);
    enemies=spawnEnemies(lv);
    initTraps(lv);
    initRunes(lv);
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
    if(lv.boss) {
        superBar.classList.remove('hidden'); runeUI.classList.add('hidden');
    } else {
        superBar.classList.add('hidden'); runeUI.classList.remove('hidden');
        runeCountText.innerText = `${player.runesCollected} / ${player.runesRequired}`;
        runeCountText.style.color = '#00ffff';
    }
    levelLabel.textContent=`Fase ${idx+1}: ${lv.name}`;
    showAreaName(lv.name);
    gameState='playing';
}

function showAreaName(name){
    areaName.textContent=name;areaName.classList.remove('hidden');areaName.style.animation='none';areaName.offsetHeight;
    areaName.style.animation='fadeArea 3s forwards';setTimeout(()=>areaName.classList.add('hidden'),3000);
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
            cutsceneBoss.hp=100; // Boosted health for Phase 2
            cutsceneBoss.maxHp=100;
            gameState='playing';
            player.shocked=false;
            player.invincible=60;
        }
        return;
    }
    if(gameState==='cutscene'){
        gameTime++; cutsceneTimer++;
        particles.update();
        if(cutsceneBoss){
            let bx=cutsceneBoss.x+cutsceneBoss.w/2, by=cutsceneBoss.y+cutsceneBoss.h/2;
            
            if(cutsceneBoss.constructor.name === 'Boss2'){
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
        
        // Limit active minions to exactly 2
        let minionCount = enemies.filter(e => e.alive && e.constructor.name !== 'Boss1' && e.constructor.name !== 'Boss2').length;
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
            if(it.type==='hp'){player.hp=Math.min(player.maxHp,player.hp+2);}
            else if(it.type==='speed'){player.speed=2.5;setTimeout(()=>{player.speed=1.5;},4000);}
            else if(it.type==='jump'){player.jumpPow=-9.5;setTimeout(()=>{player.jumpPow=-7.8;},4000);}
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
                if(rectCollide(player,{x:px,y:py-TILE*2,w:TILE,h:TILE*3}))player.takeDamage(1); 
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
        if(inRange){arrows.push({x:px+TILE/2,y:py+TILE/2,vx:at.dir*4,w:12,h:4,life:90});at.cooldown=80;}
    });
    arrows=arrows.filter(a=>{
        a.x+=a.vx;a.life--;if(a.life<=0)return false;
        if(isSolid(getTile(currentMap,Math.floor(a.x/TILE),Math.floor(a.y/TILE)))){particles.emit(a.x,a.y,4,'#aa6633',6,2,12);return false;}
        if(rectCollide(player,a)){player.takeDamage(1);particles.emit(a.x,a.y,6,'#ff4444',8,2,15);return false;}
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
            if(player.runesCollected >= player.runesRequired) runeCountText.style.color = '#00ff00';
            else runeCountText.style.color = '#00ffff';
        }
    });

    // --- EXIT PORTAL ---
    if(exitPortal.active){
        exitPortal.phase+=.04;
        if(exitPortal.deniedTimer>0) exitPortal.deniedTimer--;
        let pcx=player.x+player.w/2, pcy=player.y+player.h/2;
        let dist=Math.sqrt((pcx-exitPortal.cx)**2+(pcy-exitPortal.cy)**2);
        exitPortal.playerNear=dist<TILE*2;
        if(exitPortal.playerNear&&(keysPressed['ArrowUp']||keysPressed['w'])){
            if(player.runesCollected >= player.runesRequired){
                exitPortal.entering=true;exitPortal.enterTimer=0;exitPortal.suckScale=1;
            }else if(exitPortal.deniedTimer<=0){
                exitPortal.deniedTimer=45;
                particles.emit(exitPortal.cx, exitPortal.cy, 15, '#ff0000', 30, 3, 20, 3);
                runeCountText.style.color='#ff0000';
                setTimeout(()=>{if(!player.dead && player.runesCollected < player.runesRequired) runeCountText.style.color='#00ffff';}, 400);
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
                    particles.emit(e.x+e.w/2,e.y+e.h/2,15,'#b480ff',15,3,20,4);
                    // Hit-stop and camera shake for impact
                    hitStop = 3;
                    cam.x += (Math.random()-.5)*8; cam.y += (Math.random()-.5)*8;
                    
                    if(e.constructor.name==='Boss2'&&e.startPhaseTwo){
                        e.startPhaseTwo=false;
                        gameState='boss2_revive';
                        cutsceneBoss=e;
                        cutsceneTimer=0;
                        player.vx=0;player.vy=0;
                        player.invincible=9999;
                    }else if(!e.alive){
                        particles.emit(e.x+e.w/2,e.y+e.h/2,25,'#7b2fff',24,3.5,30,4);
                        if(e instanceof Boss1||e.constructor.name==='Boss2'){
                            gameState='cutscene';
                            cutsceneBoss=e;
                            cutsceneBoss.alive=true; // Revive visually for cutscene
                            cutsceneBoss.visible=true;
                            cutsceneTimer=0;
                            cutsceneAlpha=0;
                            player.vx=0;player.vy=0;
                            player.invincible=9999;
                        }
                    }
                }
            }
        });
    }

    // Enemy vs player
    enemies.forEach(e=>{
        if(!e.alive)return;
        let dmg = (e.constructor.name === 'Golem' && currentLevel === LEVELS.length - 1) ? 0.5 : 
                  (e.constructor.name === 'Boss1') ? 0.4 : 1;
        if(rectCollide(player,e)){player.takeDamage(dmg);particles.emit(player.x+player.w/2,player.y+player.h/2,8,'#ff4444',10,2,18);}
        if(e.getAttackBox){let ea=e.getAttackBox();if(ea&&rectCollide(player,ea)){player.takeDamage(dmg);particles.emit(player.x+player.w/2,player.y+player.h/2,10,'#ff6644',12,2.5,20);}}
        if(e.projectiles){e.projectiles.forEach(p=>{if(p.alive&&!p.noCol&&rectCollide(player,{x:p.x,y:p.y,w:p.w,h:p.h})){player.takeDamage(dmg);p.alive=false;particles.emit(p.x,p.y,8,'#b480ff',10,2,18);}});}
    });

    if(player.dead){gameState='dead';setTimeout(()=>deathScreen.classList.remove('hidden'),600);}
    if(player.y>currentMap.length*TILE+100)player.takeDamage(player.maxHp);

    healthFill.style.width=(player.hp/player.maxHp*100)+'%';
    if(LEVELS[currentLevel].boss){
        hud.classList.remove('hidden');
        superFill.style.width=(player.super/player.maxSuper*100)+'%';
        if(player.super>=player.maxSuper)superFill.style.boxShadow='0 0 15px #00ffff';else superFill.style.boxShadow='none';
    }else hud.classList.add('hidden');
    cam.follow(player,currentMap[0].length,currentMap.length);
    if(player.dashTimer>0)particles.emit(player.x+player.w/2,player.y+player.h/2,2,'#b480ff',6,1,14,3);
    if(player.wallSlide)particles.emit(player.wallDir>0?player.x+player.w:player.x,player.y+player.h/2,1,'#8a7aaa',4,.8,12,2);
    clearPressed();
}

// ---- DRAW ----
function draw(){
    drawBackground(cam,gameTime);
    if(gameState==='title')return;
    drawMap(currentMap,cam);

    // Draw falling platforms
    fallingPlats.forEach(fp=>{
        if(fp.respawn>0)return;
        for(let c=fp.col;c<fp.col+fp.w;c++){
            let px=Math.round(c*TILE-cam.x),py=Math.round(fp.row*TILE+fp.yOff-cam.y);
            let sh=fp.triggered&&fp.fallDelay>0?(Math.random()-.5)*3:0;
            ctx.fillStyle='#2a2040';ctx.fillRect(px+sh,py,TILE,8);
            ctx.fillStyle='#3a3060';ctx.fillRect(px+2+sh,py+1,TILE-4,4);
            ctx.fillStyle='#4a4080';ctx.fillRect(px+TILE/2-2+sh,py+2,4,3);
        }
    });
    // Draw Proximity Eruption Spikes
    timedSpikes.forEach(ts=>{
        let px=Math.round(ts.col*TILE-cam.x),py=Math.round(ts.row*TILE-cam.y);
        ctx.fillStyle='#2a1a3a';ctx.fillRect(px,py+TILE-6,TILE,6);
        if(ts.active){
            if(ts.phase < 15){
                let sh = (Math.random()-.5)*4;
                ctx.fillStyle='#ff00ff';ctx.fillRect(px+12+sh,py+TILE-10,8,4);
            }else if(ts.phase < 45){
                let h = Math.min(TILE*3, Math.max(0,(ts.phase-15)*8));
                ctx.fillStyle='#aa22ff';ctx.beginPath();ctx.moveTo(px,py+TILE);ctx.lineTo(px+TILE/2,py+TILE-h);ctx.lineTo(px+TILE,py+TILE);ctx.fill();
                ctx.fillStyle='#ff88ff';ctx.fillRect(px+TILE/2-2,py+TILE-h+4,4,h-4);
            }else{
                ctx.fillStyle='#3a2a4a';for(let i=0;i<4;i++)ctx.fillRect(px+i*8+3,py+TILE-4,2,3);
            }
        }else{
            ctx.fillStyle='#3a2a4a';for(let i=0;i<4;i++)ctx.fillRect(px+i*8+3,py+TILE-4,2,3);
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
        ctx.save();
        ctx.translate(rx+8, ry+8);
        ctx.rotate(r.phase*.5);
        ctx.globalAlpha = 0.8 + Math.sin(r.phase*2)*0.2;
        ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0); ctx.fill();
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

    // Vignette
    let vG=ctx.createRadialGradient(canvas.width/2,canvas.height/2,canvas.width*.35,canvas.width/2,canvas.height/2,canvas.width*.7);
    vG.addColorStop(0,'transparent');vG.addColorStop(1,'rgba(5,2,18,.4)');ctx.fillStyle=vG;ctx.fillRect(0,0,canvas.width,canvas.height);

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

        drawText("The shadows have been purified...", 60, 300, canvas.height/2 - 40);
        drawText("The depths are finally quiet.", 180, 420, canvas.height/2);
        
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
        if(currentLevel===9)ctx.fillText('Você dominou Crystal Depths!',canvas.width/2,canvas.height/2+10);
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
