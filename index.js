const cv=document.getElementById("cv"),ctx=cv.getContext("2d",{alpha:false,desynchronized:true,willReadFrequently:false}),$=id=>document.getElementById(id);
const S={m1:1,m2:1,MR1:0,MR2:0,m1Mid:0,m2Mid:0,m1End:0,m2End:0,L1:1,L2:1,d1:.02,d2:.02,r1:.08,r2:.08,g:9.81,b1:.02,b2:.02,f1:.005,f2:.005,wearRate:.00001,wearSpeed:1,temp:20,press:101325,wind:0,windAng:0,gust:0,gustP:3,cd:.47,rodCd:1.2,air:true,windOn:false,visc:.000018,fluidRho:1.225,buoy:false,supAmp:0,supFreq:1,supAng:0,force:0,forceAng:0,forceDur:.2,forceBody:1,speed:1,airRhoFactor:1,fluidViscFactor:1,jointDamp:0,gustFactor:1,material:"s1",maxEnergyDrop:1000,maxEnergyDropOn:false};

const MATERIALS={
  s1:{name:"Gốc",sigma:50e6},
  s2:{name:"Thép",sigma:400e6},
  s3:{name:"Titanium",sigma:900e6},
  s4:{name:"Sắt",sigma:250e6},
  s5:{name:"Dây thừng",sigma:30e6}
};

let q=[Math.PI/2,Math.PI/2],qd=[0,0],qdd=[0,0],time=0,running=true,forceLeft=0,workExt=0,wear=0,eLoss=0,trail=[],trailLen=2,zoom=1,camX=0,camY=0,E0=0;
let draggingCam=false,draggingBody=null,lastMouse=null;
let mouseWorld={x:0,y:0,active:false};
let targetState={mode:'auto',selected:'m2',locked:false,ready:false,setupTime:0};
let energyPrev=0,energyRate=0,energyPeak=0,energyInitialAvailable=0;
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

function detailedEnergy(qq=q,ww=qd,t=time){


  const a1=qq[0], a2=qq[1];
  const sv=supportVel(t);
  const p=points(t);
  const e1=dep(a1), e2=dep(a2);

  const vR1={x:sv.x+S.L1*e1.x*ww[0], y:sv.y+S.L1*e1.y*ww[0]};
  const vR2={x:vR1.x+S.L2*e2.x*ww[1], y:vR1.y+S.L2*e2.y*ww[1]};
  const vC1={x:sv.x+.5*S.L1*e1.x*ww[0], y:sv.y+.5*S.L1*e1.y*ww[0]};
  const vC2={x:vR1.x+.5*S.L2*e2.x*ww[1], y:vR1.y+.5*S.L2*e2.y*ww[1]};

  const m1End=S.m1+S.m1End;
  const m2End=S.m2+S.m2End;

  const K_m1=.5*m1End*(vR1.x**2+vR1.y**2);
  const K_m2=.5*m2End*(vR2.x**2+vR2.y**2);
  const K_m1Mid=.5*S.m1Mid*(vC1.x**2+vC1.y**2);
  const K_m2Mid=.5*S.m2Mid*(vC2.x**2+vC2.y**2);

  const K_rod1=.5*S.MR1*(vC1.x**2+vC1.y**2)+.5*Irod(S.MR1,S.L1)*ww[0]**2;
  const K_rod2=.5*S.MR2*(vC2.x**2+vC2.y**2)+.5*Irod(S.MR2,S.L2)*ww[1]**2;

  const U_m1=effM(m1End,S.r1,0)*S.g*p.r1.y;
  const U_m2=effM(m2End,S.r2,0)*S.g*p.r2.y;
  const U_m1Mid=effM(S.m1Mid,S.r1,0)*S.g*p.c1.y;
  const U_m2Mid=effM(S.m2Mid,S.r2,0)*S.g*p.c2.y;
  const U_rod1=effM(S.MR1,0,1,S.d1,S.L1)*S.g*p.c1.y;
  const U_rod2=effM(S.MR2,0,1,S.d2,S.L2)*S.g*p.c2.y;

  const K=K_m1+K_m2+K_m1Mid+K_m2Mid+K_rod1+K_rod2;
  const U=U_m1+U_m2+U_m1Mid+U_m2Mid+U_rod1+U_rod2;


  const Umin=S.g*(
    -effM(m1End,S.r1,0)*S.L1
    -effM(S.m1Mid,S.r1,0)*S.L1*.5
    -effM(S.MR1,0,1,S.d1,S.L1)*S.L1*.5
    -effM(m2End,S.r2,0)*(S.L1+S.L2)
    -effM(S.m2Mid,S.r2,0)*(S.L1+S.L2*.5)
    -effM(S.MR2,0,1,S.d2,S.L2)*(S.L1+S.L2*.5)
  );
  const available=K+U-Umin;

  return{
    K1:K_m1,K2:K_m2,KR1:K_rod1,KR2:K_rod2,
    K1Mid:K_m1Mid,K2Mid:K_m2Mid,
    U1:U_m1+U_m1Mid+U_rod1,
    U2:U_m2+U_m2Mid+U_rod2,
    UParts:{m1:U_m1,m2:U_m2,m1Mid:U_m1Mid,m2Mid:U_m2Mid,rod1:U_rod1,rod2:U_rod2},
    KParts:{m1:K_m1,m2:K_m2,m1Mid:K_m1Mid,m2Mid:K_m2Mid,rod1:K_rod1,rod2:K_rod2},
    K,U,E:K+U,Umin,available
  };
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

  const G1_grav=(
    effM(S.m1,S.r1,0)+effM(S.m1End,S.r1,0)+effM(S.m2,S.r2,0)+
    effM(S.m2End,S.r2,0)+effM(S.m2Mid,S.r2,0)+effM(M2,0,1,S.d2,S.L2)
  )*S.L1+effM(S.m1Mid,S.r1,0)*S.L1/2+effM(M1,0,1,S.d1,S.L1)*S.L1/2;
  const G2_grav=(effM(S.m2,S.r2,0)+effM(S.m2End,S.r2,0))*S.L2+
    effM(S.m2Mid,S.r2,0)*S.L2/2+effM(M2,0,1,S.d2,S.L2)*S.L2/2;
  const G1_mass=(S.m1+S.m1End+S.m2+S.m2End+S.m2Mid+M2)*S.L1+S.m1Mid*S.L1/2+M1*S.L1/2;
  const G2_mass=(S.m2+S.m2End)*S.L2+S.m2Mid*S.L2/2+M2*S.L2/2;
  const G_vec=[
    G1_grav*S.g*Math.sin(q1)+G1_mass*(sa.x*Math.cos(q1)+sa.y*Math.sin(q1)),
    G2_grav*S.g*Math.sin(q2)+G2_mass*(sa.x*Math.cos(q2)+sa.y*Math.sin(q2))
  ];

  let Q_nc=generalized_nc(qq,ww,t);
  const drain=energyDrainTorque(qq,ww);
  Q_nc[0]+=drain[0];
  Q_nc[1]+=drain[1];

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


function energyDrainTorque(qq,ww){
  if(!S.maxEnergyDropOn||S.maxEnergyDrop<=0)return [0,0];
  const w2=ww[0]*ww[0]+ww[1]*ww[1];
  if(w2<1e-10)return [0,0];
  const e=detailedEnergy(qq,ww).E;
  const available=Math.max(0,e-detailedEnergy(qq,[0,0]).E);
  if(available<=1e-12)return [0,0];
  const p=Math.min(S.maxEnergyDrop,available*Math.max(1,Math.sqrt(w2))*0.5);
  const c=p/(w2+1e-10);
  return[-c*ww[0],-c*ww[1]];
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

function pointAcceleration(a,w,alpha,L,baseAcc){
  const e=ep(a),d=dep(a);
  return{x:baseAcc.x+L*(d.x*alpha-e.x*w*w),y:baseAcc.y+L*(d.y*alpha-e.y*w*w)};
}
function volumeSphere(r){return (4/3)*Math.PI*r*r*r;}
function volumeRod(d,L){return Math.PI*(d/2)*(d/2)*L;}
function externalBodyForce(m,r,isRod,d,L,v){
  let fx=0,fy=-m*S.g;
  if(S.buoy){const V=isRod?volumeRod(d,L):volumeSphere(r);fy+=S.fluidRho*V*S.g;}
  if(S.air){const A=isRod?Math.max(1e-9,L*d):Math.PI*r*r;const F=drag(v,A,isRod?S.rodCd:S.cd);fx+=F.x;fy+=F.y;}
  return{x:fx,y:fy};
}
function axialLoadAtJoint2(){
  const v=velocities(),sa=supportAcc(time),a1=pointAcceleration(q[0],qd[0],qdd[0],S.L1,sa);
  const a2=pointAcceleration(q[1],qd[1],qdd[1],S.L2,a1),d2=dep(q[1]),e2=ep(q[1]);
  const ac2={x:a1.x+.5*S.L2*(d2.x*qdd[1]-e2.x*qd[1]*qd[1]),y:a1.y+.5*S.L2*(d2.y*qdd[1]-e2.y*qd[1]*qd[1])};
  let Rx=0,Ry=0;
  const add=(m,a,F)=>{Rx+=m*a.x-F.x;Ry+=m*a.y-F.y;};
  add(S.m2,a2,externalBodyForce(S.m2,S.r2,false,0,0,v.v2));
  add(S.m2End,a2,externalBodyForce(S.m2End,S.r2,false,0,0,v.v2));
  add(S.m2Mid,ac2,externalBodyForce(S.m2Mid,S.r2,false,0,0,v.c2));
  add(S.MR2,ac2,externalBodyForce(S.MR2,0,true,S.d2,S.L2,v.c2));
  return Math.abs(Rx*e2.x+Ry*e2.y);
}
function breakingCapacity(){
  const mat=MATERIALS[S.material]||MATERIALS.s1;
  return mat.sigma*Math.PI*Math.max(S.d2,1e-6)**2/4;
}

function step(realDt){
  if(draggingBody)return;

  let total=realDt*S.speed;
  let maxW=Math.max(Math.abs(qd[0]),Math.abs(qd[1]));

  let n=Math.max(
    1,
    Math.ceil(total/.002),
    Math.ceil(total*maxW/.025)
  );

  if(S.maxEnergyDropOn&&S.maxEnergyDrop>0){
    n=Math.max(n,Math.ceil(total*Math.max(1,maxW)/.006));
    n=Math.max(n,Math.ceil(total*240));
  }
  if($('performanceMode')?.checked){
    n=Math.max(n,Math.ceil(total*Math.max(120,Math.min(1200,60*S.speed))));
  }
  n=Math.min(n,8000);

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

    currFcProxy=axialLoadAtJoint2();

    if(currFcProxy>breakingCapacity() && !$("infiniteWear")?.checked){
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

    if(!$("infiniteWear")?.checked){
      wear=Math.min(
        1,
        wear+S.wearRate*S.wearSpeed*Math.abs(qd[0]+qd[1])*h
      );
    }
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

function uiText(v){
  return window.ATCXCookie&&typeof ATCXCookie.t==="function"?ATCXCookie.t(v):String(v);
}

function txt(id,v){
  if($(id))$(id).textContent=uiText(v);
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

  if($("totalMass")) txt("totalMassV",Number($("totalMass").value||0).toFixed(2)+" kg");
  ["massPart1","massPart2","massPart3","massPart4","massPart5"].forEach(id=>{
    if($(id)) txt(id+"V",Number($(id).value||0).toFixed(2)+" kg");
  });

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
  txt("wearSpeedV",S.wearSpeed.toFixed(1)+"×");
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
  txt("breakCapacity",breakingCapacity().toFixed(1));

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
  txt("currentEnergy",dE_info.E.toFixed(3));
  txt("dE",(dE_info.E-E0).toFixed(4));
  txt("work",workExt.toFixed(4));
  if(Number.isFinite(energyPrev) && energyPrev!==0){
    energyRate=(dE_info.E-energyPrev);
  }
  energyPrev=dE_info.E;
  energyPeak=Math.max(energyPeak,Math.max(0,dE_info.E-E0+Math.max(0,-E0)));
  const remaining=Math.max(0,dE_info.available);
  const initialAvailable=Math.max(1e-12,energyInitialAvailable);
  const remainPct=Math.max(0,Math.min(100,remaining/initialAvailable*100));
  txt("energyRemaining",remaining.toFixed(4)+" J");
  txt("energyBudget",initialAvailable.toFixed(4)+" J");
  txt("energyPct",remainPct.toFixed(2)+" %");
  txt("energyRate",(energyRate>=0?"+":"")+energyRate.toFixed(5)+" J/bước");
  txt("kM1",dE_info.KParts.m1.toFixed(4)+" J");
  txt("kM2",dE_info.KParts.m2.toFixed(4)+" J");
  txt("kMid1",dE_info.KParts.m1Mid.toFixed(4)+" J");
  txt("kMid2",dE_info.KParts.m2Mid.toFixed(4)+" J");
  txt("kRod1",dE_info.KParts.rod1.toFixed(4)+" J");
  txt("kRod2",dE_info.KParts.rod2.toFixed(4)+" J");
  txt("uM1",dE_info.UParts.m1.toFixed(4)+" J");
  txt("uM2",dE_info.UParts.m2.toFixed(4)+" J");
  txt("uMid1",dE_info.UParts.m1Mid.toFixed(4)+" J");
  txt("uMid2",dE_info.UParts.m2Mid.toFixed(4)+" J");
  txt("uRod1",dE_info.UParts.rod1.toFixed(4)+" J");
  txt("uRod2",dE_info.UParts.rod2.toFixed(4)+" J");

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
  $("valK").textContent=uiText(dE_info.K.toFixed(1)+" J");

  let wU=Math.min(
    100,
    Math.abs(dE_info.U)/maxEnergyDisp*100
  );

  $("barU").style.width=wU+"%";
  $("valU").textContent=uiText(Math.abs(dE_info.U).toFixed(1)+" J");

  let wLoss=Math.min(
    100,
    eLoss/maxEnergyDisp*100
  );

  $("barLoss").style.width=wLoss+"%";
  $("valLoss").textContent=uiText(eLoss.toFixed(1)+" J");



  let energyRef=Math.max(0.000001,energyInitialAvailable);
  let wEnergy=Math.min(100,Math.max(0,dE_info.available)/energyRef*100);
  $("barEnergy").style.width=wEnergy+"%";
  $("valEnergy").textContent=uiText(Math.max(0,dE_info.available).toFixed(4)+" J");
  if($("energyDetailLine")) $("energyDetailLine").textContent=uiText(
    `K ${dE_info.K.toFixed(4)} J  |  U ${dE_info.U.toFixed(4)} J  |  E ${dE_info.E.toFixed(4)} J  |  năng lượng khả dụng ${remaining.toFixed(4)} J | còn ${remainPct.toFixed(2)}%`);

  let motionThreshold=Math.max(0.001,Math.max(1,Math.abs(E0))*0.001);
  const energyScale=Math.max(1e-9, energyInitialAvailable);
  const kPct=Math.max(0,Math.min(100,dE_info.K/energyScale*100));
  const lossPct=Math.max(0,Math.min(100,eLoss/energyScale*100));
  const dEFrame=dE_info.E-(Number.isFinite(energyPrev)?energyPrev:dE_info.E);
  const absOmega=Math.hypot(qd[0],qd[1]);
  let status="⚡ Đang dao động";
  let detail="Hệ đang trao đổi liên tục giữa động năng và thế năng.";
  let alert="ℹ️ Năng lượng đang được theo dõi theo thời gian thực.";
  let flow="K ↔ U";
  let motionLevel="Dao động rõ";

  if(brokenState){
    status="⛔ Hệ thống đã dừng do quá tải";
    detail="Mô phỏng đã chuyển sang trạng thái an toàn. Chuyển động của khối không còn được tính như con lắc liên kết.";
    alert="🛑 Cảnh báo: hệ đã vượt giới hạn cơ học. Hãy giảm lực, khối lượng, tốc độ hoặc tăng độ bền/giảm tác động.";
    flow="Đã ngắt mô phỏng"; motionLevel="Dừng";
  }else if(dE_info.K<=motionThreshold){
    status="🟢 Gần dừng — động năng rất thấp";
    detail="Vận tốc góc và vận tốc của các khối đang rất nhỏ; phần lớn năng lượng động đã chuyển sang thế năng hoặc đã bị tiêu tán.";
    alert="🟢 Hệ sắp dừng. Nếu ma sát/cản vẫn khác 0, biên độ sẽ tiếp tục giảm.";
    flow="K → U + hao hụt"; motionLevel="Rất yếu";
  }else if(dE_info.K<=Math.max(0.01,energyScale*0.02)){
    status="🟡 Dao động yếu — sắp dừng";
    detail="Động năng hiện chỉ còn khoảng "+kPct.toFixed(1)+"% ngân sách ban đầu. Các lần dao động sẽ có biên độ nhỏ hơn trước.";
    alert="⚠️ Năng lượng hữu ích còn thấp; đây là dấu hiệu hệ đang tiến gần trạng thái nghỉ.";
    flow="K ↔ U, biên độ giảm"; motionLevel="Yếu";
  }else if(kPct>=70){
    status="🔵 Đang chuyển động mạnh";
    detail="Động năng đang chiếm khoảng "+kPct.toFixed(1)+"% ngân sách năng lượng; các khối đang có tốc độ lớn.";
    flow="K trội → chuyển sang U"; motionLevel="Mạnh";
  }else{
    status="⚡ Đang dao động ổn định";
    detail="Năng lượng đang luân chuyển giữa K và U. Ma sát/cản làm cơ năng khả dụng giảm dần theo thời gian.";
  }

  if(!brokenState && pLoss>1e-6){
    alert += " Tốc độ tiêu tán hiện tại khoảng "+pLoss.toFixed(4)+" W.";
  }else if(!brokenState && pLoss<=1e-6){
    alert += " Hiện gần như không có công suất tiêu tán.";
  }

  if(!brokenState && Math.abs(dEFrame)>1e-7){
    flow += dEFrame<0 ? " • E đang giảm" : " • E đang tăng";
  }

  let eta="Không xác định";
  if(!brokenState && pLoss>1e-6 && dE_info.available>0){
    const seconds=dE_info.available/pLoss;
    eta=seconds<1 ? seconds.toFixed(2)+" s" : seconds<60 ? seconds.toFixed(1)+" s" : (seconds/60).toFixed(1)+" phút";
  }else if(!brokenState && pLoss<=1e-6){
    eta="Rất lâu / gần lý tưởng";
  }else if(brokenState){
    eta="Đã dừng";
  }

  $("energyStatus").textContent=uiText(status);
  if($("energyStatusDetail")) $("energyStatusDetail").textContent=uiText(detail+"  |  |ω| = "+absOmega.toFixed(4)+" rad/s.");
  if($("energyAlert")) $("energyAlert").textContent=uiText(alert);
  if($("energyFlow")) $("energyFlow").textContent=uiText(flow);
  if($("motionLevel")) $("motionLevel").textContent=uiText(motionLevel);
  if($("lossRate")) $("lossRate").textContent=pLoss.toFixed(4)+" W";
  if($("energyEta")) $("energyEta").textContent=uiText(eta);
}

function setupNumericEditors(){
  document.querySelectorAll('input[type="range"]').forEach(range=>{
    if(range.dataset.numericReady) return;
    range.dataset.numericReady="1";
    const num=document.createElement("input");
    num.type="number";
    num.className="number-editor";
    num.min=range.min;
    num.max=range.max;
    num.step=range.step||"any";
    num.value=range.value;
    num.dataset.lastValid=range.value;
    num.title="Nhập giá trị chính xác";
    range.insertAdjacentElement("afterend",num);
    range.addEventListener("input",()=>{
      if(document.activeElement!==num) {
        num.value=range.value;
        num.dataset.lastValid=range.value;
      }
    });
    num.addEventListener("focus",()=>{
      num.dataset.lastValid=range.value;
    });
    num.addEventListener("input",()=>{
      if(num.value.trim()==="") return;
      const v=Number(num.value);
      if(!Number.isFinite(v)) return;
      const min=Number(range.min),max=Number(range.max);
      const clamped=Math.max(min,Math.min(max,v));
      range.value=clamped;
      range.dispatchEvent(new Event("input",{bubbles:true}));
    });
    num.addEventListener("blur",()=>{
      let raw=num.value.trim();
      if(raw===""){
        const restore=num.dataset.lastValid||range.value;
        num.value=restore;
        range.value=restore;
        return;
      }
      let v=Number(raw);
      if(!Number.isFinite(v)){
        num.value=num.dataset.lastValid||range.value;
        return;
      }
      const min=Number(range.min),max=Number(range.max);
      v=Math.max(min,Math.min(max,v));
      num.value=v;
      num.dataset.lastValid=String(v);
      range.value=v;
      range.dispatchEvent(new Event("input",{bubbles:true}));
    });
    num.addEventListener("keydown",e=>{
      if(e.key==="Enter"){ e.preventDefault(); num.blur(); }
      if(e.key==="Escape"){ num.value=num.dataset.lastValid||range.value; num.blur(); }
    });
  });
}

function syncNumericEditor(id){
  const range=$(id);
  if(!range) return;
  const num=range.nextElementSibling;
  if(num && num.classList.contains("number-editor")) num.value=range.value;
}


function initPerformanceInfo(){
  const el=$('performanceInfo');
  if(!el)return;
  const cores=navigator.hardwareConcurrency||1;
  let gpu='Không xác định';
  try{
    const gl=document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl');
    if(gl){
      const dbg=gl.getExtension('WEBGL_debug_renderer_info');
      gpu=dbg?gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL):'GPU/WebGL khả dụng';
    }
  }catch(e){}
  el.textContent=uiText(`CPU logic: ${cores} luồng | GPU: ${gpu} | Canvas tăng tốc trình duyệt: bật | Mô phỏng thích ứng: ${$('performanceMode')?.checked?'bật':'tắt'}`);
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
  ["wearSpeed","wearSpeed"],
  ["maxEnergyDrop","maxEnergyDrop"],
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
setupNumericEditors();

["totalMass","massPart1","massPart2","massPart3","massPart4","massPart5"].forEach(id=>{
  if($(id)) $(id).addEventListener("input",()=>ui());
});

const maxEnergyDropEl=$("maxEnergyDropOn");
if(maxEnergyDropEl){
  maxEnergyDropEl.addEventListener("change",()=>{
    S.maxEnergyDropOn=maxEnergyDropEl.checked;
    ui();
  });
}
const performanceModeEl=$("performanceMode");
if(performanceModeEl){
  performanceModeEl.addEventListener("change",initPerformanceInfo);
}

const infiniteWearEl=$("infiniteWear");
if(infiniteWearEl){
  infiniteWearEl.addEventListener("change",()=>{
    if(infiniteWearEl.checked){

      wear=0;
      brokenState=null;
      ui();
      draw();
    }
  });
}

document.querySelectorAll("[data-wear-speed]").forEach(btn=>{
  btn.onclick=()=>{
    const value=+btn.dataset.wearSpeed;
    $("wearSpeed").value=value;
    S.wearSpeed=value;
    ui();
  };
});

function setFiveMassParts(values){
  const ids=["m1","m2","m1Mid","m2Mid","m1End"];
  ids.forEach((id,i)=>{
    const value=Math.max(0,Number(values[i])||0);
    $(id).value=value;
    $(id).dispatchEvent(new Event("input",{bubbles:true}));
  });
  $("m2End").value=Number(values[4])||0;
  $("m2End").dispatchEvent(new Event("input",{bubbles:true}));
  syncNumericEditor("m2End");
}

$("splitMass").onclick=()=>{
  const total=Math.max(0,Number($("totalMass").value)||0);
  const part=total/5;
  ["massPart1","massPart2","massPart3","massPart4","massPart5"].forEach(id=>{
    $(id).value=part.toFixed(2);
  });
  setFiveMassParts([part,part,part,part,part]);
  ui();
};

$("applyMassParts").onclick=()=>{
  const ids=["massPart1","massPart2","massPart3","massPart4","massPart5"];
  const values=ids.map(id=>Math.max(0,Number($(id).value)||0));
  $("totalMass").value=values.reduce((a,b)=>a+b,0).toFixed(2);
  setFiveMassParts(values);
  ui();
};

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
  $("pause").textContent=uiText(running?"Tạm dừng":"Tiếp tục");
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
  energyPrev=E0;
  energyPeak=Math.max(0,E0);
  energyInitialAvailable=Math.max(0,detailedEnergy().available);
  brokenState=null;
  energyPrev=E0;
  energyRate=0;
  energyPeak=Math.max(0,E0);
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

function targetItems(){
  const p=points(),v=velocities(),de=detailedEnergy();
  return [
    {id:'m1',name:'m₁',pos:p.r1,vel:v.v1,K:de.KParts.m1},
    {id:'m2',name:'m₂',pos:p.r2,vel:v.v2,K:de.KParts.m2},
    {id:'m1Mid',name:'Giữa thanh 1',pos:p.c1,vel:v.c1,K:de.KParts.m1Mid},
    {id:'m2Mid',name:'Giữa thanh 2',pos:p.c2,vel:v.c2,K:de.KParts.m2Mid},
    {id:'m1End',name:'Đầu thanh 1',pos:p.r1,vel:v.v1,K:de.KParts.m1+de.KParts.m1End},
    {id:'m2End',name:'Đầu thanh 2',pos:p.r2,vel:v.v2,K:de.KParts.m2+de.KParts.m2End}
  ];
}

function getTargetItem(){
  const items=targetItems();
  if(targetState.mode==='manual') return items.find(x=>x.id===targetState.selected)||items[1];
  if(targetState.ready) return items.find(x=>x.id===targetState.selected)||items[1];
  return null;
}

function updateTargetLive(){
  const el=$('targetLive');
  if(!el)return;
  const t=getTargetItem();
  if(!t){el.textContent=uiText('Chưa thiết lập mục tiêu');return;}
  const dx=mouseWorld.x-t.pos.x,dy=mouseWorld.y-t.pos.y;
  const distMouse=Math.hypot(dx,dy);
  const speed=Math.hypot(t.vel.x,t.vel.y);
  const vv=Math.max(1e-12,t.vel.x*t.vel.x+t.vel.y*t.vel.y);
  const tau=Math.max(0,(dx*t.vel.x+dy*t.vel.y)/vv);
  const minRange=Math.hypot(dx-t.vel.x*tau,dy-t.vel.y*tau);
  const bearing=Math.atan2(t.pos.x-mouseWorld.x,-(t.pos.y-mouseWorld.y))*180/Math.PI;
  el.textContent=uiText(`🎯 ${t.name} | khóa ${targetState.locked?'BẬT':'TẮT'} | X ${t.pos.x.toFixed(5)} m | Y ${t.pos.y.toFixed(5)} m | v ${speed.toFixed(5)} m/s | K ${t.K.toFixed(5)} J | cách chuột ${distMouse.toFixed(5)} m | phương vị ${bearing.toFixed(3)}° | TCA ${tau.toFixed(5)} s | gần nhất ${minRange.toFixed(5)} m`);
}

function updateHoverInfo(wPos,mx,my){
  const items=targetItems();
  const distances=items.map(o=>Math.hypot(wPos.x-o.pos.x,wPos.y-o.pos.y));
  const idx=distances.indexOf(Math.min(...distances));
  const nearest=items[idx],dist=distances[idx];
  const threshold=.45/Math.max(.25,zoom);
  let label='👁️ Nhận diện rê chuột';
  let detail='Đưa chuột tới vật thể để nhận diện; thông tin này không cần khóa mục tiêu.';
  if(dist<threshold){
    const speed=Math.hypot(nearest.vel.x,nearest.vel.y);
    const dx=nearest.pos.x-wPos.x,dy=nearest.pos.y-wPos.y;
    const bearing=Math.atan2(dx,-dy)*180/Math.PI;
    const vv=Math.max(1e-12,nearest.vel.x*nearest.vel.x+nearest.vel.y*nearest.vel.y);
    const tau=Math.max(0,(dx*nearest.vel.x+dy*nearest.vel.y)/vv);
    const minRange=Math.hypot(dx-nearest.vel.x*tau,dy-nearest.vel.y*tau);
    label=`👁️ Nhận diện: ${nearest.name}`;
    detail=`Khoảng cách ${dist.toFixed(5)} m | phương vị ${bearing.toFixed(3)}° | v ${speed.toFixed(5)} m/s | K ${nearest.K.toFixed(5)} J | TCA ${tau.toFixed(5)} s | gần nhất ${minRange.toFixed(5)} m`;
    if($('hoverTarget')) $('hoverTarget').textContent=uiText(`👁️ ${nearest.name} | nhận diện liên tục | cách ${dist.toFixed(5)} m | tiến ${Math.max(0,-(dx*nearest.vel.x+dy*nearest.vel.y)/Math.max(1e-12,dist)).toFixed(5)} m/s | TCA ${tau.toFixed(5)} s`);
  }else if($('hoverTarget')) $('hoverTarget').textContent=uiText(`👁️ Rê chuột | gần nhất: ${nearest.name} | cách ${dist.toFixed(5)} m`);
  if($('hoverTitle')) $('hoverTitle').textContent=uiText(label);
  if($('hoverDetail')) $('hoverDetail').textContent=uiText(detail);
  if($('hoverCoords')) $('hoverCoords').textContent=uiText(`X ${wPos.x.toFixed(5)} m | Y ${wPos.y.toFixed(5)} m | khoảng cách ${dist.toFixed(5)} m`);
  if($('hoverAngles')) $('hoverAngles').textContent=uiText(`θ₁ ${(q[0]*180/Math.PI).toFixed(3)}° | θ₂ ${(q[1]*180/Math.PI).toFixed(3)}° | Δθ ${((q[1]-q[0])*180/Math.PI).toFixed(3)}°`);
  if($('hoverOmega')) $('hoverOmega').textContent=uiText(`ω₁ ${qd[0].toFixed(5)} rad/s | ω₂ ${qd[1].toFixed(5)} rad/s | α₁ ${qdd[0].toFixed(5)} rad/s² | α₂ ${qdd[1].toFixed(5)} rad/s²`);
  updateTargetLive();
}

function setupTarget(){
  targetState.ready=true;
  targetState.setupTime=time;
  if(targetState.mode==='auto'){
    const items=targetItems();
    const best=items.reduce((a,b)=>Math.hypot(b.vel.x,b.vel.y)>Math.hypot(a.vel.x,a.vel.y)?b:a,items[0]);
    targetState.selected=best.id;
    if($('targetSelect')) $('targetSelect').value=best.id;
  }
  updateTargetLive();
}

function initTargetControls(){
  const mode=$('targetMode'),sel=$('targetSelect'),lock=$('targetLock'),btn=$('targetSetup');
  if(!mode)return;
  mode.onchange=()=>{targetState.mode=mode.value;targetState.ready=false;updateTargetLive();};
  sel.onchange=()=>{targetState.selected=sel.value;targetState.ready=true;updateTargetLive();};
  lock.onchange=()=>{targetState.locked=lock.checked;updateTargetLive();};
  btn.onclick=setupTarget;
  updateTargetLive();
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
  mouseWorld={x:wPos.x,y:wPos.y,active:true};
  updateHoverInfo(wPos,mx,my);

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
function initDraggablePanel(id,key){
const el=$(id);if(!el)return;const title=el.querySelector('.hover-title');if(!title)return;title.classList.add('drag-handle');let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
if(Number.isFinite(saved.x)&&Number.isFinite(saved.y)){el.style.left=saved.x+'px';el.style.top=saved.y+'px';el.style.right='auto'}
let drag=null;title.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,left:el.offsetLeft,top:el.offsetTop};title.setPointerCapture(e.pointerId)});
title.addEventListener('pointermove',e=>{if(!drag)return;const x=Math.max(0,Math.min(window.innerWidth-el.offsetWidth,drag.left+e.clientX-drag.x));const y=Math.max(0,Math.min(window.innerHeight-el.offsetHeight,drag.top+e.clientY-drag.y));el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto'});
title.addEventListener('pointerup',e=>{if(!drag)return;try{localStorage.setItem(key,JSON.stringify({x:el.offsetLeft,y:el.offsetTop}))}catch(err){}drag=null})}
function applySavedSettings(){
  let data={};
  try{data=JSON.parse(localStorage.getItem('atcx_settings')||'{}')}catch(e){data={}}
  if(!data || typeof data!=='object') return;

  Object.keys(data).forEach(id=>{
    const el=$(id);
    if(!el)return;
    if(el.type==='checkbox') el.checked=!!data[id];
    else el.value=data[id];
  });

  // Apply saved simulation values directly to the live model.
  Object.keys(S).forEach(key=>{
    if(data[key]===undefined) return;
    if(typeof S[key]==='boolean') S[key]=!!data[key];
    else if(typeof S[key]==='number'){
      const n=Number(data[key]);
      if(Number.isFinite(n)) S[key]=n;
    }else S[key]=data[key];
  });

  if(data.t1!==undefined) q[0]=Number(data.t1)*Math.PI/180;
  if(data.t2!==undefined) q[1]=Number(data.t2)*Math.PI/180;
  if(data.w1!==undefined) qd[0]=Number(data.w1)||0;
  if(data.w2!==undefined) qd[1]=Number(data.w2)||0;
  if(data.zoom!==undefined) zoom=Number(data.zoom)||1;
  if(data.camX!==undefined) camX=Number(data.camX)||0;
  if(data.camY!==undefined) camY=Number(data.camY)||0;
  if(data.trail!==undefined) trailLen=Number(data.trail)||0;

  if(data.targetMode!==undefined) targetState.mode=data.targetMode;
  if(data.targetSelect!==undefined) targetState.selected=data.targetSelect;
  if(data.targetLock!==undefined) targetState.locked=!!data.targetLock;

  if($('t1')) $('t1').value=Math.round(q[0]*180/Math.PI);
  if($('t2')) $('t2').value=Math.round(q[1]*180/Math.PI);
  if($('w1')) $('w1').value=qd[0];
  if($('w2')) $('w2').value=qd[1];
  if($('zoom')) $('zoom').value=zoom;
  if($('camX')) $('camX').value=camX;
  if($('camY')) $('camY').value=camY;
  if($('trail')) $('trail').value=trailLen;
}

function initSettingsButton(){const b=$('openSettings');if(b)b.onclick=()=>{location.href='settings.html'}}
applySavedSettings();initDraggablePanel("targetPanel","atcx_target_panel");initDraggablePanel("hoverInfo","atcx_hover_panel");initSettingsButton();

E0=detailedEnergy().E;
energyPrev=E0;
energyInitialAvailable=Math.max(0,detailedEnergy().available);

ui();
initPerformanceInfo();
initTargetControls();

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