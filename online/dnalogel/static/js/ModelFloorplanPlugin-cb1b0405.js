import{f as O,w as P}from"./mockData-390f2e53.js";import{F as f,ay as L,r as M,a as N,u as _,b as D,a9 as b,j as h,aa as G,d as C,ab as j,ac as v,ad as k,ae as W,c as T,p as z,e as R,B as q,R as H}from"./vendor-6e04d41e.js";import{a as d,b as E,S as U,F as B}from"./typing-9caf697c.js";import{o as V,g as $,c as y,M as J}from"./changeModelCanvasOpacity-c8cde88c.js";import{f as K}from"./RoomHighlight-504e1ed1.js";import"./loadTexture-b2c90048.js";import"./constants-6d6c99de.js";import{g as Q}from"./getInitialParamFromUrl-f6979ec1.js";async function c(t){try{const e=await t;return[null,e]}catch(e){return e instanceof Error?[e,null]:[new Error(""),null]}}function p(t){return Object.prototype.toString.call(t)==="[object Object]"}function m(t,e){return t===e?!0:typeof t!=typeof e?!1:!!(Number.isNaN(t)&&Number.isNaN(e))}function X(t,e){const n=Object.getOwnPropertyNames(t),o=Object.getOwnPropertyNames(e);if(n.length!==o.length)return!1;for(let i=0,s=n.length;i<s;i++){const r=n[i];if(!m(t[r],e[r]))return!1}return!0}function Y(t,e){if(t.length!==e.length)return!1;for(let n=0,o=t.length;n<o;n++)if(!m(t[n],e[n]))return!1;return!0}function Z(t,e){return m(t,e)?!0:p(t)&&p(e)?X(t,e):Array.isArray(t)&&Array.isArray(e)?Y(t,e):!1}function g(t,e){return m(t,e)?!0:p(t)&&p(e)?te(t,e):Array.isArray(t)&&Array.isArray(e)?ee(t,e):!1}function ee(t,e){if(t.length!==e.length)return!1;for(let n=0,o=t.length;n<o;n++)if(!g(t[n],e[n]))return!1;return!0}function te(t,e){const n=Object.getOwnPropertyNames(t),o=Object.getOwnPropertyNames(e);if(n.length!==o.length)return!1;for(let i=0,s=n.length;i<s;i++){const r=n[i];if(!g(t[r],e[r]))return!1}return!0}function ne(t,e,n={deep:!1}){return n.deep?g(t,e):Z(t,e)}async function ie(t,...e){const[n]=await c(t.changeMode(...e));if(n)throw n;await new Promise((o,i)=>{t.once("initAnimationEnded",o);const s=r=>{r!==e[0]&&i("changeMode \u88AB\u4E2D\u65AD"),t.off("modeChange",s)};t.on("modeChange",s)})}function S(t,e,n=4){return Math.floor(t*Math.pow(10,n))===Math.floor(e*Math.pow(10,n))}function w(t,e){if(t.currentMode!==f.Mode.Floorplan)return!1;const{latitude:n,longitude:o,fov:i}=e,{latitude:s,longitude:r}=t.getCurrentState(),a=t.camera.fov;return!!(S(n,s,1)&&S(o,r,1)&&i===a)}async function oe(t,e,n=!0){if(w(t,e)===!0)return;if(t.currentMode!==f.Mode.Floorplan){const[u]=await c(ie(t,f.Mode.Floorplan,e,void 0,n));if(u)throw u;if(w(t,e)===!1)throw new Error(d.ChangeModeError);return}const{latitude:i,longitude:s,fov:r}=t.getCurrentState(),a=Math.min(1e3,Math.max(200,Math.abs(i-Math.PI/2)*1e3,(s>Math.PI?2*Math.PI-s:s)*500,Math.abs(r-e.fov)*10)),[l]=await c(t.updateCamera(e,a,n));if(l)throw new Error(d.UpdateCameraError)}const re="modelFloorplanPlugin";class se{name=re;hooks;visible=!1;size={width:0,height:0};app=void 0;pxmm=0;five;panoIndex=0;floorIndex=0;configs={};lastPanoramaLongitude=0;selector;floorplanData;wrapper;container=document.createElement("div");showState;ModelFloorplanPluginsShowOpts;showPromise;showRejection;constructor(e,n){this.five=e,this.hooks=new L,this.selector=n.selector,this.configs=V(n,["selector"]),this.showState={longitude:0,latitude:Math.PI/2,fov:E/(n?.scale??1)},this.container.classList.add("floorplan-plugin"),Object.assign(this.container.style,{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%, -50%)",pointerEvents:"none",zIndex:10}),this.five.model.loaded?this.handleModelLoaded():e.once("modelLoaded",this.handleModelLoaded),e.once("dispose",this.dispose),e.on("modeChange",this.handleModeChange),e.on("panGesture",this.handlePanGesture),e.on("panoArrived",this.handlePanoArrived),e.on("wantsChangeMode",this.handleWantsChangeMode),e.on("wantsInteriaPan",this.handleWantsInteriaPan),e.on("modelShownFloorChange",this.onModelShownFloorChange)}dispose=()=>{const e=this.five;this.hide(),this.app?.$destroy(),this.container?.remove(),e.off("modelLoaded",this.handleModelLoaded),e.off("modeChange",this.handleModeChange),e.off("panGesture",this.handlePanGesture),e.off("panoArrived",this.handlePanoArrived),e.off("wantsChangeMode",this.handleWantsChangeMode),e.off("wantsInteriaPan",this.handleWantsInteriaPan),e.off("wantsTapGesture",this.handleWantsTapGesture),e.off("modelShownFloorChange",this.onModelShownFloorChange)};async load(e){const n=JSON.parse(JSON.stringify(e));this.floorplanData=await K(n),this.render()}appendTo(e){return this.wrapper=e,e.appendChild(this.container),this}updateSize=()=>{if(!this.floorplanData||!w(this.five,this.showState)||!this.container||!this.wrapper)return;const{min:e,max:n}=this.floorplanData.bounding,o=n.x-e.x,i=n.y-e.y,s=this.configs.attachedTo?{attachedTo:this.configs.attachedTo}:void 0,r=$(this.five,this.wrapper,this.floorIndex,s),a=Math.ceil(o*r),l=Math.ceil(i*r);this.size.width===a&&this.size.height===l||(this.pxmm=r,this.size={width:a,height:l},this.container.style.width=a+"px",this.container.style.height=l+"px")};show=async e=>{if(!this.showPromise&&this.visible)return!0;if(!this.five.model?.loaded)throw new Error(d.ModelNotLoaded);if(!this.floorplanData)throw new Error(d.DataNotLoaded);if(this.visible=!0,this.showPromise){const i=ne(e,this.ModelFloorplanPluginsShowOpts,{deep:!1});if(!!this.showPromise&&i)return this.showPromise;!!this.showPromise&&!i&&this.showRejection?.(d.DifferentShowParams)}this.ModelFloorplanPluginsShowOpts=e;const o=(async()=>{let i=!1,s;this.showRejection=u=>{i=!0,s=u};const[r]=await c(oe(this.five,this.showState,e?.userAction));if(r)throw r;if(i)throw s?new Error(s):new Error(d.UnknownError);if(!this.visible)throw new Error(d.UnknownError);this.visible=!0,this.updateSize(),e?.floorIndex&&(this.floorIndex=e.floorIndex),this.five.model.show(this.floorIndex);const a=e?.modelOpacity??this.configs.modelOpacity??1,l=e?.immediately?0:U;return y(this.five,a,l),this.render(l),this.five.on("wantsGesture",this.handleWantsGesture),this.five.on("wantsTapGesture",this.handleWantsTapGesture),!0})().then(()=>(this.hooks.emit("showAnimationEnded",{auto:!!e?.isAutoShow,userAction:e?.userAction??!0}),!0)).catch(i=>{if(e?.isAutoShow||!(i instanceof Error))return!1;throw i}).finally(()=>{this.showPromise=void 0,this.showRejection=void 0});return this.showPromise=o,o};hide=e=>{if(this.size.width===0||this.visible===!1)return!0;const n=!!e?.isAutoHide;return this.five.off("wantsGesture",this.handleWantsGesture),this.five.off("wantsTapGesture",this.handleWantsTapGesture),this.visible=!1,this.showRejection?.(d.BreakOffByHide),y(this.five,1,0),this.render(),this.hooks.emit("hide",{auto:n,userAction:e?.userAction??!0}),!0};changeFloor(e){this.five.model.show(e),this.floorIndex=e,this.render()}changeConfigs(e){Object.assign(this.configs,e),!!this.container&&this.render()}onModelShownFloorChange=e=>{e!==null&&(this.floorIndex=e,this.updateSize(),this.render())};handleModelLoaded=()=>{if(this.wrapper||!this.selector)return;const e=this.selector instanceof Element?this.selector:document.querySelector(this.selector);if(!e)throw new Error("\u4E0D\u6B63\u786E\u7684\u7236\u5BB9\u5668\u9009\u62E9\u5668");this.wrapper=e,e.append(this.container)};handleClick=()=>{if(!this.visible)return;if(this.hooks.emit("click"))return!1};handleWantsTapGesture=()=>this.handleClick();handleWantsChangeMode=e=>{e!=="Panorama"&&(this.lastPanoramaLongitude=this.five.getCurrentState().longitude),e!=="Floorplan"&&this.hide()};handleModeChange=e=>{e==="Floorplan"?this.five.on("panGesture",this.handlePanGesture):(this.hide(),this.five.off("panGesture",this.handlePanGesture))};handlePanoArrived=e=>{!this.five?.work||(this.panoIndex=e,this.floorIndex=this.five.work.observers[e].floorIndex)};handleWantsInteriaPan=()=>{if(this.visible)return!1};handleWantsGesture=(e,n)=>{if(!!this.visible&&(n.length>1||e==="mouseWheel"))return!1};handlePanGesture=async({latitude:e,longitude:n},o)=>{if(this.configs.autoShowEnable===!1)return;if(o&&this.visible)return this.five.setState(this.showState,!0);const i=Math.abs(e-Math.PI/2)>5*Math.PI/180,s=n>5*(Math.PI/180)&&n<355*(Math.PI/180),r=i||s;if(this.visible&&r)return this.hide({isAutoHide:!0});if(this.five.camera.fov/E<.8)return;const a=Math.abs(e-Math.PI/2)<10*Math.PI/180,l=n<30*(Math.PI/180)||n>330*(Math.PI/180);if(o&&!this.visible&&a&&l){const u=async(A,x)=>{!x||(this.five.off("interiaPan",u),await this.show({isAutoShow:!0}))};this.five.on("interiaPan",u);return}};render(e){if(!this.container||!this.floorplanData||this.size.width===0)return;const{hoverEnable:n,cameraImageUrl:o,getLabelElement:i,roomLabelsEnable:s,compassEnable:r,ruleLabelsEnable:a}=this.configs,l={five:this.five,pxmm:this.pxmm,cameraImageUrl:o,visible:this.visible,duration:e??0,panoIndex:this.panoIndex,floorIndex:this.floorIndex,floorplanData:this.floorplanData,hoverEnable:n??!1,compassEnable:r??!0,ruleLabelsEnable:a??!0,roomLabelsEnable:s??!0,lastPanoramaLongitude:this.lastPanoramaLongitude,getLabelElement:i,onRoomHeightClick:this.handleClick};this.app?this.app.$set(l):this.app=new J({target:this.container,intro:!0,props:l})}}const ae=(t,e)=>new se(t,e);function F(){return{width:window.innerWidth,height:window.innerHeight}}function le(){const[t,e]=M.exports.useState(F);return M.exports.useEffect(()=>{const n=()=>e(F());return window.addEventListener("resize",n,!1),()=>window.removeEventListener("resize",n,!1)}),t}const he=t=>{const e=N(),[n,o]=_(),i=D();return b("modelLoaded",()=>{Promise.resolve(e.plugins.modelFloorplanPlugin.load(O)).then(()=>{e.plugins.modelFloorplanPlugin.show()})}),b("initAnimationEnded",()=>{n.mode===f.Mode.Floorplan&&e.plugins.modelFloorplanPlugin.show()},[n.mode]),i!=="Loaded"?null:h(G,{sx:{position:"fixed",bottom:0,left:0,right:0,backgroundColor:"transparent"},className:"topview-floorplan-plugin-use",children:C(j,{showLabels:!0,value:n.mode,onChange:(s,r)=>{o({mode:r})},children:[h(v,{label:"\u5168\u666F\u6F2B\u6E38",icon:h(k,{}),value:f.Mode.Panorama}),h(v,{label:"\u7A7A\u95F4\u603B\u89C8",icon:h(W,{}),value:f.Mode.Floorplan})]})})},de={attachedTo:B.CEILING},I=Q(),ue=JSON.stringify(I)!=="{}"?I:de,fe=T({plugins:[[ae,"modelFloorplanPlugin",{selector:".plugin-full-screen-container",...ue}]]}),ce=()=>{const t=le();return P&&C(fe,{initialWork:z(P),ref:e=>Object.assign(window,{$five:e?.five}),children:[h(R,{...t}),h(q,{className:"plugin-full-screen-container",sx:{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}),h(he,{})]})};H.render(h(ce,{}),document.querySelector("#app"));
