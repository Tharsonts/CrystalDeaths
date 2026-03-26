// ===== 10 LEVEL MAPS =====
const T=32;
function makeMap(w,h){let m=[];for(let r=0;r<h;r++)m.push(new Array(w).fill(0));return m;}
function sR(m,row,s,e,t){for(let c=s;c<=e;c++)if(row>=0&&row<m.length&&c>=0&&c<m[0].length)m[row][c]=t;}
function sC(m,col,s,e,t){for(let r=s;r<=e;r++)if(r>=0&&r<m.length&&col>=0&&col<m[0].length)m[r][col]=t;}
function fR(m,r1,c1,r2,c2,t){for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(r>=0&&r<m.length&&c>=0&&c<m[0].length)m[r][c]=t;}

// ===== L1: Crystal Cavern =====
function buildL1(){
    let m=makeMap(50,30);
    sR(m,0,0,49,1);sR(m,29,0,49,1);sC(m,0,0,29,1);sC(m,49,0,29,1);
    fR(m,25,1,28,48,1);
    // Cave ceiling detail
    for(let c=2;c<48;c+=3) m[1][c]=15;
    // Platforms - staircase right
    sR(m,23,3,9,1); sR(m,21,8,14,1); sR(m,23,14,20,1);
    sR(m,21,18,24,1); sR(m,19,12,16,1);
    // Upper path
    sR(m,17,16,22,1); sR(m,19,22,28,1); sR(m,17,26,32,1);
    sR(m,15,30,36,1); sR(m,17,35,42,1); sR(m,19,40,46,1);
    sR(m,21,44,48,1);
    // Crystals
    m[22][6]=2;m[20][12]=2;m[18][20]=2;m[16][28]=2;m[14][33]=2;m[18][38]=2;
    // Small pits
    m[25][22]=0;m[25][23]=0;m[25][36]=0;m[25][37]=0;
    // Portal alcove (open area near end, not a wall hole)
    fR(m,1,1,4,48,6);
    return m;
}

// ===== L2: Fungal Depths (first traps) =====
function buildL2(){
    let m=makeMap(55,30);
    sR(m,0,0,54,1);sR(m,29,0,54,1);sC(m,0,0,29,1);sC(m,54,0,29,1);
    fR(m,25,1,28,53,1);
    for(let c=3;c<52;c+=4) m[1][c]=15;
    // Ceiling barriers to force platforming
    sC(m,13,0,18,1); sC(m,29,0,16,1); sC(m,45,0,14,1);
    // Platforms with falling sections (tile 12)
    sR(m,23,3,8,1); sR(m,23,10,12,12); // falling!
    sR(m,23,14,20,1); sR(m,21,18,24,1);
    sR(m,21,26,28,12); // falling!
    sR(m,21,30,36,1);
    sR(m,19,15,18,1); sR(m,17,20,26,1);
    sR(m,19,34,40,1); sR(m,17,38,44,1);
    sR(m,19,42,48,1); sR(m,21,46,52,1);
    // Timed spikes (tile 14)
    m[24][16]=14; m[24][17]=14; m[24][32]=14; m[24][33]=14;
    // Spikes
    m[24][22]=4; m[24][23]=4;
    m[22][6]=2;m[20][22]=2;m[18][30]=2;m[16][42]=2;
    m[25][25]=0; // small pit
    return m;
}

// ===== L3: Ancient Ruins =====
function buildL3(){
    let m=makeMap(55,32);
    sR(m,0,0,54,1);sR(m,31,0,54,1);sC(m,0,0,31,1);sC(m,54,0,31,1);
    fR(m,27,1,30,53,1);
    for(let c=2;c<53;c+=3){m[1][c]=15;m[2][c]=1;}
    // Ruin pillars
    sC(m,12,10,26,1);sC(m,13,10,26,1);
    m[20][12]=0;m[20][13]=0;m[21][12]=0;m[21][13]=0;
    sC(m,28,8,26,1);sC(m,29,8,26,1);
    m[18][28]=0;m[18][29]=0;m[19][28]=0;m[19][29]=0;
    sC(m,42,12,26,1);sC(m,43,12,26,1);
    m[22][42]=0;m[22][43]=0;m[23][42]=0;m[23][43]=0;
    // Ceiling barriers
    sC(m,18,0,18,1); sC(m,36,0,16,1);
    // Platforms (stagger between pillars)
    sR(m,25,3,11,1); sR(m,23,6,11,1); sR(m,21,3,8,1);
    sR(m,19,6,11,1); sR(m,17,3,11,1);
    sR(m,25,14,27,1); sR(m,23,18,27,1);
    sR(m,21,14,20,1); sR(m,19,22,27,1);
    sR(m,25,30,41,1); sR(m,23,34,41,1);
    sR(m,21,30,36,1); sR(m,19,36,41,1);
    sR(m,17,14,20,1); sR(m,15,18,27,1);
    sR(m,25,44,53,1); sR(m,23,44,50,1);
    sR(m,21,48,53,1);
    // Arrow traps (tile 13) in walls
    m[22][0]=13; m[18][0]=13; m[24][54]=13; m[20][54]=13;
    // Timed spikes
    m[26][20]=14;m[26][21]=14;m[26][35]=14;m[26][36]=14;
    m[26][46]=14;m[26][47]=14;
    // Spikes
    m[26][15]=4;m[26][30]=4;
    m[24][8]=2;m[22][18]=2;m[18][24]=2;m[20][38]=2;m[22][48]=2;
    return m;
}

// ===== L4: Lava Forge =====
function buildL4(){
    let m=makeMap(55,30);
    sR(m,0,0,54,1);sR(m,29,0,54,1);sC(m,0,0,29,1);sC(m,54,0,29,1);
    fR(m,25,1,28,53,1);
    // Lava pits (tile 10)
    for(let c=10;c<=14;c++){m[25][c]=10;m[26][c]=10;m[27][c]=10;m[28][c]=10;}
    for(let c=24;c<=30;c++){m[25][c]=10;m[26][c]=10;m[27][c]=10;m[28][c]=10;}
    for(let c=40;c<=45;c++){m[25][c]=10;m[26][c]=10;m[27][c]=10;m[28][c]=10;}
    fR(m,1,1,3,53,8); // lava glow bg
    for(let c=3;c<52;c+=5) m[1][c]=15;
    // Ceiling barriers forcing lower paths
    sC(m,14,0,16,1); sC(m,30,0,14,1); sC(m,45,0,15,1);
    // Platforms over lava (solid bridges, only 1 short falling section)
    sR(m,23,3,9,1);
    sR(m,23,15,22,1); sR(m,21,11,14,1); // solid bridge
    sR(m,23,31,38,1); sR(m,21,26,30,1); // solid bridge
    sR(m,23,46,53,1); sR(m,21,43,44,12); // only 2-tile falling section
    // Upper paths
    sR(m,19,5,12,1); sR(m,17,10,18,1); sR(m,19,16,22,1);
    sR(m,17,20,28,1); sR(m,15,26,34,1); sR(m,17,32,38,1);
    sR(m,19,36,42,1); sR(m,17,40,48,1);
    // Timed spikes
    m[22][8]=14;m[22][18]=14;m[22][34]=14;m[22][48]=14;
    // Arrow traps
    m[20][0]=13; m[16][0]=13;
    m[18][6]=2;m[16][14]=2;m[14][30]=2;m[18][42]=2;
    return m;
}

// ===== L5: Guardião de Cristal BOSS =====
function buildL5(){
    let m = makeMap(45,24);
    sR(m,0,0,44,1);sR(m,23,0,44,1);sC(m,0,0,23,1);sC(m,44,0,23,1);
    fR(m,21,1,22,43,1); // Flat wide floor for boss to charge/slam freely
    
    // Side escape platforms (safe from slams, boss walks under them)
    sR(m,16,3,10,1);
    sR(m,16,34,41,1);
    
    // Middle hovering platform (for player to jump over the boss)
    sR(m,11,18,26,1);
    
    // Traps to punish hiding directly underneath side platforms
    m[20][6]=14; m[20][38]=14;
    
    // Aesthetic Crystals
    m[20][12]=2; m[20][32]=2; m[15][4]=2; m[15][40]=2; m[10][22]=2;
    
    // Dark Portal Background Glow
    fR(m,1,1,6,43,6);
    
    // Spiked Ceiling stalactites
    for(let c=2;c<43;c+=3) m[1][c]=15;
    
    return m;
}

// ===== L6: Frozen Abyss =====
function buildL6(){
    let m=makeMap(55,30);
    sR(m,0,0,54,1);sR(m,29,0,54,1);sC(m,0,0,29,1);sC(m,54,0,29,1);
    fR(m,25,1,28,53,1);
    // Ice ground
    sR(m,25,1,53,9);
    // Icicle ceiling
    for(let c=2;c<53;c+=2) m[1][c]=15;
    // Ceiling barriers
    sC(m,17,0,18,1); sC(m,35,0,16,1);
    // Platforms (ice = slippery)
    sR(m,23,3,10,9); sR(m,21,8,16,9);
    sR(m,23,18,24,1); sR(m,21,22,28,9);
    sR(m,19,14,20,9); sR(m,17,18,24,1);
    sR(m,23,30,38,9); sR(m,21,36,42,9);
    sR(m,19,28,34,1); sR(m,17,32,40,9);
    sR(m,23,44,52,9); sR(m,21,48,53,9);
    sR(m,19,44,50,1);
    // Falling icicle traps (falling platform tiles)
    m[3][12]=12;m[3][13]=12;m[3][26]=12;m[3][27]=12;
    m[3][38]=12;m[3][39]=12;m[3][50]=12;
    // Spikes
    m[24][15]=4;m[24][16]=4;m[24][28]=4;m[24][29]=4;
    m[24][42]=4;m[24][43]=4;
    m[22][7]=2;m[20][14]=2;m[18][22]=2;m[16][36]=2;m[20][48]=2;
    return m;
}

// ===== L7: Túneis das Sombras =====
function buildL7(){
    let m=makeMap(60,32);
    sR(m,0,0,59,1);sR(m,31,0,59,1);sC(m,0,0,31,1);sC(m,59,0,31,1);
    fR(m,29,1,30,58,1); // Floor
    
    // Add central massive crystal/pillar structures 
    sC(m,20,0,28,1); sC(m,40,6,31,1); 
    // Opening in the first pillar
    fR(m,14,20,18,20,0); // tunnel through the pillar
    
    // Left side (start)
    sR(m,25,3,10,1); sR(m,21,8,15,1);
    sR(m,17,3,8,1);  sR(m,13,8,12,1);
    sR(m,9,2,6,1);   sR(m,5,8,14,1);
    
    // Middle section (falling platforms over spikes)
    sR(m,28,21,39,4); // Spikes on the floor!
    sR(m,23,22,25,12); sR(m,21,28,31,12); sR(m,25,34,37,12);
    sR(m,16,21,26,1); sR(m,12,28,34,1); sR(m,8,22,25,1);
    
    // Gap in second pillar
    fR(m,10,40,14,40,0);
    fR(m,24,40,27,40,0);
    
    // Right side
    sR(m,26,43,48,1); sR(m,22,50,56,1);
    sR(m,18,42,46,1); sR(m,14,48,54,1);
    sR(m,10,42,47,1); sR(m,6,50,56,1);
    
    // Traps and details
    m[13][12]=14; m[16][24]=14; m[26][45]=14; m[14][52]=14; // Proximity spikes!
    for(let c=2;c<59;c+=3) m[1][c]=15; // Ceiling stalactites
    
    // Decorative Crystals
    m[24][5]=2; m[20][12]=2; m[11][30]=2; m[21][54]=2;
    // Arrow traps
    m[28][0]=13; m[20][0]=13; m[8][0]=13;
    m[15][20]=13; m[25][40]=13; m[12][40]=13;
    return m;
}

// ===== L8: Toxic Swamp (no falling platforms, fewer arrows) =====
function buildL8(){
    let m=makeMap(55,28);
    sR(m,0,0,54,1);sR(m,27,0,54,1);sC(m,0,0,27,1);sC(m,54,0,27,1);
    fR(m,23,1,26,53,1);
    // Poison pools (tile 11)
    for(let c=8;c<=13;c++){m[23][c]=11;m[24][c]=11;}
    for(let c=20;c<=27;c++){m[23][c]=11;m[24][c]=11;}
    for(let c=35;c<=40;c++){m[23][c]=11;m[24][c]=11;}
    for(let c=2;c<52;c+=4) m[1][c]=15;
    // Ceiling walls forcing pathing
    sC(m,23,0,16,1); sC(m,43,0,16,1);
    // Solid platforms over poison
    sR(m,21,3,7,1); sR(m,21,14,19,1); sR(m,21,28,34,1);
    sR(m,21,41,48,1); sR(m,21,50,53,1);
    sR(m,19,9,13,1); sR(m,19,22,26,1); sR(m,19,36,40,1);
    // Upper route
    sR(m,17,4,10,1); sR(m,15,8,16,1);
    sR(m,17,14,20,1); sR(m,15,18,26,1);
    sR(m,13,22,30,1); sR(m,15,28,36,1);
    sR(m,17,34,42,1); sR(m,15,40,48,1);
    sR(m,17,46,53,1);
    // Timed spikes (not overkill)
    m[22][6]=14;m[22][32]=14;
    m[20][8]=2;m[16][14]=2;m[14][26]=2;m[16][38]=2;m[18][50]=2;
    return m;
}

// ===== L9: Void Corridor (gauntlet) =====
function buildL9(){
    let m=makeMap(65,25);
    sR(m,0,0,64,1);sR(m,24,0,64,1);sC(m,0,0,24,1);sC(m,64,0,24,1);
    fR(m,20,1,23,63,1);
    for(let c=2;c<63;c+=2) m[1][c]=15;
    // Ceiling walls forcing pathing
    sC(m,16,0,14,1); sC(m,29,0,16,1); sC(m,49,0,14,1);
    // Gauntlet of traps!
    // Section 1: spike floor with platforms
    sR(m,19,4,6,4);sR(m,19,8,10,4);sR(m,19,12,14,4);
    sR(m,18,3,5,1);sR(m,16,7,10,1);sR(m,18,12,15,1);
    // Section 2: falling platforms over void
    for(let c=18;c<=28;c++) m[20][c]=0;
    sR(m,18,17,19,12);sR(m,18,21,23,12);sR(m,18,25,27,12);
    sR(m,16,20,22,1);sR(m,14,24,28,1);
    // Section 3: arrow + spike combo
    sR(m,18,30,40,1);
    m[19][32]=14;m[19][33]=14;m[19][36]=14;m[19][37]=14;
    m[17][30]=13;m[15][30]=13;
    // Section 4: lava pit
    for(let c=42;c<=48;c++){m[20][c]=10;m[21][c]=10;m[22][c]=10;m[23][c]=10;}
    sR(m,18,41,43,1);sR(m,16,45,47,12);sR(m,18,49,51,1);
    // Section 5: final sprint
    sR(m,18,52,58,1);
    m[19][54]=14;m[19][55]=14;m[19][57]=14;m[19][58]=14;
    sR(m,16,56,62,1);
    m[8][10]=2;m[8][30]=2;m[8][50]=2;
    return m;
}

// ===== L10: Shadow Lord BOSS (clean open arena) =====
function buildL10(){
    let m=makeMap(40,20);
    sR(m,0,0,39,1);sR(m,19,0,39,1);sC(m,0,0,19,1);sC(m,39,0,19,1);
    fR(m,16,1,18,38,1);
    // Clean arena - just a few small platforms to dodge on
    sR(m,14,5,9,1); sR(m,14,30,34,1);
    sR(m,12,16,23,1);
    // Crystals for ambiance only
    m[15][10]=2;m[15][29]=2;m[15][20]=2;
    fR(m,1,1,4,38,6);
    for(let c=3;c<38;c+=4) m[1][c]=15;
    return m;
}

// ===== LEVEL DEFINITIONS =====
// exit: {col,row} position of the exit portal (player presses UP to enter)
const LEVELS = [
    {name:'Caverna de Cristal',build:buildL1,spawn:{x:3*T,y:23*T},exit:{col:44,row:19},
     enemies:[{type:'crawler',x:12*T,y:2*T,p:5},{type:'crawler',x:30*T,y:2*T,p:6},{type:'bat',x:20*T,y:14*T},{type:'bat',x:38*T,y:12*T}],
     traps:{falling:[],timed:[],arrows:[]},runes:[[6,20], [33,12], [46,18]],boss:false},
    {name:'Profundezas Fungais',build:buildL2,spawn:{x:3*T,y:21*T},exit:{col:48,row:19},
     enemies:[{type:'crawler',x:8*T,y:2*T,p:4},{type:'crawler',x:30*T,y:2*T,p:5},{type:'bat',x:15*T,y:16*T},{type:'bat',x:40*T,y:14*T},{type:'golem',x:46*T,y:2*T}],
     traps:{falling:[[10,23,3],[26,21,3]],timed:[[16,24],[17,24],[32,24],[33,24]],arrows:[]},runes:[[11,20], [37,16], [49,18]],boss:false},
    {name:'Ruínas Antigas',build:buildL3,spawn:{x:3*T,y:23*T},exit:{col:48,row:21},
     enemies:[{type:'crawler',x:18*T,y:2*T,p:4},{type:'golem',x:35*T,y:2*T},{type:'bat',x:10*T,y:14*T},{type:'bat',x:25*T,y:12*T},{type:'bat',x:48*T,y:16*T},{type:'crawler',x:45*T,y:2*T,p:5}],
     traps:{falling:[],timed:[[20,26],[21,26],[35,26],[36,26],[46,26],[47,26]],arrows:[[0,22,1]]},runes:[[6,18], [22,12], [50,18]],boss:false},
    {name:'Forja de Lava',build:buildL4,spawn:{x:3*T,y:21*T},exit:{col:48,row:17},
     enemies:[{type:'crawler',x:18*T,y:2*T,p:4},{type:'golem',x:34*T,y:2*T},{type:'bat',x:8*T,y:16*T},{type:'bat',x:28*T,y:12*T},{type:'bat',x:44*T,y:14*T},{type:'golem',x:48*T,y:2*T}],
     traps:{falling:[[43,21,2]],timed:[[8,22],[18,22],[34,22],[48,22]],arrows:[[0,20,1],[0,16,1]]},runes:[[8,16], [32,12], [44,14]],boss:false},
    {name:'Guardião de Cristal',build:buildL5,spawn:{x:3*T,y:20*T},
     enemies:[{type:'boss1',x:22*T,y:2*T}],
     traps:{falling:[],timed:[],arrows:[]},runes:[],boss:true},
    {name:'Abismo Congelado',build:buildL6,spawn:{x:3*T,y:21*T},exit:{col:48,row:19},
     enemies:[{type:'crawler',x:12*T,y:2*T,p:4},{type:'crawler',x:32*T,y:2*T,p:5},{type:'bat',x:20*T,y:14*T},{type:'bat',x:40*T,y:12*T},{type:'golem',x:48*T,y:2*T}],
     traps:{falling:[[12,3,2],[13,3,2],[26,3,2],[27,3,2],[38,3,2],[39,3,2],[50,3,1]],timed:[],arrows:[]},runes:[[12,18], [36,14], [50,18]],boss:false},
    {name:'Túneis das Sombras',build:buildL7,spawn:{x:3*T,y:23*T},exit:{col:54,row:5},
     enemies:[{type:'crawler',x:8*T,y:2*T,p:4},{type:'crawler',x:22*T,y:2*T,p:4},{type:'golem',x:44*T,y:2*T},{type:'bat',x:15*T,y:18*T},{type:'bat',x:34*T,y:8*T},{type:'bat',x:50*T,y:20*T},{type:'crawler',x:52*T,y:2*T,p:5}],
     traps:{falling:[[22,23,3],[28,21,3],[34,25,3]],timed:[[12,12],[24,15],[45,25],[52,13]],arrows:[[0,28,1],[0,8,1],[20,15,1],[40,25,1],[40,12,1]]},runes:[[5,14], [31,9], [44,15]],boss:false},
    {name:'Pântano Tóxico',build:buildL8,spawn:{x:3*T,y:19*T},exit:{col:48,row:15},
     enemies:[{type:'crawler',x:15*T,y:2*T,p:3},{type:'crawler',x:30*T,y:2*T,p:4},{type:'golem',x:42*T,y:2*T},{type:'bat',x:10*T,y:12*T},{type:'bat',x:26*T,y:10*T},{type:'bat',x:44*T,y:12*T}],
     traps:{falling:[],timed:[[6,22],[32,22]],arrows:[]},runes:[[5,18], [22,12], [51,18]],boss:false},
    {name:'Corredor do Vazio',build:buildL9,spawn:{x:2*T,y:18*T},exit:{col:58,row:14},
     enemies:[{type:'bat',x:10*T,y:12*T},{type:'bat',x:25*T,y:10*T},{type:'bat',x:45*T,y:12*T},{type:'crawler',x:34*T,y:2*T,p:4},{type:'golem',x:54*T,y:2*T}],
     traps:{falling:[[17,18,3],[21,18,3],[25,18,3],[45,16,3]],timed:[[32,19],[33,19],[36,19],[37,19],[54,19],[55,19],[57,19],[58,19]],arrows:[[30,17,1]]},runes:[[4,15], [35,15], [59,13]],boss:false},
    {name:'Senhor das Sombras',build:buildL10,spawn:{x:3*T,y:14*T},
     enemies:[{type:'boss2',x:20*T,y:2*T}],
     traps:{falling:[],timed:[],arrows:[]},runes:[],boss:true}
];
