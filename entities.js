// ===== ENTITIES - Overhauled =====

const GAME_TUNING = globalThis.GAME_TUNING || {
    speedScale: 0.85,
    player: {
        maxHp: 8,
        baseSpeed: 1.32,
        jumpPow: -7.28,
        dashSpeed: 4.18,
        maxFall: 9.2,
        speedBoost: 2.15,
        jumpBoost: -8.55,
        accelGround: 0.46,
        accelAir: 0.24,
        frictionGround: 0.74,
        frictionAir: 0.92,
        turnBoost: 1.28,
        gravityRise: 1.02,
        gravityFall: 1.22,
        gravityJumpCut: 1.62,
        gravityHang: 0.82
    },
    damage: {
        crawler: 0.45,
        bat: 0.35,
        golem: 0.75,
        boss1: 0.55,
        boss2: 0.68,
        boss2PhaseTwo: 0.82,
        boss3: 0.5,
        boss3PhaseTwo: 0.72,
        trap: 0.85,
        arrow: 0.8,
        cactus: 0.28
    },
    hp: {
        boss2PhaseOne: 78,
        boss2PhaseTwo: 96,
        boss3PhaseOne: 118,
        boss3PhaseTwo: 134
    }
};
globalThis.GAME_TUNING = GAME_TUNING;

const PLAYER_STYLES = [
    { hoodDark:'#132033', hoodMid:'#20344d', hoodLight:'#3a5573', clothDark:'#1b2940', clothMid:'#27415f', clothLight:'#4b7196', armorDark:'#4f6478', armorMid:'#748ba0', armorLight:'#afc4d6', leatherDark:'#4a3528', leatherMid:'#735642', skin:'#d8c1aa', skinDark:'#9f8774', glow:'#53d4ff', rim:'#bde8ff', sash:'#1c7ad6', scarf:'#54dbff', slashMode:'arc', slashCore:'#f6feff', slashGlow:'#4ac8ff', slashAccent:'#9de8ff' },
    { hoodDark:'#2c1711', hoodMid:'#4a2319', hoodLight:'#733426', clothDark:'#3a1e16', clothMid:'#5e2a1d', clothLight:'#94412a', armorDark:'#6b4331', armorMid:'#96604a', armorLight:'#d5a486', leatherDark:'#4b2d1c', leatherMid:'#724630', skin:'#d7bea8', skinDark:'#9d7d65', glow:'#ff9f45', rim:'#ffd7ab', sash:'#b83216', scarf:'#ff7d3a', slashMode:'flame', slashCore:'#fff2d7', slashGlow:'#ff7d36', slashAccent:'#ffcf6b' },
    { hoodDark:'#0e2330', hoodMid:'#1a4b62', hoodLight:'#2b7391', clothDark:'#143342', clothMid:'#1f5368', clothLight:'#48a6c4', armorDark:'#587e94', armorMid:'#86b6ca', armorLight:'#d9f5ff', leatherDark:'#35505a', leatherMid:'#4d7886', skin:'#d9c8b4', skinDark:'#8fa2ad', glow:'#77e8ff', rim:'#e1fdff', sash:'#2d7f8a', scarf:'#7cefff', slashMode:'shard', slashCore:'#ffffff', slashGlow:'#73ecff', slashAccent:'#b0f5ff' },
    { hoodDark:'#1f153a', hoodMid:'#38245e', hoodLight:'#5f40a0', clothDark:'#251b49', clothMid:'#3a2b73', clothLight:'#7b67ce', armorDark:'#5b5687', armorMid:'#8a83be', armorLight:'#d1cafe', leatherDark:'#47385c', leatherMid:'#6d568c', skin:'#d9c1ae', skinDark:'#9b7e8e', glow:'#b68bff', rim:'#ece0ff', sash:'#6a37d2', scarf:'#c49dff', slashMode:'crescent', slashCore:'#fff8ff', slashGlow:'#b68bff', slashAccent:'#e5cfff' },
    { hoodDark:'#102113', hoodMid:'#1b4022', hoodLight:'#2e6937', clothDark:'#17311c', clothMid:'#23532d', clothLight:'#4aa25a', armorDark:'#4c6e51', armorMid:'#6ea071', armorLight:'#cce8c6', leatherDark:'#38412a', leatherMid:'#58643d', skin:'#d6c0a6', skinDark:'#8d7b5d', glow:'#7fff95', rim:'#dfffe3', sash:'#2f8f4a', scarf:'#79ff9d', slashMode:'toxic', slashCore:'#f3ffef', slashGlow:'#68ff8f', slashAccent:'#ccff7f' },
    { hoodDark:'#10232b', hoodMid:'#184550', hoodLight:'#2d7382', clothDark:'#12323c', clothMid:'#1d4f5d', clothLight:'#41a0b5', armorDark:'#477885', armorMid:'#66a8ba', armorLight:'#d5fbff', leatherDark:'#274048', leatherMid:'#3b6771', skin:'#d3c3b0', skinDark:'#809099', glow:'#6bfff0', rim:'#d8fffb', sash:'#0f8d96', scarf:'#68fff2', slashMode:'pulse', slashCore:'#ffffff', slashGlow:'#69fff2', slashAccent:'#a7fff6' },
    { hoodDark:'#25070f', hoodMid:'#4a1122', hoodLight:'#7c223c', clothDark:'#341019', clothMid:'#5b1828', clothLight:'#a13b53', armorDark:'#6d3240', armorMid:'#a15563', armorLight:'#f0b7be', leatherDark:'#4b1b20', leatherMid:'#774048', skin:'#d7bbab', skinDark:'#956873', glow:'#ff5a7a', rim:'#ffd6de', sash:'#b11638', scarf:'#ff6482', slashMode:'void', slashCore:'#fff4f6', slashGlow:'#ff5a7a', slashAccent:'#ff9cb0' },
    { hoodDark:'#3a2618', hoodMid:'#67422a', hoodLight:'#9d6a43', clothDark:'#5a351f', clothMid:'#7f5332', clothLight:'#c08a57', armorDark:'#8a6948', armorMid:'#c09763', armorLight:'#f0d7aa', leatherDark:'#5a3e27', leatherMid:'#89603b', skin:'#d8bea3', skinDark:'#997a5f', glow:'#f1c15a', rim:'#fff0bf', sash:'#7c5a22', scarf:'#ffd870', slashMode:'scimitar', slashCore:'#fff7df', slashGlow:'#f1c15a', slashAccent:'#ffd878' }
];

function getPlayerStyleIndex(){
    let level = typeof globalThis.currentLevel === 'number' ? globalThis.currentLevel : -1;
    if(level < 0) return 0;
    if(level <= 2) return 0;
    if(level <= 4) return 1;
    if(level === 5) return 2;
    if(level === 6) return 3;
    if(level === 7) return 4;
    if(level === 8) return 5;
    if(level === 9) return 6;
    return 7;
}

function getPlayerStyle(){
    let base=PLAYER_STYLES[0];
    let accent=PLAYER_STYLES[getPlayerStyleIndex()] || base;
    return {
        ...base,
        sash:accent.sash,
        scarf:accent.scarf,
        glow:'#63e7ff',
        rim:'#def9ff',
        slashCore:'#f4fdff',
        slashGlow:'#4fd6ff',
        slashAccent:'#b3efff'
    };
}

class Player {
    constructor(x,y){
        this.x=x;this.y=y;this.w=20;this.h=32;
        this.vx=0;this.vy=0;this.speed=GAME_TUNING.player.baseSpeed;this.jumpPow=GAME_TUNING.player.jumpPow;
        this.onGround=false;this.wallSlide=false;this.wallDir=0;this.facing=1;
        this.hp=GAME_TUNING.player.maxHp;this.maxHp=GAME_TUNING.player.maxHp;this.invincible=0;
        this.attacking=false;this.attackTimer=0;this.attackCooldown=0;
        this.dashTimer=0;this.dashCooldown=0;this.super=0;this.maxSuper=100;this.superActive=0;
        this.coyoteTime=0;this.jumpBuffer=0;this.dead=false;
        // Double jump
        this.jumpsLeft=2;this.maxJumps=2;this.flipPhase=0;this.isFlipping=false;
        // Animation
        this.runPhase=0;this.idlePhase=0;this.armPhase=0;
        this.squash=1;this.stretch=1;this.wasOnGround=false;
        this.trailPositions=[];this.eyeBlink=0;this.blinkTimer=0;this.capePhase=0;
        this.breathPhase=0;this.airTime=0;this.attackPose=0;this.dashPose=0;
        this.doubleJumpPose=0;this.landingTilt=0;this.animTime=0;
        this.strideBlend=0;this.motionTilt=0;this.headLag=0;this.torsoLift=0;
        this.shoulderDrift=0;this.hipDrift=0;this.footSpread=0;this.landingBounce=0;
        // Special ability bar (Boss3 fight only) - unified, auto-fires at thresholds
        this.spBar=0;this.spBarMax=100; // 30%=SP1, 70%=SP2, 100%=SP3
        this.sp1Active=0;this.sp2Active=0;this.sp3Active=0;
        this.blackHole=null; // {x,y,timer} — placed at player position, stays there
        this.runesCollected=0;this.runesRequired=3;
    }
    update(map, particles){
        if(this.dead)return;
        if(this.superActive>0){
            if(this.superActive===90 && particles) { // Activation burst!
                 particles.emit(this.x+this.w/2, this.y+this.h/2, 50, '#00ffff', 40, 5, 30, 8);
                 particles.emit(this.x+this.w/2, this.y+this.h/2, 30, '#ffffff', 50, 6, 25, 4);
            }
            this.superActive--;this.invincible=2;this.vx=0;this.vy=0;
            if(particles&&this.superActive%2===0)particles.emit(this.x+this.w/2,this.y+this.h/2,5,'#00ffff',15,2,20,3);
            return;
        }
        if(this.invincible>0)this.invincible--;
        if(this.attackCooldown>0)this.attackCooldown--;
        if(this.dashCooldown>0)this.dashCooldown--;
        if(this.jumpBuffer>0)this.jumpBuffer--;
        this.blinkTimer++;this.breathPhase+=.025;this.animTime+=.08;
        if(this.blinkTimer>180+Math.random()*60){this.eyeBlink=6;this.blinkTimer=0;}
        if(this.eyeBlink>0)this.eyeBlink--;
        this.capePhase+=.05;
        if(this.attackPose>0)this.attackPose--;
        if(this.dashPose>0)this.dashPose--;
        if(this.doubleJumpPose>0)this.doubleJumpPose--;
        this.landingTilt*=.82;
        this.landingBounce*=.76;
        // Flip animation
        if(this.isFlipping){this.flipPhase+=.25;if(this.flipPhase>=Math.PI*2){this.flipPhase=0;this.isFlipping=false;}}
        // Dash
        if(this.dashTimer>0){
            this.dashTimer--;this.vx=this.facing*GAME_TUNING.player.dashSpeed;this.vy=0;
            this.trailPositions.push({x:this.x,y:this.y,life:12});
            if(this.dashTimer<=0)this.vx=this.facing*this.speed*.92;
            this.applyCol(map);this.updateTrails();return;
        }
        let inputX=(kbCheck('right')?1:0)-(kbCheck('left')?1:0);
        let mv=inputX!==0;
        if(mv){
            this.facing=inputX>0?1:-1;
            let desired=inputX*this.speed;
            let accel=this.onGround?GAME_TUNING.player.accelGround:GAME_TUNING.player.accelAir;
            if(Math.sign(this.vx)!==0&&Math.sign(this.vx)!==inputX)accel*=GAME_TUNING.player.turnBoost;
            let delta=desired-this.vx;
            this.vx+=Math.max(-accel,Math.min(accel,delta));
            this.runPhase+=0.17+Math.abs(this.vx)*0.08;
            this.armPhase+=0.18;
        }else{
            this.vx*=this.onGround?GAME_TUNING.player.frictionGround:GAME_TUNING.player.frictionAir;
            if(Math.abs(this.vx)<.05)this.vx=0;
            this.runPhase+=Math.abs(this.vx)*0.05;
            this.armPhase*=.9;
        }
        this.idlePhase+=.03;
        let gravityMul=GAME_TUNING.player.gravityRise;
        if(this.vy<0){
            if(!kbCheck('jump'))gravityMul=GAME_TUNING.player.gravityJumpCut;
            else if(Math.abs(this.vy)<1.5)gravityMul=GAME_TUNING.player.gravityHang;
        }else if(this.vy>0){
            gravityMul=GAME_TUNING.player.gravityFall;
        }
        this.vy+=GRAVITY*gravityMul;if(this.vy>GAME_TUNING.player.maxFall)this.vy=GAME_TUNING.player.maxFall;
        if(this.onGround){this.coyoteTime=11;this.jumpsLeft=this.maxJumps;this.airTime=0;}
        else{this.airTime++;if(this.coyoteTime>0)this.coyoteTime--;}
        if(this.onGround&&mv&&Math.abs(this.vx)>.72&&particles&&Math.floor(this.animTime*10)%9===0){
            particles.emit(this.x+this.w/2-this.facing*4,this.y+this.h-2,2,'rgba(210,235,255,.55)',6,1.2,10,2);
        }
        let strideTarget=mv?Math.min(1.22,Math.abs(this.vx)/Math.max(.001,this.speed)):0;
        this.strideBlend+=(strideTarget-this.strideBlend)*(this.onGround?0.2:0.1);
        let tiltTarget=(this.onGround?this.vx*0.09:this.vx*0.05)+(this.attacking?this.facing*0.05:0);
        this.motionTilt+=(tiltTarget-this.motionTilt)*0.18;
        let headTarget=-this.motionTilt*.78+(this.wallSlide?-this.wallDir*0.08:0);
        this.headLag+=(headTarget-this.headLag)*0.18;
        let torsoTarget=this.onGround?Math.sin(this.runPhase*1.45)*2.1*this.strideBlend:Math.max(-2.2,Math.min(2.8,this.vy*.28));
        this.torsoLift+=(torsoTarget-this.torsoLift)*0.2;
        let hipTarget=this.onGround?Math.sin(this.runPhase*.72)*2*this.strideBlend*this.facing:this.vx*.32;
        this.hipDrift+=(hipTarget-this.hipDrift)*0.18;
        let shoulderTarget=this.onGround?Math.cos(this.runPhase*1.45)*1.4*this.strideBlend:-this.vx*.22;
        this.shoulderDrift+=(shoulderTarget-this.shoulderDrift)*0.18;
        let footTarget=this.onGround?(1.4+Math.abs(Math.sin(this.runPhase))*2.2*this.strideBlend):(2.4+Math.abs(this.vy)*0.14);
        this.footSpread+=(footTarget-this.footSpread)*0.18;
        this.wallSlide=false;
        if(!this.onGround&&this.vy>0){let w=this.checkWall(map);if(w!==0&&mv){this.wallSlide=true;this.wallDir=w;this.vy=Math.min(this.vy,1.2);this.jumpsLeft=this.maxJumps;}}
        // Jump (double jump)
        if(kbPressed('jump'))this.jumpBuffer=14;
        if(this.jumpBuffer>0){
            if(this.coyoteTime>0){
                this.vy=this.jumpPow;this.coyoteTime=0;this.jumpBuffer=0;this.jumpsLeft--;
                sfx('jump');
                this.squash=.7;this.stretch=1.3;
            }else if(this.wallSlide){
                this.vy=this.jumpPow*.8;this.vx=-this.wallDir*4;this.facing=-this.wallDir;
                this.wallSlide=false;this.jumpBuffer=0;this.jumpsLeft--;
                sfx('jump');
                this.squash=.75;this.stretch=1.25;
            }else if(this.jumpsLeft>0){
                // Double jump with backflip
                this.vy=this.jumpPow*.85;this.jumpBuffer=0;this.jumpsLeft--;
                this.isFlipping=true;this.flipPhase=0;
                this.doubleJumpPose=18;
                sfx('jump');
                this.squash=.65;this.stretch=1.35;
            }
        }
        if(kbPressed('attack')&&this.attackCooldown<=0){sfx('attack');this.attacking=true;this.attackTimer=16;this.attackCooldown=25;this.attackPose=16;}
        if((keysPressed['c']||keysPressed['C'])&&this.super>=this.maxSuper&&this.superActive<=0){sfx('super');this.super=0;this.superActive=90;this.attacking=false;this.attackTimer=0;}
        // Special abilities (boss fight only, handled in game.js via kbPressed)
        if(this.attackTimer>0){this.attackTimer--;if(this.attackTimer<=0)this.attacking=false;}
        if(kbPressed('dash')&&this.dashCooldown<=0){
            this.dashTimer=8;this.dashCooldown=52;this.dashPose=14;
            this.squash=1.14;this.stretch=.9;
        }
        this.wasOnGround=this.onGround;
        this.applyCol(map);
        if(this.onGround&&!this.wasOnGround&&this.vy>=0){
            this.squash=1.3;this.stretch=.7;this.isFlipping=false;this.flipPhase=0;this.landingTilt=this.facing*0.12;this.landingBounce=3.2;
            if(particles)particles.emit(this.x+this.w/2,this.y+this.h-2,8,'rgba(215,235,255,.5)',10,1.6,14,3);
        }
        this.squash+=(1-this.squash)*.15;this.stretch+=(1-this.stretch)*.15;
        let cx=Math.floor((this.x+this.w/2)/TILE),cy=Math.floor((this.y+this.h)/TILE);
        if(getTile(map,cx,cy)===4||getTile(map,cx,cy-1)===4)this.takeDamage(1);
        if(getTile(map,cx,cy)===10||getTile(map,cx,cy)===11)this.takeDamage(1);
        if(this.getColTiles(map).some(t=>t.tile===16))this.takeDamage(GAME_TUNING.damage.cactus);
        this.updateTrails();
    }
    updateTrails(){this.trailPositions=this.trailPositions.filter(t=>{t.life--;return t.life>0;});}
    applyCol(map){
        this.x+=this.vx;let c=this.getColTiles(map);
        for(let t of c)if(isSolid(t.tile)){if(this.vx>0)this.x=t.col*TILE-this.w;else if(this.vx<0)this.x=(t.col+1)*TILE;this.vx=0;}
        this.y+=this.vy;this.onGround=false;c=this.getColTiles(map);
        for(let t of c)if(isSolid(t.tile)){if(this.vy>0){this.y=t.row*TILE-this.h;this.onGround=true;}else if(this.vy<0)this.y=(t.row+1)*TILE;this.vy=0;}
    }
    getColTiles(map){
        let ts=[],l=Math.floor(this.x/TILE),r=Math.floor((this.x+this.w-1)/TILE);
        let t=Math.floor(this.y/TILE),b=Math.floor((this.y+this.h-1)/TILE);
        for(let rr=t;rr<=b;rr++)for(let cc=l;cc<=r;cc++){let v=getTile(map,cc,rr);if(v>0)ts.push({tile:v,row:rr,col:cc});}
        return ts;
    }
    checkWall(map){
        let r=getTile(map,Math.floor((this.x+this.w+2)/TILE),Math.floor((this.y+this.h/2)/TILE));
        let l=getTile(map,Math.floor((this.x-2)/TILE),Math.floor((this.y+this.h/2)/TILE));
        if(isSolid(r))return 1;if(isSolid(l))return -1;return 0;
    }
    getAttackBox(){
        if(this.superActive>0){
            let bw=800;return {x:this.facing>0?this.x+this.w/2:this.x+this.w/2-bw,y:this.y-24,w:bw,h:this.h+48,super:true};
        }
        if(!this.attacking)return null;
        let aw=this.w*2.5; 
        return {x:this.facing>0?this.x:this.x+this.w-aw,y:this.y-12,w:aw,h:this.h+24};
    }
    takeDamage(d){if(this.invincible>0||this.dead)return;sfx('playerHit');this.hp-=d;this.invincible=80;this.vy=-3;this.vx=-this.facing*2;if(this.hp<=0){this.hp=0;this.dead=true;}}
    draw(cam){
        if(this.superActive<=0 && this.invincible>0&&Math.floor(this.invincible/4)%2===0)return;
        let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y);
        let style=getPlayerStyle(),f=this.facing;
        let moveMag=Math.min(1.25,Math.abs(this.vx)/Math.max(.001,this.speed));
        let idleBob=this.onGround&&moveMag<.15?Math.sin(this.idlePhase)*1.4:Math.sin(this.runPhase*.8)*.9*this.strideBlend;
        let breath=Math.sin(this.breathPhase)*.7;
        let runCycle=this.runPhase*1.42+this.strideBlend*.28;
        let dashLean=this.dashPose>0?f*.34*(this.dashPose/14):0;
        let attackLean=this.attackPose>0?f*.24*(this.attackPose/16):0;
        let airLean=!this.onGround?Math.max(-.18,Math.min(.24,this.vy*.05)):0;
        let bodyLean=dashLean+attackLean+airLean+this.landingTilt+this.motionTilt*1.08;
        let bodyShiftX=this.hipDrift*.55;
        let hipY=sy+18+idleBob+this.torsoLift*.65-this.landingBounce;
        let shoulderY=sy+10+idleBob+breath*.45-this.shoulderDrift*.18;
        let headY=sy+4+idleBob-this.headLag*2.6-this.torsoLift*.18;
        let shadowScale=this.onGround?1+this.strideBlend*.1:Math.max(.52,1-this.airTime*.03);
        let legSwing=Math.sin(runCycle)*6.4*(.28+this.strideBlend*.82);
        let armSwing=Math.sin(runCycle+Math.PI*.5)*.58*(.2+this.strideBlend*.9);
        let jumpRear=!this.onGround?(this.vy<0?-2.8:3.8):0;
        let jumpFront=!this.onGround?(this.vy<0?1.2:4.8):0;
        let rearLegOff=this.onGround?(-legSwing-this.footSpread*.26):jumpRear;
        let frontLegOff=this.onGround?(legSwing+this.footSpread*.26):jumpFront;
        let rearArmAngle=this.attacking?-.75*f:(-0.92+armSwing)*f;
        let frontArmAngle=this.attacking?(.18+f*.82)-(this.attackTimer/16)*1.15*f:(0.95+armSwing)*f;
        let scarfTrail=Math.sin(this.capePhase*1.9+moveMag*3)*2.8+Math.abs(this.vx)*1.7;
        let cloakLift=Math.sin(this.capePhase*1.5)*1.8+Math.min(4,this.airTime*.08);
        let eyeOffset=this.eyeBlink>0?1:0;
        let eyeHeight=this.eyeBlink>0?1:2;

        if(this.shocked){
            ctx.save();ctx.strokeStyle='#ffff66';ctx.lineWidth=2;
            for(let i=0;i<4;i++){
                ctx.beginPath();
                ctx.moveTo(sx-4+Math.random()*(this.w+8),sy-4+Math.random()*(this.h+8));
                ctx.lineTo(sx-4+Math.random()*(this.w+8),sy-4+Math.random()*(this.h+8));
                ctx.stroke();
            }
            ctx.restore();
        }

        this.trailPositions.forEach(t=>{
            let tx=Math.round(t.x-cam.x),ty=Math.round(t.y-cam.y);
            ctx.save();
            ctx.globalAlpha=t.life/12*.16;
            ctx.fillStyle=style.glow;
            ctx.beginPath();
            ctx.moveTo(tx+9,ty+4);
            ctx.quadraticCurveTo(tx+1,ty+12,tx+4,ty+26);
            ctx.lineTo(tx+14,ty+26);
            ctx.quadraticCurveTo(tx+18,ty+12,tx+11,ty+4);
            ctx.fill();
            ctx.globalAlpha=t.life/12*.11;
            ctx.fillStyle=style.slashCore;
            ctx.fillRect(tx+7,ty+10,4,10);
            ctx.restore();
        });

        ctx.save();
        ctx.translate(sx+this.w/2,sy+this.h);
        ctx.scale(this.squash,this.stretch);
        ctx.translate(-(sx+this.w/2),-(sy+this.h));
        if(this.isFlipping){
            ctx.translate(sx+this.w/2,sy+this.h/2);
            ctx.rotate(this.flipPhase);
            ctx.translate(-(sx+this.w/2),-(sy+this.h/2));
        }
        ctx.translate(sx+this.w/2,hipY+5);
        ctx.rotate(bodyLean);
        ctx.translate(-(sx+this.w/2),-(hipY+5));
        ctx.translate(bodyShiftX,0);

        if(this.onGround){
            ctx.fillStyle='rgba(0,0,0,.2)';
            ctx.beginPath();
            ctx.ellipse(sx+this.w/2,sy+this.h+1,10.5*shadowScale+this.strideBlend*4.6,3.2*shadowScale+this.strideBlend,0,0,Math.PI*2);
            ctx.fill();
        }

        let drawLeg=(x,offset,front)=>{
            let kneeX=x+offset*.42;
            let kneeY=hipY+8+Math.abs(offset)*.24;
            let footX=x+offset*.78+(front?1:-1);
            let footY=kneeY+8.8+Math.max(0,offset*.05);
            ctx.lineCap='round';ctx.lineJoin='round';
            ctx.strokeStyle=front?style.clothLight:style.clothMid;
            ctx.lineWidth=front?4.3:3.7;
            ctx.beginPath();ctx.moveTo(x,hipY+1.5);ctx.lineTo(kneeX,kneeY);ctx.stroke();
            ctx.strokeStyle=front?style.armorMid:style.leatherMid;
            ctx.lineWidth=front?4.8:4.2;
            ctx.beginPath();ctx.moveTo(kneeX,kneeY);ctx.lineTo(footX,footY);ctx.stroke();
            ctx.strokeStyle=front?style.armorLight:'#26374b';
            ctx.lineWidth=5.2;
            ctx.beginPath();ctx.moveTo(footX-2.4,footY+.4);ctx.lineTo(footX+3.2,footY+.7);ctx.stroke();
        };

        let drawArm=(x,ang,front)=>{
            let upper=7.2,lower=6.2;
            let elbowX=x+Math.cos(ang)*upper;
            let elbowY=shoulderY+Math.sin(ang)*upper;
            let foreAngle=front
                ? (this.attacking?ang+.15*f:ang-.18*f)
                : ang+.28*f;
            let handX=elbowX+Math.cos(foreAngle)*lower;
            let handY=elbowY+Math.sin(foreAngle)*lower;
            ctx.lineCap='round';ctx.lineJoin='round';
            ctx.strokeStyle=front?style.armorMid:style.armorDark;
            ctx.lineWidth=front?4.2:3.8;
            ctx.beginPath();ctx.moveTo(x,shoulderY);ctx.lineTo(elbowX,elbowY);ctx.stroke();
            ctx.strokeStyle=front?style.clothLight:style.clothMid;
            ctx.lineWidth=front?3.8:3.4;
            ctx.beginPath();ctx.moveTo(elbowX,elbowY);ctx.lineTo(handX,handY);ctx.stroke();
            ctx.strokeStyle=style.skin;
            ctx.lineWidth=3;
            ctx.beginPath();ctx.moveTo(handX-.6*f,handY);ctx.lineTo(handX+.9*f,handY+.5);ctx.stroke();
            return {x:handX,y:handY};
        };

        drawLeg(sx+7,rearLegOff,false);

        ctx.fillStyle=style.clothDark;
        ctx.beginPath();
        ctx.moveTo(sx+9,shoulderY+1);
        ctx.quadraticCurveTo(sx+1-f*2,hipY+6,sx+3-scarfTrail*.55,sy+this.h-1+cloakLift);
        ctx.lineTo(sx+10,sy+this.h-5);
        ctx.quadraticCurveTo(sx+9,hipY+10,sx+10,shoulderY+4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx+11,shoulderY+1);
        ctx.quadraticCurveTo(sx+19+f*2,hipY+7,sx+17+scarfTrail*.45,sy+this.h-1-cloakLift*.4);
        ctx.lineTo(sx+10,sy+this.h-5);
        ctx.quadraticCurveTo(sx+11,hipY+10,sx+10,shoulderY+4);
        ctx.fill();

        let rearHand=drawArm(sx+(f>0?6:14)-this.shoulderDrift*.12,rearArmAngle,false);

        ctx.fillStyle=style.clothMid;
        ctx.beginPath();
        ctx.moveTo(sx+5,shoulderY+1);
        ctx.quadraticCurveTo(sx+3,shoulderY+12,sx+5,hipY+4);
        ctx.lineTo(sx+15,hipY+4);
        ctx.quadraticCurveTo(sx+17,shoulderY+12,sx+15,shoulderY+1);
        ctx.quadraticCurveTo(sx+10,shoulderY-2,sx+5,shoulderY+1);
        ctx.fill();

        ctx.fillStyle=style.armorDark;
        ctx.beginPath();
        ctx.moveTo(sx+6,shoulderY+2);
        ctx.lineTo(sx+14,shoulderY+2);
        ctx.quadraticCurveTo(sx+15.5,shoulderY+8,sx+13.5,shoulderY+12);
        ctx.lineTo(sx+6.5,shoulderY+12);
        ctx.quadraticCurveTo(sx+4.5,shoulderY+8,sx+6,shoulderY+2);
        ctx.fill();
        ctx.fillStyle=style.armorMid;
        ctx.fillRect(sx+7,shoulderY+3,6,5);
        ctx.fillStyle=style.armorLight;
        ctx.fillRect(sx+8,shoulderY+3,4,1);
        ctx.fillStyle=style.sash;
        ctx.fillRect(sx+5,shoulderY+10,11,3);
        ctx.fillStyle=style.leatherDark;
        ctx.fillRect(sx+8,shoulderY+10,4,3);

        ctx.fillStyle=style.scarf;
        ctx.beginPath();
        ctx.moveTo(sx+10+f*2,shoulderY+1);
        ctx.quadraticCurveTo(sx+8-f*3,shoulderY+3,sx+7-f*2,shoulderY+8);
        ctx.lineTo(sx+4-f*5-scarfTrail,shoulderY+9+cloakLift*.5);
        ctx.lineTo(sx+8-f*3-scarfTrail*.35,shoulderY+4);
        ctx.quadraticCurveTo(sx+11,shoulderY+3,sx+12+f*2,shoulderY+1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx+11+f,shoulderY+3);
        ctx.lineTo(sx+13-f*2-scarfTrail*.6,shoulderY+12+cloakLift*.35);
        ctx.lineTo(sx+10-f*2,shoulderY+10);
        ctx.fill();

        ctx.save();
        ctx.translate(sx+10,headY+8);
        ctx.rotate(this.headLag+bodyLean*.16);
        ctx.translate(-(sx+10),-(headY+8));
        ctx.fillStyle=style.hoodDark;
        ctx.beginPath();
        ctx.moveTo(sx+4,headY+12);
        ctx.quadraticCurveTo(sx+2,headY+4,sx+6,headY-2);
        ctx.quadraticCurveTo(sx+10,headY-8,sx+14,headY-2);
        ctx.quadraticCurveTo(sx+18,headY+4,sx+16,headY+12);
        ctx.quadraticCurveTo(sx+10,headY+16,sx+4,headY+12);
        ctx.fill();
        ctx.fillStyle=style.hoodMid;
        ctx.beginPath();
        ctx.moveTo(sx+5,headY+11);
        ctx.quadraticCurveTo(sx+5,headY+4,sx+8,headY);
        ctx.quadraticCurveTo(sx+10,headY-4,sx+12,headY);
        ctx.quadraticCurveTo(sx+15,headY+4,sx+15,headY+11);
        ctx.quadraticCurveTo(sx+10,headY+13,sx+5,headY+11);
        ctx.fill();
        ctx.fillStyle=style.hoodLight;
        ctx.beginPath();
        ctx.moveTo(sx+8,headY-1);
        ctx.lineTo(sx+10,headY-5);
        ctx.lineTo(sx+12,headY-1);
        ctx.fill();
        ctx.fillStyle='#07131c';
        ctx.beginPath();
        ctx.moveTo(sx+6,headY+6);
        ctx.quadraticCurveTo(sx+10,headY+2,sx+14,headY+6);
        ctx.quadraticCurveTo(sx+10,headY+10,sx+6,headY+6);
        ctx.fill();
        ctx.fillStyle=style.glow;
        ctx.fillRect(sx+7,headY+5+eyeOffset,2,eyeHeight);
        ctx.fillRect(sx+11,headY+5+eyeOffset,2,eyeHeight);
        if(this.eyeBlink<=0){
            ctx.fillStyle='#ffffff';
            ctx.fillRect(sx+8,headY+5,1,1);
            ctx.fillRect(sx+11,headY+5,1,1);
        }
        ctx.restore();

        drawLeg(sx+12,frontLegOff,true);
        let frontHand=drawArm(sx+(f>0?14:6)+this.shoulderDrift*.16,frontArmAngle,true);

        ctx.strokeStyle=style.rim;
        ctx.globalAlpha=.14;
        ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(sx+14,headY+1);ctx.lineTo(sx+15,shoulderY+14);
        ctx.moveTo(sx+6,shoulderY+3);ctx.lineTo(sx+6.5,shoulderY+13);
        ctx.stroke();
        ctx.globalAlpha=1;

        ctx.strokeStyle=style.slashCore;
        ctx.shadowColor=style.glow;
        ctx.shadowBlur=8;
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(frontHand.x,frontHand.y);
        ctx.lineTo(frontHand.x+f*7,frontHand.y-2);
        ctx.stroke();
        ctx.shadowBlur=0;

        if(this.wallSlide){
            ctx.fillStyle='rgba(179,239,255,.62)';
            for(let i=0;i<4;i++)ctx.fillRect(this.wallDir>0?sx+this.w:sx-2,sy+4+i*7+Math.random()*3,2,3);
        }

        if(this.attacking){
            let p=1-this.attackTimer/16;
            ctx.save();
            ctx.translate(frontHand.x,frontHand.y-1);
            ctx.scale(f,1);
            ctx.globalAlpha=.92-p*.25;
            ctx.lineCap='round';
            ctx.shadowColor=style.slashGlow;
            ctx.shadowBlur=18;
            let swing=ctx.createLinearGradient(2,-12,30,10);
            swing.addColorStop(0,'rgba(79,214,255,0)');
            swing.addColorStop(.28,style.slashGlow);
            swing.addColorStop(.7,style.slashAccent);
            swing.addColorStop(1,'rgba(244,253,255,.25)');
            ctx.strokeStyle=swing;
            ctx.lineWidth=4.2;
            ctx.beginPath();
            ctx.moveTo(2,-10);
            ctx.quadraticCurveTo(16,-18,28,-2);
            ctx.quadraticCurveTo(18,4,8,10);
            ctx.stroke();
            ctx.strokeStyle=style.slashCore;
            ctx.lineWidth=1.8;
            ctx.shadowBlur=10;
            ctx.beginPath();
            ctx.moveTo(6,-6);
            ctx.quadraticCurveTo(15,-11,22,-2);
            ctx.quadraticCurveTo(15,2,9,6);
            ctx.stroke();
            ctx.fillStyle=style.slashCore;
            for(let i=0;i<4;i++){
                let ang=-1.3+Math.random()*2.3;
                let dist=10+Math.random()*12+p*5;
                ctx.fillRect(Math.cos(ang)*dist,Math.sin(ang)*dist,2,2);
            }
            ctx.restore();
        }
        if(this.superActive>0){
            let al=this.superActive<15?this.superActive/15:1;
            let lengthPct=Math.min(1,(90-this.superActive)/15);
            ctx.save();ctx.globalAlpha=al;ctx.shadowColor='#00ffff';ctx.shadowBlur=20;
            let bw=800*lengthPct, rH=30+Math.random()*20, cH=10+Math.random()*10;
            ctx.fillStyle='rgba(0,180,255,0.7)';
            if(f>0){
                ctx.fillRect(sx+this.w,sy-rH/2+Math.random()*4,bw,rH);
                ctx.fillStyle='#ffffff';ctx.fillRect(sx+this.w,sy-cH/2+Math.random()*2,bw,cH);
            }else{
                ctx.fillRect(sx-bw,sy-rH/2+Math.random()*4,bw,rH);
                ctx.fillStyle='#ffffff';ctx.fillRect(sx-bw,sy-cH/2+Math.random()*2,bw,cH);
            }
            ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();
            for(let i=0;i<4;i++){let ly=sy+(Math.random()-.5)*rH;ctx.moveTo(f>0?sx+this.w:sx,ly);ctx.lineTo(f>0?sx+this.w+bw:sx-bw,ly);}
            ctx.stroke();ctx.restore();
        }
        ctx.restore();
    }
}

// ===== ENEMIES =====
class Crawler {
    constructor(x,y,p){this.x=x;this.y=y;this.w=26;this.h=18;this.vx=.6*GAME_TUNING.speedScale;this.vy=0;this.patrol=p*TILE;this.startX=x;this.hp=2;this.maxHp=2;this.alive=true;this.hurtTimer=0;this.legPhase=0;this.breathPhase=0;this.contactDamage=GAME_TUNING.damage.crawler;}
    update(map){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;this.legPhase+=.085;this.breathPhase+=.04;
        this.vy+=GRAVITY;this.x+=this.vx;
        let fc=Math.floor((this.vx>0?this.x+this.w+1:this.x-1)/TILE);
        for(let r=Math.floor(this.y/TILE);r<=Math.floor((this.y+this.h-1)/TILE);r++){if(isSolid(getTile(map,fc,r))){if(this.vx>0)this.x=fc*TILE-this.w;else this.x=(fc+1)*TILE;this.vx*=-1;break;}}
        if(Math.abs(this.x-this.startX)>this.patrol)this.vx*=-1;
        this.y+=this.vy;let l=Math.floor(this.x/TILE),r2=Math.floor((this.x+this.w-1)/TILE),b=Math.floor((this.y+this.h)/TILE),land=false;
        for(let c=l;c<=r2;c++)if(isSolid(getTile(map,c,b))){this.y=b*TILE-this.h;this.vy=0;land=true;}
        if(land){let ec=Math.floor((this.vx>0?this.x+this.w+4:this.x-4)/TILE);if(!isSolid(getTile(map,ec,Math.floor((this.y+this.h+2)/TILE))))this.vx*=-1;}
    }
    takeDamage(d){if(this.hurtTimer>0)return;sfx('hit');this.hp-=d;this.hurtTimer=12;if(this.hp<=0)this.alive=false;}
    draw(cam){
        if(!this.alive)return;let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),d=this.vx>0?1:-1,br=Math.sin(this.breathPhase);
        ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+1,12,3,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=this.hurtTimer>0?'#cc8866':'#2a5a4a';
        for(let i=0;i<6;i++){let lx=sx+2+i*4,lo=Math.sin(this.legPhase+i*1.2)*3;ctx.fillRect(lx,sy+this.h-2,2,4+lo);}
        let bc=this.hurtTimer>0?'#ee8866':'#3a7a5a';
        for(let i=0;i<3;i++){ctx.fillStyle=bc;ctx.fillRect(sx+1+i*8,sy+4+br,8,this.h-6);}
        ctx.fillStyle=bc;ctx.fillRect(sx+(d>0?this.w-6:0),sy+2+br,8,12);
        ctx.fillStyle='#aaffaa';ctx.fillRect(sx+(d>0?this.w-4:2),sy+5+br,3,3);
        ctx.fillStyle='#fff';ctx.fillRect(sx+(d>0?this.w-3:3),sy+6+br,1,1);
    }
}

class Bat {
    constructor(x,y){this.x=x;this.y=y;this.w=24;this.h=16;this.startX=x;this.startY=y;this.hp=1;this.maxHp=1;this.alive=true;this.hurtTimer=0;this.phase=0;this.aggroRange=140;this.aggro=false;this.wingPhase=0;this.contactDamage=GAME_TUNING.damage.bat;}
    update(map,player){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;this.wingPhase+=this.aggro?.22:.1;
        let dx=player.x-this.x,dy=player.y-this.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<this.aggroRange)this.aggro=true;
        if(this.aggro&&dist<Math.max(300, this.aggroRange)){this.x+=(dx/dist)*0.85;this.y+=(dy/dist)*0.85;}
        else{this.phase+=.018;this.x=this.startX+Math.sin(this.phase)*25;this.y=this.startY+Math.cos(this.phase*.7)*13;this.aggro=false;}
    }
    takeDamage(d){if(this.hurtTimer>0)return;sfx('hit');this.hp-=d;this.hurtTimer=10;if(this.hp<=0)this.alive=false;}
    draw(cam){
        if(!this.alive)return;let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),w=Math.sin(this.wingPhase),bc=this.hurtTimer>0?'#dd6666':'#5a3a7a';
        ctx.fillStyle=bc;ctx.fillRect(sx+8,sy+4,8,10);
        let ws=w*8;ctx.fillStyle=this.hurtTimer>0?'#cc5555':'#6a4a8a';
        ctx.beginPath();ctx.moveTo(sx+8,sy+5);ctx.lineTo(sx-2+ws,sy+2-Math.abs(ws));ctx.lineTo(sx-4+ws,sy+8);ctx.lineTo(sx+8,sy+12);ctx.fill();
        ctx.beginPath();ctx.moveTo(sx+16,sy+5);ctx.lineTo(sx+26-ws,sy+2-Math.abs(ws));ctx.lineTo(sx+28-ws,sy+8);ctx.lineTo(sx+16,sy+12);ctx.fill();
        ctx.fillStyle=bc;ctx.fillRect(sx+8,sy+1,3,4);ctx.fillRect(sx+13,sy+1,3,4);
        ctx.fillStyle=this.aggro?'#ff3333':'#ff8844';ctx.fillRect(sx+9,sy+6,2,2);ctx.fillRect(sx+13,sy+6,2,2);
    }
}

class Golem {
    constructor(x,y){this.x=x;this.y=y;this.w=32;this.h=42;this.vx=0;this.vy=0;this.hp=5;this.maxHp=5;this.alive=true;this.hurtTimer=0;this.attackTimer=0;this.attackCooldown=0;this.facing=-1;this.aggroRange=160;this.walkPhase=0;this.crystalGlow=0;this.contactDamage=GAME_TUNING.damage.golem;}
    update(map,player){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;if(this.attackCooldown>0)this.attackCooldown--;if(this.attackTimer>0)this.attackTimer--;
        this.crystalGlow+=.05;this.vy+=GRAVITY;if(this.vy>MAX_FALL)this.vy=MAX_FALL;
        let dx=player.x-this.x,dist=Math.abs(dx);
        if(dist<this.aggroRange&&!player.dead){this.facing=dx>0?1:-1;if(dist>40){this.vx+=(this.facing*.68-this.vx)*.05;this.walkPhase+=.05;}else{this.vx*=.9;if(this.attackCooldown<=0){this.attackTimer=25;this.attackCooldown=76;}}}
        else this.vx*=.92;
        this.x+=this.vx;this.y+=this.vy;
        let b=Math.floor((this.y+this.h)/TILE);for(let c=Math.floor(this.x/TILE);c<=Math.floor((this.x+this.w)/TILE);c++)if(isSolid(getTile(map,c,b))){this.y=b*TILE-this.h;this.vy=0;}
        let fc=Math.floor((this.facing>0?this.x+this.w+2:this.x-2)/TILE);if(isSolid(getTile(map,fc,Math.floor((this.y+this.h/2)/TILE))))this.vx=0;
    }
    getAttackBox(){if(this.attackTimer<=0)return null;return{x:this.facing>0?this.x+this.w:this.x-38,y:this.y,w:38,h:this.h};}
    takeDamage(d){if(this.hurtTimer>0)return;sfx('hit');this.hp-=d;this.hurtTimer=14;if(this.hp<=0)this.alive=false;}
    draw(cam){
        if(!this.alive)return;let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),f=this.facing,g=Math.sin(this.crystalGlow)*.3+.7,h=this.hurtTimer>0;
        ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+1,16,4,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=h?'#886655':'#3a2a52';let wP=Math.sin(this.walkPhase)*3;ctx.fillRect(sx+4,sy+34,10,8+wP);ctx.fillRect(sx+18,sy+34,10,8-wP);
        ctx.fillStyle=h?'#aa7766':'#4a3a6a';ctx.fillRect(sx+2,sy+10,28,26);
        ctx.fillStyle=h?'#886655':'#3a2a52';let ao=this.attackTimer>5&&this.attackTimer<20?-10:0;
        ctx.fillRect(sx+(f>0?28:-6),sy+14+ao,8,20);ctx.fillRect(sx+(f>0?-4:28),sy+16,6,18);
        ctx.fillStyle=h?'#aa7766':'#5a4a7a';ctx.fillRect(sx+4,sy-2,24,16);
        ctx.fillStyle=`rgba(180,128,255,${g})`;ctx.fillRect(sx+10,sy-10,12,10);
        ctx.fillStyle=this.attackTimer>0?'#ff3333':`rgba(180,128,255,${g})`;ctx.fillRect(sx+8,sy+4,5,5);ctx.fillRect(sx+19,sy+4,5,5);
        ctx.fillStyle='#fff';ctx.fillRect(sx+10,sy+6,2,2);ctx.fillRect(sx+21,sy+6,2,2);
    }
}

// ===== // ===== BOSS 1: Guardião de Cristal (Optimized AI, No ShadowBlur Lag) =====
class Boss1 {
    constructor(x,y){
        this.x=x;this.y=y;this.w=56;this.h=64;this.vx=0;this.vy=0;
        this.formHp=[74,78,84];
        this.lifeIndex=0;this.totalLives=3;
        this.hp=this.formHp[0];this.maxHp=this.formHp[0];this.alive=true;this.hurtTimer=0;
        this.phase=0;this.phaseTimer=0;this.attackCooldown=70;this.facing=-1;
        this.walkPhase=0;this.auraPhase=0;this.reformTimer=0;this.formFlash=0;
        this.projectiles=[];this.slamWaves=[];this.floorBursts=[];
        this.attackType=-1;this.comboLeft=0;
        this.prevX=x;this.prevY=y;this.stuckTimer=0;this.chaseHopCooldown=0;
        this.contactDamage=GAME_TUNING.damage.boss1;
        this.handlesProjectileDamage=true;
    }
    getDifficultyScale(){return 1+this.lifeIndex*0.05;}
    startNextLife(){
        if(this.lifeIndex>=this.totalLives-1){this.hp=0;this.alive=false;return;}
        this.lifeIndex++;
        this.maxHp=this.formHp[this.lifeIndex];
        this.hp=this.maxHp;
        this.attackCooldown=88;
        this.phase=0;this.phaseTimer=0;this.attackType=-1;
        this.projectiles=[];this.slamWaves=[];this.floorBursts=[];
        this.reformTimer=95;
        this.formFlash=56;
        this.vx=0;this.vy=-2.5;
        this.stuckTimer=0;this.chaseHopCooldown=26;
        this.contactDamage=GAME_TUNING.damage.boss1*this.getDifficultyScale();
        if(this.lifeIndex===2&&globalThis.setMusicTrack)globalThis.setMusicTrack('boss5Final');
    }
    update(map,player,particles){
        if(!this.alive)return;
        if(this.hurtTimer>0)this.hurtTimer--;
        if(this.attackCooldown>0)this.attackCooldown--;
        if(this.formFlash>0)this.formFlash--;
        if(this.chaseHopCooldown>0)this.chaseHopCooldown--;

        this.auraPhase+=.04;this.walkPhase+=.028;
        this.vy+=GRAVITY;if(this.vy>GAME_TUNING.player.maxFall)this.vy=GAME_TUNING.player.maxFall;

        let dx=player.x-this.x;
        if(this.phase===0)this.facing=dx>0?1:-1;
        let dist=Math.abs(dx);
        let arenaFloor=(map.length-3)*TILE-this.h;
        let movedLastFrame=Math.abs(this.x-this.prevX)+Math.abs(this.y-this.prevY);

        if(this.reformTimer>0){
            this.reformTimer--;
            this.vx*=.85;
            if(this.reformTimer>60)this.y-=0.45;
            else if(this.reformTimer<20)this.y+=0.25;
            if(this.reformTimer%5===0&&particles){
                let col=this.lifeIndex===1?'#8fd7ff':'#ff8a38';
                particles.emit(this.x+this.w/2,this.y+this.h/2,8,col,30,3,20,4);
            }
            if(this.reformTimer===60)sfx('bossSlam');
            if(this.reformTimer===20)sfx('explosion');
            this.updateProjectiles(map,player,particles);
            this.updateHazards(player,particles);
            this.groundCol(map);
            this.prevX=this.x;this.prevY=this.y;
            return;
        }

        if(this.phaseTimer>0){
            this.phaseTimer--;
            if(this.attackType===1){
                this.vx*=.88;
                if(this.phaseTimer===18){
                    sfx('bossShoot');
                    let baseAngle=Math.atan2(player.y-(this.y+10),player.x-(this.x+this.w/2));
                    let spread=0.22-(this.lifeIndex*.015);
                    let count=5+this.lifeIndex;
                    let start=-Math.floor(count/2);
                    for(let i=0;i<count;i++){
                        let idx=start+i;
                        let a=baseAngle+idx*spread;
                        let speed=4.4*this.getDifficultyScale();
                        this.projectiles.push({x:this.x+this.w/2,y:this.y+12,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,w:12,h:12,alive:true,colT:0,damage:0.55*this.getDifficultyScale(),type:'shard'});
                    }
                    if(particles)particles.emit(this.x+this.w/2,this.y+10,15,this.lifeIndex<2?'#8fd7ff':'#ff8844',20,3,15,5);
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=58;this.attackType=-1;}
            }else if(this.attackType===2){
                if(this.phaseTimer>28){
                    this.vx=-this.facing*1.1;
                }else{
                    if(this.phaseTimer===28)sfx('bossSlam');
                    this.vx=this.facing*(6.2*this.getDifficultyScale());
                    if(particles&&this.phaseTimer%3===0)particles.emit(this.x+this.w/2,this.y+this.h-10,3,'#fff',8,1.5,10,2);
                }
                if(this.phaseTimer<=0||this.x<=TILE*2||this.x+this.w>=(map[0].length-2)*TILE){
                    this.comboLeft--;
                    this.vx=0;
                    if(this.comboLeft>0){
                        this.phaseTimer=34;
                        this.facing=player.x>this.x?1:-1;
                    }else{
                        this.phase=0;this.attackCooldown=72;this.attackType=-1;
                    }
                }
            }else if(this.attackType===3){
                if(this.phaseTimer===48){this.vy=-11.5;this.vx=this.facing*2.4;}
                if(this.phaseTimer<50&&this.vy>0){
                    let b=Math.floor((this.y+this.h+this.vy)/TILE);
                    let col=Math.floor((this.x+this.w/2)/TILE);
                    if(isSolid(getTile(map,col,b))){
                        sfx('bossSlam');
                        this.vx=0;
                        let waveSpeed=3.8*this.getDifficultyScale();
                        this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:-waveSpeed,w:20,h:16,life:80,damage:0.52*this.getDifficultyScale()});
                        this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:waveSpeed,w:20,h:16,life:80,damage:0.52*this.getDifficultyScale()});
                        let centerCol=Math.round((player.x+player.w/2)/TILE);
                        [centerCol-3,centerCol,centerCol+3].forEach(c=>{
                            c=Math.max(2,Math.min(map[0].length-3,c));
                            this.floorBursts.push({x:c*TILE+TILE/2,y:(map.length-3)*TILE,w:28,h:0,maxH:TILE*2.8,life:34,warn:18,damage:0.5*this.getDifficultyScale(),active:false});
                        });
                        if(particles)particles.emit(this.x+this.w/2,this.y+this.h,30,this.lifeIndex<2?'#8fd7ff':'#ff8844',40,4,25,3);
                        this.phaseTimer=0;this.phase=0;this.attackCooldown=90;this.attackType=-1;
                    }
                }
                if(this.phaseTimer<=0&&this.attackType!==-1){this.phase=0;this.attackCooldown=90;this.attackType=-1;}
            }else if(this.attackType===4){
                this.vx*=.92;
                if(this.phaseTimer===44){
                    let count=3+this.lifeIndex;
                    for(let i=0;i<count;i++){
                        let ang=i/count*Math.PI*2;
                        this.projectiles.push({x:this.x+this.w/2,y:this.y+this.h/2,vx:0,vy:0,w:14,h:14,alive:true,life:78,type:'orbit',angle:ang,spin:(i%2===0?1:-1)*(0.11+this.lifeIndex*0.015),radius:18,damage:0.48*this.getDifficultyScale()});
                    }
                    sfx('bossShoot');
                }
                if(this.phaseTimer===18){
                    let targetX=player.x+player.w/2,targetY=player.y+player.h/2;
                    this.projectiles.forEach(p=>{
                        if(p.type==='orbit'){
                            let dx2=targetX-p.x,dy2=targetY-p.y,dist2=Math.max(1,Math.hypot(dx2,dy2));
                            p.type='shard';
                            p.vx=dx2/dist2*(4.6*this.getDifficultyScale());
                            p.vy=dy2/dist2*(4.6*this.getDifficultyScale());
                            p.life=100;
                        }
                    });
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=76;this.attackType=-1;}
            }
        }else if(this.attackCooldown<=0&&!player.dead){
            let r=Math.random();
            this.phase=1;
            if(this.lifeIndex===0){
                if(r<.58){this.attackType=1;this.phaseTimer=34;}
                else{this.attackType=3;this.phaseTimer=52;}
            }else if(this.lifeIndex===1){
                if(r<.36){this.attackType=1;this.phaseTimer=34;}
                else if(r<.7){this.attackType=2;this.phaseTimer=56;this.comboLeft=2;}
                else{this.attackType=3;this.phaseTimer=52;}
            }else{
                if(r<.32){this.attackType=4;this.phaseTimer=52;}
                else if(r<.62){this.attackType=2;this.phaseTimer=56;this.comboLeft=2;}
                else{this.attackType=3;this.phaseTimer=54;}
            }
        }else if(this.phase===0){
            if(dist>84)this.vx+=(this.facing*(1.2*this.getDifficultyScale())-this.vx)*.065;
            else this.vx*=.9;
            let elevated=this.y<arenaFloor-TILE*1.25;
            if((elevated||movedLastFrame<0.4&&dist>118)&&this.chaseHopCooldown<=0){
                this.stuckTimer++;
            }else{
                this.stuckTimer=Math.max(0,this.stuckTimer-2);
            }
            if(this.stuckTimer>34){
                this.vy=-8.6;
                this.vx=this.facing*(3.2+this.getDifficultyScale()*0.55);
                this.attackCooldown=Math.max(this.attackCooldown,20);
                this.chaseHopCooldown=52;
                this.stuckTimer=0;
                if(particles)particles.emit(this.x+this.w/2,this.y+this.h,18,this.lifeIndex<2?'#bde8ff':'#ff9a52',18,3,18,4);
                sfx('bossSlam');
            }
        }

        this.updateProjectiles(map,player,particles);
        this.updateHazards(player,particles);
        this.x+=this.vx;this.y+=this.vy;this.groundCol(map);
        this.prevX=this.x;this.prevY=this.y;
    }
    updateProjectiles(map,player,particles){
        this.projectiles.forEach(p=>{
            p.colT=(p.colT||0)+1;
            if(p.type==='orbit'){
                p.life--;
                p.angle+=p.spin;
                p.radius=Math.min(48,p.radius+0.8);
                p.x=this.x+this.w/2+Math.cos(p.angle)*p.radius-p.w/2;
                p.y=this.y+this.h/2+Math.sin(p.angle)*p.radius*.7-p.h/2;
                if(p.life<=0)p.alive=false;
            }else{
                p.x+=p.vx;p.y+=p.vy;
                if(p.life!==undefined){p.life--;if(p.life<=0)p.alive=false;}
            }
            if(p.type!=='orbit'&&isSolid(getTile(map,Math.floor(p.x/TILE),Math.floor((p.y+p.h)/TILE)))){
                p.alive=false;
                if(particles)particles.emit(p.x,p.y,5,this.lifeIndex<2?'#8fd7ff':'#ff8844',8,2,15);
            }
            if(p.alive&&rectCollide(player,{x:p.x,y:p.y,w:p.w,h:p.h})){
                player.takeDamage(p.damage||this.contactDamage);
                p.alive=false;
            }
        });
        this.projectiles=this.projectiles.filter(p=>p.alive);
    }
    updateHazards(player,particles){
        this.floorBursts.forEach(b=>{
            b.life--;
            if(!b.active&&b.life<=b.warn){
                b.active=true;
                sfx('bossShoot');
                if(particles)particles.emit(b.x,b.y,10,this.lifeIndex<2?'#8fd7ff':'#ff8844',20,3,18,4);
            }
            if(b.active){
                b.h=Math.min(b.maxH,b.h+10);
                if(rectCollide(player,{x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h}))player.takeDamage(b.damage);
            }
        });
        this.floorBursts=this.floorBursts.filter(b=>b.life>0);
        this.slamWaves.forEach(w=>{
            w.x+=w.vx;w.life--;
            if(rectCollide(player,{x:w.x-w.w/2,y:w.y-w.h,w:w.w,h:w.h}))player.takeDamage(w.damage);
        });
        this.slamWaves=this.slamWaves.filter(w=>w.life>0);
    }
    groundCol(map){
        let b=Math.floor((this.y+this.h)/TILE);
        if(this.vx!==0){
            let fc=Math.floor((this.vx>0?this.x+this.w:this.x)/TILE);
            for(let r=Math.floor(this.y/TILE);r<=b;r++){
                if(isSolid(getTile(map,fc,r))){this.x=(this.vx>0?fc*TILE-this.w:(fc+1)*TILE);this.vx=0;break;}
            }
        }
        b=Math.floor((this.y+this.h)/TILE);
        for(let c=Math.floor(this.x/TILE);c<=Math.floor((this.x+this.w)/TILE);c++)if(isSolid(getTile(map,c,b))){this.y=b*TILE-this.h;this.vy=0;}
        if(this.x<TILE)this.x=TILE;if(this.x+this.w>(map[0].length-1)*TILE)this.x=(map[0].length-1)*TILE-this.w;
        if(this.y<TILE){this.y=TILE;this.vy=0;}
    }
    getAttackBox(){
        if(this.attackType===2&&this.phaseTimer<=28)return{x:this.x-6,y:this.y-6,w:this.w+12,h:this.h+12};
        return null;
    }
    takeDamage(d){
        if(this.hurtTimer>0||this.reformTimer>0)return;
        sfx('bossHurt');
        this.hp-=d;this.hurtTimer=12;
        if(this.hp<=0){
            sfx('explosion');
            this.startNextLife();
        }
    }
    draw(cam){
        if(!this.alive)return;
        let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),f=this.facing,h=this.hurtTimer>0;
        let rage=this.lifeIndex/(this.totalLives-1);
        let shake=this.reformTimer>0?(Math.random()-.5)*4:0;
        sx+=shake;sy+=shake*.5;

        ctx.fillStyle='rgba(0,0,0,.25)';
        ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+2,28,7,0,0,Math.PI*2);ctx.fill();

        let bodyCol=h?'#d2a58d':(rage>.6?'#6b2417':'#3e506d');
        let armorCol=h?'#b27e5f':(rage>.6?'#ad4f2b':'#7fa1d6');
        let crystalGlow=this.lifeIndex<2?'#8fd7ff':'#ff9a52';
        let eyeColor=this.lifeIndex===0?'#bfefff':this.lifeIndex===1?'#ffd480':'#ff5533';

        ctx.save();
        ctx.globalAlpha=this.reformTimer>0?.45+.35*Math.sin(this.reformTimer*.35):1;
        ctx.fillStyle=bodyCol;ctx.fillRect(sx+4,sy+18,48,40);
        ctx.fillStyle=armorCol;ctx.fillRect(sx+8,sy+20,40,12);
        ctx.fillStyle=crystalGlow;ctx.fillRect(sx+24,sy+24,8,8);
        ctx.fillStyle='#ffffff';ctx.fillRect(sx+26,sy+26,3,3);

        ctx.fillStyle=h?'#d5b2a0':'#6b7688';ctx.fillRect(sx+10,sy+2,36,20);
        ctx.fillStyle=crystalGlow;ctx.fillRect(sx+18,sy-14,20,16);
        ctx.fillStyle=this.lifeIndex<2?'#d6f6ff':'#ffd9bf';ctx.fillRect(sx+22,sy-10,10,8);

        ctx.fillStyle=eyeColor;
        ctx.fillRect(sx+16,sy+7,7,6);ctx.fillRect(sx+33,sy+7,7,6);
        ctx.fillStyle='#fff';ctx.fillRect(sx+19,sy+8,2,2);ctx.fillRect(sx+36,sy+8,2,2);
        ctx.fillStyle='#2a1108';
        ctx.fillRect(sx+14,sy+5,10,1+this.lifeIndex);ctx.fillRect(sx+32,sy+5,10,1+this.lifeIndex);

        let armY=(this.attackType===1&&this.phaseTimer<20)?-8:(this.attackType===3&&this.vy<0?-16:0);
        ctx.fillStyle=armorCol;
        if(this.lifeIndex<2)ctx.fillRect(sx+(f>0?this.w-2:-14),sy+20+armY,16,28);
        ctx.fillRect(sx+(f>0?-10:this.w-6),sy+22,12,24);
        if(this.lifeIndex>=2){
            ctx.fillStyle='#ff7a3d';
            ctx.fillRect(sx+(f>0?this.w+6:-6),sy+24,4,4);
            ctx.fillRect(sx+(f>0?this.w+10:-10),sy+18,3,3);
        }

        ctx.fillStyle='#3f2b22';
        let wP=Math.sin(this.walkPhase)*3;
        ctx.fillRect(sx+8,sy+56,14,8+wP);ctx.fillRect(sx+34,sy+56,14,8-wP);

        for(let i=0;i<this.lifeIndex;i++){
            ctx.strokeStyle=i===0?'#8fd7ff':'#ff8a38';
            ctx.beginPath();ctx.moveTo(sx+14+i*8,sy+6);ctx.lineTo(sx+20+i*8,sy+18);ctx.stroke();
        }
        ctx.restore();

        let bW=70,bX=sx+this.w/2-bW/2;
        ctx.fillStyle='#0a0520';ctx.fillRect(bX-1,sy-24,bW+2,8);
        ctx.fillStyle='#2a1050';ctx.fillRect(bX,sy-23,bW,6);
        let hG=ctx.createLinearGradient(bX,0,bX+bW*(this.hp/this.maxHp),0);
        hG.addColorStop(0,this.lifeIndex<2?'#4ac8ff':'#ff6622');hG.addColorStop(1,this.lifeIndex<2?'#b4f2ff':'#ffaa44');
        ctx.fillStyle=hG;ctx.fillRect(bX,sy-23,bW*(this.hp/this.maxHp),6);

        for(let i=0;i<this.totalLives;i++){
            ctx.fillStyle=i>=this.lifeIndex?'#ffe7b0':'#3a2230';
            ctx.fillRect(bX+i*24,sy-35,18,4);
        }

        this.projectiles.forEach(p=>{let px=Math.round(p.x-cam.x),py=Math.round(p.y-cam.y);ctx.fillStyle=p.type==='orbit'?crystalGlow:(this.lifeIndex<2?'#8fd7ff':'#ff8844');ctx.beginPath();ctx.moveTo(px+5,py);ctx.lineTo(px+10,py+5);ctx.lineTo(px+5,py+10);ctx.lineTo(px,py+5);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(px+3,py+3,4,4);});
        this.slamWaves.forEach(w=>{let wx=Math.round(w.x-cam.x),wy=Math.round(w.y-cam.y);ctx.save();ctx.globalAlpha=w.life/40;ctx.fillStyle=this.lifeIndex<2?'#8fd7ff88':'#ff884488';ctx.fillRect(wx-w.w/2,wy-w.h,w.w,w.h);ctx.fillStyle=this.lifeIndex<2?'#dffbff88':'#ffaa4488';ctx.fillRect(wx-w.w/4,wy-w.h*.7,w.w/2,w.h*.7);ctx.restore();});
        this.floorBursts.forEach(b=>{let bx=Math.round(b.x-cam.x),by=Math.round(b.y-cam.y);ctx.save();if(!b.active){ctx.strokeStyle=this.lifeIndex<2?'rgba(143,215,255,.8)':'rgba(255,138,68,.8)';ctx.strokeRect(bx-b.w/2,by-6,b.w,6);}else{ctx.fillStyle=this.lifeIndex<2?'rgba(143,215,255,.6)':'rgba(255,138,68,.65)';ctx.fillRect(bx-b.w/2,by-b.h,b.w,b.h);ctx.fillStyle='#ffffff';ctx.fillRect(bx-3,by-b.h,6,b.h);}ctx.restore();});
    }
}

// ===== BOSS 3: Faraó das Areias / Faraó Corrompido (Two-Phase Desert Boss) =====
class Boss3 {
    constructor(x,y){
        this.x=x;this.y=y;this.w=52;this.h=62;this.vx=0;this.vy=0;
        this.hp=GAME_TUNING.hp.boss3PhaseOne;this.maxHp=GAME_TUNING.hp.boss3PhaseOne;this.alive=true;this.hurtTimer=0;
        this.phase=0;this.phaseTimer=0;this.attackCooldown=85;this.facing=-1;
        this.floatPhase=0;this.auraPhase=0;this.wingPhase=0;this.telegraphPulse=0;
        this.projectiles=[];this.slamWaves=[];this.sunPillars=[];this.afterimages=[];
        this.attackType=-1;
        this.targetX=x;this.targetY=y;
        this.isPhaseTwo=false;this.startPhaseTwo=false;
        this.beamAngle=0;this.beamActive=false;this.beamTimer=0;this.beamCharge=0;
        this.sandVortex=[];
        this.contactDamage=GAME_TUNING.damage.boss3;
        this.handlesProjectileDamage=true;
    }
    getArenaAnchors(map){
        let cols=map[0].length;
        return {
            leftX:7*TILE,
            centerX:Math.floor(cols/2)*TILE-this.w/2,
            rightX:(cols-9)*TILE,
            groundY:(map.length-8)*TILE,
            midY:(map.length-11)*TILE,
            highY:(map.length-15)*TILE,
            floorY:(map.length-3)*TILE
        };
    }
    spawnAfterimage(life){
        this.afterimages.push({x:this.x,y:this.y,life:life||16,p2:this.isPhaseTwo});
    }
    queueSunPillars(player,map,particles){
        let base=player.x+player.w/2;
        let floorY=(map.length-3)*TILE;
        let offsets=this.isPhaseTwo?[0,-TILE*3,TILE*3,this.facing*TILE*5]:[0,-TILE*2,TILE*2];
        let seen={};
        offsets.forEach(off=>{
            let snapped=Math.round((base+off)/TILE)*TILE;
            snapped=Math.max(TILE*2,Math.min((map[0].length-3)*TILE,snapped));
            if(seen[snapped])return;
            seen[snapped]=true;
            this.sunPillars.push({x:snapped,y:floorY,w:this.isPhaseTwo?38:34,h:0,maxH:this.isPhaseTwo?TILE*8:TILE*6,life:36,warn:18,active:false,p2:this.isPhaseTwo});
        });
        if(particles)particles.emit(this.x+this.w/2,this.y+this.h/2,12,this.isPhaseTwo?'#ff5522':'#e8c840',22,3,18,4);
    }
    releaseOrbitingOrbs(speed){
        this.projectiles.forEach(p=>{
            if(p.state==='orbit'){
                p.state='fly';
                p.life=96;
                p.noCol=false;
                p.vx=Math.cos(p.angle)*speed;
                p.vy=Math.sin(p.angle)*speed;
            }
        });
    }
    update(map,player,particles){
        if(!this.alive){this.projectiles=[];this.slamWaves=[];this.sunPillars=[];this.afterimages=[];return;}
        if(this.hurtTimer>0)this.hurtTimer--;
        if(this.attackCooldown>0)this.attackCooldown--;
        this.floatPhase+=0.03;this.auraPhase+=0.05;this.wingPhase+=0.08;this.telegraphPulse+=0.12;

        let anchors=this.getArenaAnchors(map);
        let p2=this.isPhaseTwo;
        this.contactDamage=p2?GAME_TUNING.damage.boss3PhaseTwo:GAME_TUNING.damage.boss3;
        let dx=player.x-this.x;
        this.facing=dx>0?1:-1;

        if(this.phaseTimer>0){
            this.phaseTimer--;
            if(this.attackType===1){
                this.targetX=player.x<this.x?anchors.rightX:anchors.leftX;
                this.targetY=anchors.highY;
                if(this.phaseTimer%16===0){
                    let gapCol=Math.round((player.x+player.w/2)/TILE);
                    for(let c=3;c<map[0].length-3;c+=3){
                        if(Math.abs(c-gapCol)>(p2?2:3)){
                            this.projectiles.push({x:c*TILE+6,y:TILE+Math.random()*TILE*1.5,vx:(Math.random()-.5)*(p2?1.02:0.68),vy:p2?4:3.05,w:10,h:20,alive:true,life:120,type:'sand'});
                        }
                    }
                    if(particles)particles.emit(this.x+this.w/2,this.y,10,p2?'#ff6633':'#e8c840',24,3,16,4);
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackType=-1;this.attackCooldown=p2?60:95;}
            }else if(this.attackType===2){
                if(this.phaseTimer>24){
                    this.targetX=Math.max(TILE*3,Math.min((map[0].length-4)*TILE,player.x-this.facing*TILE*5));
                    this.targetY=Math.max(anchors.midY,Math.min(player.y-TILE,anchors.groundY));
                    if(this.phaseTimer%6===0)this.spawnAfterimage(16);
                }else{
                    this.x+=this.facing*(p2?7.2:5.8);this.targetX=this.x;this.targetY=this.y;
                    if(this.phaseTimer%2===0){
                        this.spawnAfterimage(10);
                        if(particles)particles.emit(this.x+this.w/2,this.y+this.h/2,4,p2?'#ff5522':'#e8c840',10,2,12,3);
                    }
                    if(this.x<TILE*2||this.x>(map[0].length-3)*TILE)this.phaseTimer=0;
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackType=-1;this.attackCooldown=p2?70:110;}
            }else if(this.attackType===3){
                if(this.phaseTimer>34){
                    this.targetX=player.x+player.w/2-this.w/2;this.targetY=anchors.highY-TILE;
                    if(this.phaseTimer%7===0)this.spawnAfterimage(8);
                }else if(this.phaseTimer===34){
                    this.vy=p2?10.6:8.1;
                }else if(this.vy>0){
                    this.y+=this.vy;this.vy=Math.min(this.vy+0.35,p2?16:12);this.targetX=this.x;this.targetY=this.y;
                    let bRow=Math.floor((this.y+this.h)/TILE),bCol=Math.floor((this.x+this.w/2)/TILE);
                    if(isSolid(getTile(map,bCol,bRow))){
                        this.y=bRow*TILE-this.h;this.vy=0;
                        sfx('bossSlam');
                        this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:-4.2,w:26,h:18,life:72,damage:p2?0.46:0.34});
                        this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:4.2,w:26,h:18,life:72,damage:p2?0.46:0.34});
                        if(p2){
                            this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:-2.8,w:20,h:14,life:92,damage:0.3});
                            this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:2.8,w:20,h:14,life:92,damage:0.3});
                        }
                        if(particles)particles.emit(this.x+this.w/2,this.y+this.h,34,p2?'#ff6633':'#c8a838',40,5,25,4);
                        this.phaseTimer=0;
                    }
                }
                if(this.phaseTimer<=0&&this.vy===0){this.phase=0;this.attackType=-1;this.attackCooldown=p2?72:105;}
            }else if(this.attackType===4){
                this.targetX=anchors.centerX;this.targetY=anchors.midY-32;
                if(this.phaseTimer===58){
                    this.beamCharge=20;
                    this.beamAngle=Math.atan2(player.y+player.h/2-(this.y+this.h/2),player.x+player.w/2-(this.x+this.w/2));
                    sfx('bossShoot');
                }
                if(this.phaseTimer===38){
                    this.beamActive=true;
                    this.beamTimer=p2?42:30;
                }
                if(this.phaseTimer<=0){this.beamActive=false;this.beamCharge=0;this.phase=0;this.attackType=-1;this.attackCooldown=p2?72:110;}
            }else if(this.attackType===5){
                this.targetX=anchors.centerX;this.targetY=anchors.midY;
                if(this.phaseTimer===56){
                    let count=p2?6:4;
                    let cx=this.x+this.w/2,cy=this.y+this.h/2;
                    for(let i=0;i<count;i++){
                        let ang=i/count*Math.PI*2;
                        this.projectiles.push({x:cx,y:cy,vx:0,vy:0,w:14,h:14,alive:true,life:120,type:'orb',state:'orbit',angle:ang,orbitRadius:22,orbitGrow:p2?1.25:1,orbitSpin:(i%2===0?1:-1)*(p2?0.16:0.12),noCol:true});
                    }
                    if(particles)particles.emit(cx,cy,18,p2?'#ff5522':'#e8a028',20,4,18,4);
                }
                if(this.phaseTimer===24){
                    this.releaseOrbitingOrbs(p2?3.75:3.05);
                    sfx('bossShoot');
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackType=-1;this.attackCooldown=p2?58:88;}
            }else if(this.attackType===6){
                this.targetX=anchors.centerX;this.targetY=anchors.highY+TILE;
                if(this.phaseTimer===30){
                    sfx('bossShoot');
                    let cx=this.x+this.w/2,cy=this.y+this.h/2,count=18;
                    for(let i=0;i<count;i++){
                        let ang=i/count*Math.PI*2,spd=i%2===0?3.55:2.7;
                        this.projectiles.push({x:cx,y:cy,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,w:14,h:14,alive:true,life:100,type:'orb'});
                    }
                    if(particles)particles.emit(cx,cy,28,'#ff6633',34,5,22,5);
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackType=-1;this.attackCooldown=68;}
            }else if(this.attackType===7){
                this.targetX=anchors.centerX;this.targetY=anchors.highY;
                if(this.phaseTimer%18===0&&this.phaseTimer>=18)this.queueSunPillars(player,map,particles);
                if(this.phaseTimer<=0){this.phase=0;this.attackType=-1;this.attackCooldown=p2?62:96;}
            }
        }else if(this.attackCooldown<=0&&!player.dead){
            let r=Math.random();
            this.phase=1;
            if(!p2){
                if(r<0.3){this.attackType=1;this.phaseTimer=72;}
                else if(r<0.55){this.attackType=3;this.phaseTimer=56;}
                else if(r<0.8){this.attackType=5;this.phaseTimer=60;}
                else{this.attackType=7;this.phaseTimer=66;}
            }else{
                if(r<0.14){this.attackType=1;this.phaseTimer=84;}
                else if(r<0.28){this.attackType=2;this.phaseTimer=56;}
                else if(r<0.43){this.attackType=3;this.phaseTimer=62;}
                else if(r<0.58){this.attackType=4;this.phaseTimer=62;}
                else if(r<0.73){this.attackType=5;this.phaseTimer=60;}
                else if(r<0.87){this.attackType=7;this.phaseTimer=72;}
                else{this.attackType=6;this.phaseTimer=44;}
            }
        }else{
            let desiredX=player.x+player.w/2-this.w/2+this.facing*TILE*4;
            desiredX=Math.max(TILE*2,Math.min((map[0].length-3)*TILE,desiredX));
            this.targetX+=(desiredX-this.targetX)*0.08;
            this.targetY=Math.max(anchors.midY,Math.min(player.y-TILE*2,anchors.groundY))+Math.sin(this.floatPhase)*6;
        }

        if(!(this.attackType===3&&this.vy>0)){
            let sdx=this.targetX-this.x,sdy=this.targetY-this.y,dist=Math.hypot(sdx,sdy);
            let glide=p2?1.85:1.32;
            if(dist>1.5){this.x+=sdx/dist*glide;this.y+=sdy/dist*glide;}
        }

        if(this.beamCharge>0){
            let targetAngle=Math.atan2(player.y+player.h/2-(this.y+this.h/2),player.x+player.w/2-(this.x+this.w/2));
            let diff=targetAngle-this.beamAngle;
            while(diff>Math.PI)diff-=Math.PI*2;
            while(diff<-Math.PI)diff+=Math.PI*2;
            this.beamAngle+=diff*(p2?0.06:0.045);
            this.beamCharge--;
        }
        if(this.beamActive){
            this.beamTimer--;
            let targetAngle=Math.atan2(player.y+player.h/2-(this.y+this.h/2),player.x+player.w/2-(this.x+this.w/2));
            let diff=targetAngle-this.beamAngle;
            while(diff>Math.PI)diff-=Math.PI*2;
            while(diff<-Math.PI)diff+=Math.PI*2;
            this.beamAngle+=diff*(p2?0.045:0.032);
            let bx=this.x+this.w/2,by=this.y+this.h/2,damage=p2?0.1:0.07;
            for(let d=28;d<520;d+=10){
                let lx=bx+Math.cos(this.beamAngle)*d,ly=by+Math.sin(this.beamAngle)*d;
                let tc=Math.floor(lx/TILE),tr=Math.floor(ly/TILE);
                if(isSolid(getTile(map,tc,tr)))break;
                if(Math.abs(lx-player.x-player.w/2)<16&&Math.abs(ly-player.y-player.h/2)<18){
                    player.takeDamage(damage);
                    break;
                }
            }
            if(this.beamTimer<=0)this.beamActive=false;
        }

        let orbImpact=p2?0.42:0.32,sandImpact=p2?0.38:0.28;
        this.projectiles.forEach(p=>{
            if(p.state==='orbit'){
                p.life--;
                p.angle+=p.orbitSpin;
                p.orbitRadius=Math.min(p.orbitRadius+p.orbitGrow,p2?60:48);
                p.x=this.x+this.w/2+Math.cos(p.angle)*p.orbitRadius-p.w/2;
                p.y=this.y+this.h/2+Math.sin(p.angle)*p.orbitRadius*0.72-p.h/2;
                if(p.life<=0)p.alive=false;
                return;
            }
            p.x+=p.vx;p.y+=p.vy;
            if(p.type==='sand')p.vy+=0.02;
            p.life--;
            if(p.life<=0)p.alive=false;
            let tc=Math.floor((p.x+p.w/2)/TILE),tr=Math.floor((p.y+p.h/2)/TILE);
            if(p.type==='sand'){
                if(isSolid(getTile(map,Math.floor((p.x+p.w/2)/TILE),Math.floor((p.y+p.h)/TILE)))){
                    p.alive=false;
                    if(particles)particles.emit(p.x,p.y,6,p2?'#ff6633':'#c8a838',10,2,12,3);
                }
            }else if(isSolid(getTile(map,tc,tr))){
                p.alive=false;
                if(particles)particles.emit(p.x,p.y,4,p2?'#ff5522':'#e8a028',10,2,10,3);
            }
            if(p.alive&&!p.noCol&&rectCollide(player,p)){
                player.takeDamage(p.type==='sand'?sandImpact:orbImpact);
                p.alive=false;
            }
        });
        this.projectiles=this.projectiles.filter(p=>p.alive);

        this.sunPillars.forEach(p=>{
            p.life--;
            if(!p.active&&p.life<=p.warn){
                p.active=true;
                sfx('bossSlam');
                if(particles)particles.emit(p.x,p.y-16,18,p.p2?'#ff6633':'#e8c840',24,4,18,4);
            }
            if(p.active){
                p.h=Math.min(p.maxH,p.h+26);
                if(rectCollide(player,{x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h}))player.takeDamage(p.p2?0.46:0.34);
            }
        });
        this.sunPillars=this.sunPillars.filter(p=>p.life>0);

        this.afterimages=this.afterimages.filter(img=>{img.life--;return img.life>0;});
        this.slamWaves.forEach(w=>{w.x+=w.vx;w.life--;w.w+=0.15;
            if(rectCollide(player,{x:w.x-w.w/2,y:w.y-w.h,w:w.w,h:w.h}))player.takeDamage(w.damage);
        });
        this.slamWaves=this.slamWaves.filter(w=>w.life>0);
        this.clamp(map);
    }
    clamp(map){
        if(this.x<TILE)this.x=TILE;if(this.x+this.w>(map[0].length-1)*TILE)this.x=(map[0].length-1)*TILE-this.w;
        if(this.y<TILE)this.y=TILE;if(this.y+this.h>(map.length-2)*TILE)this.y=(map.length-2)*TILE-this.h;
    }
    getAttackBox(){
        if(this.attackType===2&&this.phaseTimer<=24)return{x:this.x-6,y:this.y-6,w:this.w+12,h:this.h+12};
        return null;
    }
    takeDamage(d){
        if(this.hurtTimer>0)return;
        sfx('bossHurt');this.hp-=d;this.hurtTimer=10;
        if(this.hp<=0){
            if(!this.isPhaseTwo){
                this.hp=1;this.startPhaseTwo=true;
                this.beamActive=false;this.beamCharge=0;
                this.projectiles=[];this.slamWaves=[];this.sunPillars=[];this.afterimages=[];
            }else{
                this.hp=0;this.alive=false;this.afterimages=[];
            }
        }
    }
    draw(cam){
        if(!this.alive||this.visible===false)return;
        let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),h=this.hurtTimer>0;
        let flt=Math.sin(this.floatPhase)*5;
        let a=Math.sin(this.auraPhase)*.3+.7;
        let p2=this.isPhaseTwo;
        let wSpan=Math.sin(this.wingPhase)*12;

        // Colors based on phase (Desert)
        let cBody=p2?'#3a1008':'#2a1e10';
        let cArmor=p2?'#7a2010':'#6a5020';
        let cGlow=p2?'#ff4400':'#e8c840';
        let cWing=p2?'rgba(255,68,0,':'rgba(232,200,64,';
        let cAura=p2?'#ff4400':'#e8c840';

        this.afterimages.forEach(img=>{
            let ax=Math.round(img.x-cam.x),ay=Math.round(img.y-cam.y);
            ctx.save();
            ctx.globalAlpha=img.life/18*.24;
            ctx.fillStyle=img.p2?'#ff5522':'#e8c840';
            ctx.beginPath();
            ctx.moveTo(ax+8,ay+38);ctx.quadraticCurveTo(ax-12,ay+34,ax-18,ay+52);ctx.lineTo(ax-8,ay+54);
            ctx.quadraticCurveTo(ax+6,ay+44,ax+14,ay+38);ctx.fill();
            ctx.fillRect(ax+14,ay+20,24,18);
            ctx.fillRect(ax+28,ay+14,14,10);
            ctx.fillRect(ax+38,ay+18,10,6);
            ctx.restore();
        });

        this.sunPillars.forEach(p=>{
            let px=Math.round(p.x-cam.x),py=Math.round(p.y-cam.y);
            ctx.save();
            if(!p.active){
                let pulse=.35+Math.sin(this.telegraphPulse+p.x*.02)*.25;
                ctx.strokeStyle=p.p2?`rgba(255,90,40,${pulse})`:`rgba(232,200,64,${pulse})`;
                ctx.lineWidth=2;
                ctx.strokeRect(px-p.w/2,py-8,p.w,8);
                ctx.fillStyle=p.p2?'rgba(255,90,40,.16)':'rgba(232,200,64,.14)';
                ctx.fillRect(px-p.w/2,py-4,p.w,4);
            }else{
                ctx.globalCompositeOperation='lighter';
                let pillar=ctx.createLinearGradient(0,py-p.h,0,py);
                pillar.addColorStop(0,p.p2?'rgba(255,240,180,0)':'rgba(255,250,210,0)');
                pillar.addColorStop(.2,p.p2?'rgba(255,110,50,.8)':'rgba(255,215,90,.75)');
                pillar.addColorStop(1,p.p2?'rgba(120,20,8,.25)':'rgba(120,90,20,.25)');
                ctx.fillStyle=pillar;ctx.fillRect(px-p.w/2,py-p.h,p.w,p.h);
                ctx.fillStyle=p.p2?'rgba(255,240,200,.75)':'rgba(255,252,220,.7)';
                ctx.fillRect(px-4,py-p.h,8,p.h);
            }
            ctx.restore();
        });

        // Shadow
        ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+10+flt,24,6,0,0,Math.PI*2);ctx.fill();

        // Aura glow
        ctx.save();ctx.globalAlpha=.12*a;
        let ag=ctx.createRadialGradient(sx+this.w/2,sy+this.h/2+flt,0,sx+this.w/2,sy+this.h/2+flt,90);
        ag.addColorStop(0,cAura);ag.addColorStop(1,'transparent');ctx.fillStyle=ag;
        ctx.fillRect(sx-50,sy-50+flt,this.w+100,this.h+100);ctx.restore();
        let headLift=this.attackType===4&&this.beamCharge>0?-8:this.attackType===2&&this.phaseTimer<=24?-4:0;
        let mouthX=sx+47,mouthY=sy+26+flt+headLift;

        if(this.beamCharge>0){
            let bx=mouthX,by=mouthY;
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.globalAlpha=.35+Math.sin(this.telegraphPulse)*.15;
            ctx.strokeStyle=p2?'rgba(255,110,40,.75)':'rgba(255,220,120,.7)';ctx.lineWidth=3;
            ctx.beginPath();ctx.moveTo(bx,by);
            ctx.lineTo(bx+Math.cos(this.beamAngle)*320,by+Math.sin(this.beamAngle)*320);ctx.stroke();
            ctx.beginPath();ctx.arc(bx,by,18+Math.sin(this.telegraphPulse)*4,0,Math.PI*2);ctx.stroke();
            ctx.restore();
        }

        let tailSwing=Math.sin(this.wingPhase)*10;
        let bodyY=sy+28+flt;
        let lizardBody=h?'#e7c38d':(p2?'#7b2314':'#7c6330');
        let lizardDark=h?'#b8834f':(p2?'#4d120a':'#54411c');
        let bellyCol=p2?'#d58a50':'#d8c47a';
        let spikeCol=p2?'#ff7b38':'#f2d36a';
        let eyeCol=p2?'#ff2b16':'#8bfff3';

        ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+10+flt,24,6,0,0,Math.PI*2);ctx.fill();

        ctx.beginPath();
        ctx.fillStyle=lizardDark;
        ctx.moveTo(sx+12,bodyY+10);
        ctx.quadraticCurveTo(sx-8,bodyY+4,sx-16+tailSwing,bodyY+20);
        ctx.quadraticCurveTo(sx-10+tailSwing,bodyY+28,sx+4,bodyY+24);
        ctx.quadraticCurveTo(sx+14,bodyY+20,sx+18,bodyY+14);
        ctx.fill();

        ctx.fillStyle=lizardBody;
        ctx.beginPath();
        ctx.moveTo(sx+16,bodyY-4);
        ctx.quadraticCurveTo(sx+6,bodyY+4,sx+10,bodyY+18);
        ctx.quadraticCurveTo(sx+20,bodyY+26,sx+32,bodyY+22);
        ctx.quadraticCurveTo(sx+44,bodyY+16,sx+46,bodyY+4);
        ctx.quadraticCurveTo(sx+44,bodyY-10,sx+30,bodyY-12);
        ctx.quadraticCurveTo(sx+20,bodyY-12,sx+16,bodyY-4);
        ctx.fill();

        ctx.fillStyle=bellyCol;
        ctx.beginPath();
        ctx.moveTo(sx+18,bodyY+4);
        ctx.quadraticCurveTo(sx+28,bodyY+20,sx+40,bodyY+8);
        ctx.lineTo(sx+38,bodyY+16);
        ctx.quadraticCurveTo(sx+28,bodyY+24,sx+20,bodyY+14);
        ctx.fill();

        for(let i=0;i<4;i++){
            let spikeX=sx+18+i*7;
            let spikeH=8+(i%2)*4+Math.sin(this.wingPhase+i)*2;
            ctx.fillStyle=spikeCol;
            ctx.beginPath();ctx.moveTo(spikeX,bodyY-6);ctx.lineTo(spikeX+4,bodyY-6-spikeH);ctx.lineTo(spikeX+8,bodyY-6);ctx.fill();
        }

        let legKick=this.attackType===3&&this.vy>0?8:0;
        ctx.fillStyle=lizardDark;
        ctx.fillRect(sx+18,bodyY+16,6,14+legKick);
        ctx.fillRect(sx+30,bodyY+18,6,12+legKick*.5);
        ctx.fillRect(sx+20,bodyY+28+legKick,8,3);
        ctx.fillRect(sx+32,bodyY+30+legKick*.5,8,3);
        ctx.fillStyle=spikeCol;
        ctx.fillRect(sx+28,bodyY+28,2,4);ctx.fillRect(sx+40,bodyY+30,2,4);

        ctx.fillStyle=cWing+(0.4+a*.12)+')';
        ctx.beginPath();
        ctx.moveTo(sx+30,bodyY-4+headLift);
        ctx.lineTo(sx+18-wSpan*.35,bodyY-24+headLift);
        ctx.lineTo(sx+34,bodyY-16+headLift);
        ctx.lineTo(sx+46+wSpan*.2,bodyY-24+headLift);
        ctx.lineTo(sx+40,bodyY-4+headLift);
        ctx.fill();

        ctx.fillStyle=lizardBody;
        ctx.beginPath();
        ctx.moveTo(sx+30,bodyY-2+headLift);
        ctx.lineTo(sx+42,bodyY-8+headLift);
        ctx.lineTo(sx+48,bodyY-2+headLift);
        ctx.lineTo(sx+46,bodyY+8+headLift);
        ctx.lineTo(sx+34,bodyY+8+headLift);
        ctx.fill();
        ctx.fillStyle=lizardDark;
        ctx.fillRect(sx+42,bodyY-2+headLift,10,8);
        ctx.fillStyle=bellyCol;
        ctx.fillRect(sx+42,bodyY+4+headLift,9,4);
        ctx.fillStyle=spikeCol;
        ctx.fillRect(sx+46,bodyY-8+headLift,4,4);
        ctx.fillStyle=eyeCol;
        ctx.fillRect(sx+40,bodyY-3+headLift,4,3);
        ctx.fillStyle='#fff';ctx.fillRect(sx+42,bodyY-2+headLift,1,1);
        ctx.fillStyle=cGlow;
        ctx.fillRect(sx+28,bodyY+2,6,5);
        ctx.fillStyle='#ffffff';ctx.fillRect(sx+30,bodyY+3,2,2);

        // HP bar
        let bW=110,bX=sx+this.w/2-bW/2;
        ctx.fillStyle='#1a1008';ctx.fillRect(bX-1,sy-28+flt,bW+2,8);
        ctx.fillStyle='#2a1a0a';ctx.fillRect(bX,sy-27+flt,bW,6);
        let hG=ctx.createLinearGradient(bX,0,bX+bW*(this.hp/this.maxHp),0);
        hG.addColorStop(0,p2?'#aa2200':'#886600');hG.addColorStop(1,p2?'#ff4400':'#e8c840');
        ctx.fillStyle=hG;ctx.fillRect(bX,sy-27+flt,bW*(this.hp/this.maxHp),6);

        // Phase label
        ctx.fillStyle=cGlow;ctx.font='7px "Press Start 2P"';ctx.textAlign='center';
        ctx.fillText(p2?'LAGARTO':'BASILISCO',sx+this.w/2,sy-32+flt);ctx.textAlign='left';

        // Heat beam rendering
        if(this.beamActive){
            let bx=mouthX,by=mouthY;
            ctx.save();ctx.globalCompositeOperation='lighter';
            ctx.strokeStyle=p2?'rgba(255,85,34,0.8)':'rgba(232,200,64,0.75)';ctx.lineWidth=10;
            ctx.beginPath();ctx.moveTo(bx,by);
            ctx.lineTo(bx+Math.cos(this.beamAngle)*520,by+Math.sin(this.beamAngle)*520);ctx.stroke();
            ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=4;
            ctx.beginPath();ctx.moveTo(bx,by);
            ctx.lineTo(bx+Math.cos(this.beamAngle)*520,by+Math.sin(this.beamAngle)*520);ctx.stroke();
            ctx.restore();
        }

        // Projectiles
        this.projectiles.forEach(p=>{
            let px=Math.round(p.x-cam.x),py=Math.round(p.y-cam.y);
            if(p.type==='sand'){
                ctx.save();
                ctx.translate(px+p.w/2,py+p.h/2);
                ctx.rotate((p.life+p.x)*.08);
                ctx.fillStyle=p2?'#ff5522':'#e8c840';
                ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(6,0);ctx.lineTo(0,10);ctx.lineTo(-6,0);ctx.fill();
                ctx.fillStyle='#ffe880';ctx.fillRect(-1,-4,2,8);
                ctx.restore();
            }else if(p.type==='orb'){
                ctx.fillStyle=p2?'#ff4400':'#e8a028';
                ctx.beginPath();ctx.arc(px+p.w/2,py+p.h/2,p.state==='orbit'?8:7,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='#ffe880';
                ctx.beginPath();ctx.arc(px+p.w/2,py+p.h/2,3,0,Math.PI*2);ctx.fill();
            }
        });
        // Slam waves
        this.slamWaves.forEach(w=>{
            let wx=Math.round(w.x-cam.x),wy=Math.round(w.y-cam.y);
            ctx.save();ctx.globalAlpha=w.life/70;
            ctx.fillStyle=p2?'#ff440088':'#e8c84088';ctx.fillRect(wx-w.w/2,wy-w.h,w.w,w.h);
            ctx.fillStyle=p2?'#ff884488':'#ffe88088';ctx.fillRect(wx-w.w/4,wy-w.h*.7,w.w/2,w.h*.7);
            ctx.restore();
        });
    }
}

// ===== // ===== BOSS 2: Shadow Lord (True final boss: Ranged Bullet Hell + Lasers + Scythe) =====
class Boss2 {
    constructor(x,y){
        this.x=x;this.y=y;this.w=52;this.h=60;this.vx=0;this.vy=0;
        this.hp=GAME_TUNING.hp.boss2PhaseOne;this.maxHp=GAME_TUNING.hp.boss2PhaseOne;this.alive=true;this.hurtTimer=0;
        this.phase=0;this.phaseTimer=0;this.attackCooldown=30;this.facing=-1;
        this.floatPhase=0;this.auraPhase=0;
        this.projectiles=[];this.orbPhase=0;
        this.telegraphTimer=0;this.telegraphType='';this.scythe=null;
        this.targetX=x;this.targetY=y;this.dashTrail=[];
        this.isPhaseTwo=false; this.startPhaseTwo=false;
        this.contactDamage=GAME_TUNING.damage.boss2;
        this.handlesProjectileDamage=true;
    }
    update(map,player,particles){
        if(!this.alive){this.projectiles=[];this.scythe=null;return;}
        if(this.hurtTimer>0)this.hurtTimer--;if(this.attackCooldown>0)this.attackCooldown--;
        this.floatPhase+=.03;this.auraPhase+=.05;this.orbPhase+=.04;
        this.contactDamage=this.isPhaseTwo?GAME_TUNING.damage.boss2PhaseTwo:GAME_TUNING.damage.boss2;
        
        let dx=player.x-this.x;this.facing=dx>0?1:-1;
        
        // Constant glide speed instead of lerp (no more 'teleporting' sudden snaps)
        let sdx = this.targetX - this.x, sdy = this.targetY - this.y;
        let dist = Math.sqrt(sdx*sdx + sdy*sdy);
        if(dist > 2.5){
            this.x += (sdx/dist)*2.1;
            this.y += (sdy/dist)*2.1;
        }

        // Telegraph phase
        if(this.telegraphTimer>0){
            this.telegraphTimer--;
            if(this.telegraphTimer<=0){
                if(this.telegraphType==='cascade'){this.phase=1;this.phaseTimer=110;} // Meteor rain
                else if(this.telegraphType==='dash'){
                    this.phase=2;this.phaseTimer=30; 
                    this.vx=this.facing*(this.isPhaseTwo?15.3:11);
                    this.targetY=this.y; // Lock Y
                }
                else if(this.telegraphType==='spikes'){this.phase=3;this.phaseTimer=120;}
                else if(this.telegraphType==='ring'){this.phase=4;this.phaseTimer=100;}
                else if(this.telegraphType==='plunge'){this.phase=5;this.phaseTimer=80;}
                else if(this.telegraphType==='scythe'){this.phase=6;this.phaseTimer=100;this.scythe={x:this.x+this.w/2,y:this.y+this.h/2,vx:this.facing*3,vy:0,w:30,h:30,alive:true,rot:0};}
            }
            this.updateProj(map,player,particles);
            this.clamp(map);return;
        }

        if(this.phaseTimer>0){
            this.phaseTimer--;
            if(this.phase===1){// Shadow Meteor Rain (Sinister Chuva)
                if(this.phaseTimer%25===0){
                    let gapCol = Math.floor(player.x/TILE);
                    for(let c=1;c<24;c+=2){ // Densely packed arrows
                        if(Math.abs(c-gapCol)>3){ // Generous gap for fairness
                            this.projectiles.push({x:c*TILE,y:1*TILE+Math.random()*TILE,vx:0,vy:(this.isPhaseTwo?4.7:3)+Math.random(),w:16,h:36,alive:true,life:140,type:'meteor',noCol:true});
                        }
                    }
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?60:100;}
            }else if(this.phase===2){// Shadow Dash (Fast horizontal slice)
                this.x+=this.vx;
                this.targetX=this.x; // Follow the dash mapping
                if(this.phaseTimer%2===0){this.dashTrail.push({x:this.x,y:this.y,life:20});}
                if(rectCollide(player,{x:this.x,y:this.y,w:this.w,h:this.h}))player.takeDamage(this.isPhaseTwo?0.9:0.72);
                
                // Stop at walls
                if(this.x<TILE*2||this.x>24*TILE){this.phaseTimer=0;}
                if(this.phaseTimer<=0){this.phase=0;this.vx=0;this.attackCooldown=this.isPhaseTwo?120:180;}
            }else if(this.phase===3){// Ground Spikes
                if(this.phaseTimer===90 || this.phaseTimer===50 || this.phaseTimer===10){ // More spread out
                    if(particles)particles.emit(player.x+player.w/2, player.y+player.h, 10, '#aa00aa', 10, 2, 10, 2);
                    // Drop a warning marker at player's foot
                    this.projectiles.push({x:player.x+player.w/2 - 12, y:player.y+player.h - 4, vx:0, vy:0, w:24, h:4, alive:true, life:55, type:'spike_warn',noCol:true}); // Needs longer life before erupt
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?70:100;}
            }else if(this.phase===4){// Expanding Ring
                if(this.phaseTimer===80){
                    if(particles)particles.emit(this.x+this.w/2,this.y+this.h/2,30,'#ff00ff',40,5,30,5);
                    this.projectiles.push({x:this.x+this.w/2,y:this.y+this.h/2,vx:0,vy:0,w:10,h:10,alive:true,life:100,type:'ring',radius:10,noCol:true});
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?70:100;}
            }else if(this.phase===5){// Plunge Drop Slam
                if(this.phaseTimer>60){ // Floating above player, tracking
                    this.targetX=player.x; this.targetY=8*TILE; // Lower
                    let pdx = this.targetX - this.x; this.x += Math.sign(pdx)*Math.min(2.5, Math.abs(pdx)); // Smooth track
                }else if(this.phaseTimer===60){
                    this.vy = this.isPhaseTwo?13.6:9.35;
                }else if(this.phaseTimer<60 && this.vy > 0){
                    this.targetX=this.x; this.targetY=this.y; // Lock float target
                    this.y += this.vy;
                    let bCol = Math.floor((this.x+this.w/2)/TILE);
                    let bRow = Math.floor((this.y+this.h)/TILE);
                    if(isSolid(getTile(map,bCol,bRow))){
                        this.y = bRow*TILE - this.h;
                        this.vy = 0; // Ground hit!
                        if(particles)particles.emit(this.x+this.w/2,this.y+this.h,25,'#8844ff',25,4,20,5);
                    }
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?70:100;}
            }else if(this.phase===6){ // Scythe attack
                if(this.scythe){
                    this.scythe.x += this.scythe.vx;
                    this.scythe.y += this.scythe.vy;
                    this.scythe.rot += 0.3; // Rotate scythe
                    if(rectCollide(player, this.scythe)) player.takeDamage(this.isPhaseTwo?0.88:0.72);
                    if(this.phaseTimer < 50 && this.scythe.vx * this.facing > 0){ // Return after a certain time
                        this.scythe.vx *= -1;
                    }
                    if(this.phaseTimer < 20 && this.scythe.vx * this.facing < 0){ // Return to boss
                        let sdx = this.x + this.w/2 - this.scythe.x;
                        let sdy = this.y + this.h/2 - this.scythe.y;
                        let sdist = Math.sqrt(sdx*sdx + sdy*sdy);
                        if(sdist > 1){
                            this.scythe.vx = (sdx/sdist) * (this.isPhaseTwo?5.1:3.4);
                            this.scythe.vy = (sdy/sdist) * (this.isPhaseTwo?5.1:3.4);
                        } else {
                            this.scythe = null; // Scythe returned
                        }
                    }
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?70:100;}
            }
        }else if(this.attackCooldown<=0&&!player.dead){
            let r=Math.random(), dx=player.x-this.x, tgX = Math.random()>.5?4*TILE:20*TILE;
            if(r<.15){ 
                this.telegraphType='cascade'; this.telegraphTimer=70; 
                this.targetX=tgX; this.targetY=8*TILE; 
            }else if(r<.30){ 
                this.telegraphType='dash'; this.telegraphTimer=60; 
                this.targetX=(dx>0?2:22)*TILE; this.targetY=player.y-10; 
            }else if(r<.45){ 
                this.telegraphType='spikes'; this.telegraphTimer=50; 
                this.targetX=tgX; this.targetY=9*TILE; 
            }else if(r<.60){ 
                this.telegraphType='ring'; this.telegraphTimer=60; 
                this.targetX=tgX; this.targetY=9*TILE; 
            }else if(r<.75){ 
                this.telegraphType='plunge'; this.telegraphTimer=50; 
                this.targetX=player.x; this.targetY=8*TILE; 
            }else{
                this.telegraphType='scythe'; this.telegraphTimer=50;
                this.targetX=tgX; this.targetY=9*TILE;
            }
        }else{
            // Just float smoothly near target
            this.targetY += Math.sin(this.floatPhase)*1.5;
        }
        
        this.dashTrail=this.dashTrail.filter(t=>{t.life--;return t.life>0;});
        this.updateProj(map,player,particles);
        this.clamp(map);
    }
    updateProj(map,player,particles){
        this.projectiles.forEach(p=>{
            p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)p.alive=false;
            
            if(p.type==='meteor'){
                if(particles)particles.emit(p.x+p.w/2,p.y,2,'#2a0055',12,2,10,2);
                if(isSolid(getTile(map,Math.floor(p.x/TILE),Math.floor(p.y/TILE)))){
                    p.alive=false;
                    if(particles)particles.emit(p.x+p.w/2,p.y+p.h/2,10,'#8844ff',15,3,15,4);
                }
            }else if(p.type==='spike_warn'){
                if(p.life===1){
                    // Erupt spike!
                    this.projectiles.push({x:p.x,y:p.y,vx:0,vy:-11,w:24,h:60,alive:true,life:40,type:'spike',noCol:true});
                    if(particles)particles.emit(p.x+12,p.y,15,'#8844ff',20,4,20,4);
                }
            }else if(p.type==='spike'){
                if(p.vy < 0) { p.y+=p.vy; p.vy+=1.4; if(p.vy>=0)p.vy=0; } // Slow rise
            }else if(p.type==='ring'){
                p.radius+=3.5; p.x-=1.75; p.y-=1.75; p.w+=3.5; p.h+=3.5; // Expand slower
            }
            
            // Custom collisions
            let hit = false;
            if(p.type==='ring'){
                let cx=p.x+p.w/2, cy=p.y+p.h/2, px=player.x+player.w/2, py=player.y+player.h/2;
                let d = Math.sqrt((cx-px)**2+(cy-py)**2);
                if(d > p.radius - 8 && d < p.radius + 8) hit = true; // Only hit edge
            }else if(p.type!=='spike_warn'){
                hit = rectCollide(player, p);
            }
            
            if(p.alive && hit){ player.takeDamage(this.isPhaseTwo?0.85:0.68); if(p.type!=='spike'&&p.type!=='ring') p.alive=false; }
        });
        this.projectiles=this.projectiles.filter(p=>p.alive);
    }
    clamp(map){
        if(this.x<TILE)this.x=TILE;if(this.x+this.w>(map[0].length-1)*TILE)this.x=(map[0].length-1)*TILE-this.w;
        if(this.y<TILE)this.y=TILE;if(this.y+this.h>(map.length-2)*TILE)this.y=(map.length-2)*TILE-this.h;
    }
    getAttackBox(){return null;}
    takeDamage(d){
        if(this.phase===2||this.hurtTimer>0||this.dead)return;
        sfx('bossHurt');
        this.hp-=d;this.hurtTimer=10;
        if(this.hp<=0){
            if(!this.isPhaseTwo){
                this.hp=1;this.startPhaseTwo=true; // Signals game.js to trigger revive cutscene
            }else{
                this.hp=0;this.alive=false;
            }
        }
    }
    draw(cam){
        if(!this.alive||this.visible===false)return;let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),a=Math.sin(this.auraPhase)*.3+.7,h=this.hurtTimer>0;
        let flt=Math.sin(this.floatPhase)*6;
        
        let cA1=this.isPhaseTwo?`rgba(255,20,60,${a*.4})`:`rgba(138,90,170,${a*.3})`;
        let cA2=this.isPhaseTwo?`rgba(255,80,0,${a*.6})`:`rgba(180,128,255,${a*.5})`;
        let cRobe=this.isPhaseTwo?'#4a0a1a':'#1a0a2a';
        let cBody=this.isPhaseTwo?'#a01030':'#2a1040';
        let cHead=this.isPhaseTwo?'#d02040':'#3a1860';
        let cCrown=this.isPhaseTwo?`rgba(255,100,0,${a})`:`rgba(150,70,255,${a})`;
        let cEyes=this.isPhaseTwo?'#ff0000':`rgba(200,100,255,${a})`;

        // Dash trail
        this.dashTrail.forEach(t=>{
            ctx.globalAlpha=t.life/20*.4;
            ctx.fillStyle=this.isPhaseTwo?'#ff0044':'#8822ff';ctx.fillRect(Math.round(t.x-cam.x),Math.round(t.y-cam.y),this.w,this.h);
        });
        ctx.globalAlpha=1;

        // Aura
        ctx.save();ctx.globalAlpha=.15*a;let ag=ctx.createRadialGradient(sx+this.w/2,sy+this.h/2,0,sx+this.w/2,sy+this.h/2,100);
        ag.addColorStop(0,this.isPhaseTwo?'#ff4400':'#8822ff');ag.addColorStop(1,'transparent');ctx.fillStyle=ag;ctx.fillRect(sx-60,sy-60,this.w+120,this.h+100);ctx.restore();
        
        ctx.fillStyle='rgba(0,0,0,.22)';
        ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+14+flt,28,7,0,0,Math.PI*2);ctx.fill();

        let coreX=sx+this.w/2,coreY=sy+22+flt;
        for(let i=0;i<6;i++){
            let spread=(i-2.5)*9;
            let sway=Math.sin(this.auraPhase*1.2+i*.7)*8*(this.isPhaseTwo?1.2:1);
            let len=22+(i%3)*8+(this.isPhaseTwo?8:0);
            ctx.fillStyle=this.isPhaseTwo?`rgba(120,18,32,${.42+i*.04})`:`rgba(32,10,52,${.35+i*.04})`;
            ctx.beginPath();
            ctx.moveTo(coreX+spread,sy+36+flt);
            ctx.quadraticCurveTo(coreX+spread+sway*.35,sy+50+flt,coreX+spread+sway,sy+66+flt+len);
            ctx.lineTo(coreX+spread+sway+6,sy+60+flt+len);
            ctx.quadraticCurveTo(coreX+spread+sway*.2,sy+48+flt,coreX+spread+8,sy+38+flt);
            ctx.fill();
        }

        ctx.fillStyle=h?'#ccaacc':cRobe;
        ctx.beginPath();
        ctx.moveTo(sx+6,sy+18+flt);
        ctx.quadraticCurveTo(sx-12,sy+30+flt,sx-6,sy+52+flt);
        ctx.lineTo(sx+12,sy+60+flt);
        ctx.quadraticCurveTo(sx+this.w/2,sy+52+flt,sx+this.w-12,sy+60+flt);
        ctx.lineTo(sx+this.w+6,sy+52+flt);
        ctx.quadraticCurveTo(sx+this.w+12,sy+28+flt,sx+this.w-6,sy+18+flt);
        ctx.quadraticCurveTo(sx+this.w/2,sy+4+flt,sx+6,sy+18+flt);
        ctx.fill();

        ctx.fillStyle=h?'#e7c5ff':cBody;
        ctx.fillRect(sx+10,sy+10+flt,this.w-20,28);
        ctx.fillStyle=this.isPhaseTwo?'#5f1022':'#231038';
        ctx.fillRect(sx+14,sy+14+flt,this.w-28,22);

        ctx.fillStyle=this.isPhaseTwo?'rgba(255,80,40,.85)':`rgba(214,156,255,${.65+a*.25})`;
        ctx.beginPath();ctx.arc(coreX,coreY,8+Math.sin(this.auraPhase*2)*1.4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ffffff';ctx.fillRect(coreX-2,coreY-1,4,3);

        ctx.fillStyle=h?'#aa88aa':cHead;
        ctx.beginPath();
        ctx.moveTo(sx+14,sy-2+flt);
        ctx.lineTo(sx+10,sy+12+flt);
        ctx.lineTo(sx+this.w-10,sy+12+flt);
        ctx.lineTo(sx+this.w-14,sy-2+flt);
        ctx.quadraticCurveTo(sx+this.w/2,sy-14+flt,sx+14,sy-2+flt);
        ctx.fill();

        ctx.fillStyle=cCrown;
        ctx.beginPath();
        ctx.moveTo(sx+12,sy-12+flt);
        ctx.lineTo(sx+20,sy-24+flt);
        ctx.lineTo(sx+this.w/2-4,sy-14+flt);
        ctx.lineTo(sx+this.w/2,sy-28+flt);
        ctx.lineTo(sx+this.w/2+4,sy-14+flt);
        ctx.lineTo(sx+this.w-20,sy-24+flt);
        ctx.lineTo(sx+this.w-12,sy-12+flt);
        ctx.lineTo(sx+this.w/2,sy-6+flt);
        ctx.fill();

        for(let i=0;i<3;i++){
            let tentY=sy+18+flt+i*8;
            ctx.fillStyle=this.isPhaseTwo?'rgba(255,84,64,.28)':'rgba(162,104,255,.22)';
            ctx.beginPath();
            ctx.moveTo(sx+6,tentY);
            ctx.quadraticCurveTo(sx-16-Math.sin(this.auraPhase+i)*8,tentY+4,sx-10,tentY+14);
            ctx.lineTo(sx-2,tentY+10);
            ctx.quadraticCurveTo(sx+2,tentY+6,sx+6,tentY);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(sx+this.w-6,tentY);
            ctx.quadraticCurveTo(sx+this.w+16+Math.sin(this.auraPhase+i)*8,tentY+4,sx+this.w+10,tentY+14);
            ctx.lineTo(sx+this.w+2,tentY+10);
            ctx.quadraticCurveTo(sx+this.w-2,tentY+6,sx+this.w-6,tentY);
            ctx.fill();
        }

        ctx.fillStyle=this.telegraphTimer>0?'#ff00ff':cEyes;
        ctx.fillRect(sx+18,sy+2+flt,6,6);ctx.fillRect(sx+this.w-24,sy+2+flt,6,6);
        ctx.fillStyle='#fff';ctx.fillRect(sx+20,sy+4+flt,2,2);ctx.fillRect(sx+this.w-22,sy+4+flt,2,2);

        for(let i=0;i<4;i++){
            let oa=this.orbPhase+i*Math.PI/2;
            let ox=coreX+Math.cos(oa)*(24+(this.isPhaseTwo?6:0));
            let oy=sy+26+flt+Math.sin(oa*1.25)*10;
            ctx.fillStyle=this.isPhaseTwo?'rgba(255,72,32,.25)':'rgba(180,128,255,.24)';
            ctx.beginPath();ctx.arc(ox,oy,4+(i%2),0,Math.PI*2);ctx.fill();
        }
        
        // Telegraph warning
        if(this.telegraphTimer>0){
            let flash=Math.sin(this.telegraphTimer*.4)>.2;
            ctx.save();ctx.strokeStyle='#ff22ff';ctx.lineWidth=2;ctx.shadowColor='#ff22ff';ctx.shadowBlur=12;ctx.setLineDash([4,4]);
            if(flash){
                if(this.telegraphType==='dash'){
                    ctx.beginPath();ctx.moveTo(sx+this.w/2,sy+this.h/2+flt);
                    ctx.lineTo(sx+this.w/2+this.facing*800,sy+this.h/2+flt);ctx.stroke();
                }else if(this.telegraphType==='plunge'){
                    ctx.beginPath();ctx.moveTo(sx+this.w/2,sy+this.h/2+flt);
                    ctx.lineTo(sx+this.w/2,sy+this.h/2+flt+800);ctx.stroke();
                }else{
                    ctx.beginPath();ctx.arc(sx+this.w/2,sy+this.h/2+flt,40+Math.sin(this.telegraphTimer*.2)*10,0,Math.PI*2);ctx.stroke();
                }
            }
            ctx.setLineDash([]);ctx.restore();
        }

        // Boomerang Scythe
        if(this.scythe){
            let scx=Math.round(this.scythe.x-cam.x+this.scythe.w/2),scy=Math.round(this.scythe.y-cam.y+this.scythe.h/2);
            ctx.save();ctx.translate(scx,scy);ctx.rotate(this.scythe.rot);
            ctx.fillStyle='#aa22ff';ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*1.2);ctx.lineTo(0,-5);ctx.fill();
            ctx.fillStyle='#fff';ctx.fillRect(-2,-2,4,4);
            ctx.restore();
        }
        
        // HP bar (Epic Boss size)
        let bW=120,bX=sx+this.w/2-bW/2;ctx.fillStyle='#0a0520';ctx.fillRect(bX-1,sy-32,bW+2,8);ctx.fillStyle='#1a0a30';ctx.fillRect(bX,sy-31,bW,6);
        let hG=ctx.createLinearGradient(bX,0,bX+bW*(this.hp/this.maxHp),0);hG.addColorStop(0,'#8822cc');hG.addColorStop(1,'#ff44ff');ctx.fillStyle=hG;ctx.fillRect(bX,sy-31,bW*(this.hp/this.maxHp),6);
        
        // Projectiles
        this.projectiles.forEach(p=>{
            let px=Math.round(p.x-cam.x),py=Math.round(p.y-cam.y);
            if(p.type==='meteor'){
                ctx.fillStyle='#110022';ctx.fillRect(px,py,p.w,p.h);
                ctx.fillStyle='#440088';ctx.fillRect(px+2,py+4,p.w-4,p.h-8);
                ctx.fillStyle='#aa44ff';ctx.fillRect(px+4,py+p.h-12,p.w-8,8);
                ctx.fillStyle='#ffffff';ctx.fillRect(px+6,py+p.h-8,p.w-12,4);
            }else if(p.type==='spike'){
                ctx.fillStyle='#2a0055';ctx.fillRect(px,py,p.w,p.h);
                ctx.fillStyle='#aa44ff';ctx.fillRect(px+4,py,p.w-8,p.h);
                ctx.fillStyle='#ffffff';ctx.fillRect(px+8,py,p.w-16,8); // sharp tip
            }else if(p.type==='spike_warn'){
                ctx.fillStyle=p.life%10<5?'#ff00ff':'rgba(255,0,255,0.2)';
                ctx.fillRect(px,py,p.w,p.h);
            }else if(p.type==='wave'){
                ctx.fillStyle='#8844ff';ctx.fillRect(px,py,p.w,p.h);
                ctx.fillStyle='#ffffff';ctx.fillRect(px+(p.vx>0?p.w-4:0),py,4,p.h);
            }else if(p.type==='ring'){
                ctx.strokeStyle=`rgba(255,0,255,${p.life/100})`;ctx.lineWidth=6;
                ctx.shadowColor='#ff00ff';ctx.shadowBlur=12;
                ctx.beginPath();ctx.arc(px+p.w/2,py+p.h/2,p.radius,0,Math.PI*2);ctx.stroke();
                ctx.shadowBlur=0;
            }
        });
    }
}
