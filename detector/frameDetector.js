import {FRAMES} from "../data/frames.js";
export class FrameDetector{
 constructor(id){this.frame=FRAMES.find(f=>f.id===id); this.c=document.createElement("canvas");
 this.x=this.c.getContext("2d"); this.h=0;}
 detect(v){const w=v.videoWidth,h=v.videoHeight; if(!w||!h)return null;
 this.c.width=160; this.c.height=120; this.x.drawImage(v,0,0,160,120);
 const d=this.x.getImageData(0,0,160,120).data; let e=0;
 for(let i=4;i<d.length-4;i+=4)e+=Math.abs(d[i]-d[i+4]);
 if(e<350000){this.h=0; return null;} this.h++; if(this.h<4)return null;
 const bh=h*0.6, bw=bh*this.frame.aspect;
 return {x:(w-bw)/2,y:(h-bh)/2,width:bw,height:bh};}
}