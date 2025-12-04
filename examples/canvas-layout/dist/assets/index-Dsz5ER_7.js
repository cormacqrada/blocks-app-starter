var D=Object.defineProperty;var q=(s,n,e)=>n in s?D(s,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[n]=e;var b=(s,n,e)=>q(s,typeof n!="symbol"?n+"":n,e);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function e(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function t(o){if(o.ep)return;o.ep=!0;const r=e(o);fetch(o.href,r)}})();class S{constructor(n){b(this,"tree");b(this,"adapters",[]);this.tree=n}getTree(){return this.tree}applyDeltas(n){var e;for(const t of n)t.kind==="update"&&t.path==="root"&&t.block&&(this.tree=t.block);for(const t of this.adapters)(e=t.onDeltas)==null||e.call(t,n,this)}registerAdapter(n){this.adapters.push(n)}}class z extends HTMLElement{constructor(){super(...arguments);b(this,"node",null);b(this,"x",0);b(this,"y",0)}setNode(e){this.node=e;const t=e.properties;this.x=t.x??0,this.y=t.y??0,this.applyPosition(),this.render()}connectedCallback(){this.node&&this.render()}applyPosition(){this.style.position="absolute",this.style.left=`${this.x}px`,this.style.top=`${this.y}px`}render(){var y,v,x,N;const e=this.shadowRoot??this.attachShadow({mode:"open"});e.innerHTML="",$(e);const t=document.createElement("div");t.className="blocks-node";const o=document.createElement("header");o.className="blocks-node-header";const r=document.createElement("span");r.className="blocks-node-title",r.textContent=String(((v=(y=this.node)==null?void 0:y.properties)==null?void 0:v.title)??((x=this.node)==null?void 0:x.id)??"Node"),o.appendChild(r);const d=document.createElement("div");d.className="blocks-node-body";const i=((N=this.node)==null?void 0:N.properties)??{},u=i.inputs??[],c=i.outputs??[],m=document.createElement("div");m.className="blocks-node-ports";const l=document.createElement("div");l.className="blocks-node-ports-col inputs";for(const C of u){const f=document.createElement("div");f.className="blocks-node-port-row";const g=document.createElement("span");g.className="port-dot input";const a=document.createElement("span");a.className="port-label",a.textContent=C.label,f.appendChild(g),f.appendChild(a),l.appendChild(f)}const p=document.createElement("div");p.className="blocks-node-ports-col outputs";for(const C of c){const f=document.createElement("div");f.className="blocks-node-port-row";const g=document.createElement("span");g.className="port-label",g.textContent=C.label;const a=document.createElement("span");a.className="port-dot output",f.appendChild(g),f.appendChild(a),p.appendChild(f)}m.appendChild(l),m.appendChild(p);const h=document.createElement("div");h.className="blocks-node-content",h.textContent="Node content",d.appendChild(m),d.appendChild(h),t.appendChild(o),t.appendChild(d),e.appendChild(t),this.attachDragBehavior(o)}attachDragBehavior(e){let t=!1,o=0,r=0,d=0,i=0;const u=l=>{t=!0,o=l.clientX,r=l.clientY,d=this.x,i=this.y,e.setPointerCapture(l.pointerId),l.preventDefault()},c=l=>{if(!t)return;const p=l.clientX-o,h=l.clientY-r;this.x=d+p,this.y=i+h,this.applyPosition()},m=l=>{var v;if(!t)return;t=!1,e.releasePointerCapture(l.pointerId);const p=((v=this.node)==null?void 0:v.id)??"";if(!p)return;const h=[{kind:"update",blockId:p,path:"node.position",block:{x:this.x,y:this.y}}],y={nodeId:p,x:this.x,y:this.y,deltas:h};this.dispatchEvent(new CustomEvent("node:moveRequested",{detail:y,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",u),e.addEventListener("pointermove",c),e.addEventListener("pointerup",m),e.addEventListener("pointercancel",m)}}function R(s="blocks-node"){customElements.get(s)||customElements.define(s,z)}function $(s){if(s.querySelector("style[data-blocks-node-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-node-style","true"),n.textContent=`
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
`,s.prepend(n)}class A extends HTMLElement{constructor(){super(...arguments);b(this,"tree",null);b(this,"canvasId",null);b(this,"handleNodeMoveRequested",e=>{const o=e.detail;if(!o)return;const r={nodeId:o.nodeId,x:o.x,y:o.y,deltas:o.deltas};this.dispatchEvent(new CustomEvent("canvas:nodePositionChange",{detail:r,bubbles:!0,composed:!0}))})}static get observedAttributes(){return["canvas-id"]}attributeChangedCallback(e,t,o){e==="canvas-id"&&(this.canvasId=o,this.render())}setTree(e){this.tree=e,this.render()}connectedCallback(){this.addEventListener("node:moveRequested",this.handleNodeMoveRequested),this.render()}disconnectedCallback(){this.removeEventListener("node:moveRequested",this.handleNodeMoveRequested)}render(){const e=this.shadowRoot??this.attachShadow({mode:"open"});if(e.innerHTML="",j(e),!this.tree)return;const t=this.findCanvas();if(!t){const p=document.createElement("div");p.className="blocks-canvas-empty",p.textContent="No canvas block found.",e.appendChild(p);return}const o=t.properties,r=o.zoom??1,d=o.offsetX??0,i=o.offsetY??0,u=o.showGrid??!0,c=document.createElement("div");c.className="blocks-canvas-viewport",u&&c.classList.add("with-grid");const m=document.createElement("div");m.className="blocks-canvas-plane",m.style.transform=`translate(${d}px, ${i}px) scale(${r})`;const l=this.findNodes(t.id);for(const p of l){const h=document.createElement("blocks-node");h.setNode(p),m.appendChild(h)}c.appendChild(m),e.appendChild(c),this.attachPanZoomBehavior(c,t,r,d,i)}findCanvas(){if(!this.tree)return null;const e=this.tree.blocks;return this.canvasId?e.find(t=>t.type==="visual"&&t.properties.element==="canvas"&&t.id===this.canvasId)??null:e.find(t=>t.type==="visual"&&t.properties.element==="canvas")??null}findNodes(e){return this.tree?this.tree.blocks.filter(o=>o.type==="visual"&&o.properties.element==="node"&&(o.properties.canvasId??e)===e):[]}attachPanZoomBehavior(e,t,o,r,d){let i=o,u=r,c=d,m=!1,l=0,p=0,h=0,y=0;const v=e.querySelector(".blocks-canvas-plane");if(!v)return;const x=()=>{v.style.transform=`translate(${u}px, ${c}px) scale(${i})`},N=a=>{a.button===0&&(a.target.closest("blocks-node")||(m=!0,l=a.clientX,p=a.clientY,h=u,y=c,a.currentTarget.setPointerCapture(a.pointerId),a.preventDefault()))},C=a=>{if(!m)return;const k=a.clientX-l,E=a.clientY-p;u=h+k,c=y+E,x()},f=a=>{if(!m)return;m=!1,a.currentTarget.releasePointerCapture(a.pointerId);const k=t.id,P={canvasId:k,zoom:i,offsetX:u,offsetY:c,deltas:[{kind:"update",blockId:k,path:"canvas.view",block:{zoom:i,offsetX:u,offsetY:c}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:P,bubbles:!0,composed:!0}))},g=a=>{if(!a.ctrlKey&&!a.metaKey)return;a.preventDefault();const k=e.getBoundingClientRect(),E=a.clientX-k.left,P=a.clientY-k.top,X=a.deltaY<0?1.1:.9,I=Math.min(4,Math.max(.25,i*X)),T=I/i;u=E-T*(E-u),c=P-T*(P-c),i=I,x();const M=t.id,B={canvasId:M,zoom:i,offsetX:u,offsetY:c,deltas:[{kind:"update",blockId:M,path:"canvas.view",block:{zoom:i,offsetX:u,offsetY:c}}]};this.dispatchEvent(new CustomEvent("canvas:viewChange",{detail:B,bubbles:!0,composed:!0}))};e.addEventListener("pointerdown",N),e.addEventListener("pointermove",C),e.addEventListener("pointerup",f),e.addEventListener("pointercancel",f),e.addEventListener("wheel",g,{passive:!1})}}function O(s="blocks-canvas"){customElements.get(s)||customElements.define(s,A),R()}function j(s){if(s.querySelector("style[data-blocks-canvas-style]"))return;const n=document.createElement("style");n.setAttribute("data-blocks-canvas-style","true"),n.textContent=`
:host {
  display: block;
  position: relative;
  overflow: hidden;
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
`,s.prepend(n)}O();function Y(s){return s.map((n,e)=>({id:`${n}:${e}`,label:n}))}function F(){const s={id:"canvas:main",type:"visual",version:"1.0.0",properties:{element:"canvas",zoom:1,offsetX:80,offsetY:40,showGrid:!0,snapToGrid:!1},inputs:[],outputs:[],schema:"blocks.schema.json"},n=(t,o,r,d,i,u)=>({id:t,type:"visual",version:"1.0.0",properties:{element:"node",canvasId:s.id,title:o,x:r,y:d,inputs:Y(i),outputs:Y(u)},inputs:[],outputs:[],schema:"blocks.schema.json"});return{id:"canvas-node-demo-root",blocks:[s,n("node:noise","Noise",40,60,["seed","frequency"],["noise"]),n("node:color-map","Color Map",320,80,["noise"],["colorTexture"]),n("node:displace","Displace",640,60,["geometry","displacement"],["geometry"]),n("node:output","Output",960,120,["geometry","colorTexture"],[])],collections:[]}}const G=F(),L=new S(G),w=document.getElementById("demo-canvas");w&&typeof w.setTree=="function"&&(w.setTree(L.getTree()),w.addEventListener("canvas:nodePositionChange",s=>{var t;const e=((t=s.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||L.applyDeltas(e)}),w.addEventListener("canvas:viewChange",s=>{var t;const e=((t=s.detail)==null?void 0:t.deltas)??[];!Array.isArray(e)||e.length===0||L.applyDeltas(e)}));
