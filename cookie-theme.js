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
  document.cookie=COOKIE+"="+encodeURIComponent(JSON.stringify({
    lang:v.lang||"vi",
    theme:v.theme||"dark",
    bg:v.bg||""
  }))+"; Max-Age="+DAY+"; Path=/; SameSite=Lax";
}
function delCookie(){document.cookie=COOKIE+"=; Max-Age=0; Path=/; SameSite=Lax"}
function hasConsent(){return localStorage.getItem(CONSENT)==="yes"}
function setConsent(v){localStorage.setItem(CONSENT,v?"yes":"no")}

const tr={
"⚙️ ATCX Settings":"⚙️ ATCX Settings",
"Điều khiển toàn bộ thông số của phòng thí nghiệm.":"Control all laboratory parameters.",
"← Phòng thí nghiệm":"← Laboratory",
"Áp dụng":"Apply",
"🎨 Giao diện":"🎨 Interface",
"Khôi phục mặc định":"Restore Defaults",
"🎨 Giao diện nhanh":"🎨 Quick Interface",
"×":"×",
"Ngôn ngữ":"Language",
"🇻🇳 Tiếng Việt":"🇻🇳 Vietnamese",
"🇬🇧 English":"🇬🇧 English",
"Chủ đề":"Theme",
"🌙 Tối":"🌙 Dark",
"☀️ Sáng":"☀️ Light",
"Ảnh nền URL":"Background URL",
"Hoặc chọn ảnh từ máy":"Or choose an image from your computer",
"Không ảnh nền":"No background",
"Phòng thí nghiệm":"Laboratory",
"Không gian":"Space",
"Cookie: —":"Cookie: —",
"🗑️ Xóa cookie":"🗑️ Delete cookie",
"Xem trước":"Preview",
"Lưu giao diện":"Save Interface",
"🍪 Dữ liệu cookie":"🍪 Cookie Data",
"Chỉ lưu ngôn ngữ, chủ đề sáng/tối và ảnh nền. Không lưu thông số mô phỏng bằng cookie.":"Only the language, light/dark theme, and background are stored. Simulation parameters are not stored in cookies.",
"🗑️ Xóa dữ liệu cookie":"🗑️ Delete cookie data",
"🍪 Hỏi lại về cookie":"🍪 Ask about cookies again",
"Khối lượng":"Mass",
"Kích thước":"Dimensions",
"Động lực học":"Dynamics",
"Mòn & vật liệu":"Wear & Materials",
"Môi trường":"Environment",
"Kích thích & lực":"Excitation & Forces",
"Camera & hiển thị":"Camera & Display",
"Thông số khác":"Other Parameters",
"Zoom":"Zoom",
"Camera X":"Camera X",
"Camera Y":"Camera Y",
"Lưới tọa độ chuẩn":"Standard coordinate grid",
"Vector vận tốc và gió":"Velocity and wind vectors",
"Nhãn vật lý các điểm khối lượng":"Physical labels for mass points",
"m₁ — vật 1":"m₁ — mass 1",
"m₂ — vật 2":"m₂ — mass 2",
"M₁ thanh — thanh 1":"M₁ rod — rod 1",
"M₂ thanh — thanh 2":"M₂ rod — rod 2",
"m₁ giữa — điểm giữa thanh 1":"m₁ midpoint — rod 1",
"m₂ giữa — điểm giữa thanh 2":"m₂ midpoint — rod 2",
"m₁ đầu — khối tập trung đầu thanh 1":"m₁ end — rod 1 end mass",
"m₂ đầu — khối tập trung đầu thanh 2":"m₂ end — rod 2 end mass",
"⚖️ Điều khiển khối lượng nâng cao":"⚖️ Advanced Mass Control",
"Tổng khối lượng 5 vị trí":"Total mass for 5 positions",
"Vị trí 1 — m₁":"Position 1 — m₁",
"Vị trí 2 — m₂":"Position 2 — m₂",
"Vị trí 3 — giữa thanh 1":"Position 3 — rod 1 midpoint",
"Vị trí 4 — giữa thanh 2":"Position 4 — rod 2 midpoint",
"Vị trí 5 — đầu thanh 1":"Position 5 — rod 1 end",
"⚖️ Chia đều tổng khối lượng cho 5 vị trí":"⚖️ Distribute total mass across 5 positions",
"✅ Áp dụng 5 giá trị vào mô hình":"✅ Apply 5 values to the model",
"Hình học & Cấu trúc":"Geometry & Structure",
"Điều kiện ban đầu":"Initial Conditions",
"Gia tốc trọng trường g":"Gravitational acceleration g",
"Trái Đất":"Earth",
"Mặt Trăng":"Moon",
"Sao Hỏa":"Mars",
"Mộc Tinh":"Jupiter",
"Không trọng lực":"Zero gravity",
"Vật liệu & Hao mòn ổ khớp":"Materials & Joint Wear",
"Chất liệu cấu tạo (Chịu lực ly tâm)":"Material (Centrifugal Resistance)",
"s1 - Vật liệu gốc (Tiêu chuẩn)":"s1 - Base Material (Standard)",
"s2 - Thép (Cứng, chịu ly tâm tốt)":"s2 - Steel (Hard, high centrifugal resistance)",
"s3 - Titanium (Rất cứng, siêu bền)":"s3 - Titanium (Very hard, ultra durable)",
"s4 - Sắt (Cứng trung bình)":"s4 - Iron (Medium hardness)",
"s5 - Dây thừng (Mềm, mòn/đứt nhanh)":"s5 - Rope (Soft, wears/breaks quickly)",
"Nhớt b₁":"Damping b₁",
"Nhớt b₂":"Damping b₂",
"Ma sát khô τ₁":"Dry friction τ₁",
"Ma sát khô τ₂":"Dry friction τ₂",
"Hệ số mòn cơ bản":"Base wear rate",
"🔬 Chế độ nghiên cứu":"🔬 Research Mode",
"Tốc độ mòn":"Wear speed",
"x1 Chuẩn":"x1 Normal",
"x5 Nhanh":"x5 Fast",
"x10 Tối đa":"x10 Maximum",
"Giới hạn giảm năng lượng":"Energy reduction limit",
"🚀 Tối ưu hiệu năng CPU/GPU":"🚀 CPU/GPU Performance Optimization",
"Đang phát hiện CPU/GPU...":"Detecting CPU/GPU...",
"Mức giảm năng lượng mỗi giây":"Energy reduction per second",
"Không khí & Gió động":"Air & Dynamic Wind",
"Nhiệt độ":"Temperature",
"Áp suất":"Pressure",
"Gió tĩnh":"Static wind",
"Hướng gió":"Wind direction",
"Gió giật":"Wind gust",
"Chu kỳ giật":"Gust period",
"Cd vật":"Mass Cd",
"Cd thanh":"Rod Cd",
"Cản không khí":"Air resistance",
"Bật gió":"Enable wind",
"Độ nhớt μ":"Viscosity μ",
"Mật độ chất lưu ρf":"Fluid density ρf",
"Lực đẩy Archimedes":"Buoyant force",
"Môi trường nâng cao & Rung":"Advanced Environment & Vibration",
"Hệ số ρ khí":"Air density factor",
"Hệ số nhớt môi trường":"Environment viscosity factor",
"Biên độ rung":"Vibration amplitude",
"Tần số rung":"Vibration frequency",
"Hướng rung":"Vibration direction",
"Lực ngoại vi (Ném/Đẩy)":"External Force (Throw/Push)",
"Lực F":"Force F",
"Hướng lực":"Force direction",
"Thời gian":"Duration",
"Tác dụng lên m₁":"Apply to m₁",
"Tác dụng lên m₂":"Apply to m₂",
"Tác dụng lực":"Force target",
"ĐIỀU KHIỂN MÔ PHỎNG":"SIMULATION CONTROL",
"Tốc độ thời gian":"Time speed",
"Vệt quỹ đạo":"Trajectory trail",
"Âm thanh mô phỏng":"Simulation sound",
"Độ mòn vô hạn — không đứt dây":"Infinite wear — rope never breaks",
"Tính cản không khí":"Air resistance",
"Lực nổi":"Buoyancy",
"Bật giảm năng lượng J/s":"Enable energy reduction J/s",
"Chế độ hiệu năng":"Performance mode",
"targetLock":"Target lock",
"gridOn":"Coordinate grid",
"vectors":"Velocity/wind vectors",
"labels":"Physical labels",
"Lựa chọn hệ thống":"System Selection",
"Tự thiết lập":"Auto setup",
"Chọn mục tiêu":"Choose target",
"m₁":"m₁",
"m₂":"m₂",
"Giữa thanh 1":"Rod 1 midpoint",
"Giữa thanh 2":"Rod 2 midpoint",
"Đầu thanh 1":"Rod 1 end",
"Đầu thanh 2":"Rod 2 end",
"Tác dụng lên m₁":"Apply to m₁",
"Tác dụng lên m₂":"Apply to m₂",
"Đã lưu Settings":"Settings saved",
"Khôi phục toàn bộ giá trị mặc định?":"Restore all default values?",
"Bạn chưa chấp nhận cookie":"You have not accepted cookies",
"Đã lưu giao diện":"Interface saved",
"Đã lưu giao diện vào cookie":"Interface saved to cookies",
"Đã xóa cookie giao diện":"Interface cookies deleted",
"Đã xóa dữ liệu cookie":"Cookie data deleted",
"Đã đặt lại yêu cầu đồng ý":"Cookie consent request reset",
"Đã chấp nhận":"Accepted",
"Chưa chấp nhận":"Not accepted",
"Cookie: ":"Cookie: ",
"Cookie: Đã chấp nhận":"Cookie: Accepted",
"Cookie: Chưa chấp nhận":"Cookie: Not accepted",
"Cookie: Đã xóa":"Cookie: Deleted",
"🍪 Dữ liệu cookie":"🍪 Cookie Data",
"Web chỉ dùng cookie để lưu ":"The website only uses cookies to store ",
"ngôn ngữ, giao diện sáng/tối và ảnh nền":"language, light/dark interface, and background",
". Bạn có thể xóa dữ liệu này bất cứ lúc nào trong Settings.":". You can delete this data at any time in Settings.",
"Không chấp nhận":"Decline",
"Chấp nhận":"Accept",
"Xem thêm →":"Learn more →"
};

function translate(lang){
  document.documentElement.lang=lang||"vi";
  const nodes=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    if(n.__atcxOriginal===undefined)n.__atcxOriginal=n.nodeValue;
    const original=n.__atcxOriginal;
    if(lang==="en" && tr[original]!==undefined)n.nodeValue=tr[original];
    else if(lang!=="en")n.nodeValue=original;
  });
  document.querySelectorAll("input[placeholder]").forEach(el=>{
    if(el.__atcxOriginalPlaceholder===undefined)el.__atcxOriginalPlaceholder=el.placeholder;
    if(lang==="en" && el.__atcxOriginalPlaceholder==="https://.../anh.jpg")el.placeholder="https://.../image.jpg";
    else if(lang!=="en")el.placeholder=el.__atcxOriginalPlaceholder;
  });
  document.querySelectorAll("option").forEach(el=>{
    if(el.__atcxOriginal===undefined)el.__atcxOriginal=el.textContent;
    const original=el.__atcxOriginal;
    if(lang==="en" && tr[original]!==undefined)el.textContent=tr[original];
    else if(lang!=="en")el.textContent=original;
  });
  window.dispatchEvent(new CustomEvent("atcx-language-change",{detail:{lang}}));
}

function prefs(){return readCookie()}
function apply(v){
  v=v||prefs();
  document.documentElement.dataset.theme=v.theme||"dark";
  document.body.dataset.theme=v.theme||"dark";
  document.documentElement.lang=v.lang||"vi";
  if(v.bg){
    const safe=String(v.bg).replace(/"/g,'\\"');
    document.documentElement.style.setProperty("--atcx-bg-image",'url("'+safe+'")');
    document.body.style.setProperty("--atcx-bg-image",'url("'+safe+'")');
    document.body.classList.add("atcx-custom-bg");
  }else{
    document.body.classList.remove("atcx-custom-bg");
    document.documentElement.style.removeProperty("--atcx-bg-image");
    document.body.style.removeProperty("--atcx-bg-image");
  }
  if(document.body)translate(v.lang||"vi");
}

function makeBanner(){
  if(hasConsent()||document.getElementById("atcx-cookie-banner"))return;
  const b=document.createElement("div");
  b.id="atcx-cookie-banner";
  b.innerHTML='<div><strong>🍪 Dữ liệu cookie</strong><p>Web chỉ dùng cookie để lưu <b>ngôn ngữ, giao diện sáng/tối và ảnh nền</b>. Bạn có thể xóa dữ liệu này bất cứ lúc nào trong Settings.</p><a class="atcx-cookie-more" href="cookie.html" target="_blank" rel="noopener noreferrer">Xem thêm →</a></div><div class="atcx-cookie-actions"><button id="atcx-cookie-no">Không chấp nhận</button><button id="atcx-cookie-yes">Chấp nhận</button></div>';
  document.body.appendChild(b);
  b.querySelector("#atcx-cookie-yes").onclick=()=>{setConsent(true);saveCookie(readCookie());b.remove()};
  b.querySelector("#atcx-cookie-no").onclick=()=>{setConsent(false);delCookie();b.remove()};
  if((readCookie().lang||"vi")==="en")translate("en");
}

window.ATCXCookie={
  read:readCookie,save:saveCookie,delete:delCookie,apply,hasConsent,setConsent,
  ask:makeBanner,translate
};
document.addEventListener("DOMContentLoaded",()=>{apply(readCookie());makeBanner()});
})();
