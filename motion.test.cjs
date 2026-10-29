const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pose}=require('./motion.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
test('limb and torso lengths stay fixed throughout the animation',()=>{
 for(let t=0;t<=28;t+=1/60){
  const p=pose(t);
  for(const [a,b,length] of [['hip','shoulder',94],['hip','k1',78],['k1','f1',76],['hip','k2',78],['k2','f2',76],['shoulder','elbow',44],['elbow','hand',44],['shoulder','elbowBack',44],['elbowBack','handBack',44]])
   assert.ok(Math.abs(distance(p[a],p[b])-length)<.01,`${a}-${b} at ${t.toFixed(2)}`);
  for(const key of ['f1','f2','k1','k2'])assert.ok(p[key][1]<=768.1,`${key} goes below the ground at ${t}`);
 }
});
test('weight-bearing feet and kneeling knee do not slide',()=>{
 for(let t=0;t<1.4;t+=.1)assert.deepEqual(pose(t).f2,pose(0).f2);
 for(let t=8.6;t<=28;t+=.1)assert.deepEqual(pose(t).f2,[830,768]);
 for(let t=11.2;t<=28;t+=.1){assert.deepEqual(pose(t).f1,[762,768]);assert.ok(distance(pose(t).k1,pose(11.2).k1)<.001);}
});
test('walking, stopping, kneeling and bowing connect without position jumps',()=>{
 for(const t of [6.4,7.4,8.6,10.5,11.2,14.5,19.5,24.5,28]){
  const a=pose(t-.0001),b=pose(t+.0001);
  for(const key of ['hip','shoulder','head','k1','k2','f1','f2','hand','handBack'])assert.ok(distance(a[key],b[key])<.05,`${key} jumps at ${t}`);
 }
});
test('standing and upright kneeling leave room in front of the woman',()=>{
 assert.ok(pose(6.5).head[0]<820,'standing face should leave a clear gap');
 assert.ok(pose(10.5).head[0]<890,'kneeling face should not crowd her');
 for(let t=6.4;t<=8.6;t+=.05)assert.ok(distance(pose(t).f1,[781.25,768])<.001,'rear foot must stay planted during the approach');
});

test('kneeling starts in place before the closer approach',()=>{
 for(let t=6.4;t<=7.4;t+=.05){
  assert.equal(pose(t).hip[0],800);
  assert.ok(distance(pose(t).f1,[781.25,768])<.001);
  assert.ok(distance(pose(t).f2,[818.75,768])<.001);
 }
 assert.ok(pose(7.3).hip[1]>660,'hips should already be lowered at the farther position');
});

test('kneeling legs stay behind the woman’s extended shoe',()=>{
 for(let t=7.4;t<=28;t+=1/60){
  const p=pose(t);
  for(const key of ['hip','k1','k2'])assert.ok(p[key][0]+11<900,`${key} crowds her at ${t}`);
  assert.ok(p.f2[0]+22<880,'front shoe must leave a visible gap');
 }
});
test('the kiss is held before a slow lift and a longer ending',()=>{
 assert.equal(require('./motion.js').duration,28);
 assert.deepEqual(pose(15),pose(19));
 assert.ok(pose(24.5).head[1]<pose(19).head[1]-100);
 assert.deepEqual(pose(24.5),pose(28));
});
