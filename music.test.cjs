const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('application/json'));
// Media is a browser boundary: simulate its real play -> buffering -> playing sequence.
function setup(){
 const elements={};
 function element(){const handlers={};return {textContent:'',hidden:false,attrs:{},classList:{add(){},remove(){}},addEventListener(n,fn){(handlers[n]??=[]).push(fn)},emit(n,e={}){for(const fn of handlers[n]||[])fn(e)},setAttribute(n,v){this.attrs[n]=v}}}
 for(const id of ['audio','sound','musicHint','music-data'])elements[id]=element();
 elements['music-data'].textContent='""';
 const a=elements.audio;a.paused=true;a.error=null;a.readyState=0;
 a.load=()=>{};a.play=()=>{a.paused=false;a.emit('play');return new Promise(()=>{})};
 a.pause=()=>{a.paused=true;a.emit('pause')};
 const document=element();document.getElementById=id=>elements[id];
 vm.runInNewContext(scripts.at(-1)[2],{document,window:element()});
 return {a,s:elements.sound,h:elements.musicHint,document};
}
test('buffering must not be labelled as audible playback',()=>{
 const {a,s}=setup();
 assert.notEqual(s.attrs['aria-pressed'],'true');
 a.readyState=4;a.emit('playing');
 assert.equal(s.attrs['aria-pressed'],'true');
});
test('manual pause stays paused across page interactions',()=>{
 const {a,s,h,document}=setup();a.readyState=4;a.emit('playing');s.emit('click');
 document.emit('touchend',{target:{closest:()=>null}});
 assert.equal(a.paused,true);assert.equal(s.attrs['aria-pressed'],'false');
 assert.equal(h.hidden,true);
});
