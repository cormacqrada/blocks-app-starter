var L=Object.defineProperty;var z=(r,o,t)=>o in r?L(r,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[o]=t;var h=(r,o,t)=>z(r,typeof o!="symbol"?o+"":o,t);(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(e){if(e.ep)return;e.ep=!0;const n=t(e);fetch(e.href,n)}})();class I{constructor(o){h(this,"tree");h(this,"adapters",[]);this.tree=o}getTree(){return this.tree}applyDeltas(o){var t;for(const s of o)s.kind==="update"&&s.path==="root"&&s.block&&(this.tree=s.block);for(const s of this.adapters)(t=s.onDeltas)==null||t.call(s,o,this)}registerAdapter(o){this.adapters.push(o)}}class D extends HTMLElement{constructor(){super(...arguments);h(this,"panel",null);h(this,"columns",12);h(this,"rowHeightPx",80);h(this,"x",0);h(this,"y",0);h(this,"w",3);h(this,"h",2)}setConfig(t,s,e){this.panel=t,this.columns=s,this.rowHeightPx=e;const n=t.properties;this.x=n.x??0,this.y=n.y??0,this.w=n.w??3,this.h=n.h??2,this.applyGridPosition(),this.render()}connectedCallback(){this.panel&&this.render()}applyGridPosition(){this.style.gridColumn=`${this.x+1} / span ${this.w}`,this.style.gridRow=`${this.y+1} / span ${this.h}`}render(){var c,v,m,g,f;const t=this.shadowRoot??this.attachShadow({mode:"open"});t.innerHTML="",q(t);const s=document.createElement("div");s.className="blocks-dashboard-panel";const e=document.createElement("header");e.className="blocks-dashboard-panel-header";const n=document.createElement("span");n.className="blocks-dashboard-panel-title";const i=((v=(c=this.panel)==null?void 0:c.properties)==null?void 0:v.title)??((m=this.panel)==null?void 0:m.id)??"Panel";n.textContent=i;const l=document.createElement("span");l.className="blocks-dashboard-panel-handle",l.textContent="⋮⋮",e.appendChild(n),e.appendChild(l);const d=document.createElement("div");d.className="blocks-dashboard-panel-body";const y=(f=(g=this.panel)==null?void 0:g.inputs)==null?void 0:f[0],p=(y==null?void 0:y.id)??"(none)";d.textContent=`Content block: ${p}`;const a=document.createElement("div");a.className="blocks-dashboard-panel-resize",s.appendChild(e),s.appendChild(d),s.appendChild(a),t.appendChild(s),this.attachDragBehavior(l),this.attachResizeBehavior(a)}attachDragBehavior(t){let s=!1,e=0,n=0,i=0,l=0;const d=a=>{s=!0,e=a.clientX,n=a.clientY,i=this.x,l=this.y,t.setPointerCapture(a.pointerId),a.preventDefault()},y=a=>{if(!s)return;const c=this.parentElement;if(!c)return;const m=c.getBoundingClientRect().width/this.columns,g=a.clientX-e,f=a.clientY-n,x=Math.round(g/m),w=Math.round(f/this.rowHeightPx),u=Math.max(0,i+x),b=Math.max(0,l+w);this.style.gridColumn=`${u+1} / span ${this.w}`,this.style.gridRow=`${b+1} / span ${this.h}`},p=a=>{var P;if(!s)return;s=!1,t.releasePointerCapture(a.pointerId);const c=this.parentElement;if(!c)return;const m=c.getBoundingClientRect().width/this.columns,g=a.clientX-e,f=a.clientY-n,x=Math.round(g/m),w=Math.round(f/this.rowHeightPx),u=Math.max(0,this.x+x),b=Math.max(0,this.y+w);this.x=u,this.y=b,this.applyGridPosition();const k=((P=this.panel)==null?void 0:P.id)??"";if(!k)return;const R=[{kind:"update",blockId:k,path:"panel.position",block:{x:u,y:b}}],E={panelId:k,x:u,y:b,w:this.w,h:this.h,deltas:R};this.dispatchEvent(new CustomEvent("panel:moveRequested",{detail:E,bubbles:!0,composed:!0}))};t.addEventListener("pointerdown",d),t.addEventListener("pointermove",y),t.addEventListener("pointerup",p),t.addEventListener("pointercancel",p)}attachResizeBehavior(t){let s=!1,e=0,n=0,i=0,l=0;const d=a=>{s=!0,e=a.clientX,n=a.clientY,i=this.w,l=this.h,t.setPointerCapture(a.pointerId),a.preventDefault()},y=a=>{if(!s)return;const c=this.parentElement;if(!c)return;const m=c.getBoundingClientRect().width/this.columns,g=a.clientX-e,f=a.clientY-n,x=Math.round(g/m),w=Math.round(f/this.rowHeightPx),u=Math.max(1,i+x),b=Math.max(1,l+w);this.style.gridColumn=`${this.x+1} / span ${u}`,this.style.gridRow=`${this.y+1} / span ${b}`},p=a=>{var P;if(!s)return;s=!1,t.releasePointerCapture(a.pointerId);const c=this.parentElement;if(!c)return;const m=c.getBoundingClientRect().width/this.columns,g=a.clientX-e,f=a.clientY-n,x=Math.round(g/m),w=Math.round(f/this.rowHeightPx),u=Math.max(1,this.w+x),b=Math.max(1,this.h+w);this.w=u,this.h=b,this.applyGridPosition();const k=((P=this.panel)==null?void 0:P.id)??"";if(!k)return;const R=[{kind:"update",blockId:k,path:"panel.size",block:{w:u,h:b}}],E={panelId:k,x:this.x,y:this.y,w:u,h:b,deltas:R};this.dispatchEvent(new CustomEvent("panel:resizeRequested",{detail:E,bubbles:!0,composed:!0}))};t.addEventListener("pointerdown",d),t.addEventListener("pointermove",y),t.addEventListener("pointerup",p),t.addEventListener("pointercancel",p)}}function H(r="blocks-dashboard-panel"){customElements.get(r)||customElements.define(r,D)}function q(r){if(r.querySelector("style[data-blocks-dashboard-panel-style]"))return;const o=document.createElement("style");o.setAttribute("data-blocks-dashboard-panel-style","true"),o.textContent=`
.blocks-dashboard-panel {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  border-radius: 0.75rem;
  background: radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 55%),
              radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 55%),
              #111827;
  border: 1px solid rgba(148,163,184,0.4);
  box-shadow: 0 16px 40px rgba(15,23,42,0.7);
  overflow: hidden;
}

.blocks-dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #e5e7eb;
  border-bottom: 1px solid rgba(15,23,42,0.9);
  cursor: grab;
}

.blocks-dashboard-panel-title {
  font-weight: 500;
}

.blocks-dashboard-panel-handle {
  opacity: 0.7;
  font-size: 0.85rem;
}

.blocks-dashboard-panel-body {
  padding: 0.75rem 0.9rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.blocks-dashboard-panel-resize {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(148,163,184,0.75);
  background: rgba(15,23,42,0.95);
  cursor: se-resize;
}
`,r.prepend(o)}class B extends HTMLElement{constructor(){super(...arguments);h(this,"tree",null);h(this,"dashboardId",null);h(this,"handlePanelMoveRequested",t=>{const e=t.detail;if(!e)return;const n={panelId:e.panelId,x:e.x,y:e.y,w:e.w,h:e.h,deltas:e.deltas};this.dispatchEvent(new CustomEvent("dashboard:panelPositionChange",{detail:n,bubbles:!0,composed:!0}))});h(this,"handlePanelResizeRequested",t=>{const e=t.detail;if(!e)return;const n={panelId:e.panelId,x:e.x,y:e.y,w:e.w,h:e.h,deltas:e.deltas};this.dispatchEvent(new CustomEvent("dashboard:panelPositionChange",{detail:n,bubbles:!0,composed:!0}))})}static get observedAttributes(){return["dashboard-id"]}attributeChangedCallback(t,s,e){t==="dashboard-id"&&(this.dashboardId=e,this.render())}setTree(t){this.tree=t,this.render()}connectedCallback(){this.addEventListener("panel:moveRequested",this.handlePanelMoveRequested),this.addEventListener("panel:resizeRequested",this.handlePanelResizeRequested),this.render()}disconnectedCallback(){this.removeEventListener("panel:moveRequested",this.handlePanelMoveRequested),this.removeEventListener("panel:resizeRequested",this.handlePanelResizeRequested)}render(){const t=this.shadowRoot??this.attachShadow({mode:"open"});if(t.innerHTML="",T(t),!this.tree)return;const s=this.findDashboard();if(!s){const p=document.createElement("div");p.textContent="No dashboard block found.",p.className="blocks-dashboard-empty",t.appendChild(p);return}const e=s.properties,n=e.columns??12,i=e.rowHeightPx??80,l=e.gapPx??8,d=document.createElement("div");d.className="blocks-dashboard-grid",d.style.setProperty("--blocks-dashboard-columns",String(n)),d.style.setProperty("--blocks-dashboard-row-height",`${i}px`),d.style.setProperty("--blocks-dashboard-gap",`${l}px`);const y=this.findPanels(s.id);for(const p of y)d.appendChild(this.renderPanel(p,n,i));t.appendChild(d)}findDashboard(){if(!this.tree)return null;const t=this.tree.blocks;return this.dashboardId?t.find(s=>s.type==="visual"&&s.properties.element==="dashboard"&&s.id===this.dashboardId)??null:t.find(s=>s.type==="visual"&&s.properties.element==="dashboard")??null}findPanels(t){return this.tree?this.tree.blocks.filter(e=>e.type==="visual"&&e.properties.element==="dashboard.panel"&&(e.properties.dashboardId??t)===t):[]}renderPanel(t,s,e){const n=document.createElement("blocks-dashboard-panel");return n.setConfig(t,s,e),n}}function $(r="blocks-dashboard"){customElements.get(r)||customElements.define(r,B),H()}function T(r){if(r.querySelector("style[data-blocks-dashboard-style]"))return;const o=document.createElement("style");o.setAttribute("data-blocks-dashboard-style","true"),o.textContent=`
:host {
  display: block;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.blocks-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(var(--blocks-dashboard-columns, 12), minmax(0, 1fr));
  grid-auto-rows: var(--blocks-dashboard-row-height, 80px);
  gap: var(--blocks-dashboard-gap, 8px);
}

.blocks-dashboard-panel {
  position: relative;
  border-radius: 0.75rem;
  background: radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 55%),
              radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 55%),
              #111827;
  border: 1px solid rgba(148,163,184,0.4);
  box-shadow: 0 16px 40px rgba(15,23,42,0.7);
  overflow: hidden;
}

.blocks-dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #e5e7eb;
  border-bottom: 1px solid rgba(15,23,42,0.9);
  cursor: grab;
}

.blocks-dashboard-panel-title {
  font-weight: 500;
}

.blocks-dashboard-panel-handle {
  opacity: 0.7;
  font-size: 0.85rem;
}

.blocks-dashboard-panel-body {
  padding: 0.75rem 0.9rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.blocks-dashboard-panel-resize {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(148,163,184,0.75);
  background: rgba(15,23,42,0.95);
  cursor: se-resize;
}

.blocks-dashboard-empty {
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #9ca3af;
}
  `,r.prepend(o)}$();function N(){const r={id:"dashboard:main",type:"visual",properties:{element:"dashboard",columns:12,rowHeightPx:80,gapPx:12,editMode:!0},state:{},inputs:[],children:[],metadata:{}},o=(s,e,n,i,l,d)=>({id:s,type:"visual",properties:{element:"dashboard.panel",dashboardId:r.id,title:e,x:n,y:i,w:l,h:d},state:{},inputs:[],children:[],metadata:{}}),t=[r,o("panel:traffic","Traffic",0,0,4,3),o("panel:revenue","Revenue",4,0,4,3),o("panel:activity","Activity",8,0,4,3),o("panel:map","Geo Map",0,3,6,3),o("panel:feed","Feed",6,3,6,3)];return{id:"dashboard-demo-root",version:1,root:r.id,blocks:t}}const S=N(),M=new I(S),C=document.getElementById("demo-dashboard");C&&typeof C.setTree=="function"&&(C.setTree(M.getTree()),C.addEventListener("dashboard:panelPositionChange",r=>{var s;const t=((s=r.detail)==null?void 0:s.deltas)??[];!Array.isArray(t)||t.length===0||M.applyDeltas(t)}));
