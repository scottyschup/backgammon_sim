export function automaticAngle(state,mode='play',flipped=false){
 const humans=(state.controllers?.black??'human')==='human'&&(state.controllers?.red??'human')==='human';
 if(mode!=='play'||!humans)return flipped?180:0;
 return state.opening?90:state.turn==='black'?0:180;
}
export function nextRotation(current,target){
 if(current===null)return target;
 let delta=((target-current)%360+540)%360-180;
 if(delta===-180)delta=180;
 return current+delta;
}
export function rotationScale(angle,width,height){
 const rad=angle*Math.PI/180,c=Math.abs(Math.cos(rad)),s=Math.abs(Math.sin(rad));
 return Math.min(1,width/(width*c+height*s),height/(width*s+height*c));
}
export function rotationFrames(from,to,width,height){
 const safeScale=Math.min(width,height)/Math.hypot(width,height);
 const frame=(angle,scale,offset)=>({'--board-angle':`${angle}deg`,transform:`rotate(${angle}deg) scale(${scale})`,offset});
 const steps=Math.max(1,Math.ceil(Math.abs(to-from)/5));
 return [frame(from,rotationScale(from,width,height),0),
  ...Array.from({length:steps+1},(_,i)=>frame(from+(to-from)*i/steps,safeScale,.15+.7*i/steps)),
  frame(to,rotationScale(to,width,height),1)];
}

export function barCheckerLayout(count){
 if(!count)return [];
 if(count===1)return [{x:0,y:0,r:24}];
 const rows=Math.ceil(count/2),r=Math.min(15,70/rows),gap=2;
 return Array.from({length:count},(_,i)=>{const row=Math.floor(i/2),lastSingle=i===count-1&&count%2;return {x:lastSingle?0:(i%2===0?-16:16),y:(row-(rows-1)/2)*(2*r+gap),r};});
}
