const cv=document.getElementById("cv"),ctx=cv.getContext("2d"),$=id=>document.getElementById(id);
const S={m1:1,m2:1,MR1:0,MR2:0,m1Mid:0,m2Mid:0,m1End:0,m2End:0,L1:1,L2:1,d1:.02,d2:.02,r1:.08,r2:.08,g:9.81,b1:.02,b2:.02,f1:.005,f2:.005,wearRate:.00001,temp:20,press:101325,wind:0,windAng:0,gust:0,gustP:3,cd:.47,rodCd:1.2,air:true,windOn:false,visc:.000018,fluidRho:1.225,buoy:false,supAmp:0,supFreq:1,supAng:0,force:0,forceAng:0,forceDur:.2,forceBody:1,speed:1,airRhoFactor:1,fluidViscFactor:1,jointDamp:0,gustFactor:1,material:"s1"};

const MATERIALS={
  s1:{name:"Gốc",res:500},
  s2:{name:"Thép",res:4000},
  s3:{name:"Titanium",res:15000},
  s4:{name:"Sắt",res:1500},
  s5:{name:"Dây thừng",res:20}
};

let q=[Math.PI/2,Math.PI/2],qd=[0,0],qdd=[0,0],time=0,running=true,forceLeft=0,workExt=0,wear=0,eLoss=0,trail=[],trailLen=2,zoom=1,camX=0,camY=0,E0=0;
let draggingCam=false,draggingBody=null,lastMouse=null;
let currFcProxy=0;
let brokenState=null;
let audioCtx=null,windGain=null,windFilter=null,creakGain=null,creakOsc=null;

function initAudio(){
  if(audioCtx)return;
  try{
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    let bufferSize=audioCtx.sampleRate*2;
    let noiseBuffer=audioCtx.createBuffer(1,bufferSize,audioCtx.sampleRate);
    let output=noiseBuffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++)output[i]=Math.random()*2-1;

    let whiteNoise=audioCtx.createBufferSource();
    whiteNoise.buffer=noiseBuffer;
    whiteNoise.loop=true;

    windFilter=audioCtx.createBiquadFilter();
    windFilter.type="bandpass";
    windFilter.frequency.value=400;
    windFilter.Q.value=3;

    windGain=audioCtx.createGain();
    windGain.gain.value=0;

    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    whiteNoise.start();

    creakOsc=audioCtx.createOscillator();
    creakOsc.type="sawtooth";
    creakOsc.frequency.value=120;

    let creakFilter=audioCtx.createBiquadFilter();
    creakFilter.type="lowpass";
    creakFilter.frequency.value=800;

    creakGain=audioCtx.createGain();
    creakGain.gain.value=0;

    creakOsc.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(audioCtx.destination);
    creakOsc.start();
  }catch(e){}
}

function updateAudio(v1,v2){
  if(!$("soundOn").checked||!audioCtx){
    if(windGain)windGain.gain.value=0;
    if(creakGain)creakGain.gain.value=0;
    return;
  }

  if(audioCtx.state==="suspended")audioCtx.resume();

  let vMax=Math.max(Math.hypot(v1.x,v1.y),Math.hypot(v2.x,v2.y));
  let wMax=Math.max(Math.abs(qd[0]),Math.abs(qd[1]));

  let windVol=Math.min(.25,vMax*.015);
  windGain.gain.setTargetAtTime(windVol,audioCtx.currentTime,.05);
  windFilter.frequency.setTargetAtTime(200+vMax*70,audioCtx.currentTime,.05);

  let creakVol=Math.min(.1,wMax*.01);
  creakGain.gain.setTargetAtTime(creakVol,audioCtx.currentTime,.03);
  creakOsc.frequency.setTargetAtTime(80+wMax*20+Math.random()*10,audioCtx.currentTime,.03);
}

function masses(){
  return[S.MR1,S.MR2];
}

function Irod(M,L){
  return M*L*L/12;
}

function rho(){
  return S.airRhoFactor*S.press/(287.05*(S.temp+273.15));
}

function ep(a){
  return{x:Math.sin(a),y:-Math.cos(a)};
}

function dep(a){
  return{x:Math.cos(a),y:Math.sin(a)};
}

function support(t){
  let a=S.supAng*Math.PI/180,w=2*Math.PI*S.supFreq;
  return{
    x:S.supAmp*Math.sin(w*t)*Math.cos(a),
    y:S.supAmp*Math.sin(w*t)*Math.sin(a)
  };
}

function supportVel(t){
  let a=S.supAng*Math.PI/180,w=2*Math.PI*S.supFreq;
  return{
    x:S.supAmp*w*Math.cos(w*t)*Math.cos(a),
    y:S.supAmp*w*Math.cos(w*t)*Math.sin(a)
  };
}

function supportAcc(t){
  let a=S.supAng*Math.PI/180,w=2*Math.PI*S.supFreq;
  return{
    x:-S.supAmp*w*w*Math.sin(w*t)*Math.cos(a),
    y:-S.supAmp*w*w*Math.sin(w*t)*Math.sin(a)
  };
}

function points(t=time){
  let s=support(t),e1=ep(q[0]),e2=ep(q[1]);

  return{
    s,
    r1:{
      x:s.x+S.L1*e1.x,
      y:s.y+S.L1*e1.y
    },
    r2:{
      x:s.x+S.L1*e1.x+S.L2*e2.x,
      y:s.y+S.L1*e1.y+S.L2*e2.y
    },
    c1:{
      x:s.x+.5*S.L1*e1.x,
      y:s.y+.5*S.L1*e1.y
    },
    c2:{
      x:s.x+S.L1*e1.x+.5*S.L2*e2.x,
      y:s.y+S.L1*e1.y+.5*S.L2*e2.y
    }
  };
}

function velocities(t=time){
  let sv=supportVel(t),e1=dep(q[0]),e2=dep(q[1]);

  return{
    v1:{
      x:sv.x+S.L1*e1.x*qd[0],
      y:sv.y+S.L1*e1.y*qd[0]
    },
    v2:{
      x:sv.x+S.L1*e1.x*qd[0]+S.L2*e2.x*qd[1],
      y:sv.y+S.L1*e1.y*qd[0]+S.L2*e2.y*qd[1]
    },
    c1:{
      x:sv.x+.5*S.L1*e1.x*qd[0],
      y:sv.y+.5*S.L1*e1.y*qd[0]
    },
    c2:{
      x:sv.x+S.L1*e1.x*qd[0]+.5*S.L2*e2.x*qd[1],
      y:sv.y+S.L1*e1.y*qd[0]+.5*S.L2*e2.y*qd[1]
    }
  };
}

function effM(m,r,isRod,d,L){
  if(!S.buoy)return m;
  let V=isRod?Math.PI*(d/2)**2*L:(4/3)*Math.PI*r**3;
  return m-S.fluidRho*V;
}

function massMatrix(qq=q){
  let[M1,M2]=masses(),d=qq[0]-qq[1];
  let m1t=S.m1+S.m1End,m2t=S.m2+S.m2End;

  let A=m1t*S.L1**2+
    S.m1Mid*(S.L1/2)**2+
    M1*S.L1**2/3+
    (m2t+S.m2Mid+M2)*S.L1**2;

  let B=m2t*S.L2**2+
    S.m2Mid*(S.L2/2)**2+
    M2*S.L2**2/3;

  let C=(m2t+S.m2Mid/2+M2/2)*S.L1*S.L2*Math.cos(d);

  return[[A,C],[C,B]];
}

function solve2(A,b){
  let d=A[0][0]*A[1][1]-A[0][1]*A[1][0];
  if(Math.abs(d)<1e-12)return[0,0];

  return[
    (b[0]*A[1][1]-A[0][1]*b[1])/d,
    (A[0][0]*b[1]-b[0]*A[1][0])/d
  ];
}

function windVec(){
  if(!S.windOn)return{x:0,y:0};

  let a=S.windAng*Math.PI/180;
  let w=S.wind+S.gust*Math.max(0,Math.sin(2*Math.PI*time/S.gustP));

  return{
    x:w*Math.cos(a),
    y:w*Math.sin(a)
  };
}

function drag(v,A,Cd){
  if(!S.air)return{x:0,y:0,mag:0};

  let W=windVec();
  let rx=v.x-W.x,ry=v.y-W.y;
  let s=Math.hypot(rx,ry);

  if(s<1e-9)return{x:0,y:0,mag:0};

  let F=.5*rho()*Cd*A*s*s;

  return{
    x:-F*rx/s,
    y:-F*ry/s,
    mag:F
  };
}

function jacobian(a,b,qq){
  return[
    [a*Math.cos(qq[0]),b*Math.cos(qq[1])],
    [a*Math.sin(qq[0]),b*Math.sin(qq[1])]
  ];
}

function addPointForce(F,a,b,Q,qq){
  let J=jacobian(a,b,qq);

  Q[0]+=J[0][0]*F.x+J[1][0]*F.y;
  Q[1]+=J[0][1]*F.x+J[1][1]*F.y;
}

function detailedEnergy(qq=q,ww=qd){
  let p=points(0),v=velocities(0),[M1,M2]=masses();

  let K1=.5*(S.m1+S.m1End)*(v.v1.x**2+v.v1.y**2);
  let K2=.5*(S.m2+S.m2End)*(v.v2.x**2+v.v2.y**2);

  let KR1=.5*M1*(v.c1.x**2+v.c1.y**2)+.5*Irod(M1,S.L1)*ww[0]**2;
  let KR2=.5*M2*(v.c2.x**2+v.c2.y**2)+.5*Irod(M2,S.L2)*ww[1]**2;

  let p1mid={
    x:p.s.x+.5*S.L1*ep(qq[0]).x,
    y:p.s.y+.5*S.L1*ep(qq[0]).y
  };

  let p2mid={
    x:p.r1.x+.5*S.L2*ep(qq[1]).x,
    y:p.r1.y+.5*S.L2*ep(qq[1]).y
  };

  let U1=S.g*(
    effM(S.m1+S.m1End,S.r1,0)*p.r1.y+
    effM(S.m1Mid,S.r1,0)*p1mid.y+
    effM(M1,0,1,S.d1,S.L1)*p.c1.y
  );

  let U2=S.g*(
    effM(S.m2+S.m2End,S.r2,0)*p.r2.y+
    effM(S.m2Mid,S.r2,0)*p2mid.y+
    effM(M2,0,1,S.d2,S.L2)*p.c2.y
  );

  let K=K1+K2+KR1+KR2;
  let U=U1+U2;

  return{K1,K2,KR1,KR2,U1,U2,K,U,E:K+U};
}

function generalized_nc(qq,ww,t){
  let Q=[0,0];
  let sv=supportVel(t),e1=dep(qq[0]),e2=dep(qq[1]);

  let v1={
    x:sv.x+S.L1*e1.x*ww[0],
    y:sv.y+S.L1*e1.y*ww[0]
  };

  let v2={
    x:v1.x+S.L2*e2.x*ww[1],
    y:v1.y+S.L2*e2.y*ww[1]
  };

  let c1={
    x:sv.x+.5*S.L1*e1.x*ww[0],
    y:sv.y+.5*S.L1*e1.y*ww[0]
  };

  let c2={
    x:sv.x+S.L1*e1.x*ww[0]+.5*S.L2*e2.x*ww[1],
    y:sv.y+S.L1*e1.y*ww[0]+.5*S.L2*e2.y*ww[1]
  };

  addPointForce(
    drag(v1,S.r1**2*Math.PI,S.cd),
    S.L1,0,Q,qq
  );

  addPointForce(
    drag(v2,S.r2**2*Math.PI,S.cd),
    S.L1,S.L2,Q,qq
  );

  if(S.MR1>0||S.d1>0){
    addPointForce(
      drag(c1,S.L1*S.d1,S.rodCd),
      S.L1*.5,0,Q,qq
    );
  }

  if(S.MR2>0||S.d2>0){
    addPointForce(
      drag(c2,S.L2*S.d2,S.rodCd),
      S.L1,S.L2*.5,Q,qq
    );
  }

  if(forceLeft>0){
    let a=S.forceAng*Math.PI/180;
    let F={
      x:S.force*Math.cos(a),
      y:S.force*Math.sin(a)
    };

    if(S.forceBody===1)
      addPointForce(F,S.L1,0,Q,qq);
    else
      addPointForce(F,S.L1,S.L2,Q,qq);
  }

  return Q;
}

function accel(qq,ww,t){
  let[M1,M2]=masses();
  let q1=qq[0],q2=qq[1];
  let w1=ww[0],w2=ww[1];

  let M_mat=massMatrix(qq);

  let C0=(S.m2+S.m2End+S.m2Mid/2+M2/2)*S.L1*S.L2;

  let C_vec=[
    C0*Math.sin(q1-q2)*w2**2,
    -C0*Math.sin(q1-q2)*w1**2
  ];

  let sa=supportAcc(t);
  let gx=sa.x,gy=S.g+sa.y;

  let G1_coeff=(
    effM(S.m1,S.r1,0)+
    effM(S.m1End,S.r1,0)+
    effM(S.m2,S.r2,0)+
    effM(S.m2End,S.r2,0)+
    effM(S.m2Mid,S.r2,0)+
    effM(M2,0,1,S.d2,S.L2)
  )*S.L1+
  effM(S.m1Mid,S.r1,0)*S.L1/2+
  effM(M1,0,1,S.d1,S.L1)*S.L1/2;

  let G2_coeff=(
    effM(S.m2,S.r2,0)+
    effM(S.m2End,S.r2,0)
  )*S.L2+
  effM(S.m2Mid,S.r2,0)*S.L2/2+
  effM(M2,0,1,S.d2,S.L2)*S.L2/2;

  let G_vec=[
    G1_coeff*(gx*Math.cos(q1)+gy*Math.sin(q1)),
    G2_coeff*(gx*Math.cos(q2)+gy*Math.sin(q2))
  ];

  let Q_nc=generalized_nc(qq,ww,t);

  let fac=1+4*wear;

  let fric1=-S.b1*S.fluidViscFactor*fac*w1-S.jointDamp*w1;
  let fric2=-S.b2*S.fluidViscFactor*fac*w2-S.jointDamp*w2;

  let dry1=S.f1*fac,dry2=S.f2*fac;

  let Tau1=Q_nc[0]-C_vec[0]-G_vec[0]+fric1;
  let Tau2=Q_nc[1]-C_vec[1]-G_vec[1]+fric2;

  if(Math.abs(w1)<.001&&Math.abs(Tau1)<=dry1){
    Tau1=0;
    dry1=0;
    w1=0;
    ww[0]=0;
  }else{
    Tau1-=dry1*Math.sign(w1||Tau1);
  }

  if(Math.abs(w2)<.001&&Math.abs(Tau2)<=dry2){
    Tau2=0;
    dry2=0;
    w2=0;
    ww[1]=0;
  }else{
    Tau2-=dry2*Math.sign(w2||Tau2);
  }

  return solve2(M_mat,[Tau1,Tau2]);
}

function rk4(dt){
  let s=[q[0],q[1],qd[0],qd[1]];

  let f=(z,t)=>{
    let a=accel(z.slice(0,2),z.slice(2),t);
    return[z[2],z[3],a[0],a[1]];
  };

  let k1=f(s,time);

  let s2=s.map((x,i)=>x+k1[i]*dt/2);
  let k2=f(s2,time+dt/2);

  let s3=s.map((x,i)=>x+k2[i]*dt/2);
  let k3=f(s3,time+dt/2);

  let s4=s.map((x,i)=>x+k3[i]*dt);
  let k4=f(s4,time+dt);

  let n=s.map(
    (x,i)=>x+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6
  );

  q=n.slice(0,2);
  qd=n.slice(2);
  qdd=accel(q,qd,time);
}

function step(realDt){
  if(draggingBody)return;

  let total=realDt*S.speed;
  let maxW=Math.max(Math.abs(qd[0]),Math.abs(qd[1]));

  let n=Math.max(
    1,
    Math.ceil(total/.004),
    Math.ceil(total*maxW/.05)
  );

  n=Math.min(n,1000);

  let h=total/n;

  for(let i=0;i<n;i++){
    if(brokenState){
      brokenState.m1.vy-=S.g*h;
      brokenState.m1.x+=brokenState.m1.vx*h;
      brokenState.m1.y+=brokenState.m1.vy*h;

      brokenState.m2.vy-=S.g*h;
      brokenState.m2.x+=brokenState.m2.vx*h;
      brokenState.m2.y+=brokenState.m2.vy*h;

      time+=h;
      continue;
    }

    let eBefore=detailedEnergy().E;

    rk4(h);

    let eAfter=detailedEnergy().E;

    if(forceLeft<=0)
      eLoss+=Math.max(0,eBefore-eAfter);

    if(forceLeft>0){
      let a=S.forceAng*Math.PI/180;
      let v=velocities(time);
      let vv=S.forceBody===1?v.v1:v.v2;

      workExt+=S.force*(
        Math.cos(a)*vv.x+
        Math.sin(a)*vv.y
      )*h;

      forceLeft=Math.max(0,forceLeft-h);
    }

    time+=h;

    let v=velocities();
    let p=points();

    if(trailLen>0){
      trail.push({
        x:p.r2.x,
        y:p.r2.y
      });

      let maxTrail=Math.max(
        2,
        Math.floor(trailLen*60)
      );

      if(trail.length>maxTrail)
        trail.splice(0,trail.length-maxTrail);
    }

    let m2=S.m2+S.m2End;
    let r=Math.hypot(v.v2.x,v.v2.y);

    currFcProxy=m2*r*r/Math.max(S.L2,.0001);

    let mat=MATERIALS[S.material]||MATERIALS.s1;

    if(currFcProxy>mat.res){
      brokenState={
        m1:{
          x:p.r1.x,
          y:p.r1.y,
          vx:v.v1.x,
          vy:v.v1.y
        },
        m2:{
          x:p.r2.x,
          y:p.r2.y,
          vx:v.v2.x,
          vy:v.v2.y
        }
      };
      break;
    }

    wear=Math.min(
      1,
      wear+S.wearRate*Math.abs(qd[0]+qd[1])*h
    );
  }
}

function screen(p){
  let scale=Math.min(cv.clientWidth,cv.clientHeight)*.22*zoom;

  return{
    x:cv.clientWidth/2+(p.x-camX)*scale,
    y:cv.clientHeight/2-(p.y-camY)*scale
  };
}

function toWorld(x,y){
  let scale=Math.min(cv.clientWidth,cv.clientHeight)*.22*zoom;

  return{
    x:(x-cv.clientWidth/2)/scale+camX,
    y:-(y-cv.clientHeight/2)/scale+camY
  };
}

function arrow(a,b,label){
  let dx=b.x-a.x,dy=b.y-a.y;
  let len=Math.hypot(dx,dy);

  if(len<1)return;

  let ux=dx/len,uy=dy/len;

  ctx.strokeStyle="#67d8ff";
  ctx.fillStyle="#67d8ff";
  ctx.lineWidth=2;

  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(b.x,b.y);
  ctx.lineTo(
    b.x-ux*8+uy*4,
    b.y-uy*8-ux*4
  );
  ctx.lineTo(
    b.x-ux*8-uy*4,
    b.y-uy*8+ux*4
  );
  ctx.closePath();
  ctx.fill();

  ctx.font="11px monospace";
  ctx.fillText(label,b.x+5,b.y-5);
}

function draw(){
  let w=cv.clientWidth,h=cv.clientHeight;

  ctx.clearRect(0,0,w,h);

  ctx.fillStyle="#07111c";
  ctx.fillRect(0,0,w,h);

  let scale=Math.min(w,h)*.22*zoom;

  ctx.strokeStyle="rgba(255,255,255,.05)";
  ctx.lineWidth=1;

  for(let x=-20;x<=20;x++){
    let sx=w/2+(x-camX)*scale;
    ctx.beginPath();
    ctx.moveTo(sx,0);
    ctx.lineTo(sx,h);
    ctx.stroke();
  }

  for(let y=-20;y<=20;y++){
    let sy=h/2-(y-camY)*scale;
    ctx.beginPath();
    ctx.moveTo(0,sy);
    ctx.lineTo(w,sy);
    ctx.stroke();
  }

  if(trail.length>1){
    ctx.strokeStyle="rgba(85,229,138,.35)";
    ctx.lineWidth=1.5;
    ctx.beginPath();

    let p0=screen(trail[0]);
    ctx.moveTo(p0.x,p0.y);

    for(let i=1;i<trail.length;i++){
      let p=screen(trail[i]);
      ctx.lineTo(p.x,p.y);
    }

    ctx.stroke();
  }

  let p=points();
  let v=velocities();

  let S0=screen(p.s);
  let R1=screen(p.r1);
  let R2=screen(p.r2);
  let C1=screen(p.c1);
  let C2=screen(p.c2);

  if(!brokenState){
    ctx.strokeStyle="#d8e2ed";
    ctx.lineWidth=4;

    ctx.beginPath();
    ctx.moveTo(S0.x,S0.y);
    ctx.lineTo(R1.x,R1.y);
    ctx.lineTo(R2.x,R2.y);
    ctx.stroke();

    ctx.fillStyle="#d8e2ed";
    ctx.beginPath();
    ctx.arc(S0.x,S0.y,6,0,7);
    ctx.fill();

    ctx.fillStyle="#55e58a";
    ctx.beginPath();
    ctx.arc(C1.x,C1.y,5,0,7);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(C2.x,C2.y,5,0,7);
    ctx.fill();
  }else{
    ctx.fillStyle="rgba(255,80,92,.1)";
    ctx.fillRect(0,0,cv.clientWidth,cv.clientHeight);

    ctx.fillStyle="#ff505c";
    ctx.font="bold 20px Arial";
    ctx.textAlign="center";

    ctx.fillText(
      "⚠️ HỆ THỐNG ĐÃ ĐỨT GÃY DO QUÁ TẢI LY TÂM!",
      cv.clientWidth/2,
      40
    );

    ctx.fillStyle="#fff";
    ctx.font="14px Arial";

    ctx.fillText(
      "Hãy nhấn nút 'Reset hệ thống' để cài đặt lại.",
      cv.clientWidth/2,
      65
    );

    ctx.textAlign="left";
  }

  let m1Color=draggingBody===1
    ?" #ffff00"
    :(wear>.5?"#ff8800":"#ffb64b");

  let m2Color=draggingBody===2
    ?" #ffff00"
    :(wear>.5?"#ff3333":"#ff505c");

  ctx.fillStyle=m1Color.trim();
  ctx.beginPath();
  ctx.arc(R1.x,R1.y,9,0,7);
  ctx.fill();

  ctx.fillStyle=m2Color.trim();
  ctx.beginPath();
  ctx.arc(R2.x,R2.y,9,0,7);
  ctx.fill();

  if($("vectors").checked){
    let sv=supportVel(time);

    let relV1={
      x:v.v1.x-sv.x,
      y:v.v1.y-sv.y
    };

    let relV2={
      x:v.v2.x-sv.x,
      y:v.v2.y-sv.y
    };

    arrow(
      R1,
      screen({
        x:p.r1.x+relV1.x*.12,
        y:p.r1.y+relV1.y*.12
      }),
      "v₁"
    );

    arrow(
      R2,
      screen({
        x:p.r2.x+relV2.x*.12,
        y:p.r2.y+relV2.y*.12
      }),
      "v₂"
    );
  }

  if($("labels").checked){
    ctx.fillStyle="#d8e2ed";
    ctx.font="11px monospace";

    ctx.fillText(
      "m₁ "+S.m1.toFixed(2)+" kg",
      R1.x+12,
      R1.y
    );

    ctx.fillText(
      "m₂ "+S.m2.toFixed(2)+" kg",
      R2.x+12,
      R2.y
    );
  }

  updateAudio(v.v1,v.v2);
}

function txt(id,v){
  if($(id))$(id).textContent=v;
}

function ui(){
  let[M1,M2]=masses();
  let dE_info=detailedEnergy();
  let v=velocities();
  let p=points();

  let d1=drag(
    v.v1,
    S.r1*S.r1*Math.PI,
    S.cd
  );

  let d2=drag(
    v.v2,
    S.r2*S.r2*Math.PI,
    S.cd
  );

  let m1Tot=S.m1+S.m1End+S.m1Mid+M1;
  let m2Tot=S.m2+S.m2End+S.m2Mid+M2;

  let T2_val=Math.abs(
    m2Tot*(S.g*Math.cos(q[1])+S.L2*qd[1]**2)
  );

  let T1_val=Math.abs(
    T2_val+
    m1Tot*(S.g*Math.cos(q[0])+S.L1*qd[0]**2)
  );

  let fac=1+4*wear;

  let tauF1=
    S.b1*S.fluidViscFactor*fac*Math.abs(qd[0])+
    S.f1*fac;

  let tauF2=
    S.b2*S.fluidViscFactor*fac*Math.abs(qd[1])+
    S.f2*fac;

  let pLoss=
    tauF1*Math.abs(qd[0])+
    tauF2*Math.abs(qd[1])+
    d1.mag*Math.hypot(v.v1.x,v.v1.y)+
    d2.mag*Math.hypot(v.v2.x,v.v2.y);

  let xCM=(
    m1Tot*p.r1.x+
    m2Tot*p.r2.x
  )/(m1Tot+m2Tot);

  let yCM=(
    m1Tot*p.r1.y+
    m2Tot*p.r2.y
  )/(m1Tot+m2Tot);

  let L_val=
    (S.m1+S.m1End)*S.L1**2*qd[0]+
    (S.m2+S.m2End)*
    ((S.L1*qd[0]+S.L2*qd[1])*S.L2);

  txt("zoomV",zoom.toFixed(2)+"×");
  txt("camXV",camX.toFixed(2)+" m");
  txt("camYV",camY.toFixed(2)+" m");

  txt("m1V",S.m1.toFixed(2)+" kg");
  txt("m2V",S.m2.toFixed(2)+" kg");
  txt("MR1V",S.MR1.toFixed(2)+" kg");
  txt("MR2V",S.MR2.toFixed(2)+" kg");

  txt("m1MidV",S.m1Mid.toFixed(2)+" kg");
  txt("m2MidV",S.m2Mid.toFixed(2)+" kg");
  txt("m1EndV",S.m1End.toFixed(2)+" kg");
  txt("m2EndV",S.m2End.toFixed(2)+" kg");

  for(const k of["L1","L2","d1","d2","r1","r2"])
    txt(
      k+"V",
      S[k].toFixed(k[0]=="d"?3:2)+" m"
    );

  txt("t1V",$("t1").value+"°");
  txt("t2V",$("t2").value+"°");
  txt("w1V",$("w1").value);
  txt("w2V",$("w2").value);

  txt("gV",S.g.toFixed(2)+" m/s²");

  for(const k of["b1","b2","f1","f2"])
    txt(k+"V",S[k].toFixed(3));

  txt("wearRateV",S.wearRate.toFixed(6)+"/s");
  txt("tempV",S.temp+" °C");
  txt("pressV",Math.round(S.press)+" Pa");

  txt("windV",S.wind.toFixed(1)+" m/s");
  txt("windAngV",S.windAng+"°");
  txt("gustV",S.gust.toFixed(1)+" m/s");
  txt("gustPV",S.gustP.toFixed(1)+" s");

  txt("cdV",S.cd.toFixed(2));
  txt("rodCdV",S.rodCd.toFixed(2));
  txt("viscV",S.visc.toExponential(2)+" Pa·s");

  txt("fluidRhoV",S.fluidRho.toFixed(1)+" kg/m³");

  txt("supAmpV",S.supAmp.toFixed(3)+" m");
  txt("supFreqV",S.supFreq.toFixed(1)+" Hz");
  txt("supAngV",S.supAng+"°");

  txt("airRhoFactorV",S.airRhoFactor.toFixed(2)+"×");
  txt("fluidViscFactorV",S.fluidViscFactor.toFixed(2)+"×");
  txt("jointDampV",S.jointDamp.toFixed(2));
  txt("gustFactorV",S.gustFactor.toFixed(2)+"×");

  txt("forceV",S.force.toFixed(1)+" N");
  txt("forceAngV",S.forceAng+"°");
  txt("forceDurV",S.forceDur.toFixed(2)+" s");
  txt("speedV",S.speed.toFixed(1)+"×");
  txt("trailV",trailLen.toLocaleString("vi-VN")+" m");

  txt("time",time.toFixed(2));
  txt("wear",(wear*100).toFixed(3));
  txt("fcProxy",currFcProxy.toFixed(1));

  txt("xCM",xCM.toFixed(3));
  txt("yCM",yCM.toFixed(3));

  txt("theta1",(q[0]*180/Math.PI).toFixed(2));
  txt("theta2",(q[1]*180/Math.PI).toFixed(2));

  txt("omega1",qd[0].toFixed(3));
  txt("omega2",qd[1].toFixed(3));

  txt("alpha1",qdd[0].toFixed(3));
  txt("alpha2",qdd[1].toFixed(3));

  txt("v1",Math.hypot(v.v1.x,v.v1.y).toFixed(3));
  txt("v2",Math.hypot(v.v2.x,v.v2.y).toFixed(3));

  txt("a1",Math.abs(qdd[0]*S.L1).toFixed(3));
  txt("a2",Math.abs(qdd[1]*S.L2).toFixed(3));

  txt("T1",T1_val.toFixed(2));
  txt("T2",T2_val.toFixed(2));

  txt("tauF1",tauF1.toFixed(4));
  txt("tauF2",tauF2.toFixed(4));
  txt("pLoss",pLoss.toFixed(4));

  txt("K",dE_info.K.toFixed(3));
  txt("U",dE_info.U.toFixed(3));
  txt("E",dE_info.E.toFixed(3));
  txt("dE",(dE_info.E-E0).toFixed(4));
  txt("work",workExt.toFixed(4));

  txt("rho",rho().toFixed(3));

  txt(
    "mom",
    Math.hypot(
      S.m1*v.v1.x+S.m2*v.v2.x,
      S.m1*v.v1.y+S.m2*v.v2.y
    ).toFixed(3)
  );

  txt("angMom",Math.abs(L_val).toFixed(3));

  let maxEnergyDisp=Math.max(
    10,
    dE_info.K,
    Math.abs(dE_info.U),
    eLoss,
    Math.abs(E0)
  );

  let wK=Math.min(
    100,
    dE_info.K/maxEnergyDisp*100
  );

  $("barK").style.width=wK+"%";
  $("valK").textContent=dE_info.K.toFixed(1)+" J";

  let wU=Math.min(
    100,
    Math.abs(dE_info.U)/maxEnergyDisp*100
  );

  $("barU").style.width=wU+"%";
  $("valU").textContent=Math.abs(dE_info.U).toFixed(1)+" J";

  let wLoss=Math.min(
    100,
    eLoss/maxEnergyDisp*100
  );

  $("barLoss").style.width=wLoss+"%";
  $("valLoss").textContent=eLoss.toFixed(1)+" J";
}

function bind(id,key){
  if($(id)){
    $(id).oninput=e=>{
      S[key]=+e.target.value;
      ui();
    };
  }
}

const binds=[
  ["m1","m1"],
  ["m2","m2"],
  ["MR1","MR1"],
  ["MR2","MR2"],
  ["airRhoFactor","airRhoFactor"],
  ["fluidViscFactor","fluidViscFactor"],
  ["jointDamp","jointDamp"],
  ["gustFactor","gustFactor"],
  ["m1Mid","m1Mid"],
  ["m2Mid","m2Mid"],
  ["m1End","m1End"],
  ["m2End","m2End"],
  ["L1","L1"],
  ["L2","L2"],
  ["d1","d1"],
  ["d2","d2"],
  ["r1","r1"],
  ["r2","r2"],
  ["g","g"],
  ["b1","b1"],
  ["b2","b2"],
  ["f1","f1"],
  ["f2","f2"],
  ["wearRate","wearRate"],
  ["temp","temp"],
  ["press","press"],
  ["wind","wind"],
  ["windAng","windAng"],
  ["gust","gust"],
  ["gustP","gustP"],
  ["cd","cd"],
  ["rodCd","rodCd"],
  ["visc","visc"],
  ["fluidRho","fluidRho"],
  ["supAmp","supAmp"],
  ["supFreq","supFreq"],
  ["supAng","supAng"],
  ["force","force"],
  ["forceAng","forceAng"],
  ["forceDur","forceDur"],
  ["speed","speed"]
];

binds.forEach(x=>bind(...x));

$("zoom").oninput=e=>{
  zoom=+e.target.value;
  ui();
};

$("camX").oninput=e=>{
  camX=+e.target.value;
  ui();
};

$("camY").oninput=e=>{
  camY=+e.target.value;
  ui();
};

$("trail").oninput=e=>{
  trailLen=+e.target.value;
  ui();
};

$("air").onchange=e=>S.air=e.target.checked;
$("windOn").onchange=e=>S.windOn=e.target.checked;
$("buoy").onchange=e=>S.buoy=e.target.checked;
$("forceBody").onchange=e=>S.forceBody=+e.target.value;

$("material").onchange=e=>{
  S.material=e.target.value;
  ui();
};

$("gPreset").onchange=e=>{
  $("g").value=e.target.value;
  S.g=+e.target.value;
  ui();
};

["t1","t2","w1","w2"].forEach(
  id=>$(id).oninput=ui
);

$("applyForce").onclick=()=>{
  forceLeft=S.forceDur;
};

$("pause").onclick=()=>{
  running=!running;
  $("pause").textContent=running?"Tạm dừng":"Tiếp tục";
};

$("reset").onclick=()=>{
  q=[
    +$("t1").value*Math.PI/180,
    +$("t2").value*Math.PI/180
  ];

  qd=[0,0];
  qdd=[0,0];
  time=0;
  forceLeft=0;
  workExt=0;
  wear=0;
  eLoss=0;
  trail=[];
  E0=detailedEnergy().E;
  brokenState=null;
};

$("toggleBtn").onclick=()=>{
  $("sidePanel").classList.toggle("collapsed");
  $("toggleBtn").classList.toggle("flipped");

  $("toggleBtn").textContent=
    $("sidePanel").classList.contains("collapsed")
    ?"◀"
    :"▶";

  setTimeout(resize,310);
};

function resize(){
  let r=cv.getBoundingClientRect();
  let d=devicePixelRatio;

  cv.width=r.width*d;
  cv.height=r.height*d;

  ctx.setTransform(d,0,0,d,0,0);
}

cv.addEventListener("mousedown",e=>{
  initAudio();

  let rect=cv.getBoundingClientRect();

  let mx=e.clientX-rect.left;
  let my=e.clientY-rect.top;

  let wPos=toWorld(mx,my);
  let p=points();

  let d1=Math.hypot(
    wPos.x-p.r1.x,
    wPos.y-p.r1.y
  );

  let d2=Math.hypot(
    wPos.x-p.r2.x,
    wPos.y-p.r2.y
  );

  let threshold=.25/zoom;

  if(d2<threshold)
    draggingBody=2;
  else if(d1<threshold)
    draggingBody=1;
  else{
    draggingCam=true;
    lastMouse={
      x:e.clientX,
      y:e.clientY
    };

    cv.classList.add("dragging");
  }
});

addEventListener("mouseup",()=>{
  draggingCam=false;
  draggingBody=null;
  cv.classList.remove("dragging");
});

addEventListener("mousemove",e=>{
  let rect=cv.getBoundingClientRect();

  let mx=e.clientX-rect.left;
  let my=e.clientY-rect.top;

  let wPos=toWorld(mx,my);

  if(draggingBody===1){
    let s=support(time);

    let angle=Math.atan2(
      wPos.x-s.x,
      -(wPos.y-s.y)
    );

    q[0]=angle;
    qd[0]=0;

    $("t1").value=Math.round(
      angle*180/Math.PI
    );

    ui();
  }else if(draggingBody===2){
    let p=points();

    let angle=Math.atan2(
      wPos.x-p.r1.x,
      -(wPos.y-p.r1.y)
    );

    q[1]=angle;
    qd[1]=0;

    $("t2").value=Math.round(
      angle*180/Math.PI
    );

    ui();
  }else if(draggingCam){
    let scale=
      Math.min(cv.clientWidth,cv.clientHeight)*
      .22*
      zoom;

    camX-=(e.clientX-lastMouse.x)/scale;
    camY+=(e.clientY-lastMouse.y)/scale;

    $("camX").value=
      Math.max(-10,Math.min(10,camX));

    $("camY").value=
      Math.max(-10,Math.min(10,camY));

    lastMouse={
      x:e.clientX,
      y:e.clientY
    };

    ui();
  }
});

cv.addEventListener(
  "wheel",
  e=>{
    e.preventDefault();

    zoom=Math.max(
      .2,
      Math.min(
        4,
        zoom*(e.deltaY<0?1.1:.9)
      )
    );

    $("zoom").value=zoom;
    ui();
  },
  {passive:false}
);

cv.addEventListener("dblclick",()=>{
  zoom=1;
  camX=0;
  camY=0;

  $("zoom").value=1;
  $("camX").value=0;
  $("camY").value=0;

  ui();
});

addEventListener("resize",resize);

resize();

E0=detailedEnergy().E;

ui();

let last=performance.now();

function loop(now){
  let dt=Math.min(
    .025,
    (now-last)/1000
  );

  last=now;

  if(running)
    step(dt);

  draw();
  ui();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
