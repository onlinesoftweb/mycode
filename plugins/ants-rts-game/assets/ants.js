/* global ANTS_BOOT, ANT_SPRITES, ANT_VIDEOS, ANT_SOUNDS */
(function(){
  /* ===== DOM ===== */
  const view=document.getElementById('ants-view');
  const hud=document.getElementById('ants-hud');
  const overlay=document.getElementById('ants-overlay');
  const banner=document.getElementById('ants-banner');
  if(!view||!hud||!overlay||!banner){ console.warn('[ANTS] Missing DOM'); return; }
  const ctx=view.getContext('2d'), hudCtx=hud.getContext('2d');
  const BOOT=(typeof ANTS_BOOT==='object'&&ANTS_BOOT)?ANTS_BOOT:{}; 
  const SPR=(typeof ANT_SPRITES==='object'&&ANT_SPRITES)?ANT_SPRITES:{};
  const VID=(typeof ANT_VIDEOS==='object'&&ANT_VIDEOS)?ANT_VIDEOS:{};
  const SFX=(typeof ANT_SOUNDS==='object'&&ANT_SOUNDS)?ANT_SOUNDS:{};

  const SETTINGS={ sfxOn:true };

  /* ===== Audio (mobile-safe) ===== */
  const audioMap=new Map();
  let audioUnlocked=false;
  function getAudio(key){
    const url=SFX[key]; if(!url) return null;
    if(audioMap.has(key)) return audioMap.get(key);
    const a=new Audio(); a.src=url; a.preload='auto'; a.crossOrigin='anonymous';
    audioMap.set(key,a); return a;
  }
  function unlockAudio(){
    if(audioUnlocked) return;
    const unlock = () => {
      if(audioUnlocked) return;
      const k=Object.keys(SFX)[0]; const a=k?getAudio(k):null;
      if(a){
        a.muted=true;
        a.play().then(()=>{ a.pause(); a.currentTime=0; a.muted=false; audioUnlocked=true; })
                .catch(()=>{ audioUnlocked=true; });
      } else { audioUnlocked=true; }
    };
    ['pointerdown','touchstart','keydown'].forEach(evt=>window.addEventListener(evt,unlock,{once:true,passive:true}));
  }
  unlockAudio();
  function playSfx(key){
    if(!SETTINGS.sfxOn) return;
    const a=getAudio(key); if(!a) return;
    try{ a.currentTime=0; a.play(); }catch(_){ }
  }

  /* ===== In-DOM modal (no iframe) ===== */
  function modalWrite(html, opts){
    const opt = opts || {};
    overlay.innerHTML = `
      <div class="ants-modal-backdrop" data-close></div>
      <div class="ants-modal-box" id="ants-modal-box">${html}</div>
    `;
    overlay.classList.add('show');

    // click sfx for any modal open
    playSfx('click');

    const box = document.getElementById('ants-modal-box');
    if(opt.anchorPx && typeof opt.anchorPx.x === 'number'){
      const x = Math.max(8, Math.min(window.innerWidth - 8 - 320, opt.anchorPx.x - 140));
      const y = Math.max(8, Math.min(window.innerHeight - 8 - 120, opt.anchorPx.y - 20));
      box.style.left = x + 'px';
      box.style.top  = y + 'px';
    } else {
      box.style.left = '50%';
      box.style.top  = '50%';
      box.style.transform = 'translate(-50%, -50%)';
    }
    overlay.addEventListener('click', modalClickHandler);
    document.addEventListener('keydown', modalKeyHandler);
  }
  function modalClose(){
    overlay.classList.remove('show');
    overlay.innerHTML = '<div id="ants-banner"></div>';
    overlay.removeEventListener('click', modalClickHandler);
    document.removeEventListener('keydown', modalKeyHandler);
  }
  function modalClickHandler(e){
    if(e.target && e.target.hasAttribute('data-close')) return modalClose();
    const btn = e.target.closest('[data-call]');
    if(btn){
      try{
        const payload = JSON.parse(btn.getAttribute('data-call'));
        handleMenuAction(payload);
      }catch(_){ }
    }
  }
  function modalKeyHandler(e){ if(e.key==='Escape') modalClose(); }

  function playVideoOverlay(src, onEnd){
    if(!src){ onEnd&&onEnd(); return; }
    const id='ants-video';
    modalWrite(`<video id="${id}" playsinline controls style="max-width:min(92vw,960px);max-height:min(80vh,540px);border-radius:12px;outline:0"></video>`);
    const v=document.getElementById(id); if(!v){ onEnd&&onEnd(); return; }
    v.src=src; v.addEventListener('ended',()=>{ modalClose(); onEnd&&onEnd(); },{once:true});
    v.play().catch(()=>{}); // user-gesture might be required on some devices
  }

  /* ===== WORLD / MAP ===== */
  const TILE=Math.max(8,(BOOT.settings&&BOOT.settings.tileSize)||64);
  const W=BOOT.gridCols||94, H=BOOT.gridRows||94; const WORLD_W=W*TILE, WORLD_H=H*TILE;
  const tiles=(BOOT.gridTiles&&BOOT.gridTiles.length===W*H)?BOOT.gridTiles.slice():Array(W*H).fill('');
  const walk =(BOOT.gridWalk &&BOOT.gridWalk.length===W*H)?BOOT.gridWalk.slice() :Array(W*H).fill('W');
  const tags =(BOOT.gridTags &&BOOT.gridTags.length===W*H)?BOOT.gridTags.slice() :Array(W*H).fill('NONE');
  const idx=(x,y)=>y*W+x, inBounds=(x,y)=>x>=0&&y>=0&&x<W&&y<H;

  const T={DIRT:0,BLOCK:1,NEST:2,FOOD:3,GOLD:4,BUILD:5,WALL:6};
  const C={grid:'#10171b',select:'#8be9fd',path:'rgba(56,189,248,0.28)',food:'#2f6b17',gold:'#b28900',nest:'#0c3816',trap:'#b91c1c',enemy:'#ef4444'};

  let map=Array.from({length:H},()=>Array(W).fill(T.DIRT));
  let amtFood=Array.from({length:H},()=>Array(W).fill(0));
  let amtGold=Array.from({length:H},()=>Array(W).fill(0));

  let nest={x:(W>>1),y:(H>>1),food:0,gold:0,level:1};
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(walk[idx(x,y)]==='B') map[y][x]=T.BLOCK; }
  let baseFound=false;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const tg=tags[idx(x,y)];
    if(tg==='FOOD'){ map[y][x]=T.FOOD; amtFood[y][x]=1000; }
    if(tg==='GOLD'){ map[y][x]=T.GOLD; amtGold[y][x]=10000; }
    if(tg==='BASE'&&!baseFound){ baseFound=true; nest.x=x; nest.y=y; }
  }
  const nestTiles=[]; for(let yy=nest.y-1;yy<=nest.y+1;yy++) for(let xx=nest.x-1;xx<=nest.x+1;xx++){ if(inBounds(xx,yy)){ map[yy][xx]=T.NEST; nestTiles.push({x:xx,y:yy}); } }
  function normalizeTile(x,y){ if(map[y][x]===T.FOOD && amtFood[y][x]<=0) map[y][x]=T.DIRT; if(map[y][x]===T.GOLD && amtGold[y][x]<=0) map[y][x]=T.DIRT; }
  function isWalkable(x,y){ return inBounds(x,y)&&map[y][x]!==T.BLOCK&&map[y][x]!==T.BUILD&&map[y][x]!==T.WALL; }
  function speedMulAt(x,y){ const m=(BOOT.settings&&typeof BOOT.settings.slowMultiplier==='number')?BOOT.settings.slowMultiplier:0.5; return (walk[idx(x,y)]==='S')?m:1.0; }

  /* ===== Camera ===== */
  const cam={x:0,y:0}; function centerOnNest(){ cam.x=Math.max(0,Math.min(WORLD_W-view.width, nest.x*TILE-(view.width>>1))); cam.y=Math.max(0,Math.min(WORLD_H-view.height, nest.y*TILE-(view.height>>1))); } centerOnNest();
  let dragging=false, dragStart={x:0,y:0}, camStart={x:0,y:0};
  view.addEventListener('mousedown',e=>{ dragging=true; dragStart.x=e.clientX; dragStart.y=e.clientY; camStart.x=cam.x; camStart.y=cam.y; });
  window.addEventListener('mouseup',()=>dragging=false);
  window.addEventListener('mousemove',e=>{ if(!dragging) return; const dpr=window.devicePixelRatio||1; cam.x=Math.max(0,Math.min(WORLD_W-view.width, camStart.x+(dragStart.x-e.clientX)*dpr)); cam.y=Math.max(0,Math.min(WORLD_H-view.height, camStart.y+(dragStart.y-e.clientY)*dpr)); });
  function screenToTile(cx,cy){ const r=view.getBoundingClientRect(); const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1)); const sx=(cx-r.left)*dpr, sy=(cy-r.top)*dpr; return {x:Math.floor((cam.x+sx)/TILE), y:Math.floor((cam.y+sy)/TILE)}; }
  function tileToClientCenter(tx,ty){ const r=view.getBoundingClientRect(); const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1)); const cx=(tx*TILE+TILE/2-cam.x)/dpr + r.left; const cy=(ty*TILE+TILE/2-cam.y)/dpr + r.top; return {x:cx,y:cy}; }

  /* ===== Assets ===== */
  const imgCache=new Map(); function getImg(u){ if(!u) return null; if(imgCache.has(u)) return imgCache.get(u); const im=new Image(); im.decoding='async'; im.referrerPolicy='no-referrer'; im.src=u; imgCache.set(u,im); return im; }

  /* ===== Pathing ===== */
  function isPassableForAnt(x,y,antId){ return isWalkable(x,y)&&!ants.some(a=>a.id!==antId&&a.x===x&&a.y===y); }
  function bfs(start,isGoal,pass){ const key=(x,y)=>x+'|'+y; const q=[start], came=new Map([[key(start.x,start.y),null]]); while(q.length){ const c=q.shift(); if(isGoal(c.x,c.y)){ const out=[{x:c.x,y:c.y}]; for(let k=key(c.x,c.y),p;(p=came.get(k));k=key(p.x,p.y)) out.push(p); return out.reverse(); } for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=c.x+dx, ny=c.y+dy, kk=key(nx,ny); if(!inBounds(nx,ny)||!pass(nx,ny)||came.has(kk)) continue; came.set(kk,c); q.push({x:nx,y:ny}); } } return []; }
  function nearestReachableAround(goal,pass){ if(pass(goal.x,goal.y)) return goal; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const nx=goal.x+dx, ny=goal.y+dy; if(inBounds(nx,ny)&&pass(nx,ny)) return {x:nx,y:ny}; } return null; }
  function pathToAdjacent(a,tx,ty,pass){ const adj=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:tx+dx,y:ty+dy})).filter(p=>inBounds(p.x,p.y)&&pass(p.x,p.y)); adj.sort((p,q)=> (Math.abs(p.x-a.x)+Math.abs(p.y-a.y)) - (Math.abs(q.x-a.x)+Math.abs(q.y-a.y)) ); for(const t of adj){ const p=bfs({x:a.x,y:a.y},(x,y)=>x===t.x&&y===t.y,pass); if(p&&p.length) return p; } return []; }

  /* ===== Units ===== */
  const ants=[]; let nextId=0;
  const Colors={fighter:'#3b82f6',food:'#ffd166',gold:'#37d45d',builder:'#ff3b3b',fire:'#ff6db6',bomber:'#f97316',queen:'#eab308'};
  const STATE={IDLE:'IDLE',MOVE:'MOVE',AUTO:'AUTO',TRAP_MOVE:'TRAP_MOVE',TRAP_ARMING:'TRAP_ARMING',PATROL:'PATROL',BUILD:'BUILD'};
  function roleDmg(r){ if(r==='queen') return 0; if(r==='fighter') return 5; if(r==='fire') return 2; if(r==='bomber') return 6; return 1; }
  function makeAnt(role,color,size,pos){
    const a={id:++nextId,role,color,size,x:pos.x,y:pos.y,path:[],state:STATE.IDLE,stepReadyAt:0,selected:false,hpMax:100,hp:100,ai:{},dps:roleDmg(role),_eng:false,_orbit:(Math.random()<0.5?1:-1)};
    if(role==='food'||role==='gold'){ a.carry=0; a.upgraded=false; a.cap=a.upgraded?8:5; a.ai.collect={phase:'IDLE',target:null,gatherEndAt:0,unloadEndAt:0}; }
    return a;
  }
  function initialAntPositions(k){ const res=[], used=new Set(), add=(x,y)=>{ if(!isWalkable(x,y))return; const k2=`${x},${y}`; if(used.has(k2))return; used.add(k2); res.push({x,y}); }; for(const p of nestTiles) add(p.x,p.y); let r=1; while(res.length<k&&r<Math.max(W,H)){ for(let y=nest.y-r;y<=nest.y+r;y++){ add(nest.x-r,y); add(nest.x+r,y); } for(let x=nest.x-r+1;x<=nest.x+r-1;x++){ add(x,nest.y-r); add(x,nest.y+r); } r++; } return res.slice(0,k); }
  function spawnAnts(){ ants.length=0; nextId=0; const starts=initialAntPositions(5+2+1+5+1+1+1); let i=0; for(let k=0;k<5;k++) ants.push(makeAnt('food',Colors.food,1.0,starts[i++])); for(let k=0;k<2;k++) ants.push(makeAnt('gold',Colors.gold,1.0,starts[i++])); ants.push(makeAnt('builder',Colors.builder,1.0,starts[i++])); for(let k=0;k<5;k++) ants.push(makeAnt('fighter',Colors.fighter,1.15,starts[i++])); ants.push(makeAnt('fire',Colors.fire,1.1,starts[i++])); ants.push(makeAnt('bomber',Colors.bomber,1.1,starts[i++])); ants.push(makeAnt('queen',Colors.queen,1.25,starts[i++])); }

  /* ===== Structures / Upgrades ===== */
  // structure: {type, origin:{x,y}, footprint:[{x,y,status:'QUEUED'|'BUILDING'|'DONE',doneAt}], spinnerAt?}
  const structures=[]; 
  const upgrades={hpBonus:0,hospitalLevel:0};

  function structureAt(x,y){
    for(const s of structures){
      for(const c of s.footprint){
        if(c.x===x && c.y===y) return {s, cell:c, isOrigin:(x===s.origin.x && y===s.origin.y)};
      }
    }
    return null;
  }
  function freeAdj(x,y){ return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:x+dx,y:y+dy})).find(p=>inBounds(p.x,p.y)&&isWalkable(p.x,p.y)&&!ants.some(a=>a.x===p.x&&a.y===p.y)); }

  /* ===== Traps / Enemies ===== */
  // trap: {x,y,type:'FIRE'|'BOMB', state:'ARMING'|'ARMED'|'TRIPPED', armAt}
  const traps=[]; function placeTrap(x,y,type){ const t={x,y,type,state:'ARMING',armAt:performance.now()+3000}; traps.push(t); playSfx('trap'); }

  const HARVEST_RATE=10;

  const enemies=[]; let nextEnemyId=0;
  function makeEnemy(x,y){ return {id:++nextEnemyId,x,y,hpMax:120,hp:120,dps:2.5,path:[],stepReadyAt:0,_eng:false,_orbit:(Math.random()<0.5?1:-1)}; }
  let spawnSide='top'; (function(){ const dT=nest.y, dB=H-1-nest.y, dL=nest.x, dR=W-1-nest.x; const m=Math.max(dT,dB,dL,dR); spawnSide=(m===dT)?'top':(m===dB)?'bottom':(m===dL)?'left':'right'; })();
  function spawnEnemyOpposite(){
    const pos=[]; if(spawnSide==='top'){for(let x=0;x<W;x++) pos.push({x,y:0});} else if(spawnSide==='bottom'){for(let x=0;x<W;x++) pos.push({x,y:H-1});} else if(spawnSide==='left'){for(let y=0;y<H;y++) pos.push({x:0,y});} else {for(let y=0;y<H;y++) pos.push({x:W-1,y});}
    for(let i=pos.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [pos[i],pos[j]]=[pos[j],pos[i]]; }
    for(const p of pos){ if(isWalkable(p.x,p.y)){ enemies.push(makeEnemy(p.x,p.y)); playSfx('enemy'); return; } }
  }

  /* ===== Game state / HUD ===== */
  const GAME={phase:'PREP',status:'PLAY',prepMs:30*60*1000,waveMs:3*60*1000,prepEndAt:0,waveEndAt:0,enemiesKilled:0,antsLost:0,waveSize:0,toSpawn:0,spawnEvery:1000,nextSpawnAt:0};
  function resetGame(){ const now=performance.now(); Object.assign(GAME,{phase:'PREP',status:'PLAY',prepEndAt:now+GAME.prepMs,waveEndAt:0,enemiesKilled:0,antsLost:0,waveSize:0,toSpawn:0,nextSpawnAt:0}); enemies.length=0; modalClose(); if(VID.intro) playVideoOverlay(VID.intro); }
  function startBattle(){ const now=performance.now(); GAME.phase='COMBAT'; GAME.status='PLAY'; GAME.waveEndAt=now+GAME.waveMs; enemies.length=0; GAME.waveSize=Math.floor(GAME.waveMs/1000); GAME.toSpawn=GAME.waveSize; GAME.nextSpawnAt=now+1000; }
  function endGame(win){
    GAME.phase='ENDED'; GAME.status=win?'WIN':'LOSE';
    playSfx(win?'victory':'defeat');
    modalWrite(`<h2>${win?'Victory!':'Defeat'}</h2><div>${win?'All enemies destroyed.':'All ants died or time ran out.'}</div><div class="row"><button class="close" data-close>OK</button></div>`);
    const clip = win ? VID.win : VID.lose;
    if(clip) playVideoOverlay(clip);
  }

  function drawHUD(){
    const pad=10,h=56,cssW=hud.width/(window.devicePixelRatio||1);
    hudCtx.clearRect(0,0,hud.width,hud.height); hudCtx.fillStyle='#0e1316'; hudCtx.fillRect(0,0,cssW,h);
    hudCtx.font='600 13px ui-monospace, Menlo, Consolas, monospace'; hudCtx.textBaseline='middle';
    let x=pad,y=h/2; const left=[`Food: ${nest.food|0}`,`Gold: ${nest.gold|0}`,`Total: ${((nest.food|0)+(nest.gold|0))}`];
    left.forEach(t=>{ hudCtx.fillStyle='#d9e0e3'; hudCtx.fillText(t,x,y); x+=hudCtx.measureText(t).width+18; });
    const now=performance.now(); if(GAME.phase==='PREP'&&now>=GAME.prepEndAt) startBattle();
    const remain=(GAME.phase==='COMBAT'?Math.max(0,GAME.waveEndAt-now):Math.max(0,GAME.prepEndAt-now));
    const s=Math.ceil(remain/1000), m=(s/60)|0, r=s%60;
    const center=`${GAME.phase==='COMBAT'?'Battle':'Prep'} ${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`; const cw=hudCtx.measureText(center).width;
    hudCtx.fillStyle='#e6eef3'; hudCtx.fillText(center,(cssW-cw)/2,y);
    const right=[`Score: You ${(nest.food|0)+(nest.gold|0)+(GAME.enemiesKilled*10|0)} | Enemy ${(GAME.antsLost*10|0)}`, (GAME.phase==='COMBAT'?`Wave: ${GAME.waveSize-GAME.toSpawn-GAME.enemiesKilled}/${GAME.waveSize}`:`Nest Lv. ${nest.level}`)];
    let rx=cssW-pad; for(let i=right.length-1;i>=0;i--){ const w=hudCtx.measureText(right[i]).width; rx-=w; hudCtx.fillStyle=i===0?'#e6eef3':'#cbd5e1'; hudCtx.fillText(right[i],rx,y); rx-=18; }
  }

  /* ===== Drawing helpers ===== */
  function drawImageTile(url,x,y){ const im=url?getImg(url):null; if(!im||!im.complete) return false; try{ ctx.drawImage(im,x,y,TILE,TILE); }catch(_){ } return true; }
  function drawAntSprite(a,px,py){ const url=SPR[a.role]||''; const im=url?getImg(url):null; if(im&&im.complete){ try{ ctx.drawImage(im,px,py,TILE,TILE); return true; }catch(_){ } } return false; }
  function drawRing(ax,ay,r){ ctx.beginPath(); ctx.arc(ax,ay,r+4,0,Math.PI*2); ctx.strokeStyle='rgba(139,233,253,0.95)'; ctx.lineWidth=2; ctx.stroke(); }
  function drawSpinner(px,py){
    const t=(performance.now()/1000)%1;
    ctx.save(); ctx.translate(px+TILE/2, py+TILE/2); ctx.rotate(t*2*Math.PI);
    ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=2; ctx.beginPath();
    ctx.arc(0,0,Math.max(6,TILE*0.18), Math.PI*0.1, Math.PI*1.6); ctx.stroke(); ctx.restore();
  }
  function buildingSpriteFor(type){
    if(type==='BARRACKS') return SPR.barracks||SPR.nest||'';
    if(type==='UPGRADE')  return SPR.upgrade ||SPR.nest||'';
    if(type==='HOSPITAL') return SPR.hospital||SPR.nest||'';
    return SPR.nest||'';
  }

  function roleLabel(r){
    return r==='food' ? 'Food Collector' :
           r==='gold' ? 'Gold Collector' :
           r.charAt(0).toUpperCase()+r.slice(1);
  }
  function drawBubble(ax,ay,text){
    ctx.save();
    ctx.font=`600 ${Math.max(12,Math.floor(TILE*0.28))}px ui-sans-serif`;
    const padX=10, padY=6;
    const m=ctx.measureText(text);
    const w=m.width+padX*2, h=Math.max(22,padY*2+Math.ceil(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent));
    const x=ax-w/2, y=ay-(TILE*0.9)-h;
    ctx.fillStyle='rgba(12,16,20,0.88)';
    ctx.strokeStyle='rgba(255,255,255,0.18)';
    const r=10;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax-6, y+h);
    ctx.lineTo(ax+6, y+h);
    ctx.lineTo(ax, y+h+10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#e6eef3';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(text, ax, y+h/2);
    ctx.restore();
  }

  /* ===== Draw ===== */
  function draw(){
    ctx.clearRect(0,0,view.width,view.height);
    const x0=Math.max(0,Math.floor(cam.x/TILE)), y0=Math.max(0,Math.floor(cam.y/TILE));
    const x1=Math.min(W-1,Math.ceil((cam.x+view.width)/TILE)), y1=Math.min(H-1,Math.ceil((cam.y+view.height)/TILE));
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++){
      const px=x*TILE-cam.x, py=y*TILE-cam.y; const i=idx(x,y); const url=tiles[i];

      // Base tile image or fallback fill
      if(url) drawImageTile(url,px,py);
      if(!url){
        let f='#1a2428'; 
        if(map[y][x]===T.BLOCK) f='#2a2f33';
        if(map[y][x]===T.NEST)  f=C.nest;
        if(map[y][x]===T.FOOD)  f=C.food;
        if(map[y][x]===T.GOLD)  f=C.gold;
        if(map[y][x]===T.BUILD) f='#6b7280';
        if(map[y][x]===T.WALL)  f='#9ca3af';
        ctx.fillStyle=f; ctx.fillRect(px,py,TILE,TILE);
      }

      // NEST overlay always on top
      if(map[y][x]===T.NEST && SPR.nest) drawImageTile(SPR.nest,px,py);

      // Building sprite always on top when DONE
      const here=structureAt(x,y);
      if(here && here.cell.status==='DONE'){
        const spr=buildingSpriteFor(here.s.type);
        if(spr) drawImageTile(spr,px,py);
      }

      ctx.strokeStyle=C.grid; ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
    }

    // Traps
    const now=performance.now();
    for(const t of traps){
      const px=t.x*TILE-cam.x, py=t.y*TILE-cam.y;
      if(t.state==='ARMING'){
        ctx.globalAlpha=0.25; ctx.fillStyle=C.trap; ctx.fillRect(px,py,TILE,TILE); ctx.globalAlpha=1; drawSpinner(px,py);
      } else if(t.state==='ARMED'){
        ctx.globalAlpha=0.30; ctx.fillStyle=C.trap; ctx.fillRect(px,py,TILE,TILE); ctx.globalAlpha=1;
      } else if(t.state==='TRIPPED' && t.type==='FIRE'){
        ctx.globalAlpha=0.15; ctx.fillStyle=C.trap; ctx.fillRect(px,py,TILE,TILE); ctx.globalAlpha=1;
      }
      const deco=(t.type==='FIRE'?SPR.fireTile:SPR.bombTile)||''; if(deco) drawImageTile(deco,px,py);
    }

    // Nest marker
    const nx=nest.x*TILE+TILE/2-cam.x, ny=nest.y*TILE+TILE/2-cam.y; ctx.beginPath(); ctx.arc(nx,ny,3,0,Math.PI*2); ctx.fillStyle='#93f9b9'; ctx.fill();

    // Ants
    const now2=performance.now();
    ants.forEach(a=>{
      let offx=0, offy=0;
      if(a._eng){
        const t=(now2/1000)+(a.id*0.37), orbit=Math.min(6,TILE*0.10);
        offx+=Math.cos(t*7.0)*orbit*(a._orbit||1); offy+=Math.sin(t*7.0)*orbit*(a._orbit||1);
        offx+=(Math.random()-0.5)*1.5; offy+=(Math.random()-0.5)*1.5;
      }
      const ax=a.x*TILE+TILE/2-cam.x+offx, ay=a.y*TILE+TILE/2-cam.y+offy, r=TILE*0.3*(a.size||1);
      const px=a.x*TILE-cam.x+offx, py=a.y*TILE-cam.y+offy;
      const spr=drawAntSprite(a,px,py);
      if(!spr){ ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.fillStyle=a.color; ctx.fill(); ctx.fillStyle='black'; ctx.font=`${Math.max(10,Math.floor(TILE*0.4))}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(a.id,ax,ay); }

      // Inventory slots (collectors)
      if((a.role==='food'||a.role==='gold')){
        const slots=a.cap||5, filled=a.carry||0, size=Math.max(4,Math.floor(TILE*0.12)), pad=Math.max(2,Math.floor(TILE*0.04)), total=slots*size+(slots-1)*pad, bx=ax-total/2, by=ay-(TILE*0.55);
        for(let i=0;i<slots;i++){
          const sx=bx+i*(size+pad), sy=by;
          ctx.fillStyle=(i<filled)?'#e5e7eb':'rgba(0,0,0,0.0)';
          ctx.fillRect(sx,sy,size,size);
          ctx.strokeStyle='black'; ctx.lineWidth=Math.max(1,Math.floor(size*0.18)); ctx.strokeRect(sx+0.5,sy+0.5,size-1,size-1);
        }
      }

      // Health bar (always visible) ABOVE inventory squares
      {
        const bw=TILE*0.6, bh=4;
        const bx=ax-bw/2;
        const invTop=ay-(TILE*0.55);
        const gap=Math.max(4,Math.floor(TILE*0.05));
        const by = (a.role==='food'||a.role==='gold') ? (invTop - gap - bh) : (ay-(TILE*0.35));
        ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(bx,by,bw,bh);
        ctx.fillStyle='#22c55e'; ctx.fillRect(bx,by,bw*(a.hp/a.hpMax),bh);
        ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(bx+0.5,by+0.5,bw-1,bh-1);
      }

      if(a===selected){ drawRing(ax,ay,r); if(a.path&&a.path.length){ ctx.beginPath(); ctx.strokeStyle=C.path; ctx.lineWidth=2; let first=true; a.path.forEach(p=>{ const px2=p.x*TILE+TILE/2-cam.x, py2=p.y*TILE+TILE/2-cam.y; if(first){ ctx.moveTo(px2,py2); first=false; } else ctx.lineTo(px2,py2); }); ctx.stroke(); } }

      // Hover bubble
      if(a._bubbleUntil && performance.now()<=a._bubbleUntil && a._bubbleText){
        drawBubble(ax, ay, a._bubbleText);
      }
    });

    // Enemies
    enemies.forEach(e=>{
      let offx=0, offy=0;
      if(e._eng){
        const t=(now2/1000)+(e.id*0.29), orbit=Math.min(6,TILE*0.10);
        offx+=Math.cos(t*7.0)*orbit*(e._orbit||1); offy+=Math.sin(t*7.0)*orbit*(e._orbit||1);
        offx+=(Math.random()-0.5)*1.5; offy+=(Math.random()-0.5)*1.5;
      }
      const ex=e.x*TILE+TILE/2-cam.x+offx, ey=e.y*TILE+TILE/2-cam.y+offy, r=TILE*0.28;
      ctx.beginPath(); ctx.arc(ex,ey,r,0,Math.PI*2); ctx.fillStyle=C.enemy; ctx.fill();
      // health bar always visible
      const bw=TILE*0.6,bh=4,bx=ex-bw/2,by=ey-(TILE*0.35); ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(bx,by,bw,bh); ctx.fillStyle='#f87171'; ctx.fillRect(bx,by,bw*(e.hp/e.hpMax),bh); ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(bx+0.5,by+0.5,bw-1,bh-1);
    });

    // Structure spinners on tiles that are BUILDING
    for(const s of structures) for(const c of s.footprint){
      if(c.status==='BUILDING'){ const px=c.x*TILE-cam.x, py=c.y*TILE-cam.y; drawSpinner(px,py); }
    }
  }

  /* ===== Input ===== */
  let selected=null, healTarget=false, healTargetId=null, healRate=0, patrolArm=null;

  view.addEventListener('click',e=>{
    const t=screenToTile(e.clientX,e.clientY); if(!inBounds(t.x,t.y)) return;

    // Only show Recruit on Barracks ORIGIN tile
    const bHit=structureAt(t.x,t.y);
    if(!findAntAtClient(e.clientX,e.clientY) && bHit && bHit.s.type==='BARRACKS' && bHit.isOrigin){
      return showRecruitMenu(bHit.s.origin.x,bHit.s.origin.y,{anchorPx: tileToClientCenter(t.x,t.y)});
    }

    if(patrolArm){ const f=ants.find(a=>a.id===patrolArm&&a.role==='fighter'); patrolArm=null; if(f){ f.ai.patrol=[{x:f.x,y:f.y},{x:t.x,y:t.y}]; f.ai.patrolIdx=1; f.state=STATE.PATROL; const pass=(x,y)=>isPassableForAnt(x,y,f.id); const tgt=nearestReachableAround({x:t.x,y:t.y},pass)||{x:t.x,y:t.y}; f.path=bfs({x:f.x,y:f.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; } return; }
    if(healTarget){ const hit=findAntAtClient(e.clientX,e.clientY); if(hit){ healTargetId=hit.id; healTarget=false; toast('Healing…'); playSfx('heal'); } return; }

    const hit=findAntAtClient(e.clientX,e.clientY);
    if(hit){ ants.forEach(a=>a.selected=false); hit.selected=true; selected=hit; return; }

    if(!selected) return;
    if(isWalkable(t.x,t.y)){ selected.goal={x:t.x,y:t.y}; const pass=(x,y)=>isPassableForAnt(x,y,selected.id); const tgt=nearestReachableAround(selected.goal,pass)||selected.goal; selected.path=bfs({x:selected.x,y:selected.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; selected.state=selected.path.length?STATE.MOVE:STATE.IDLE; }
    if(selected.role==='food' && map[t.y]?.[t.x]===T.FOOD) startCollector(selected,t.x,t.y);
    if(selected.role==='gold' && map[t.y]?.[t.x]===T.GOLD) startCollector(selected,t.x,t.y);
  });

  view.addEventListener('contextmenu',e=>{
    e.preventDefault();
    const t=screenToTile(e.clientX,e.clientY);
    const hit=findAntAtClient(e.clientX,e.clientY);

    if(selected && (selected.role==='food'||selected.role==='gold')){
      const want=(selected.role==='food')?T.FOOD:T.GOLD;
      if(inBounds(t.x,t.y)&&map[t.y][t.x]===want) return startCollector(selected,t.x,t.y);
    }

    if(selected && selected.role==='builder'){
      if(!inBounds(t.x,t.y)||!isWalkable(t.x,t.y)) return toast('Can’t build there');
      if(structureAt(t.x,t.y)) return toast('Tile already has a building');
      return showBuildMenu(selected,t.x,t.y,{anchorPx: tileToClientCenter(t.x,t.y)});
    }

    if(hit && hit.role==='queen'){
      if(selected) selected.selected=false;
      selected=hit; selected.selected=true;
      return showQueenHealMenu({anchorPx: tileToClientCenter(hit.x,hit.y)});
    }

    if(selected && selected.role==='fire'){
      const a=selected; a.selected=false; selected=null;
      a.state=STATE.TRAP_MOVE; a.ai.trapTarget={x:t.x,y:t.y,type:'FIRE'};
      const pass=(x,y)=>isPassableForAnt(x,y,a.id); const tgt=nearestReachableAround({x:t.x,y:t.y},pass)||{x:t.x,y:t.y};
      a.path=bfs({x:a.x,y:a.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; return;
    }

    if(selected && selected.role==='bomber'){
      const a=selected; a.selected=false; selected=null;
      a.state=STATE.TRAP_MOVE; a.ai.trapTarget={x:t.x,y:t.y,type:'BOMB'};
      const pass=(x,y)=>isPassableForAnt(x,y,a.id); const tgt=nearestReachableAround({x:t.x,y:t.y},pass)||{x:t.x,y:t.y};
      a.path=bfs({x:a.x,y:a.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; return;
    }

    const fighter=hit&&hit.role==='fighter'?hit:(selected&&selected.role==='fighter'?selected:null);
    if(fighter){ patrolArm=fighter.id; toast(`Patrol armed for Fighter${fighter.id}. Left-click destination.`); return; }

    if(selected){ selected.selected=false; selected=null; }
  });

  // Hover bubbles
  let hoverAntId=null, bubbleMs=1500;
  view.addEventListener('mousemove', e=>{
    const hit=findAntAtClient(e.clientX,e.clientY);
    hoverAntId=hit?hit.id:null;
    if(hit){ hit._bubbleUntil=performance.now()+bubbleMs; hit._bubbleText=roleLabel(hit.role); }
  });
  view.addEventListener('touchstart', e=>{
    const t=e.touches&&e.touches[0]; if(!t) return;
    const hit=findAntAtClient(t.clientX,t.clientY);
    if(hit){ hoverAntId=hit.id; hit._bubbleUntil=performance.now()+bubbleMs; hit._bubbleText=roleLabel(hit.role); }
  },{passive:true});

  window.addEventListener('keydown',e=>{
    const step=32*(window.devicePixelRatio||1);
    if(e.key==='Escape'){ healTarget=false; patrolArm=null; modalClose(); if(selected){ selected.selected=false; selected=null; } }
    if(e.key==='a'||e.key==='ArrowLeft') cam.x=Math.max(0,cam.x-step);
    if(e.key==='d'||e.key==='ArrowRight') cam.x=Math.min(WORLD_W-view.width, cam.x+step);
    if(e.key==='w'||e.key==='ArrowUp') cam.y=Math.max(0,cam.y-step);
    if(e.key==='s'||e.key==='ArrowDown') cam.y=Math.min(WORLD_H-view.height, cam.y+step);
  });

  /* ===== Settings button ===== */
  (function addSettingsButton(){
    const btn=document.createElement('button');
    btn.textContent='⚙️';
    btn.setAttribute('aria-label','Settings');
    Object.assign(btn.style,{
      position:'fixed', right:'10px', top:'10px', zIndex:'9001',
      background:'#0f161a', color:'#e6eef3', border:'1px solid #27323a',
      borderRadius:'10px', padding:'8px 10px', cursor:'pointer'
    });
    btn.addEventListener('click', ()=> showSettingsMenu());
    document.body.appendChild(btn);
  })();

  function showSettingsMenu(){
    modalWrite(`
      <h2>Settings</h2>
      <div class="ants-grid cols-2">
        <button data-call='${json({act:'toggleSfx'})}'><strong>Sound</strong>: ${SETTINGS.sfxOn?'On':'Off'}</button>
        <button data-call='${json({act:'help'})}'>Help</button>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `);
  }
  function showHelp(){
    modalWrite(`
      <h2>How to Play</h2>
      <div style="line-height:1.4">
        <p><b>Goal:</b> Survive waves by gathering Food/Gold, building, and defending the nest.</p>
        <ul style="margin:0 0 8px 18px">
          <li><b>Left-click</b> an ant to select. Right-click to move.</li>
          <li>Collectors: Right-click on <b>Food</b> or <b>Gold</b> to start auto-gathering.</li>
          <li><b>Builder</b>: Right-click ground → Build menu (Barracks / Upgrade / Hospital).</li>
          <li><b>Barracks</b>: Click origin tile → Recruit (Fighter / Fire / Bomber / Food / Gold).</li>
          <li><b>Fighter</b>: Right-click a point to arm patrol; they also auto-chase nearby enemies.</li>
          <li><b>Fire/Bomber</b>: Right-click to place traps.</li>
          <li><b>Queen</b>: Context-menu → heal menu (after Hospital unlock).</li>
        </ul>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `);
  }

  /* ===== Menus ===== */
  function showBuildMenu(builder,tx,ty,opts){
    modalWrite(`
      <h2>Build (Cost in Gold)</h2>
      <div class="ants-grid cols-2">
        <button data-call='${json({act:'build',kind:'BARRACKS',cost:50,tx,ty,builderId:builder.id})}'>
          <div><strong>Barracks</strong> <small>(2×2)</small></div><div>Cost: 50</div>
        </button>
        <button data-call='${json({act:'build',kind:'UPGRADE',cost:100,tx,ty,builderId:builder.id})}'>
          <div><strong>Upgrade Center</strong> <small>(2×3)</small></div><div>Cost: 100</div>
        </button>
        <button data-call='${json({act:'build',kind:'HOSPITAL',cost:150,tx,ty,builderId:builder.id})}'>
          <div><strong>Hospital</strong> <small>(2×4)</small></div><div>Cost: 150</div>
        </button>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `, opts||{});
  }
  function showRecruitMenu(bx,by,opts){
    modalWrite(`
      <h2>Recruit (Gold)</h2>
      <div class="ants-grid cols-2">
        <button data-call='${json({act:'recruit',role:'fighter',cost:25,bx,by})}'><strong>Fighter</strong> — 25</button>
        <button data-call='${json({act:'recruit',role:'fire',   cost:40,bx,by})}'><strong>Fire</strong> — 40</button>
        <button data-call='${json({act:'recruit',role:'bomber', cost:60,bx,by})}'><strong>Bomber</strong> — 60</button>
        <button data-call='${json({act:'recruit',role:'food',   cost:15,bx,by})}'><strong>Food Collector</strong> — 15</button>
        <button data-call='${json({act:'recruit',role:'gold',   cost:20,bx,by})}'><strong>Gold Collector</strong> — 20</button>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `, opts||{});
  }
  function showUpgradeChoices(opts){
    modalWrite(`
      <h2>Upgrade Center</h2>
      <div class="ants-grid cols-2">
        <button data-call='${json({act:'hpBonus',value:10})}'>+10 HP</button>
        <button data-call='${json({act:'hpBonus',value:30})}'>+30 HP</button>
        <button data-call='${json({act:'hpBonus',value:50})}'>+50 HP</button>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `, opts||{});
  }
  function showHospitalChoices(opts){
    modalWrite(`
      <h2>Hospital</h2>
      <div class="ants-grid cols-2">
        <button data-call='${json({act:'unlockHeal',level:1,rate:20})}'>Unlock +20 HP/s</button>
        <button data-call='${json({act:'unlockHeal',level:2,rate:30})}'>Unlock +30 HP/s</button>
        <button data-call='${json({act:'unlockHeal',level:3,rate:50})}'>Unlock +50 HP/s</button>
      </div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `, opts||{});
  }
  function showQueenHealMenu(opts){
    const items=[];
    if(upgrades.hospitalLevel>=1) items.push(`<button data-call='${json({act:'healRate',rate:20})}'>Heal +20 HP/s</button>`);
    if(upgrades.hospitalLevel>=2) items.push(`<button data-call='${json({act:'healRate',rate:30})}'>Heal +30 HP/s</button>`);
    if(upgrades.hospitalLevel>=3) items.push(`<button data-call='${json({act:'healRate',rate:50})}'>Heal +50 HP/s</button>`);
    if(!items.length) items.push(`<button disabled>No hospital unlocked</button>`);
    modalWrite(`
      <h2>Queen Heal</h2>
      <div class="ants-grid cols-2">${items.join('')}</div>
      <div class="row"><button class="close" data-close>Close</button></div>
    `, opts||{});
  }
  function json(o){ return JSON.stringify(o).replace(/"/g,'&quot;'); }

  function handleMenuAction(p){
    switch(p.act){
      case 'build': return doBuild(p);
      case 'recruit': return doRecruit(p);
      case 'hpBonus': return applyHpBonus(p.value);
      case 'unlockHeal': return unlockHealLevel(p.level,p.rate);
      case 'healRate': return setHealRate(p.rate);
      case 'toggleSfx': SETTINGS.sfxOn=!SETTINGS.sfxOn; modalClose(); toast('Sound '+(SETTINGS.sfxOn?'On':'Off')); break;
      case 'help': showHelp(); break;
    }
  }

  /* ===== Actions ===== */
  function doBuild({kind,cost,tx,ty,builderId}){
    const b=ants.find(a=>a.id===builderId && a.role==='builder'); if(!b) return modalClose();
    if(nest.gold<cost){ return modalWrite(`<h2>Not enough gold</h2><div>Need ${cost} gold.</div><div class="row"><button class="close" data-close>OK</button></div>`); }

    // Footprints
    const size = (kind==='BARRACKS')?[2,2] : (kind==='UPGRADE')?[2,3] : [2,4];
    const cells=[];
    for(let dy=0;dy<size[1];dy++){
      for(let dx=0;dx<size[0];dx++){
        const cx=tx+dx, cy=ty+dy;
        if(!inBounds(cx,cy)||!isWalkable(cx,cy)||structureAt(cx,cy)) { toast('Blocked'); return; }
        cells.push({x:cx,y:cy,status:'QUEUED',doneAt:0});
      }
    }
    nest.gold-=cost;
    const s={type:kind,origin:{x:tx,y:ty},footprint:cells.slice()};
    structures.push(s);

    // Assign job to builder: walk to first cell then build sequentially (5s/tile)
    b.state=STATE.BUILD; b.ai.build={phase:'GOTO',targetIdx:0,structure:s, doneAll:false};
    const targ = s.footprint[0];
    const pass=(x,y)=>isPassableForAnt(x,y,b.id);
    b.path=bfs({x:b.x,y:b.y},(x,y)=>x===targ.x&&y===targ.y,pass)||[];
    modalClose();
  }

  function doRecruit({role,cost,bx,by}){
    if(nest.gold<cost){ return modalWrite(`<h2>Not enough gold</h2><div>Need ${cost} gold.</div><div class="row"><button class="close" data-close>OK</button></div>`); }
    const spot=freeAdj(bx,by)||freeAdj(nest.x,nest.y); if(!spot){ return modalWrite(`<h2>No Space</h2><div>No adjacent free tile to deploy.</div><div class="row"><button class="close" data-close>OK</button></div>`); }
    nest.gold-=cost;
    const col={fighter:'#3b82f6',fire:'#ff6db6',bomber:'#f97316',food:Colors.food,gold:Colors.gold};
    const sz ={fighter:1.15,fire:1.10,bomber:1.10,food:1.0,gold:1.0};
    ants.push(makeAnt(role,col[role]||'#888',sz[role]||1.0,spot));
    playSfx('recruit');
    modalClose();
  }

  function applyHpBonus(v){
    const delta=Math.max(0,v-upgrades.hpBonus); if(!delta){ return modalWrite(`<h2>No change</h2><div>Already at ${upgrades.hpBonus} or higher.</div><div class="row"><button class="close" data-close>OK</button></div>`); }
    upgrades.hpBonus=v; ants.forEach(u=>{ u.hpMax+=delta; u.hp=Math.min(u.hpMax,u.hp+delta); }); modalClose();
  }
  function unlockHealLevel(level,_rate){
    if(level<=upgrades.hospitalLevel){ return modalWrite(`<h2>Already unlocked</h2><div>Hospital level ${upgrades.hospitalLevel} active.</div><div class="row"><button class="close" data-close>OK</button></div>`); }
    upgrades.hospitalLevel=level; modalClose();
  }
  function setHealRate(rate){ healRate=rate; healTarget=true; modalClose(); toast(`Heal: click an ant (${rate}/s, 1 Food/HP)`); playSfx('heal'); }

  function startCollector(a,tx,ty){
    a.state=STATE.AUTO; a.cap=a.upgraded?8:5;
    a.ai.collect={phase:'GOTO',target:{x:tx,y:ty},gatherEndAt:0,unloadEndAt:0};
    const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.path=pathToAdjacent(a,tx,ty,pass); a.goal={x:tx,y:ty};
  }

  /* ===== Movement / tick ===== */
  function stepMove(a,now){
    if(now<(a.stepReadyAt||0)) return;
    const base=180/Math.max(0.1,(BOOT.settings&&BOOT.settings.normalSpeed)||1.0), mul=speedMulAt(a.x,a.y)*(1+(nest.level-1)*0.15);
    a.stepReadyAt=now+base/Math.max(0.05,mul);
    if(!a.path||!a.path.length){
      let tgt=null; if(a.state===STATE.PATROL&&a.ai?.patrol?.length){ const t=a.ai.patrol[a.ai.patrolIdx%a.ai.patrol.length]; tgt={x:t.x,y:t.y}; }
      else if(a.goal){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); tgt=nearestReachableAround(a.goal,pass)||a.goal; }
      if(tgt){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.path=bfs({x:a.x,y:a.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; }
      if(!a.path||!a.path.length){ if(a.state!==STATE.PATROL && a.state!==STATE.BUILD && a.state!==STATE.TRAP_MOVE && a.state!==STATE.TRAP_ARMING && a.state!==STATE.AUTO) a.state=STATE.IDLE; return; }
    }
    const next=a.path[0]; if(!isPassableForAnt(next.x,next.y,a.id)){ a.path=[]; return; }
    a.path.shift(); a.x=next.x; a.y=next.y;
    if(a.state===STATE.PATROL && a.ai?.patrol?.length){ const t=a.ai.patrol[a.ai.patrolIdx%a.ai.patrol.length]; if(a.x===t.x&&a.y===t.y){ a.ai.patrolIdx=(a.ai.patrolIdx+1)%a.ai.patrol.length; const pass=(x,y)=>isPassableForAnt(x,y,a.id); const tgt=nearestReachableAround(a.ai.patrol[a.ai.patrolIdx],pass)||a.ai.patrol[a.ai.patrolIdx]; a.path=bfs({x:a.x,y:a.y},(x,y)=>x===tgt.x&&y===tgt.y,pass)||[]; } }
  }

  function findAntAtClient(cx,cy){
    const r=view.getBoundingClientRect(); const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
    const sx=(cx-r.left)*dpr, sy=(cy-r.top)*dpr;
    for(let i=ants.length-1;i>=0;i--){
      const a=ants[i]; const ax=a.x*TILE+TILE/2-cam.x, ay=a.y*TILE+TILE/2-cam.y, rr=TILE*0.38*(a.size||1);
      const dx=sx-ax, dy=sy-ay; if(dx*dx+dy*dy<=rr*rr) return a;
    } return null;
  }

  let healAccu=0;
  function healTick(dt){
    if(!healTargetId || healRate<=0) return;
    const t=ants.find(a=>a.id===healTargetId); if(!t){ healTargetId=null; return; }
    if(t.hp>=t.hpMax || nest.food<=0) return;
    const gain=Math.min(healRate*dt, t.hpMax-t.hp, nest.food);
    healAccu+=gain; while(healAccu>=1){ if(t.hp>=t.hpMax || nest.food<=0) break; t.hp+=1; nest.food-=1; healAccu-=1; }
  }

  function markEng(){
    ants.forEach(a=>a._eng=false); enemies.forEach(e=>e._eng=false);
    for(const e of enemies){
      let engaged=0;
      for(const a of ants){
        if(engaged>=4) break;
        if(Math.abs(a.x-e.x)+Math.abs(a.y-e.y)<=1){ a._eng=true; e._eng=true; engaged++; }
      }
    }
  }

  function trapTick(){
    const now=performance.now();
    for(const t of traps){
      if(t.state==='ARMING' && now>=t.armAt) t.state='ARMED';
    }
  }
  function processTrapInteractions(){
    for(let i=0;i<traps.length;i++){
      const t=traps[i];
      if(t.state==='ARMED'){
        const victim=enemies.find(e=>e.x===t.x&&e.y===t.y);
        if(victim){
          if(t.type==='BOMB'){
            victim.hp=Math.max(0, victim.hp-25);
            t.state='TRIPPED';
            traps.splice(i,1); i--;
            continue;
          } else if(t.type==='FIRE'){
            t.state='TRIPPED'; // persists
          }
        }
      } else if(t.state==='TRIPPED' && t.type==='FIRE'){
        for(const e of enemies){ if(e.x===t.x&&e.y===t.y) e.hp=Math.max(0, e.hp-4); }
      }
    }
  }

  function buildTick(now){
    for(const a of ants){
      if(a.state===STATE.BUILD && a.ai.build){
        const job=a.ai.build, s=job.structure;
        if(job.phase==='GOTO'){
          if(a.path&&a.path.length){ stepMove(a,now); continue; }
          job.phase='BUILD_TILE';
          job.targetIdx=Math.max(0, Math.min(s.footprint.length-1, job.targetIdx|0));
          const cell=s.footprint[job.targetIdx];
          if(cell.status==='QUEUED'){ cell.status='BUILDING'; cell.doneAt=now+5000; }
          continue;
        }
        if(job.phase==='BUILD_TILE'){
          const cell=s.footprint[job.targetIdx];
          if(now>=cell.doneAt){
            cell.status='DONE';
            map[cell.y][cell.x]=T.BUILD;

            // Next tile?
            let nextIdx=-1;
            for(let k=0;k<s.footprint.length;k++){ if(s.footprint[k].status==='QUEUED'){ nextIdx=k; break; } }
            if(nextIdx>=0){
              job.targetIdx=nextIdx;
              const pass=(x,y)=>isPassableForAnt(x,y,a.id);
              a.path=bfs({x:a.x,y:a.y},(x,y)=>x===s.footprint[nextIdx].x&&y===s.footprint[nextIdx].y,pass)||[];
              job.phase='GOTO';
            } else {
              // Finished entire structure
              if(s.type==='BARRACKS'){ modalWrite(`<h2>Barracks Ready</h2><div>Click the origin tile to Recruit.</div><div class="row"><button class="close" data-close>OK</button></div>`); }
              if(s.type==='UPGRADE'){ showUpgradeChoices(); }
              if(s.type==='HOSPITAL'){ showHospitalChoices(); }
              playSfx('buildDone');
              a.state=STATE.IDLE; a.ai.build=null;
              // Move builder to closest free adjacent square
              const exit=freeAdj(a.x,a.y);
              if(exit){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.goal={x:exit.x,y:exit.y}; a.path=bfs({x:a.x,y:a.y},(x,y)=>x===exit.x&&y===exit.y,pass)||[]; a.state=STATE.MOVE; }
            }
          }
        }
      }
    }
  }

  function loop(){
    const now=performance.now(); const dt=Math.min(0.1,(loop._last? (now-loop._last)/1000 : 0)); loop._last=now;

    if(GAME.phase==='COMBAT'&&GAME.status==='PLAY'){
      if(GAME.toSpawn>0 && now>=GAME.nextSpawnAt){ spawnEnemyOpposite(); GAME.toSpawn--; GAME.nextSpawnAt+=GAME.spawnEvery; }
      if(GAME.toSpawn===0 && enemies.length===0) endGame(true);
      if(now>=GAME.waveEndAt && GAME.status==='PLAY') endGame(enemies.length===0);
    }

    trapTick();
    processTrapInteractions();
    healTick(dt);
    buildTick(now);

    // Ants
    for(const a of ants){
      // Fighters: auto-chase nearest enemy if idle or auto
      if(a.role==='fighter' && (a.state===STATE.IDLE || a.state===STATE.AUTO) && enemies.length){
        let best=null,bd=9999;
        for(const e of enemies){ const d=Math.abs(a.x-e.x)+Math.abs(a.y-e.y); if(d<bd){bd=d; best=e;} }
        if(best && bd<=7){
          const pass=(x,y)=>isPassableForAnt(x,y,a.id);
          a.goal={x:best.x,y:best.y};
          a.path=bfs({x:a.x,y:a.y},(x,y)=>x===best.x&&y===best.y,pass)||[];
          a.state=STATE.MOVE;
        }
      }

      if(a.state===STATE.TRAP_MOVE){
        stepMove(a,now);
        if(!a.path.length){ a.state=STATE.TRAP_ARMING; a.ai.armedAt=now+3000; }
        continue;
      }
      if(a.state===STATE.TRAP_ARMING){
        if(now>=a.ai.armedAt){
          placeTrap(a.x,a.y, (a.ai.trapTarget && a.ai.trapTarget.type) || 'FIRE');
          const opt=[[a.x+1,a.y],[a.x-1,a.y],[a.x,a.y+1],[a.x,a.y-1]].find(([nx,ny])=>isWalkable(nx,ny));
          if(opt){ a.x=opt[0]; a.y=opt[1]; }
          a.state=STATE.IDLE;
        }
        continue;
      }

      if(a.state===STATE.AUTO){
        const want=(a.role==='food')?T.FOOD:T.GOLD; const amt=(a.role==='food')?amtFood:amtGold; const job=a.ai.collect;
        if(job.phase==='GOTO'){
          if(a.path&&a.path.length){ stepMove(a,now); continue; }
          const adj=(Math.abs(a.x-job.target.x)+Math.abs(a.y-job.target.y))===1;
          const still=inBounds(job.target.x,job.target.y) && map[job.target.y][job.target.x]===want && (amt[job.target.y][job.target.x]>0);
          if(!still){ const n=nearestResource(a.x,a.y,(want===T.FOOD)?'FOOD':'GOLD'); if(n){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.path=pathToAdjacent(a,n.x,n.y,pass); job.target=n; continue; } a.state=STATE.IDLE; continue; }
          if(!adj){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.path=pathToAdjacent(a,job.target.x,job.target.y,pass); continue; }
          job.phase='GATHER'; job.gatherEndAt=now+5000; playSfx('gather'); continue;
        }
        if(job.phase==='GATHER'){
          const total=a.cap, remaining=Math.max(0,job.gatherEndAt-now), should=total-Math.ceil(remaining/1000);
          const bucket=amt[job.target.y][job.target.x]||0, give=Math.max(0,Math.min(should-a.carry,bucket));
          if(give>0){ a.carry+=give; amt[job.target.y][job.target.x]-=give; if(amt[job.target.y][job.target.x]<=0) normalizeTile(job.target.x,job.target.y); }
          const windowDone=now>=job.gatherEndAt, full=a.carry>=a.cap, empty=!(inBounds(job.target.x,job.target.y)&&map[job.target.y][job.target.x]===want&&(amt[job.target.y][job.target.x]>0));
          if(windowDone||full||empty){ job.phase='RETURN'; const pass=(x,y)=>isPassableForAnt(x,y,a.id); const nt=nestTiles.find(p=>isWalkable(p.x,p.y))||{x:nest.x,y:nest.y}; a.path=bfs({x:a.x,y:a.y},(x,y)=>x===nt.x&&y===nt.y,pass)||[]; }
          continue;
        }
        if(job.phase==='RETURN'){
          if(a.path&&a.path.length){ stepMove(a,now); continue; }
          const inNest=map[a.y][a.x]===T.NEST||nestTiles.some(p=>p.x===a.x&&p.y===a.y);
          if(!inNest){ const pass=(x,y)=>isPassableForAnt(x,y,a.id); const nt=nestTiles.find(p=>isWalkable(p.x,p.y))||{x:nest.x,y:nest.y}; a.path=bfs({x:a.x,y:a.y},(x,y)=>x===nt.x&&y===nt.y,pass)||[]; continue; }
          job.phase='UNLOAD'; job.unloadEndAt=now+5000; continue;
        }
        if(job.phase==='UNLOAD'){
          if(now<job.unloadEndAt) continue;
          if(a.role==='food') nest.food+=a.carry; else nest.gold+=a.carry; a.carry=0; playSfx('deposit');
          const still=inBounds(job.target.x,job.target.y)&&map[job.target.y][job.target.x]===((a.role==='food')?T.FOOD:T.GOLD)&&((a.role==='food'?amtFood:amtGold)[job.target.y][job.target.x]>0);
          if(still){ job.phase='GOTO'; const pass=(x,y)=>isPassableForAnt(x,y,a.id); a.path=pathToAdjacent(a,job.target.x,job.target.y,pass); } else { a.state=STATE.IDLE; job.phase='IDLE'; }
          continue;
        }
      }

      stepMove(a,now);
    }

    // Enemies: path either to nearest ant (<=7) or to nest
    for(const e of enemies){
      if(now<e.stepReadyAt) continue;
      const base=200; e.stepReadyAt=now+base;
      if(!e.path||!e.path.length){
        let targetAnt=null, bd=9999;
        for(const a of ants){ const d=Math.abs(a.x-e.x)+Math.abs(a.y-e.y); if(d<bd){bd=d; targetAnt=a;} }
        const goal = (targetAnt && bd<=7) ? {x:targetAnt.x,y:targetAnt.y} : (nestTiles[(Math.random()*nestTiles.length)|0]||{x:nest.x,y:nest.y});
        e.path=bfs({x:e.x,y:e.y},(x,y)=>x===goal.x&&y===goal.y,(x,y)=>isWalkable(x,y)&&!enemies.some(o=>o!==e&&o.x===x&&o.y===y))||[];
      }
      const next=e.path.shift(); if(next && isWalkable(next.x,next.y)) { e.x=next.x; e.y=next.y; }
    }

    // Combat
    markEng();
    function mh(a,b){ return Math.abs(a.x-b.x)+Math.abs(a.y-b.y); }
    for(const e of enemies){
      let attackers=0;
      for(const a of ants){
        if(mh(a,e)<=1){
          e.hp=Math.max(0,e.hp-a.dps*dt);
          a.hp=Math.max(0,a.hp-e.dps*dt/4);
          attackers++; if(attackers>=4) break;
        }
      }
    }
    for(let i=enemies.length-1;i>=0;i--) if(enemies[i].hp<=0){ enemies.splice(i,1); GAME.enemiesKilled++; }
    for(let i=ants.length-1;i>=0;i--) if(ants[i].hp<=0){ if(selected&&selected.id===ants[i].id) selected=null; GAME.antsLost++; ants.splice(i,1); }
    if(GAME.status==='PLAY' && ants.length===0) endGame(false);

    draw(); drawHUD();
    requestAnimationFrame(loop);
  }

  /* ===== Utils / Boot ===== */
  function toast(t){ overlay.classList.add('show'); overlay.innerHTML='<div id="ants-banner">'+t+'</div>'; setTimeout(()=>{ overlay.classList.remove('show'); overlay.innerHTML='<div id="ants-banner"></div>'; },900); }
  function resize(){
    const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
    const adminBar=document.body.classList.contains('admin-bar')?32:0, hudCssH=56;
    hud.width=Math.floor(window.innerWidth*dpr); hud.height=Math.floor(hudCssH*dpr); hud.style.width='100vw'; hud.style.height=hudCssH+'px'; hudCtx.setTransform(1,0,0,1,0,0); hudCtx.scale(dpr,dpr); hudCtx.imageSmoothingEnabled=false;
    view.width=Math.floor(window.innerWidth*dpr); view.height=Math.floor((window.innerHeight-adminBar)*dpr); view.style.width='100vw'; view.style.height='100vh'; ctx.imageSmoothingEnabled=false;
  }
  window.addEventListener('resize',resize); resize();
  spawnAnts(); resetGame(); requestAnimationFrame(loop);

  // Nav pad + edges
  (function(){
    const step=32*(window.devicePixelRatio||1);
    function pan(dx,dy){ cam.x=Math.max(0,Math.min(WORLD_W-view.width,cam.x+dx)); cam.y=Math.max(0,Math.min(WORLD_H-view.height,cam.y+dy)); }
    function panDir(dir){ const d={'up':[0,-step],'down':[0,step],'left':[-step,0],'right':[step,0],'up-left':[-step,-step],'up-right':[step,-step],'down-left':[-step,step],'down-right':[step,step]}[dir]; if(!d) return; pan(d[0],d[1]); }
    const pad=document.getElementById('ants-pad'); if(pad) pad.addEventListener('click',e=>{ const b=e.target.closest('[data-pan]'); if(!b) return; const dir=b.getAttribute('data-pan'); if(dir==='center'){ centerOnNest(); return; } panDir(dir); });
    const edges=document.querySelectorAll('.ants-edge'); if(edges){ let timer=null, dir=null; function start(d){ dir=d; if(timer) return; timer=setInterval(()=>panDir(dir),50); } function stop(){ if(timer) clearInterval(timer); timer=null; dir=null; } edges.forEach(el=>{ el.addEventListener('mouseenter',()=>start(el.getAttribute('data-edge'))); el.addEventListener('mouseleave',stop); el.addEventListener('mousedown',()=>start(el.getAttribute('data-edge'))); window.addEventListener('mouseup',stop); }); }
  })();

  // Helpers
  function nearestResource(x,y,kind){
    const want=(kind==='FOOD')?T.FOOD:T.GOLD;
    let best=null, bestd=1e9;
    for(let yy=0;yy<H;yy++) for(let xx=0;xx<W;xx++){
      if(map[yy][xx]===want && ((kind==='FOOD')?amtFood:amtGold)[yy][xx]>0){
        const d=Math.abs(xx-x)+Math.abs(yy-y);
        if(d<bestd){ best={x:xx,y:yy}; bestd=d; }
      }
    }
    return best;
  }

  /* menu action JSON helper above already */
})();
