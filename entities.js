// ===== ENTITIES - Overhauled =====

class Player {
    constructor(x,y){
        this.x=x;this.y=y;this.w=20;this.h=32;
        this.vx=0;this.vy=0;this.speed=1.5;this.jumpPow=-7.8;
        this.onGround=false;this.wallSlide=false;this.wallDir=0;this.facing=1;
        this.hp=6;this.maxHp=6;this.invincible=0;
        this.attacking=false;this.attackTimer=0;this.attackCooldown=0;
        this.dashTimer=0;this.dashCooldown=0;this.super=0;this.maxSuper=100;this.superActive=0;
        this.coyoteTime=0;this.jumpBuffer=0;this.dead=false;
        // Double jump
        this.jumpsLeft=2;this.maxJumps=2;this.flipPhase=0;this.isFlipping=false;
        // Animation
        this.runPhase=0;this.idlePhase=0;this.armPhase=0;
        this.squash=1;this.stretch=1;this.wasOnGround=false;
        this.trailPositions=[];this.eyeBlink=0;this.blinkTimer=0;this.capePhase=0;
        this.breathPhase=0;
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
        this.blinkTimer++;this.breathPhase+=.025;
        if(this.blinkTimer>180+Math.random()*60){this.eyeBlink=6;this.blinkTimer=0;}
        if(this.eyeBlink>0)this.eyeBlink--;
        this.capePhase+=.05;
        // Flip animation
        if(this.isFlipping){this.flipPhase+=.25;if(this.flipPhase>=Math.PI*2){this.flipPhase=0;this.isFlipping=false;}}
        // Dash (cooldown = 60 frames = 1s)
        if(this.dashTimer>0){
            this.dashTimer--;this.vx=this.facing*5;this.vy=0;
            this.trailPositions.push({x:this.x,y:this.y,life:12});
            if(this.dashTimer<=0)this.vx=this.facing*this.speed;
            this.applyCol(map);this.updateTrails();return;
        }
        let mv=false,tvx=0;
        if(keys['ArrowLeft']||keys['a']){tvx=-this.speed;this.facing=-1;mv=true;}
        else if(keys['ArrowRight']||keys['d']){tvx=this.speed;this.facing=1;mv=true;}
        if(mv){this.vx+=(tvx-this.vx)*.12;this.runPhase+=.12;this.armPhase+=.12;}
        else{this.vx*=.82;if(Math.abs(this.vx)<.1)this.vx=0;this.runPhase*=.9;this.armPhase*=.9;}
        this.idlePhase+=.03;
        this.vy+=GRAVITY;if(this.vy>MAX_FALL)this.vy=MAX_FALL;
        if(this.onGround){this.coyoteTime=8;this.jumpsLeft=this.maxJumps;}
        else if(this.coyoteTime>0)this.coyoteTime--;
        this.wallSlide=false;
        if(!this.onGround&&this.vy>0){let w=this.checkWall(map);if(w!==0&&mv){this.wallSlide=true;this.wallDir=w;this.vy=Math.min(this.vy,1.2);this.jumpsLeft=this.maxJumps;}}
        // Jump (double jump)
        if(keysPressed['ArrowUp']||keysPressed[' ']||keysPressed['w'])this.jumpBuffer=10;
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
                sfx('jump');
                this.squash=.65;this.stretch=1.35;
            }
        }
        if((keysPressed['z']||keysPressed['Z'])&&this.attackCooldown<=0){sfx('attack');this.attacking=true;this.attackTimer=16;this.attackCooldown=25;}
        if((keysPressed['c']||keysPressed['C'])&&this.super>=this.maxSuper&&this.superActive<=0){sfx('super');this.super=0;this.superActive=90;this.attacking=false;this.attackTimer=0;}
        if(this.attackTimer>0){this.attackTimer--;if(this.attackTimer<=0)this.attacking=false;}
        if((keysPressed['x']||keysPressed['X']||keysPressed['Shift'])&&this.dashCooldown<=0){this.dashTimer=8;this.dashCooldown=60;}
        this.wasOnGround=this.onGround;
        this.applyCol(map);
        if(this.onGround&&!this.wasOnGround&&this.vy>=0){this.squash=1.3;this.stretch=.7;this.isFlipping=false;this.flipPhase=0;}
        this.squash+=(1-this.squash)*.15;this.stretch+=(1-this.stretch)*.15;
        let cx=Math.floor((this.x+this.w/2)/TILE),cy=Math.floor((this.y+this.h)/TILE);
        if(getTile(map,cx,cy)===4||getTile(map,cx,cy-1)===4)this.takeDamage(1);
        if(getTile(map,cx,cy)===10||getTile(map,cx,cy)===11)this.takeDamage(1);
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
    takeDamage(d){if(this.invincible>0||this.dead)return;this.hp-=d;this.invincible=80;this.vy=-3;this.vx=-this.facing*2;if(this.hp<=0){this.hp=0;this.dead=true;}}
    draw(cam){
        if(this.superActive<=0 && this.invincible>0&&Math.floor(this.invincible/4)%2===0)return;
        let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y);
        
        if(this.shocked){
            ctx.save();ctx.strokeStyle='#ffff00';ctx.lineWidth=2;
            for(let i=0;i<3;i++){
                ctx.beginPath();ctx.moveTo(sx-4+Math.random()*(this.w+8),sy-4+Math.random()*(this.h+8));
                ctx.lineTo(sx-4+Math.random()*(this.w+8),sy-4+Math.random()*(this.h+8));ctx.stroke();
            }
            ctx.restore();
        }

        // Dash trails
        this.trailPositions.forEach(t=>{let tx=Math.round(t.x-cam.x),ty=Math.round(t.y-cam.y);ctx.globalAlpha=t.life/12*.25;ctx.fillStyle='#7ac8ff';ctx.fillRect(tx+2,ty+4,16,24);ctx.globalAlpha=1;});
        ctx.save();
        ctx.translate(sx+this.w/2,sy+this.h);ctx.scale(this.squash,this.stretch);ctx.translate(-(sx+this.w/2),-(sy+this.h));
        // Flip rotation for double jump
        if(this.isFlipping){ctx.translate(sx+this.w/2,sy+this.h/2);ctx.rotate(this.flipPhase);ctx.translate(-(sx+this.w/2),-(sy+this.h/2));}
        let f=this.facing,bob=this.onGround&&Math.abs(this.vx)<.2?Math.sin(this.idlePhase)*1.2:0;
        let br=Math.sin(this.breathPhase)*.8;
        // Shadow
        if(this.onGround){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h,10,3,0,0,Math.PI*2);ctx.fill();}
        // === NEW CHARACTER: Hooded Crystal Wanderer ===
        // Cloak/cape (flowing behind)
        ctx.fillStyle='#1a2844';
        let co=Math.sin(this.capePhase)*2.5+this.vx*-.6;
        ctx.beginPath();ctx.moveTo(sx+2,sy+10+bob);
        ctx.quadraticCurveTo(sx+10-f*co,sy+26+bob,sx+1-f*4,sy+this.h+3);
        ctx.lineTo(sx+this.w-1+f*4,sy+this.h+3);
        ctx.quadraticCurveTo(sx+10+f*co,sy+26+bob,sx+this.w-2,sy+10+bob);ctx.fill();
        // Cloak detail folds
        ctx.fillStyle='#243858';
        ctx.fillRect(sx+5,sy+18+bob,3,2);ctx.fillRect(sx+12,sy+22+bob,3,2);
        // Body armor
        ctx.fillStyle='#2a3a5a';ctx.fillRect(sx+4,sy+8+bob+br,12,14);
        // Chest plate detail
        ctx.fillStyle='#3a5070';ctx.fillRect(sx+5,sy+10+bob+br,10,5);
        // Crystal core on chest
        ctx.fillStyle='#4ac8ff';ctx.fillRect(sx+8,sy+11+bob+br,4,3);
        ctx.fillStyle='#8adeff';ctx.fillRect(sx+9,sy+12+bob+br,2,1);
        // Shoulder pads
        ctx.fillStyle='#3a4a6a';
        ctx.fillRect(sx+1,sy+8+bob+br,4,5);ctx.fillRect(sx+15,sy+8+bob+br,4,5);
        // Hood
        ctx.fillStyle='#1a2844';ctx.fillRect(sx+2,sy-4+bob,16,14);
        // Hood shading (deeper inside)
        ctx.fillStyle='#0d1828';ctx.fillRect(sx+4,sy+bob,12,8);
        // Face visible inside hood (just eyes)
        ctx.fillStyle='#c8d8e8';ctx.fillRect(sx+5,sy+2+bob,10,5);
        ctx.fillStyle='#0d1828';ctx.fillRect(sx+5,sy+6+bob,10,2);
        // Eyes (cyan glow)
        let eY=this.eyeBlink>0?1:0,eH=this.eyeBlink>0?1:2;
        ctx.fillStyle='#4ac8ff';
        if(f>0){ctx.fillRect(sx+10,sy+3+bob+eY,3,eH);ctx.fillRect(sx+6,sy+3+bob+eY,2,eH);}
        else{ctx.fillRect(sx+7,sy+3+bob+eY,3,eH);ctx.fillRect(sx+12,sy+3+bob+eY,2,eH);}
        if(this.eyeBlink<=0){ctx.fillStyle='#aaeeff';ctx.fillRect(f>0?sx+11:sx+8,sy+3+bob,1,1);}
        // Hood peak
        ctx.fillStyle='#1a2844';ctx.fillRect(sx+7,sy-6+bob,6,3);
        ctx.fillRect(sx+8,sy-8+bob,4,3);
        // Arms
        let as=Math.sin(this.armPhase)*5;
        if(this.onGround&&Math.abs(this.vx)>.3){
            // Running: swing arms
            ctx.fillStyle='#2a3a5a';
            ctx.save();ctx.translate(sx+(f>0?2:this.w-4),sy+12+bob);ctx.rotate(-as*f*.06);
            ctx.fillRect(-1,0,3,10-as);ctx.fillRect(-2,8-as,4,3);ctx.restore();
            ctx.fillStyle='#3a4a6a';
            ctx.save();ctx.translate(sx+(f>0?this.w-2:2),sy+12+bob);ctx.rotate(as*f*.06);
            ctx.fillRect(-1,0,3,10+as);ctx.fillRect(-2,8+as,4,3);ctx.restore();
        }else if(!this.onGround){
            ctx.fillStyle='#2a3a5a';ctx.fillRect(sx,sy+10,3,9);ctx.fillRect(sx+this.w-3,sy+10,3,9);
        }else{
            ctx.fillStyle='#2a3a5a';ctx.fillRect(sx+1,sy+12+bob+br,3,10);ctx.fillRect(sx+this.w-4,sy+12+bob+br,3,10);
        }
        // Legs with run cycle
        ctx.fillStyle='#1a2844';
        if(this.onGround&&Math.abs(this.vx)>.3){
            let la=Math.sin(this.runPhase)*4.5,lb=Math.sin(this.runPhase+Math.PI)*4.5;
            ctx.fillStyle='#15203a';ctx.fillRect(sx+5,sy+22+bob,4,10+lb);
            ctx.fillStyle='#1a2844';ctx.fillRect(sx+11,sy+22+bob,4,10+la);
            // Boots
            ctx.fillStyle='#2a3a4a';
            ctx.fillRect(sx+4+(lb>0?1:-1),sy+30+bob+lb,5,3);
            ctx.fillRect(sx+10+(la>0?1:-1),sy+30+bob+la,5,3);
        }else if(!this.onGround){
            ctx.fillRect(sx+5,sy+22,4,8);ctx.fillRect(sx+11,sy+22,4,7);
            ctx.fillStyle='#2a3a4a';ctx.fillRect(sx+4,sy+29,5,3);ctx.fillRect(sx+10,sy+28,5,3);
        }else{
            ctx.fillRect(sx+5,sy+22+bob,4,10);ctx.fillRect(sx+11,sy+22+bob,4,10);
            ctx.fillStyle='#2a3a4a';ctx.fillRect(sx+4,sy+30+bob,5,3);ctx.fillRect(sx+10,sy+30+bob,5,3);
        }
        // Wall slide particles
        if(this.wallSlide){ctx.fillStyle='#4a6a8a88';for(let i=0;i<3;i++)ctx.fillRect(this.wallDir>0?sx+this.w:sx-2,sy+5+i*8+Math.random()*4,2,3);}
        // Attack slash (crystal blade) - Improved arc and mirroring
        if(this.attacking){
            let p=1-this.attackTimer/16;
            ctx.save();
            ctx.translate(sx+this.w/2, sy+this.h/2);
            ctx.scale(f, 1);
            ctx.lineWidth=3;
            ctx.strokeStyle='#4ac8ff';
            ctx.shadowColor='#2a8aff';
            ctx.shadowBlur=16;
            ctx.globalAlpha=1-p;
            
            // Outer blue energy
            ctx.beginPath();
            ctx.arc(8, 0, 20+p*10, -1.5, 1.5);
            ctx.stroke();
            
            // Inner white core
            ctx.strokeStyle='#ffffff';
            ctx.lineWidth=1;
            ctx.shadowBlur=8;
            ctx.beginPath();
            ctx.arc(10, 0, 18+p*8, -1.2, 1.2);
            ctx.stroke();
            
            // Motion sparks on the blade itself
            ctx.fillStyle='#ffffff';
            for(let i=0; i<3; i++){
                let ang=(Math.random()-.5)*2.4, d=20+p*10;
                ctx.fillRect(Math.cos(ang)*d, Math.sin(ang)*d, 2, 2);
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
    constructor(x,y,p){this.x=x;this.y=y;this.w=26;this.h=18;this.vx=.6;this.vy=0;this.patrol=p*TILE;this.startX=x;this.hp=2;this.maxHp=2;this.alive=true;this.hurtTimer=0;this.legPhase=0;this.breathPhase=0;}
    update(map){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;this.legPhase+=.1;this.breathPhase+=.04;
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
    constructor(x,y){this.x=x;this.y=y;this.w=24;this.h=16;this.startX=x;this.startY=y;this.hp=1;this.maxHp=1;this.alive=true;this.hurtTimer=0;this.phase=0;this.aggroRange=180;this.aggro=false;this.wingPhase=0;}
    update(map,player){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;this.wingPhase+=this.aggro?.25:.12;
        let dx=player.x-this.x,dy=player.y-this.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<this.aggroRange)this.aggro=true;
        if(this.aggro&&dist<Math.max(350, this.aggroRange)){this.x+=(dx/dist)*1.5;this.y+=(dy/dist)*1.5;}
        else{this.phase+=.02;this.x=this.startX+Math.sin(this.phase)*30;this.y=this.startY+Math.cos(this.phase*.7)*15;this.aggro=false;}
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
    constructor(x,y){this.x=x;this.y=y;this.w=32;this.h=42;this.vx=0;this.vy=0;this.hp=5;this.maxHp=5;this.alive=true;this.hurtTimer=0;this.attackTimer=0;this.attackCooldown=0;this.facing=-1;this.aggroRange=160;this.walkPhase=0;this.crystalGlow=0;}
    update(map,player){
        if(!this.alive)return;if(this.hurtTimer>0)this.hurtTimer--;if(this.attackCooldown>0)this.attackCooldown--;if(this.attackTimer>0)this.attackTimer--;
        this.crystalGlow+=.05;this.vy+=GRAVITY;if(this.vy>MAX_FALL)this.vy=MAX_FALL;
        let dx=player.x-this.x,dist=Math.abs(dx);
        if(dist<this.aggroRange&&!player.dead){this.facing=dx>0?1:-1;if(dist>40){this.vx+=(this.facing*.8-this.vx)*.05;this.walkPhase+=.06;}else{this.vx*=.9;if(this.attackCooldown<=0){this.attackTimer=25;this.attackCooldown=70;}}}
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
        this.hp=200;this.maxHp=200;this.alive=true;this.hurtTimer=0;
        this.phase=0;this.phaseTimer=0;this.attackCooldown=60;this.facing=-1;
        this.walkPhase=0;this.auraPhase=0;
        this.projectiles=[];this.slamWaves=[];
        // New variables
        this.attackType=-1; 
    }
    update(map,player,particles){
        if(!this.alive)return;
        if(this.hurtTimer>0)this.hurtTimer--;
        if(this.attackCooldown>0)this.attackCooldown--;
        
        this.auraPhase+=.04;this.walkPhase+=.03;
        this.vy+=GRAVITY;if(this.vy>MAX_FALL)this.vy=MAX_FALL;
        
        let dx=player.x-this.x;
        if(this.phase===0) this.facing=dx>0?1:-1; // Track player only when idle
        let dist=Math.abs(dx);
        
        // Attack State Machine
        if(this.phaseTimer>0){
            this.phaseTimer--;
            
            // Attack 1: Crystal Shotgun (Fires a spread of 5 fast shards)
            if(this.attackType===1){
                this.vx*=.9; // Stop moving
                if(this.phaseTimer===15){ // Fire on frame 15
                    sfx('bossShoot');
                    let baseAngle=Math.atan2(player.y-(this.y+10),player.x-(this.x+this.w/2));
                    for(let i=-2;i<=2;i++){
                        let a=baseAngle+i*0.2;
                        this.projectiles.push({x:this.x+this.w/2,y:this.y+10,vx:Math.cos(a)*5,vy:Math.sin(a)*5,w:12,h:12,alive:true,colT:0});
                    }
                    if(particles)particles.emit(this.x+this.w/2,this.y+10,15,'#ff8844',20,3,15,5);
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=60;this.attackType=-1;}
                
            // Attack 2: Super Dash (Rushes forward blindly at high speed)
            }else if(this.attackType===2){
                if(this.phaseTimer>30){ // Wind up (30 frames)
                    this.vx = -this.facing * 1.5; // Back up slightly
                }else{ // Execute Dash
                    this.vx = this.facing * 8;
                    if(particles&&this.phaseTimer%3===0)particles.emit(this.x+this.w/2,this.y+this.h-10,3,'#fff',8,1.5,10,2);
                }
                if(this.phaseTimer<=0){this.vx=0;this.phase=0;this.attackCooldown=80;this.attackType=-1;}
                
            // Attack 3: Ground Quake (Jumps and creates massive shockwaves on landing)
            }else if(this.attackType===3){
                if(this.phaseTimer===50){ // Jump
                    this.vy=-14; this.vx=this.facing*4;
                }
                if(this.phaseTimer<50){
                    if(this.vy>0){ // Falling
                        let b=Math.floor((this.y+this.h+this.vy)/TILE);
                        let col=Math.floor((this.x+this.w/2)/TILE);
                        if(isSolid(getTile(map,col,b))){ // Hit ground
                            sfx('bossSlam');
                            this.vx=0;
                            this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:-4,w:20,h:16,life:80});
                            this.slamWaves.push({x:this.x+this.w/2,y:this.y+this.h,vx:4,w:20,h:16,life:80});
                            if(particles)particles.emit(this.x+this.w/2,this.y+this.h,30,'#ff8844',40,4,25,3);
                            this.phaseTimer=0;this.phase=0;this.attackCooldown=90;this.attackType=-1;
                        }
                    }
                }
                if(this.phaseTimer<=0&&this.attackType!==-1){this.phase=0;this.attackCooldown=90;this.attackType=-1;}
            }
        }else if(this.attackCooldown<=0&&!player.dead){
            // Choose new attack (no more shadow telegraphs, direct wind-ups)
            let r=Math.random();
            if(r<.33){this.attackType=1;this.phaseTimer=30;this.phase=1;} // 30f windup
            else if(r<.66){this.attackType=2;this.phaseTimer=60;this.phase=1;} // 30f windup 30f dash
            else{this.attackType=3;this.phaseTimer=51;this.phase=1;} // Jump wait 1f then falling
        }else if(this.phase===0){
            if(dist>80){this.vx+=(this.facing*1.2-this.vx)*.05;}else this.vx*=.92;
        }
        
        // Update physics arrays
        this.updateProjectiles(map,particles);
        this.slamWaves=this.slamWaves.filter(w=>{w.x+=w.vx;w.life--;return w.life>0;});
        
        // Movement
        this.x+=this.vx;this.y+=this.vy;this.groundCol(map);
    }
    updateProjectiles(map,particles){
        this.projectiles.forEach(p=>{
            p.colT++;
            p.x+=p.vx;p.y+=p.vy;
            if(isSolid(getTile(map,Math.floor(p.x/TILE),Math.floor((p.y+p.h)/TILE)))){
                p.alive=false;
                if(particles)particles.emit(p.x,p.y,5,'#ff8844',8,2,15);
            }
        });
        this.projectiles=this.projectiles.filter(p=>p.alive);
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
        // Only body collision during fast dash, otherwise no standalone attack boxes
        if(this.attackType===2 && this.phaseTimer<=30) return {x:this.x-6,y:this.y-6,w:this.w+12,h:this.h+12};
        return null;
    }
    takeDamage(d){if(this.hurtTimer>0)return;this.hp-=d;this.hurtTimer=12;if(this.hp<=0)this.alive=false;}
    draw(cam){
        if(!this.alive)return;
        let sx=Math.round(this.x-cam.x),sy=Math.round(this.y-cam.y),f=this.facing,h=this.hurtTimer>0;
        
        ctx.fillStyle='rgba(0,0,0,.25)';
        ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+2,28,7,0,0,Math.PI*2);ctx.fill();
        
        // Body (Simple rendering)
        ctx.fillStyle=h?'#cc8866':(this.attackType===2&&this.phaseTimer<=30)?'#ff5533':'#4a2a1a';
        ctx.fillRect(sx+4,sy+18,48,40); // Torso
        ctx.fillStyle=h?'#aa6644':'#5a3a2a';
        ctx.fillRect(sx+8,sy+20,40,10); // Chestplate
        
        // Head
        ctx.fillStyle=h?'#cc8866':'#6a4a3a';
        ctx.fillRect(sx+10,sy+2,36,20);
        
        // Face crystal
        ctx.fillStyle=this.attackType!==-1?'#fff':'#ffcc44';
        ctx.fillRect(sx+18,sy-14,20,16);
        ctx.fillStyle='#ff8844';
        ctx.fillRect(sx+20,sy-12,16,12);
        
        // Eyes
        ctx.fillStyle=(this.attackType!==-1)?'#ff2222':'#ffcc44';
        ctx.fillRect(sx+16,sy+7,7,7);ctx.fillRect(sx+33,sy+7,7,7);
        ctx.fillStyle='#fff';ctx.fillRect(sx+19,sy+9,3,3);ctx.fillRect(sx+36,sy+9,3,3);
        
        // Arms
        ctx.fillStyle=h?'#aa6644':'#5a3a2a';
        let armY = (this.attackType===1&&this.phaseTimer<15)?-10:(this.attackType===3&&this.vy<0)?-20:0;
        ctx.fillRect(sx+(f>0?this.w-2:-14),sy+20+armY,16,28);
        ctx.fillRect(sx+(f>0?-10:this.w-6),sy+22,12,24);
        
        // Legs
        ctx.fillStyle=h?'#996644':'#4a2a1a';
        let wP=Math.sin(this.walkPhase)*4;
        ctx.fillRect(sx+8,sy+56,14,8+wP);ctx.fillRect(sx+34,sy+56,14,8-wP);
        
        // HP bar
        let bW=70,bX=sx+this.w/2-bW/2;
        ctx.fillStyle='#0a0520';ctx.fillRect(bX-1,sy-24,bW+2,8);
        ctx.fillStyle='#2a1050';ctx.fillRect(bX,sy-23,bW,6);
        let hG=ctx.createLinearGradient(bX,0,bX+bW*(this.hp/this.maxHp),0);
        hG.addColorStop(0,'#ff6622');hG.addColorStop(1,'#ffaa44');
        ctx.fillStyle=hG;ctx.fillRect(bX,sy-23,bW*(this.hp/this.maxHp),6);
    // Projectiles
        this.projectiles.forEach(p=>{let px=Math.round(p.x-cam.x),py=Math.round(p.y-cam.y);ctx.fillStyle='#ff8844';ctx.beginPath();ctx.moveTo(px+5,py);ctx.lineTo(px+10,py+5);ctx.lineTo(px+5,py+10);ctx.lineTo(px,py+5);ctx.fill();ctx.fillStyle='#ffcc88';ctx.fillRect(px+3,py+3,4,4);});
        // Slam waves
        this.slamWaves.forEach(w=>{let wx=Math.round(w.x-cam.x),wy=Math.round(w.y-cam.y);ctx.save();ctx.globalAlpha=w.life/40;ctx.fillStyle='#ff884488';ctx.fillRect(wx-w.w/2,wy-w.h,w.w,w.h);ctx.fillStyle='#ffaa4488';ctx.fillRect(wx-w.w/4,wy-w.h*.7,w.w/2,w.h*.7);ctx.restore();});
    }
}

// ===== // ===== BOSS 2: Shadow Lord (True final boss: Ranged Bullet Hell + Lasers + Scythe) =====
class Boss2 {
    constructor(x,y){
        this.x=x;this.y=y;this.w=52;this.h=60;this.vx=0;this.vy=0;
        this.hp=85;this.maxHp=85;this.alive=true;this.hurtTimer=0;
        this.phase=0;this.phaseTimer=0;this.attackCooldown=30;this.facing=-1;
        this.floatPhase=0;this.auraPhase=0;
        this.projectiles=[];this.orbPhase=0;
        this.telegraphTimer=0;this.telegraphType='';this.scythe=null;
        this.targetX=x;this.targetY=y;this.dashTrail=[];
        this.isPhaseTwo=false; this.startPhaseTwo=false;
    }
    update(map,player,particles){
        if(!this.alive){this.projectiles=[];this.scythe=null;return;}
        if(this.hurtTimer>0)this.hurtTimer--;if(this.attackCooldown>0)this.attackCooldown--;
        this.floatPhase+=.03;this.auraPhase+=.05;this.orbPhase+=.04;
        
        let dx=player.x-this.x;this.facing=dx>0?1:-1;
        
        // Constant glide speed instead of lerp (no more 'teleporting' sudden snaps)
        let sdx = this.targetX - this.x, sdy = this.targetY - this.y;
        let dist = Math.sqrt(sdx*sdx + sdy*sdy);
        if(dist > 2.5){
            this.x += (sdx/dist)*2.5; // Slower glide
            this.y += (sdy/dist)*2.5;
        }

        // Telegraph phase
        if(this.telegraphTimer>0){
            this.telegraphTimer--;
            if(this.telegraphTimer<=0){
                if(this.telegraphType==='cascade'){this.phase=1;this.phaseTimer=110;} // Meteor rain
                else if(this.telegraphType==='dash'){
                    this.phase=2;this.phaseTimer=30; 
                    this.vx=this.facing*(this.isPhaseTwo?18:13); // Faster dash in p2
                    this.targetY=this.y; // Lock Y
                }
                else if(this.telegraphType==='spikes'){this.phase=3;this.phaseTimer=120;}
                else if(this.telegraphType==='ring'){this.phase=4;this.phaseTimer=100;}
                else if(this.telegraphType==='plunge'){this.phase=5;this.phaseTimer=80;}
                else if(this.telegraphType==='scythe'){this.phase=6;this.phaseTimer=100;this.scythe={x:this.x+this.w/2,y:this.y+this.h/2,vx:this.facing*3.5,vy:0,w:30,h:30,alive:true,rot:0};} // Scythe (-23% duration, -30% speed)
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
                            this.projectiles.push({x:c*TILE,y:1*TILE+Math.random()*TILE,vx:0,vy:(this.isPhaseTwo?5.5:3.5)+Math.random(),w:16,h:36,alive:true,life:140,type:'meteor',noCol:true});
                        }
                    }
                }
                if(this.phaseTimer<=0){this.phase=0;this.attackCooldown=this.isPhaseTwo?60:100;}
            }else if(this.phase===2){// Shadow Dash (Fast horizontal slice)
                this.x+=this.vx;
                this.targetX=this.x; // Follow the dash mapping
                if(this.phaseTimer%2===0){this.dashTrail.push({x:this.x,y:this.y,life:20});}
                if(rectCollide(player,{x:this.x,y:this.y,w:this.w,h:this.h}))player.takeDamage(1);
                
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
                    this.vy = this.isPhaseTwo?16:11; // Faster drop
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
                    if(rectCollide(player, this.scythe)) player.takeDamage(1);
                    if(this.phaseTimer < 50 && this.scythe.vx * this.facing > 0){ // Return after a certain time
                        this.scythe.vx *= -1;
                    }
                    if(this.phaseTimer < 20 && this.scythe.vx * this.facing < 0){ // Return to boss
                        let sdx = this.x + this.w/2 - this.scythe.x;
                        let sdy = this.y + this.h/2 - this.scythe.y;
                        let sdist = Math.sqrt(sdx*sdx + sdy*sdy);
                        if(sdist > 1){
                            this.scythe.vx = (sdx/sdist) * (this.isPhaseTwo?6:4);
                            this.scythe.vy = (sdy/sdist) * (this.isPhaseTwo?6:4);
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
            
            if(p.alive && hit){ player.takeDamage(1); if(p.type!=='spike'&&p.type!=='ring') p.alive=false; }
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
        
        ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+this.w/2,sy+this.h+12+flt,24,6,0,0,Math.PI*2);ctx.fill();
        
        // Robes
        ctx.fillStyle=h?'#ccaacc':'#1a0a2a';ctx.beginPath();ctx.moveTo(sx+4,sy+18+flt);ctx.lineTo(sx-8,sy+this.h+flt);ctx.lineTo(sx+this.w+8,sy+this.h+flt);ctx.lineTo(sx+this.w-4,sy+18+flt);ctx.fill();
        ctx.fillStyle=h?'#aa88aa':'#2a1040';ctx.fillRect(sx+6,sy+22+flt,this.w-12,32);
        // Body
        ctx.fillStyle=h?'#ddaadd':'#3a1860';ctx.fillRect(sx+10,sy+6+flt,this.w-20,24);
        // Head
        ctx.fillStyle=h?'#aa88aa':'#150525';ctx.fillRect(sx+14,sy-6+flt,this.w-28,16);
        // Crown
        ctx.fillStyle=`rgba(150,70,255,${a})`;ctx.fillRect(sx+12,sy-16+flt,28,10);
        ctx.fillStyle='#fff';ctx.fillRect(sx+24,sy-10+flt,4,4);
        // Eyes
        ctx.fillStyle=this.telegraphTimer>0?'#ff00ff':`rgba(200,100,255,${a})`;ctx.fillRect(sx+18,sy-2+flt,6,6);ctx.fillRect(sx+this.w-24,sy-2+flt,6,6);
        ctx.fillStyle='#fff';ctx.fillRect(sx+20,sy+flt,2,2);ctx.fillRect(sx+this.w-22,sy+flt,2,2);
        
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
