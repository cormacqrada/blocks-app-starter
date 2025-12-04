var q=Object.defineProperty;var Y=(r,n,e)=>n in r?q(r,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[n]=e;var g=(r,n,e)=>Y(r,typeof n!="symbol"?n+"":n,e);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();class X{constructor(n){g(this,"tree");g(this,"adapters",[]);this.tree=n}getTree(){return this.tree}applyDeltas(n){var e;for(const t of n)t.kind==="update"&&t.path==="root"&&t.block&&(this.tree=t.block);for(const t of this.adapters)(e=t.onDeltas)==null||e.call(t,n,this)}registerAdapter(n){this.adapters.push(n)}}class z extends HTMLElement{constructor(){super(...arguments);g(this,"node",null);g(this,"x",0);g(this,"y",0)}setNode(e){this.node=e;const t=e.properties;this.x=t.x??0,this.y=t.y??0,this.applyPosition(),this.render()}connectedCallback(){this.node&&this.render()}applyPosition(){this.style.position="absolute",this.style.left=`${this.x}px`,this.style.top=`${this.y}px`}render(){var y,h,v,N;const e=this.shadowRoot??this.attachShadow({mode:"open"});e.innerHTML="",O(e);const t=document.createElement("div");t.className="blocks-node";const s=document.createElement("header");s.className="blocks-node-header";const o=document.createElement("span");o.className="blocks-node-title",o.textContent=String(((h=(y=this.node)==null?void 0:y.properties)==null?void 0:h.title)??((v=this.node)==null?void 0:v.id)??"Node"),s.appendChild(o);const c=document.createElement("div");c.className="blocks-node-body";const a=((N=this.node)==null?void 0:N.properties)??{},p=a.inputs??[],l=a.outputs??[],u=document.createElement("div");u.className="blocks-node-ports";const d=document.createElement("div");d.className="blocks-node-ports-col inputs";for(const w of p){const b=document.createElement("div");b.className="blocks-node-port-row";const k=document.createElement("span");k.className="port-dot input";const i=document.createElement("span");i.className="port-label",i.textContent=w.label,b.appendChild(k),b.appendChild(i),d.appendChild(b)}const m=document.createElement("div");m.className="blocks-node-ports-col outputs";for(const w of l){const b=document.createElement("div");b.className="blocks-node-port-row";const k=document.createElement("span");k.className="port-label",k.textContent=w.label;const i=document.createElement("span");i.className="port-dot output",b.appendChild(k),b.appendChild(i),m.appendChild(b)}u.appendChild(d),u.appendChild(m);const f=document.createElement("div");f.className="blocks-node-content",f.textContent="Node content",c.appendChild(u),c.appendChild(f),t.appendChild(s),t.appendChild(c),e.appendChild(t),this.attachDragBehavior(s)}attachDragBehavior(e){let t=!1,s=0,o=0,c=0,a=0;const p=d=>{t=!0,s=d.clientX,o=d.clientY,c=this.x,a=this.y,e.setPointerCapture(d.pointerId),d.preventDefault()},l=d=>{if(!t)return;const m=d.clientX-s,f=d.clientY-o;this.x=c+m,this.y=a+f,this.applyPosition()},u=d=>{var h;if(!t)return;t=!1,e.releasePointerCapture(d.pointerId);const m=((h=this.node)==null?void 0:h.id)??"";if(!m)return;const f=[{kind:"update",blockId:m,path:"node.position",block:{x:this.x,y:this.y}}],y={nodeId:m,x:this.x,y:this.y,deltas:f};this.dispatchEvent(new CustomEvent("node:moveRequested",{detail:y,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",p),e.addEventListener("pointermove",l),e.addEventListener("pointerup",u),e.addEventListener("pointercancel",u)}}function R(r="blocks-node"){customElements.get(r)||customElements.define(r,z)}function O(r){if(r.querySelector("style[data-blocks-node-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-node-style","true"),n.textContent=`
.blocks-node {
  position: relative;
  min-width: 180px;
  max-width: 260px;
  border-radius: 0.75rem;
  background: radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 55%),
              #020617;
  border: 1px solid rgba(148,163,184,0.6);
  box-shadow: 0 16px 40px rgba(15,23,42,0.9);
  overflow: hidden;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.blocks-node-header {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  background: linear-gradient(to right, rgba(15,23,42,0.98), rgba(30,64,175,0.9));
  border-bottom: 1px solid rgba(15,23,42,0.95);
  cursor: grab;
}

.blocks-node-title {
  font-weight: 500;
}

.blocks-node-body {
  padding: 0.5rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.blocks-node-ports {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 0.8rem;
}

.blocks-node-ports-col {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.blocks-node-port-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #cbd5f5;
}

.blocks-node-ports-col.outputs .blocks-node-port-row {
  justify-content: flex-end;
}

.port-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.9);
}

.port-dot.input {
  background: rgba(52,211,153,0.5);
}

.port-dot.output {
  background: rgba(59,130,246,0.65);
}

.port-label {
  white-space: nowrap;
}

.blocks-node-content {
  margin-top: 0.4rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.45rem;
  border: 1px dashed rgba(55,65,81,0.95);
  background: rgba(15,23,42,0.95);
  font-size: 0.75rem;
  color: #9ca3af;
}
`,r.prepend(n)}class K extends HTMLElement{constructor(){super(...arguments);g(this,"tree",null);g(this,"canvasId",null);g(this,"selectedNodeIds",new Set);g(this,"marqueeEl",null);g(this,"marqueeStart",null);g(this,"handleNodeMoveRequested",e=>{const s=e.detail;if(!s)return;const o={nodeId:s.nodeId,x:s.x,y:s.y,deltas:s.deltas};this.dispatchEvent(new CustomEvent("canvas:nodePositionChange",{detail:o,bubbles:!0,composed:!0}))});g(this,"handleCanvasClick",e=>{const s=e.target.closest("blocks-node");if(!s){this.selectedNodeIds.clear(),this.refreshSelectionClasses();return}const o=s.getAttribute("data-node-id");o&&(this.selectedNodeIds=new Set([o]),this.refreshSelectionClasses())});g(this,"handleKeyDown",e=>{var s;if(this.selectedNodeIds.size===0||!this.tree)return;const t=[];if(e.key==="Delete"||e.key==="Backspace"){const o=new Set(this.selectedNodeIds);for(const a of o)t.push({kind:"remove",blockId:a});const c=this.findEdges(((s=this.findCanvas())==null?void 0:s.id)??"");for(const a of c){const p=a.properties;(o.has(p.sourceNodeId)||o.has(p.targetNodeId))&&t.push({kind:"remove",blockId:a.id})}t.length>0&&this.dispatchEvent(new CustomEvent("canvas:edit",{detail:{deltas:t},bubbles:!0,composed:!0})),e.preventDefault();return}if((e.key==="d"||e.key==="D")&&(e.metaKey||e.ctrlKey)){const o=new Map(this.tree.blocks.map(c=>[c.id,c]));for(const c of this.selectedNodeIds){const a=o.get(c);if(!a||a.properties.element!=="node")continue;const p=a.properties,l={...a,id:`${a.id}:copy:${Math.floor(Math.random()*1e6)}`,properties:{...p,x:(p.x??0)+40,y:(p.y??0)+40}};t.push({kind:"insert",path:"blocks",blockId:l.id,block:l})}t.length>0&&this.dispatchEvent(new CustomEvent("canvas:edit",{detail:{deltas:t},bubbles:!0,composed:!0})),e.preventDefault()}})}static get observedAttributes(){return["canvas-id"]}attributeChangedCallback(e,t,s){e==="canvas-id"&&(this.canvasId=s,this.render())}setTree(e){this.tree=e,this.render()}connectedCallback(){this.addEventListener("node:moveRequested",this.handleNodeMoveRequested),this.addEventListener("click",this.handleCanvasClick),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("keydown",this.handleKeyDown),this.render()}disconnectedCallback(){this.removeEventListener("node:moveRequested",this.handleNodeMoveRequested),this.removeEventListener("click",this.handleCanvasClick),this.removeEventListener("keydown",this.handleKeyDown)}render(){const e=this.shadowRoot??this.attachShadow({mode:"open"});if(e.innerHTML="",H(e),!this.tree)return;const t=this.findCanvas();if(!t){const h=document.createElement("div");h.className="blocks-canvas-empty",h.textContent="No canvas block found.",e.appendChild(h);return}const s=t.properties,o=s.zoom??1,c=s.offsetX??0,a=s.offsetY??0,p=s.showGrid??!0,l=document.createElement("div");l.className="blocks-canvas-viewport",p&&l.classList.add("with-grid");const u=document.createElement("div");u.className="blocks-canvas-plane",u.style.transform=`translate(${c}px, ${a}px) scale(${o})`;const d=document.createElementNS("http://www.w3.org/2000/svg","svg");d.setAttribute("class","blocks-canvas-edges"),d.setAttribute("width","100%"),d.setAttribute("height","100%"),d.setAttribute("viewBox","0 0 2000 1000");const m=this.findEdges(t.id),f=new Map;for(const h of this.findNodes(t.id))f.set(h.id,h);for(const h of m){const v=h.properties,N=f.get(v.sourceNodeId),w=f.get(v.targetNodeId);if(!N||!w)continue;const b=N.properties,k=w.properties,i=(b.x??0)+150,x=(b.y??0)+40,E=k.x??0,I=(k.y??0)+40,P=document.createElementNS("http://www.w3.org/2000/svg","path"),A=(E-i)*.5,S=`M ${i} ${x} C ${i+A} ${x}, ${E-A} ${I}, ${E} ${I}`;P.setAttribute("d",S),P.setAttribute("class","blocks-canvas-edge"),d.appendChild(P)}u.appendChild(d);const y=this.findNodes(t.id);for(const h of y){const v=document.createElement("blocks-node");v.setAttribute("data-node-id",h.id),this.selectedNodeIds.has(h.id)&&v.setAttribute("data-selected","true"),v.setNode(h),u.appendChild(v)}l.appendChild(u),e.appendChild(l),this.attachPanZoomBehavior(l,t,o,c,a)}findCanvas(){if(!this.tree)return null;const e=this.tree.blocks;return this.canvasId?e.find(t=>t.type==="visual"&&t.properties.element==="canvas"&&t.id===this.canvasId)??null:e.find(t=>t.type==="visual"&&t.properties.element==="canvas")??null}findNodes(e){return this.tree?this.tree.blocks.filter(s=>s.type==="visual"&&s.properties.element==="node"&&(s.properties.canvasId??e)===e):[]}findEdges(e){return this.tree?this.tree.blocks.filter(s=>s.type==="visual"&&s.properties.element==="edge"&&(s.properties.canvasId??e)===e):[]}attachPanZoomBehavior(e,t,s,o,c){let a=s,p=o,l=c,u=!1,d=0,m=0,f=0,y=0;const h=e.querySelector(".blocks-canvas-plane");if(!h)return;const v=()=>{h.style.transform=`translate(${p}px, ${l}px) scale(${a})`},N=i=>{i.button===0&&(i.target.closest("blocks-node")||(u=!0,d=i.clientX,m=i.clientY,f=p,y=l,i.currentTarget.setPointerCapture(i.pointerId),i.preventDefault()))},w=i=>{if(!u)return;const x=i.clientX-d,E=i.clientY-m;p=f+x,l=y+E,v()},b=i=>{if(!u)return;u=!1,i.currentTarget.releasePointerCapture(i.pointerId);const x=t.id,I={canvasId:x,zoom:a,offsetX:p,offsetY:l,deltas:[{kind:"update",blockId:x,path:"canvas.view",block:{zoom:a,offsetX:p,offsetY:l}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:I,bubbles:!0,composed:!0}))},k=i=>{if(!i.ctrlKey&&!i.metaKey)return;i.preventDefault();const x=e.getBoundingClientRect(),E=i.clientX-x.left,I=i.clientY-x.top,P=i.deltaY<0?1.1:.9,A=Math.min(4,Math.max(.25,a*P)),S=A/a;p=E-S*(E-p),l=I-S*(I-l),a=A,v();const T=t.id,B={canvasId:T,zoom:a,offsetX:p,offsetY:l,deltas:[{kind:"update",blockId:T,path:"canvas.view",block:{zoom:a,offsetX:p,offsetY:l}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:B,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",N),e.addEventListener("pointermove",w),e.addEventListener("pointerup",b),e.addEventListener("pointercancel",b),e.addEventListener("wheel",k,{passive:!1})}refreshSelectionClasses(){const e=this.shadowRoot;if(!e)return;e.querySelectorAll("blocks-node").forEach(s=>{const o=s.getAttribute("data-node-id");o&&this.selectedNodeIds.has(o)?s.setAttribute("data-selected","true"):s.removeAttribute("data-selected")})}}function j(r="blocks-canvas"){customElements.get(r)||customElements.define(r,K),R()}function H(r){if(r.querySelector("style[data-blocks-canvas-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-canvas-style","true"),n.textContent=`
:host {
  display: block;
  position: relative;
  overflow: hidden;
  /* Default height so the viewport is visible even if the host has no explicit size.
     Embedders can override this via CSS (e.g. blocks-canvas { height: 100%; }). */
  min-height: 320px;
  background: radial-gradient(circle at top left, #020617, #020617 45%, #000 100%);
}

.blocks-canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
}

.blocks-canvas-plane {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.blocks-canvas-edges {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}

.blocks-canvas-edge {
  fill: none;
  stroke: rgba(129, 140, 248, 0.9);
  stroke-width: 1.5;
}

.blocks-canvas-viewport.with-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(31,41,55,0.8) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(31,41,55,0.8) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.blocks-canvas-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #9ca3af;
}
`,r.prepend(n)}j();function D(r){return r.map((n,e)=>({id:`${n}:${e}`,label:n}))}function F(){const r={id:"canvas:dag",type:"visual",version:"1.0.0",properties:{element:"canvas",zoom:.9,offsetX:80,offsetY:40,showGrid:!0,snapToGrid:!1},inputs:[],outputs:[],schema:"blocks.schema.json"},n=(l,u,d,m,f,y)=>({id:l,type:"visual",version:"1.0.0",properties:{element:"node",canvasId:r.id,title:u,x:d,y:m,inputs:D(f),outputs:D(y)},inputs:[],outputs:[],schema:"blocks.schema.json"}),e=(l,u,d,m,f)=>({id:l,type:"visual",version:"1.0.0",properties:{element:"edge",canvasId:r.id,sourceNodeId:u,sourcePortId:m,targetNodeId:d,targetPortId:f},inputs:[],outputs:[],schema:"blocks.schema.json"}),t=n("node:noise","Noise",40,60,["seed","frequency"],["noise"]),s=n("node:color-map","Color Map",320,80,["noise"],["colorTexture"]),o=n("node:displace","Displace",640,60,["geometry","displacement"],["geometry"]),c=n("node:output","Output",960,120,["geometry","colorTexture"],[]),a=[e("edge:noise->color",t.id,s.id,"noise:0","noise:0"),e("edge:color->displace",s.id,o.id,"colorTexture:0","displacement:1"),e("edge:displace->output",o.id,c.id,"geometry:0","geometry:0")];return{id:"canvas-node-live-root",blocks:[r,t,s,o,c,...a],collections:[]}}const L=new X(F()),C=document.getElementById("graph-canvas"),M=document.getElementById("graph-summary");function $(){if(!M)return;const r=L.getTree(),n=r.blocks.filter(s=>s.properties.element==="node"),e=r.blocks.filter(s=>s.properties.element==="edge"),t=[];t.push(`Nodes:
`);for(const s of n){const o=s.properties;t.push(`• ${o.title??s.id}  (x:${o.x??0}, y:${o.y??0})`)}t.push(`
Edges:
`);for(const s of e){const o=s.properties;t.push(`→ ${o.sourceNodeId} → ${o.targetNodeId}`)}M.textContent=t.join(`
`)}C&&typeof C.setTree=="function"&&(C.setTree(L.getTree()),$(),C.addEventListener("canvas:nodePositionChange",r=>{var t;const e=((t=r.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||(L.applyDeltas(e),C.setTree(L.getTree()),$())}),C.addEventListener("canvas:viewChange",r=>{var t;const e=((t=r.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||(L.applyDeltas(e),$())}),C.addEventListener("canvas:edit",r=>{var t;const e=((t=r.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||(L.applyDeltas(e),C.setTree(L.getTree()),$())}));
