var T=Object.defineProperty;var B=(i,n,e)=>n in i?T(i,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[n]=e;var g=(i,n,e)=>B(i,typeof n!="symbol"?n+"":n,e);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();class q{constructor(n){g(this,"tree");g(this,"adapters",[]);this.tree=n}getTree(){return this.tree}applyDeltas(n){var e;for(const t of n)t.kind==="update"&&t.path==="root"&&t.block&&(this.tree=t.block);for(const t of this.adapters)(e=t.onDeltas)==null||e.call(t,n,this)}registerAdapter(n){this.adapters.push(n)}}class Y extends HTMLElement{constructor(){super(...arguments);g(this,"node",null);g(this,"x",0);g(this,"y",0)}setNode(e){this.node=e;const t=e.properties;this.x=t.x??0,this.y=t.y??0,this.applyPosition(),this.render()}connectedCallback(){this.node&&this.render()}applyPosition(){this.style.position="absolute",this.style.left=`${this.x}px`,this.style.top=`${this.y}px`}render(){var x,u,v,E;const e=this.shadowRoot??this.attachShadow({mode:"open"});e.innerHTML="",z(e);const t=document.createElement("div");t.className="blocks-node";const s=document.createElement("header");s.className="blocks-node-header";const o=document.createElement("span");o.className="blocks-node-title",o.textContent=String(((u=(x=this.node)==null?void 0:x.properties)==null?void 0:u.title)??((v=this.node)==null?void 0:v.id)??"Node"),s.appendChild(o);const d=document.createElement("div");d.className="blocks-node-body";const a=((E=this.node)==null?void 0:E.properties)??{},c=a.inputs??[],p=a.outputs??[],h=document.createElement("div");h.className="blocks-node-ports";const l=document.createElement("div");l.className="blocks-node-ports-col inputs";for(const C of c){const m=document.createElement("div");m.className="blocks-node-port-row";const y=document.createElement("span");y.className="port-dot input";const r=document.createElement("span");r.className="port-label",r.textContent=C.label,m.appendChild(y),m.appendChild(r),l.appendChild(m)}const f=document.createElement("div");f.className="blocks-node-ports-col outputs";for(const C of p){const m=document.createElement("div");m.className="blocks-node-port-row";const y=document.createElement("span");y.className="port-label",y.textContent=C.label;const r=document.createElement("span");r.className="port-dot output",m.appendChild(y),m.appendChild(r),f.appendChild(m)}h.appendChild(l),h.appendChild(f);const b=document.createElement("div");b.className="blocks-node-content",b.textContent="Node content",d.appendChild(h),d.appendChild(b),t.appendChild(s),t.appendChild(d),e.appendChild(t),this.attachDragBehavior(s)}attachDragBehavior(e){let t=!1,s=0,o=0,d=0,a=0;const c=l=>{t=!0,s=l.clientX,o=l.clientY,d=this.x,a=this.y,e.setPointerCapture(l.pointerId),l.preventDefault()},p=l=>{if(!t)return;const f=l.clientX-s,b=l.clientY-o;this.x=d+f,this.y=a+b,this.applyPosition()},h=l=>{var u;if(!t)return;t=!1,e.releasePointerCapture(l.pointerId);const f=((u=this.node)==null?void 0:u.id)??"";if(!f)return;const b=[{kind:"update",blockId:f,path:"node.position",block:{x:this.x,y:this.y}}],x={nodeId:f,x:this.x,y:this.y,deltas:b};this.dispatchEvent(new CustomEvent("node:moveRequested",{detail:x,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",c),e.addEventListener("pointermove",p),e.addEventListener("pointerup",h),e.addEventListener("pointercancel",h)}}function X(i="blocks-node"){customElements.get(i)||customElements.define(i,Y)}function z(i){if(i.querySelector("style[data-blocks-node-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-node-style","true"),n.textContent=`
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
`,i.prepend(n)}class R extends HTMLElement{constructor(){super(...arguments);g(this,"tree",null);g(this,"canvasId",null);g(this,"selectedNodeIds",new Set);g(this,"marqueeEl",null);g(this,"marqueeStart",null);g(this,"handleNodeMoveRequested",e=>{const s=e.detail;if(!s)return;const o={nodeId:s.nodeId,x:s.x,y:s.y,deltas:s.deltas};this.dispatchEvent(new CustomEvent("canvas:nodePositionChange",{detail:o,bubbles:!0,composed:!0}))});g(this,"handleCanvasClick",e=>{const s=e.target.closest("blocks-node");if(!s){this.selectedNodeIds.clear(),this.refreshSelectionClasses();return}const o=s.getAttribute("data-node-id");o&&(this.selectedNodeIds=new Set([o]),this.refreshSelectionClasses())});g(this,"handleKeyDown",e=>{var s;if(this.selectedNodeIds.size===0||!this.tree)return;const t=[];if(e.key==="Delete"||e.key==="Backspace"){const o=new Set(this.selectedNodeIds);for(const a of o)t.push({kind:"remove",blockId:a});const d=this.findEdges(((s=this.findCanvas())==null?void 0:s.id)??"");for(const a of d){const c=a.properties;(o.has(c.sourceNodeId)||o.has(c.targetNodeId))&&t.push({kind:"remove",blockId:a.id})}t.length>0&&this.dispatchEvent(new CustomEvent("canvas:edit",{detail:{deltas:t},bubbles:!0,composed:!0})),e.preventDefault();return}if((e.key==="d"||e.key==="D")&&(e.metaKey||e.ctrlKey)){const o=new Map(this.tree.blocks.map(d=>[d.id,d]));for(const d of this.selectedNodeIds){const a=o.get(d);if(!a||a.properties.element!=="node")continue;const c=a.properties,p={...a,id:`${a.id}:copy:${Math.floor(Math.random()*1e6)}`,properties:{...c,x:(c.x??0)+40,y:(c.y??0)+40}};t.push({kind:"insert",path:"blocks",blockId:p.id,block:p})}t.length>0&&this.dispatchEvent(new CustomEvent("canvas:edit",{detail:{deltas:t},bubbles:!0,composed:!0})),e.preventDefault()}})}static get observedAttributes(){return["canvas-id"]}attributeChangedCallback(e,t,s){e==="canvas-id"&&(this.canvasId=s,this.render())}setTree(e){this.tree=e,this.render()}connectedCallback(){this.addEventListener("node:moveRequested",this.handleNodeMoveRequested),this.addEventListener("click",this.handleCanvasClick),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("keydown",this.handleKeyDown),this.render()}disconnectedCallback(){this.removeEventListener("node:moveRequested",this.handleNodeMoveRequested),this.removeEventListener("click",this.handleCanvasClick),this.removeEventListener("keydown",this.handleKeyDown)}render(){const e=this.shadowRoot??this.attachShadow({mode:"open"});if(e.innerHTML="",K(e),!this.tree)return;const t=this.findCanvas();if(!t){const u=document.createElement("div");u.className="blocks-canvas-empty",u.textContent="No canvas block found.",e.appendChild(u);return}const s=t.properties,o=s.zoom??1,d=s.offsetX??0,a=s.offsetY??0,c=s.showGrid??!0,p=document.createElement("div");p.className="blocks-canvas-viewport",c&&p.classList.add("with-grid");const h=document.createElement("div");h.className="blocks-canvas-plane",h.style.transform=`translate(${d}px, ${a}px) scale(${o})`;const l=document.createElementNS("http://www.w3.org/2000/svg","svg");l.setAttribute("class","blocks-canvas-edges"),l.setAttribute("width","100%"),l.setAttribute("height","100%"),l.setAttribute("viewBox","0 0 2000 1000");const f=this.findEdges(t.id),b=new Map;for(const u of this.findNodes(t.id))b.set(u.id,u);for(const u of f){const v=u.properties,E=b.get(v.sourceNodeId),C=b.get(v.targetNodeId);if(!E||!C)continue;const m=E.properties,y=C.properties,r=(m.x??0)+150,k=(m.y??0)+40,w=y.x??0,N=(y.y??0)+40,I=document.createElementNS("http://www.w3.org/2000/svg","path"),L=(w-r)*.5,A=`M ${r} ${k} C ${r+L} ${k}, ${w-L} ${N}, ${w} ${N}`;I.setAttribute("d",A),I.setAttribute("class","blocks-canvas-edge"),l.appendChild(I)}h.appendChild(l);const x=this.findNodes(t.id);for(const u of x){const v=document.createElement("blocks-node");v.setAttribute("data-node-id",u.id),this.selectedNodeIds.has(u.id)&&v.setAttribute("data-selected","true"),v.setNode(u),h.appendChild(v)}p.appendChild(h),e.appendChild(p),this.attachPanZoomBehavior(p,t,o,d,a)}findCanvas(){if(!this.tree)return null;const e=this.tree.blocks;return this.canvasId?e.find(t=>t.type==="visual"&&t.properties.element==="canvas"&&t.id===this.canvasId)??null:e.find(t=>t.type==="visual"&&t.properties.element==="canvas")??null}findNodes(e){return this.tree?this.tree.blocks.filter(s=>s.type==="visual"&&s.properties.element==="node"&&(s.properties.canvasId??e)===e):[]}findEdges(e){return this.tree?this.tree.blocks.filter(s=>s.type==="visual"&&s.properties.element==="edge"&&(s.properties.canvasId??e)===e):[]}attachPanZoomBehavior(e,t,s,o,d){let a=s,c=o,p=d,h=!1,l=0,f=0,b=0,x=0;const u=e.querySelector(".blocks-canvas-plane");if(!u)return;const v=()=>{u.style.transform=`translate(${c}px, ${p}px) scale(${a})`},E=r=>{r.button===0&&(r.target.closest("blocks-node")||(h=!0,l=r.clientX,f=r.clientY,b=c,x=p,r.currentTarget.setPointerCapture(r.pointerId),r.preventDefault()))},C=r=>{if(!h)return;const k=r.clientX-l,w=r.clientY-f;c=b+k,p=x+w,v()},m=r=>{if(!h)return;h=!1,r.currentTarget.releasePointerCapture(r.pointerId);const k=t.id,N={canvasId:k,zoom:a,offsetX:c,offsetY:p,deltas:[{kind:"update",blockId:k,path:"canvas.view",block:{zoom:a,offsetX:c,offsetY:p}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:N,bubbles:!0,composed:!0}))},y=r=>{if(!r.ctrlKey&&!r.metaKey)return;r.preventDefault();const k=e.getBoundingClientRect(),w=r.clientX-k.left,N=r.clientY-k.top,I=r.deltaY<0?1.1:.9,L=Math.min(4,Math.max(.25,a*I)),A=L/a;c=w-A*(w-c),p=N-A*(N-p),a=L,v();const D=t.id,M={canvasId:D,zoom:a,offsetX:c,offsetY:p,deltas:[{kind:"update",blockId:D,path:"canvas.view",block:{zoom:a,offsetX:c,offsetY:p}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:M,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",E),e.addEventListener("pointermove",C),e.addEventListener("pointerup",m),e.addEventListener("pointercancel",m),e.addEventListener("wheel",y,{passive:!1})}refreshSelectionClasses(){const e=this.shadowRoot;if(!e)return;e.querySelectorAll("blocks-node").forEach(s=>{const o=s.getAttribute("data-node-id");o&&this.selectedNodeIds.has(o)?s.setAttribute("data-selected","true"):s.removeAttribute("data-selected")})}}function O(i="blocks-canvas"){customElements.get(i)||customElements.define(i,R),X()}function K(i){if(i.querySelector("style[data-blocks-canvas-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-canvas-style","true"),n.textContent=`
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
  /* Ensure the viewport is visible even if the host has not been given an
     explicit height. This works together with the host min-height. */
  min-height: 320px;
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
`,i.prepend(n)}O();function $(i){return i.map((n,e)=>({id:`${n}:${e}`,label:n}))}function H(){const i={id:"canvas:main",type:"visual",version:"1.0.0",properties:{element:"canvas",zoom:1,offsetX:80,offsetY:40,showGrid:!0,snapToGrid:!1},inputs:[],outputs:[],schema:"blocks.schema.json"},n=(t,s,o,d,a,c)=>({id:t,type:"visual",version:"1.0.0",properties:{element:"node",canvasId:i.id,title:s,x:o,y:d,inputs:$(a),outputs:$(c)},inputs:[],outputs:[],schema:"blocks.schema.json"});return{id:"canvas-node-demo-root",blocks:[i,n("node:noise","Noise",40,60,["seed","frequency"],["noise"]),n("node:color-map","Color Map",320,80,["noise"],["colorTexture"]),n("node:displace","Displace",640,60,["geometry","displacement"],["geometry"]),n("node:output","Output",960,120,["geometry","colorTexture"],[])],collections:[]}}const j=H(),S=new q(j),P=document.getElementById("demo-canvas");P&&typeof P.setTree=="function"&&(P.setTree(S.getTree()),P.addEventListener("canvas:nodePositionChange",i=>{var t;const e=((t=i.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||S.applyDeltas(e)}),P.addEventListener("canvas:viewChange",i=>{var t;const e=((t=i.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||S.applyDeltas(e)}));
