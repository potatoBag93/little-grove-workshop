import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { Engine } from '@babylonjs/core/Engines/engine';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Shaders/default.vertex';
import '@babylonjs/core/Shaders/default.fragment';
import '@babylonjs/core/Culling/ray';
import './workshop.css';

type Kind = 'grass' | 'wood' | 'stone' | 'brick' | 'flower' | 'tree';
type Cell = { x: number; z: number; y: number; kind: Kind };
type Save = { version: 1; cells: Cell[]; player: { x: number; z: number } };
const labels: Record<Kind, string> = { grass: '잔디', wood: '나무', stone: '돌', brick: '벽돌', flower: '꽃', tree: '나무 심기' };
const emoji: Record<Kind, string> = { grass: '🟩', wood: '🪵', stone: '🪨', brick: '🧱', flower: '🌼', tree: '🌳' };
const kinds = Object.keys(labels) as Kind[];
const canvas = document.querySelector<HTMLCanvasElement>('#renderCanvas')!;
const engine = new Engine(canvas, true, { antialias: false, stencil: false });
engine.setHardwareScalingLevel(Math.max(1, Math.min(2, window.devicePixelRatio || 1)));
const scene = new Scene(engine);
scene.clearColor = Color4.FromHexString('#b7e8ebff');
scene.ambientColor = new Color3(.65, .7, .65);
const camera = new ArcRotateCamera('isometricCamera', -Math.PI / 4, 1.02, 24, Vector3.Zero(), scene);
camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
camera.inputs.clear();
scene.activeCamera = camera;
let halfHeight = 10;
let cameraAlphaTarget = camera.alpha;
function resize() {
  engine.resize();
  const ratio = engine.getRenderWidth() / Math.max(engine.getRenderHeight(), 1);
  camera.orthoTop = halfHeight; camera.orthoBottom = -halfHeight;
  camera.orthoLeft = -halfHeight * ratio; camera.orthoRight = halfHeight * ratio;
}
window.addEventListener('resize', resize);
resize();
new HemisphericLight('skyLight', Vector3.Up(), scene).intensity = .9;
new DirectionalLight('sun', new Vector3(-.5, -1, .3), scene).intensity = .5;
function material(name: string, hex: string) {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.ambientColor = m.diffuseColor.scale(.3);
  m.specularColor = Color3.Black();
  return m;
}
const m = {
  grass: material('grass', '#9ac878'), earth: material('earth', '#a97c58'),
  wood: material('wood', '#bc8354'), stone: material('stone', '#a8b7b5'),
  brick: material('brick', '#e6a08a'), flower: material('flower', '#efa1b4'),
  leaf: material('leaf', '#68a975'), trunk: material('trunk', '#8a6b51'),
  path: material('path', '#ead9ae'), water: material('water', '#79cbd2'),
  wall: material('wall', '#fff1db'), roof: material('roof', '#d77c6c'),
  skin: material('skin', '#f5c9a8'), shirt: material('shirt', '#eda45a'),
  dark: material('dark', '#594f4a'),
};
function cube(name: string, x: number, y: number, z: number, w: number, h: number, d: number, mat: StandardMaterial, parent?: TransformNode) {
  const mesh = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
  mesh.position.set(x, y, z); mesh.material = mat;
  if (parent) mesh.parent = parent;
  return mesh;
}
const FIELD_HALF = 90;
cube('sea', 0, -.49, 0, 380, .12, 380, m.water).isPickable = false;
cube('islandSides', 0, -.37, 0, 185, .65, 185, m.earth).isPickable = false;
const ground = cube('buildableGround', 0, 0, 0, 180, .12, 180, m.grass);
for (let x = -80; x <= 80; x++) cube('villagePath', x, .071, 0, .98, .015, .98, m.path).isPickable = false;
for (const [x, z] of [[-60,-50],[-60,50],[60,-60],[70,60],[-10,60],[-35,-25],[35,28],[12,-62]]) {
  const trunk = MeshBuilder.CreateCylinder('landmarkTrunk', { height: 1.2, diameter: .34, tessellation: 6 }, scene);
  trunk.position.set(x,.65,z); trunk.material=m.trunk; trunk.isPickable=false;
  const leaves = MeshBuilder.CreateSphere('landmarkLeaves', { diameter: 1.75, segments: 7 }, scene);
  leaves.position.set(x,1.65,z); leaves.material=m.leaf; leaves.isPickable=false;
}
const house = new TransformNode('littleCottage', scene);
house.position.set(4, 0, -4);
cube('walls',0,1.08,0,2.6,2.1,2.2,m.wall,house).isPickable=false;
cube('roof',0,2.33,0,3.1,.45,2.6,m.roof,house).isPickable=false;
cube('door',0,.66,-1.15,.68,1.25,.07,m.dark,house).isPickable=false;
cube('window',-.8,1.35,-1.15,.5,.5,.08,m.water,house).isPickable=false;
for (const [x,z] of [[-30,-40],[-20,-40],[30,30],[40,30],[-40,40],[55,-35],[-55,28],[18,48],[-15,-68]]) {
  const bloom=MeshBuilder.CreateSphere('wildflower',{diameter:.32,segments:6},scene);
  bloom.position.set(x,.26,z); bloom.material=m.flower; bloom.isPickable=false;
}
const avatar = new TransformNode('builder', scene);
const body=MeshBuilder.CreateSphere('builderShirt',{diameter:.65,segments:8},scene);
body.position.y=.68; body.scaling.y=1.15; body.material=m.shirt; body.parent=avatar; body.isPickable=false;
const head=MeshBuilder.CreateSphere('builderHead',{diameter:.65,segments:8},scene);
head.position.y=1.32; head.material=m.skin; head.parent=avatar; head.isPickable=false;
const hat=MeshBuilder.CreateCylinder('strawHat',{height:.13,diameter:.95,tessellation:10},scene);
hat.position.y=1.67; hat.material=m.wood; hat.parent=avatar; hat.isPickable=false;
for (const x of [-.18,.18]) cube('boot',x,.14,0,.18,.28,.28,m.dark,avatar).isPickable=false;

const blocks=new Map<string,{cell:Cell;root:TransformNode}>();
const storageKey='little-grove-workshop-v1';
const cellKey=(x:number,z:number,y:number)=>`${x},${z},${y}`;
let selected:Kind='wood', erasing=false, playerX=-2, playerZ=1;
const palette=document.querySelector<HTMLElement>('#palette')!;
const count=document.querySelector<HTMLElement>('#blockCount')!;
const status=document.querySelector<HTMLElement>('#statusText')!;
function message(value:string) { status.textContent=value; }
function updateUi() {
  count.textContent=`${blocks.size}개 놓음`;
  document.querySelector('#selectedLabel')!.textContent=`${emoji[selected]} ${labels[selected]}`;
  document.querySelector('#modeLabel')!.textContent=erasing?'치우기 모드':'놓기 모드';
  document.querySelectorAll<HTMLButtonElement>('[data-block]').forEach(b=>b.classList.toggle('active',b.dataset.block===selected));
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.classList.toggle('active',(b.dataset.mode==='erase')===erasing));
}
function save() {
  const data:Save={version:1,cells:[...blocks.values()].map(v=>v.cell),player:{x:playerX,z:playerZ}};
  try { localStorage.setItem(storageKey,JSON.stringify(data)); } catch { message('브라우저 저장 공간을 사용할 수 없어요'); }
  updateUi();
}
function part(root:TransformNode, mesh:Mesh, key:string) { mesh.parent=root; mesh.metadata={blockKey:key}; }
function add(cell:Cell, persist=true) {
  const {x,z,y,kind}=cell, key=cellKey(x,z,y);
  if (Math.abs(x)>FIELD_HALF-2 || Math.abs(z)>FIELD_HALF-2 || y<0 || y>4 || blocks.has(key)) return false;
  const root=new TransformNode('placed-'+key,scene);
  root.position.set(x,y,z);
  if (kind==='flower') {
    const stem=MeshBuilder.CreateCylinder('flowerStem',{height:.48,diameter:.08,tessellation:5},scene);
    stem.position.y=.25; stem.material=m.leaf; part(root,stem,key);
    const bloom=MeshBuilder.CreateSphere('flowerBloom',{diameter:.42,segments:7},scene);
    bloom.position.y=.55; bloom.material=m.flower; part(root,bloom,key);
  } else if (kind==='tree') {
    const trunk=MeshBuilder.CreateCylinder('treeTrunk',{height:1,diameter:.32,tessellation:6},scene);
    trunk.position.y=.5; trunk.material=m.trunk; part(root,trunk,key);
    const leaves=MeshBuilder.CreateSphere('treeLeaves',{diameter:1.25,segments:7},scene);
    leaves.position.y=1.35; leaves.material=m.leaf; part(root,leaves,key);
  } else {
    const mesh=cube('block',0,.5,0,.96,.96,.96,m[kind],root);
    mesh.metadata={blockKey:key};
  }
  blocks.set(key,{cell,root});
  if (persist) save();
  return true;
}
function remove(key:string) {
  const item=blocks.get(key); if (!item) return false;
  item.root.getChildMeshes().forEach(mesh=>mesh.dispose());
  item.root.dispose(); blocks.delete(key); save(); return true;
}
function starter() {
  for (const cell of [
    {x:-5,z:2,y:0,kind:'wood'},{x:-4,z:2,y:0,kind:'wood'},
    {x:-5,z:3,y:0,kind:'wood'},{x:-4,z:3,y:0,kind:'wood'},
    {x:-5,z:2,y:1,kind:'brick'},{x:-4,z:2,y:1,kind:'brick'},
    {x:2,z:5,y:0,kind:'flower'},{x:3,z:5,y:0,kind:'flower'},
    {x:6,z:2,y:0,kind:'tree'},
  ] as Cell[]) add(cell,false);
}
try {
  const raw=localStorage.getItem(storageKey);
  if (raw) {
    const data=JSON.parse(raw) as Save;
    if (data.version===1 && Array.isArray(data.cells)) {
      data.cells.forEach(c=>{if(c && Number.isInteger(c.x) && Number.isInteger(c.z) && Number.isInteger(c.y) && kinds.includes(c.kind)) add(c,false);});
      if (Number.isFinite(data.player?.x)) playerX=data.player.x;
      if (Number.isFinite(data.player?.z)) playerZ=data.player.z;
    } else starter();
  } else starter();
} catch { starter(); }
avatar.position.set(playerX,.08,playerZ);
for (const kind of kinds) {
  const b=document.createElement('button'); b.type='button'; b.dataset.block=kind;
  const icon=document.createElement('span'); icon.className='icon'; icon.textContent=emoji[kind];
  const label=document.createElement('span'); label.textContent=labels[kind];
  b.append(icon,label);
  b.addEventListener('click',()=>{selected=kind;erasing=false;updateUi();});
  palette.append(b);
}
updateUi();
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>{erasing=b.dataset.mode==='erase';updateUi();}));
document.querySelector('#saveButton')?.addEventListener('click',()=>{save();message('마을을 저장했어요');});
document.querySelector('#resetButton')?.addEventListener('click',()=>{
  if (!window.confirm('놓은 블록을 처음 상태로 되돌릴까요?')) return;
  for (const key of [...blocks.keys()]) remove(key);
  starter(); playerX=-2;playerZ=1;avatar.position.set(playerX,.08,playerZ);save();message('새 마을을 시작했어요');
});
document.querySelector('#helpButton')?.addEventListener('click',()=>document.querySelector<HTMLDialogElement>('#helpDialog')?.showModal());
document.querySelector('#closeHelp')?.addEventListener('click',()=>document.querySelector<HTMLDialogElement>('#helpDialog')?.close());

function interact(clientX:number,clientY:number) {
  const bounds=canvas.getBoundingClientRect();
  const x=clientX-bounds.left;
  const y=clientY-bounds.top;
  const hit=scene.pick(x,y,mesh=>mesh===ground || Boolean(mesh.metadata?.blockKey));
  if (!hit?.hit || !hit.pickedPoint) return;
  const oldKey=hit.pickedMesh?.metadata?.blockKey as string|undefined;
  if (erasing) { if (!oldKey || !remove(oldKey)) message('치울 블록을 눌러주세요'); return; }
  let target:Cell={x:Math.round(hit.pickedPoint.x),z:Math.round(hit.pickedPoint.z),y:0,kind:selected};
  if (oldKey) {
    const old=blocks.get(oldKey)?.cell; if (!old) return;
    const normal=hit.getNormal(true)??Vector3.Up();
    target={x:old.x+(Math.abs(normal.x)>.5?Math.round(normal.x):0),z:old.z+(Math.abs(normal.z)>.5?Math.round(normal.z):0),y:old.y+(normal.y>.5?1:0),kind:selected};
  }
  message(add(target)?`${labels[selected]}을 놓았어요`:'그 자리에 놓을 수 없어요');
}
let start:{x:number;y:number;at:number}|null=null;
canvas.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,at:performance.now()};});
canvas.addEventListener('pointerup',e=>{
  if (start && Math.hypot(e.clientX-start.x,e.clientY-start.y)<12 && performance.now()-start.at<700) interact(e.clientX,e.clientY);
  start=null;
});
canvas.addEventListener('pointercancel',()=>{start=null;});
canvas.addEventListener('wheel',e=>{e.preventDefault();halfHeight=Math.max(6,Math.min(15,halfHeight+Math.sign(e.deltaY)));resize();},{passive:false});
const pressed=new Set<string>();
window.addEventListener('keydown',e=>{
  if (e.code.startsWith('Arrow')) e.preventDefault();
  pressed.add(e.code);
  if (e.repeat) return;
  if (e.code==='KeyE') {erasing=!erasing;updateUi();}
  if (/^Digit[1-6]$/.test(e.code)) {selected=kinds[Number(e.code.slice(-1))-1];erasing=false;updateUi();}
});
window.addEventListener('keyup',e=>pressed.delete(e.code));
window.addEventListener('blur',()=>pressed.clear());
document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(b=>{
  const code=b.dataset.move!;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);pressed.add(code);});
  for(const event of ['pointerup','pointercancel','lostpointercapture']) b.addEventListener(event,()=>pressed.delete(code));
});
scene.onBeforeRenderObservable.add(()=>{
  const dt=Math.min(engine.getDeltaTime()/1000,.05);
  const dx=Number(pressed.has('KeyD')||pressed.has('ArrowRight'))-Number(pressed.has('KeyA')||pressed.has('ArrowLeft'));
  const dz=Number(pressed.has('KeyW')||pressed.has('ArrowUp'))-Number(pressed.has('KeyS')||pressed.has('ArrowDown'));
  const length=Math.hypot(dx,dz)||1;
  playerX=Math.max(-FIELD_HALF+1.5,Math.min(FIELD_HALF-1.5,playerX+dx/length*3.4*dt));
  playerZ=Math.max(-FIELD_HALF+1.5,Math.min(FIELD_HALF-1.5,playerZ+dz/length*3.4*dt));
  avatar.position.x=playerX;avatar.position.z=playerZ;
  if(dx||dz) {
    avatar.rotation.y=Math.atan2(dx,dz);
    cameraAlphaTarget=Math.atan2(dx,dz)-Math.PI/4;
  }
  const angleDelta=Math.atan2(Math.sin(cameraAlphaTarget-camera.alpha),Math.cos(cameraAlphaTarget-camera.alpha));
  camera.alpha+=angleDelta*Math.min(1,dt*1.4);
  camera.target.x+=(playerX-camera.target.x)*Math.min(1,dt*1.6);
  camera.target.z+=(playerZ-camera.target.z)*Math.min(1,dt*1.6);
});
engine.runRenderLoop(()=>scene.render());
window.setInterval(save,15000);
