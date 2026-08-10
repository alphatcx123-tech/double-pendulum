
(function(){
const COOKIE="atcx_preferences";
const CONSENT="atcx_cookie_consent";
const DAY=60*60*24*365;
function readCookie(){
  const m=document.cookie.match(new RegExp("(?:^|; )"+COOKIE.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"=([^;]*)"));
  if(!m)return {};
  try{return JSON.parse(decodeURIComponent(m[1]))||{}}catch(e){return {}}
}
function saveCookie(v){
  document.cookie=COOKIE+"="+encodeURIComponent(JSON.stringify({lang:v.lang||"vi",theme:v.theme||"dark",bg:v.bg||""}))+"; Max-Age="+DAY+"; Path=/; SameSite=Lax";
}
function delCookie(){document.cookie=COOKIE+"=; Max-Age=0; Path=/; SameSite=Lax"}
function hasConsent(){return localStorage.getItem(CONSENT)==="yes"}
function setConsent(v){localStorage.setItem(CONSENT,v?"yes":"no")}
function prefs(){return readCookie()}
function apply(v){
  v=v||prefs();
  document.documentElement.dataset.theme=v.theme||"dark";
  document.body.dataset.theme=v.theme||"dark";
  document.documentElement.lang=v.lang||"vi";
  if(v.bg){
    document.documentElement.style.setProperty("--atcx-bg-image",'url("'+String(v.bg).replace(/"/g,'\\"')+'")');
    document.body.style.setProperty("--atcx-bg-image",'url("'+String(v.bg).replace(/"/g,'\\"')+'")');
    document.body.classList.add("atcx-custom-bg");
  }else{
    document.body.classList.remove("atcx-custom-bg");
    document.documentElement.style.removeProperty("--atcx-bg-image");
  }
  translate(v.lang||"vi");
}
const tr={
  en:{
    "Con lắc kép — Phòng thí nghiệm động lực học nâng cao":"Double Pendulum — Advanced Dynamics Laboratory",
    "Phòng thí nghiệm động lực học — mô hình cơ học Lagrange + RK4":"Dynamics Laboratory — Lagrangian Mechanics + RK4",
    "ÂM THANH & TÍNH NĂNG THỰC TẾ":"SOUND & REALISTIC FEATURES",
    "CAMERA & QUAN SÁT":"CAMERA & OBSERVATION",
    "THÔNG SỐ KHỐI LƯỢNG — CHỈNH CHÍNH XÁC":"MASS PARAMETERS — PRECISION CONTROL",
    "BẢNG ĐO LƯỜNG NĂNG LƯỢNG":"ENERGY MEASUREMENT",
    "CẢM BIẾN ĐỘNG LỰC HỌC CHI TIẾT":"DETAILED DYNAMICS SENSORS",
    "Nhận diện rê chuột":"Mouse Hover Detection",
    "Theo dõi mục tiêu":"Target Tracking",
    "Mục tiêu":"Target",
    "Tự thiết lập":"Auto setup",
    "Chọn mục tiêu":"Choose target",
    "Đang dao động":"Oscillating",
    "Tạm dừng":"Pause",
    "Reset hệ thống":"Reset system",
    "Mở bảng Settings":"Open Settings"
  },
  vi:{}
};
function translate(lang){
  if(lang!=="en")return;
  const map=tr.en;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const t=n.nodeValue.trim();
    if(map[t]) n.nodeValue=n.nodeValue.replace(t,map[t]);
  });
}
function makeBanner(){
  if(hasConsent()||document.getElementById("atcx-cookie-banner"))return;
  const b=document.createElement("div"); b.id="atcx-cookie-banner";
  b.innerHTML='<div><strong>🍪 Dữ liệu cookie</strong><p>Web chỉ dùng cookie để lưu <b>ngôn ngữ, giao diện sáng/tối và ảnh nền</b>. Bạn có thể xóa dữ liệu này bất cứ lúc nào trong Settings.</p></div><div class="atcx-cookie-actions"><button id="atcx-cookie-no">Không chấp nhận</button><button id="atcx-cookie-yes">Chấp nhận</button></div>';
  document.body.appendChild(b);
  b.querySelector("#atcx-cookie-yes").onclick=()=>{setConsent(true);saveCookie(readCookie());b.remove()};
  b.querySelector("#atcx-cookie-no").onclick=()=>{setConsent(false);delCookie();b.remove()};
}
window.ATCXCookie={
  read:readCookie,save:saveCookie,delete:delCookie,apply,hasConsent,setConsent,
  ask:makeBanner
};
document.addEventListener("DOMContentLoaded",()=>{apply(readCookie());makeBanner()});
})();
