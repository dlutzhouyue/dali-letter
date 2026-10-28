const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pose}=require('./motion.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
test('limb and torso lengths stay fixed throughout the animation',()=>{
 for(let t=0;t<=18;t+=1/60){
  const p=pose(t);
  for(const [a,b,length] of [['hip','shoulder',94],['hip','k1',78],['k1','f1',76],['hip','k2',78],['k2','f2',76],['shoulder','elbow',44],['elbow','hand',44],['shoulder','elbowBack',44],['elbowBack','handBack',44]])
   assert.ok(Math.abs(distance(p[a],p[b])-length)<.01,`${a}-${b} at ${t.toFixed(2)}`);
  for(const key of ['f1','f2','k1','k2'])assert.ok(p[key][1]<=768.1,`${key} goes below the ground at ${t}`);
 }
});
test('weight-bearing feet and kneeling knee do not slide',()=>{
 for(let t=0;t<1.4;t+=.1)assert.deepEqual(pose(t).f2,pose(0).f2);
 for(let t=8.2;t<=18;t+=.1)assert.deepEqual(pose(t).f2,[902,768]);
 for(let t=11.2;t<=18;t+=.1){assert.deepEqual(pose(t).f1,[762,768]);assert.ok(distance(pose(t).k1,pose(11.2).k1)<.001);}
});
test('walking, stopping, kneeling and bowing connect without position jumps',()=>{
 for(const t of [6.4,7,8.2,10.5,11.2,14.5]){
  const a=pose(t-.0001),b=pose(t+.0001);
  for(const key of ['hip','shoulder','head','k1','k2','f1','f2','hand','handBack'])assert.ok(distance(a[key],b[key])<.05,`${key} jumps at ${t}`);
 }
});
