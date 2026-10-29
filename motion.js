/* Fixed-length, two-bone poses in the scene's SVG coordinates. */
(function(root){
 'use strict';
 const duration=28,ground=768,thigh=78,calf=76,torso=94,arm=44;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
 const mix=(a,b,u)=>a+(b-a)*u;
 const point=(a,b,u)=>[mix(a[0],b[0],u),mix(a[1],b[1],u)];
 const radians=d=>d*Math.PI/180;
 function joint(origin,target,a,b,side=1){
  let dx=target[0]-origin[0],dy=target[1]-origin[1],distance=Math.hypot(dx,dy)||.001;
  const reach=Math.max(Math.abs(a-b)+.001,Math.min(a+b-.001,distance));
  dx/=distance;dy/=distance;
  const end=[origin[0]+dx*reach,origin[1]+dy*reach];
  const along=(a*a-b*b+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,a*a-along*along));
  return {bend:[origin[0]+dx*along+side*dy*height,origin[1]+dy*along-side*dx*height],end};
 }
 const rearKnee=joint([868,692],[762,ground],thigh,calf).bend;
 // Sit back over the grounded rear knee so the raised knee stays clear of her legs.
 const kneelingAngle=-18;
 const kneelingHip=[rearKnee[0]+thigh*Math.sin(radians(kneelingAngle)),rearKnee[1]-thigh*Math.cos(radians(kneelingAngle))];
 function pose(time){
  const t=Math.max(0,Math.min(duration,time)),q=6*ease(t/6.4);
  let hip=[575+37.5*q,615.55],f1=[556.25,ground],f2=[593.75,ground],lean=4,bow=0;
  const feet=[f1,f2];
  // The support foot stays at its world position. Only the other foot swings.
  for(let i=0;i<6;i++){
   const foot=feet[i%2],u=clamp(q-i),from=foot[0];
   foot[0]=from+75*ease(u);
   if(u>0&&u<1)foot[1]=ground-9*Math.sin(Math.PI*u)**2;
  }
  // Keep the supporting leg nearly straight; the swinging knee does the bending.
  const support=feet[1-Math.min(5,Math.floor(q))%2];
  hip[1]=ground-Math.sqrt(153.6**2-(hip[0]-support[0])**2);
  // Begin lowering while still at the farther stop, with both feet planted.
  if(t>=6.4){
   const crouch=ease((t-6.4)/1);
   hip=point([800,ground-Math.sqrt(153.6**2-18.75**2)],[800,665],crouch);
   f1=[781.25,ground];f2=[818.75,ground];
  }
  if(t>=7.4){
   const step=ease((t-7.4)/1.2);
   hip=point([800,665],[808,682],step);
   f1=[781.25,ground];f2=[mix(818.75,830,step),ground-8*Math.sin(Math.PI*step)**2];
  }
  if(t>=8.6){
   const lower=ease((t-8.6)/1.9);
   hip=point([808,682],kneelingHip,lower);
   f1=[mix(781.25,762,lower),ground-12*Math.sin(Math.PI*lower)**2];f2=[830,ground];lean=mix(4,0,lower);
  }
  if(t>=11.2){
   bow=ease((t-11.2)/3.3)*(1-ease((t-19.5)/5));
   const angle=radians(mix(kneelingAngle,-65,bow));
   hip=[rearKnee[0]+thigh*Math.sin(angle),rearKnee[1]-thigh*Math.cos(angle)];
   lean=mix(0,85,bow);
  }
  const rear=joint(hip,f1,thigh,calf),front=joint(hip,f2,thigh,calf);
  const shoulder=[hip[0]+torso*Math.sin(radians(lean)),hip[1]-torso*Math.cos(radians(lean))];
  const neckAngle=radians(lean+18*bow);
  const head=[shoulder[0]+35*Math.sin(neckAngle),shoulder[1]-35*Math.cos(neckAngle)];
  function hangingHand(sign){
   const swing=sign*15*Math.sin(Math.PI*q),upper=radians(7+swing),lower=radians(16+swing);
   return [shoulder[0]+arm*(Math.sin(upper)+Math.sin(lower)),shoulder[1]+arm*(Math.cos(upper)+Math.cos(lower))];
  }
  const rest=ease((t-6.4)/4.1);
  let hand=point(hangingHand(1),[front.bend[0]-14,front.bend[1]-22],rest);
  let handBack=point(hangingHand(-1),[hip[0]-2,hip[1]-8],rest);
  hand=point(hand,[899,748],bow);
  handBack=point(handBack,[front.bend[0]-10,front.bend[1]-8],bow);
  const reach=joint(shoulder,hand,arm,arm,-1),reachBack=joint(shoulder,handBack,arm,arm,1);
  return {hip,shoulder,head,k1:rear.bend,k2:front.bend,f1:rear.end,f2:front.end,elbow:reach.bend,hand:reach.end,elbowBack:reachBack.bend,handBack:reachBack.end,angle:lean-15*bow};
 }
 const api={pose,duration};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.DaliMotion=api;
})(typeof globalThis==='object'?globalThis:this);
