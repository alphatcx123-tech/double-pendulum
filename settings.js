const fieldData={"Khối lượng": ["m1", "m2", "MR1", "MR2", "m1Mid", "m2Mid", "m1End", "m2End", "totalMass", "massPart1", "massPart2", "massPart3", "massPart4", "massPart5"],


"Kích thước": ["L1", "L2", "d1", "d2", "r1", "r2", "t1", "t2"],


"Động lực học": ["g", "b1", "b2", "f1", "f2", "speed", "force", "forceAng", "forceDur"],


"Mòn & vật liệu": ["wearRate", "wearSpeed", "maxEnergyDrop"],


"Môi trường": ["temp", "press", "wind", "windAng", "gust", "gustP", "cd", "rodCd", "visc", "fluidRho", "airRhoFactor", "fluidViscFactor"],


"Kích thích & lực": ["supAmp", "supFreq", "supAng"],


"Camera & hiển thị": ["zoom", "camX", "camY", "trail"],


"Thông số khác": ["w1", "w2"]},
checkData=[["targetLock", false],


["soundOn", true],


["infiniteWear", false],


["gridOn", true],


["vectors", true],


["labels", true],


["maxEnergyDropOn", false],


["performanceMode", true],


["air", true],


["windOn", false],


["buoy", false]],
selectData=[["targetMode", [["auto", "Tự thiết lập"], ["manual", "Chọn mục tiêu"]]],


["targetSelect", [["m1", "m₁"], ["m2", "m₂"], ["m1Mid", "Giữa thanh 1"], ["m2Mid", "Giữa thanh 2"], ["m1End", "Đầu thanh 1"], ["m2End", "Đầu thanh 2"]]],


["material", [["s1", "s1 - Vật liệu gốc (Tiêu chuẩn)"], ["s2", "s2 - Thép (Cứng, chịu ly tâm tốt)"], ["s3", "s3 - Titanium (Rất cứng, siêu bền)"], ["s4", "s4 - Sắt (Cứng trung bình)"], ["s5", "s5 - Dây thừng (Mềm, mòn/đứt nhanh)"]]],


["forceBody", [["1", "Tác dụng lên m₁"], ["2", "Tác dụng lên m₂"]]]],
labels={"zoom": "Zoom",


"camX": "Camera X",


"camY": "Camera Y",


"m1": "m₁ — vật 1",


"m2": "m₂ — vật 2",


"MR1": "M₁ thanh — thanh 1",


"MR2": "M₂ thanh — thanh 2",


"m1Mid": "m₁ giữa — điểm giữa thanh 1",


"m2Mid": "m₂ giữa — điểm giữa thanh 2",


"m1End": "m₁ đầu — khối tập trung đầu thanh 1",


"m2End": "m₂ đầu — khối tập trung đầu thanh 2",


"totalMass": "Tổng khối lượng 5 vị trí",


"massPart1": "Vị trí 1 — m₁",


"massPart2": "Vị trí 2 — m₂",


"massPart3": "Vị trí 3 — giữa thanh 1",


"massPart4": "Vị trí 4 — giữa thanh 2",


"massPart5": "Vị trí 5 — đầu thanh 1",


"L1": "Độ dài thanh 1 — L₁",


"L2": "Độ dài thanh 2 — L₂",


"d1": "Đường kính thanh d₁",


"d2": "Đường kính thanh d₂",


"r1": "Bán kính vật r₁",


"r2": "Bán kính vật r₂",


"t1": "θ₁",


"t2": "θ₂",


"w1": "ω₁",


"w2": "ω₂",


"g": "Gia tốc trọng trường g",


"b1": "Nhớt b₁",


"b2": "Nhớt b₂",


"f1": "Ma sát khô τ₁",


"f2": "Ma sát khô τ₂",


"wearRate": "Hệ số mòn cơ bản",


"wearSpeed": "Tốc độ mòn",


"maxEnergyDrop": "Giới hạn giảm năng lượng",


"temp": "Nhiệt độ",


"press": "Áp suất",


"wind": "Gió tĩnh",


"windAng": "Hướng gió",


"gust": "Gió giật",


"gustP": "Chu kỳ giật",


"cd": "Cd vật",


"rodCd": "Cd thanh",


"visc": "Độ nhớt μ",


"fluidRho": "Mật độ chất lưu ρf",


"airRhoFactor": "Hệ số ρ khí",


"fluidViscFactor": "Hệ số nhớt môi trường",


"supAmp": "Biên độ rung",


"supFreq": "Tần số rung",


"supAng": "Hướng rung",


"force": "Lực F",


"forceAng": "Hướng lực",


"forceDur": "Thời gian",


"speed": "Tốc độ thời gian",


"trail": "Vệt quỹ đạo"},
fieldMap={"zoom": {"min": ".25", "max": "40", "step": ".01", "value": "1"},


"camX": {"min": "-100", "max": "100", "step": ".01", "value": "0"},


"camY": {"min": "-100", "max": "100", "step": ".01", "value": "0"},


"m1": {"min": "0.1", "max": "2000", "step": ".01", "value": "1"},


"m2": {"min": "0.1", "max": "2000", "step": ".01", "value": "1"},


"MR1": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"MR2": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"m1Mid": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"m2Mid": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"m1End": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"m2End": {"min": "0", "max": "2000", "step": ".01", "value": "0"},


"totalMass": {"min": "0", "max": "10000", "step": "0.01", "value": "2000"},


"massPart1": {"min": "0", "max": "2000", "step": "0.01", "value": "400"},


"massPart2": {"min": "0", "max": "2000", "step": "0.01", "value": "400"},


"massPart3": {"min": "0", "max": "2000", "step": "0.01", "value": "400"},


"massPart4": {"min": "0", "max": "2000", "step": "0.01", "value": "400"},


"massPart5": {"min": "0", "max": "2000", "step": "0.01", "value": "400"},


"L1": {"min": ".1", "max": "20", "step": ".01", "value": "1"},


"L2": {"min": ".1", "max": "20", "step": ".01", "value": "1"},


"d1": {"min": "0.02", "max": "20", "step": ".001", "value": ".02"},


"d2": {"min": "0.02", "max": "20", "step": ".001", "value": ".02"},


"r1": {"min": ".001", "max": "40", "step": ".001", "value": ".08"},


"r2": {"min": ".001", "max": "40", "step": ".001", "value": ".08"},


"t1": {"min": "-1800", "max": "360", "step": "1", "value": "90"},


"t2": {"min": "-1800", "max": "360", "step": "1", "value": "90"},


"w1": {"min": "-200", "max": "2000", "step": ".1", "value": "0"},


"w2": {"min": "-200", "max": "2000", "step": ".1", "value": "0"},


"g": {"min": "0", "max": "200", "step": ".01", "value": "9.81"},


"b1": {"min": "0", "max": "100", "step": ".001", "value": ".02"},


"b2": {"min": "0", "max": "100", "step": ".001", "value": ".02"},


"f1": {"min": "0", "max": "50", "step": ".001", "value": ".005"},


"f2": {"min": "0", "max": "50", "step": ".001", "value": ".005"},


"wearRate": {"min": "0", "max": "0.1", "step": ".000001", "value": ".00001"},


"wearSpeed": {"min": "1", "max": "10", "step": ".1", "value": "1"},


"maxEnergyDrop": {"min": "1", "max": "10000", "step": "1", "value": "1000"},


"temp": {"min": "-200", "max": "500", "step": "1", "value": "20"},


"press": {"min": "30000", "max": "120000", "step": "100", "value": "101325"},


"wind": {"min": "0", "max": "500", "step": ".1", "value": "0"},


"windAng": {"min": "0", "max": "360", "step": "1", "value": "0"},


"gust": {"min": "0", "max": "3000", "step": ".1", "value": "0"},


"gustP": {"min": "2", "max": "2000", "step": ".1", "value": "3"},


"cd": {"min": "0", "max": "200", "step": ".01", "value": ".47"},


"rodCd": {"min": "0", "max": "200", "step": ".01", "value": "1.2"},


"visc": {"min": "0", "max": "2", "step": ".000001", "value": ".000018"},


"fluidRho": {"min": "0", "max": "20000", "step": "1", "value": "1.225"},


"airRhoFactor": {"min": "0", "max": "10", "step": ".01", "value": "1"},


"fluidViscFactor": {"min": "0", "max": "10", "step": ".01", "value": "1"},


"supAmp": {"min": "0", "max": "50", "step": ".001", "value": "0"},


"supFreq": {"min": "1", "max": "2000", "step": ".1", "value": "1"},


"supAng": {"min": "0", "max": "360", "step": "1", "value": "0"},


"force": {"min": "0", "max": "30000", "step": ".1", "value": "0"},


"forceAng": {"min": "0", "max": "360", "step": "1", "value": "0"},


"forceDur": {"min": "0.1", "max": "1000", "step": ".01", "value": ".2"},


"speed": {"min": "1", "max": "500", "step": ".1", "value": "1"},


"trail": {"min": "0", "max": "1000000", "step": "1", "value": "2"}},
checkLabels={"soundOn": "Âm thanh mô phỏng",


"infiniteWear": "Độ mòn vô hạn — không đứt dây",


"air": "Tính cản không khí",


"windOn": "Bật gió",


"buoy": "Lực nổi",


"maxEnergyDropOn": "Bật giảm năng lượng J/s",


"performanceMode": "Chế độ hiệu năng",


"targetLock": "targetLock",


"gridOn": "gridOn",


"vectors": "vectors",


"labels": "labels"},
defaults={"zoom": "1",


"camX": "0",


"camY": "0",


"m1": "1",


"m2": "1",


"MR1": "0",


"MR2": "0",


"m1Mid": "0",


"m2Mid": "0",


"m1End": "0",


"m2End": "0",


"totalMass": "2000",


"massPart1": "400",


"massPart2": "400",


"massPart3": "400",


"massPart4": "400",


"massPart5": "400",


"L1": "1",


"L2": "1",


"d1": ".02",


"d2": ".02",


"r1": ".08",


"r2": ".08",


"t1": "90",


"t2": "90",


"w1": "0",


"w2": "0",


"g": "9.81",


"b1": ".02",


"b2": ".02",


"f1": ".005",


"f2": ".005",


"wearRate": ".00001",


"wearSpeed": "1",


"maxEnergyDrop": "1000",


"temp": "20",


"press": "101325",


"wind": "0",


"windAng": "0",


"gust": "0",


"gustP": "3",


"cd": ".47",


"rodCd": "1.2",


"visc": ".000018",


"fluidRho": "1.225",


"airRhoFactor": "1",


"fluidViscFactor": "1",


"supAmp": "0",


"supFreq": "1",


"supAng": "0",


"force": "0",


"forceAng": "0",


"forceDur": ".2",


"speed": "1",


"trail": "2",


"targetLock": false,


"soundOn": true,


"infiniteWear": false,


"gridOn": true,


"vectors": true,


"labels": true,


"maxEnergyDropOn": false,


"performanceMode": true,


"air": true,


"windOn": false,


"buoy": false},
saved=JSON.parse(localStorage.getItem("atcx_settings")||"{}");
const root=document.getElementById("settings");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));
const val=id=>saved[id]!==undefined?saved[id]:defaults[id];

function build(){
  root.innerHTML='';
  Object.entries(fieldData).forEach(([cat,ids])=>{
    if(!ids.length)return;
    const c=document.createElement('section');
    c.className='card';
    c.innerHTML='<h2>'+esc(cat)+'</h2>';
    ids.forEach(id=>{
      const f=fieldMap[id];
      const v=val(id);
      const r=document.createElement('div');
      r.className='row';
      r.innerHTML='<div><div class="name">'+esc(labels[id]||id)+'</div><div class="desc">'+f.min+' → '+f.max+' · bước '+f.step+'</div></div><div class="control"><input class="range" data-id="'+id+'" type="range" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" value="'+v+'"><input class="num" data-id="'+id+'" type="number" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" value="'+v+'"></div>';
      c.appendChild(r);
    });
    root.appendChild(c);
  });

  const t=document.createElement('section');
  t.className='card';
  t.innerHTML='<h2>Chế độ & công tắc</h2>';
  checkData.forEach(([id,d])=>{
    const v=saved[id]!==undefined?saved[id]:d;
    const l=document.createElement('label');
    l.className='checkrow';
    l.innerHTML='<input type="checkbox" data-check="'+id+'" '+(v?'checked':'')+'><span>'+esc(checkLabels[id])+'</span>';
    t.appendChild(l);
  });
  root.appendChild(t);

  const s=document.createElement('section');
  s.className='card';
  s.innerHTML='<h2>Lựa chọn hệ thống</h2>';
  selectData.forEach(([id,opts])=>{
    const w=document.createElement('div');
    w.className='row';
    w.innerHTML='<div class="name">'+esc(id)+'</div><select class="select" data-select="'+id+'">'+opts.map(o=>'<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>').join('')+'</select>';
    w.querySelector('select').value=saved[id]!==undefined?saved[id]:opts[0][0];
    s.appendChild(w);
  });
  root.appendChild(s);
  bind();
  if(window.ATCXCookie){
    window.ATCXCookie.translate((window.ATCXCookie.read()||{}).lang||"vi");
  }
}

function bind(){
  root.querySelectorAll('.range').forEach(r=>r.oninput=()=>{
    const n=root.querySelector('.num[data-id="'+r.dataset.id+'"]');
    n.value=r.value;
  });
  root.querySelectorAll('.num').forEach(n=>n.oninput=()=>{
    const r=root.querySelector('.range[data-id="'+n.dataset.id+'"]');
    if(n.value!==''){
      r.value=Math.max(+r.min,Math.min(+r.max,+n.value));
    }
  });
}

function collect(){
  const o={};
  root.querySelectorAll('.range').forEach(r=>o[r.dataset.id]=r.value);
  root.querySelectorAll('[data-check]').forEach(c=>o[c.dataset.check]=c.checked);
  root.querySelectorAll('[data-select]').forEach(s=>o[s.dataset.select]=s.value);
  return o;
}

function toast(m){
  const t=document.getElementById('toast');
  t.textContent=m;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),1600);
}

document.getElementById('apply').onclick=()=>{
  const data=collect();
  localStorage.setItem('atcx_settings',JSON.stringify(data));
  try{
    if(window.ATCXSettings)window.ATCXSettings.save(data);
  }catch(e){}
  toast('Đã lưu Settings');
};

document.getElementById('back').onclick=()=>location.href='index.html';

document.getElementById('reset').onclick=()=>{
  if(confirm('Khôi phục toàn bộ giá trị mặc định?')){
    localStorage.removeItem('atcx_settings');
    location.reload();
  }
};

build();

(function(){
  const btn=document.getElementById("quickUI");
  const panel=document.getElementById("quickUIPanel");
  const close=document.getElementById("quickUIClose");
  const qLang=document.getElementById("quickLang");
  const qTheme=document.getElementById("quickTheme");
  const qBg=document.getElementById("quickBg");
  const qState=document.getElementById("quickCookieState");

  if(!btn||!panel)return;

  function read(){
    return window.ATCXCookie?ATCXCookie.read():{};
  }

  function sync(){
    const v=read();
    qLang.value=v.lang||"vi";
    qTheme.value=v.theme||"dark";
    qBg.value=v.bg&&/^https?:/i.test(v.bg)?v.bg:"";
    qState.textContent="Cookie: "+(
      window.ATCXCookie&&ATCXCookie.hasConsent()
        ?"Đã chấp nhận"
        :"Chưa chấp nhận"
    );
  }

  function preview(){
    const v={
      lang:qLang.value,
      theme:qTheme.value,
      bg:qBg.value.trim()
    };
    if(window.ATCXCookie)window.ATCXCookie.apply(v);
  }

  function save(){
    const v={
      lang:qLang.value,
      theme:qTheme.value,
      bg:qBg.value.trim()
    };
    if(window.ATCXCookie)window.ATCXCookie.save(v);
    if(window.ATCXCookie)window.ATCXCookie.apply(v);
    qState.textContent=window.ATCXCookie&&window.ATCXCookie.hasConsent()
      ?"Cookie: Đã chấp nhận"
      :"Cookie: Chưa chấp nhận";
    toast("Đã lưu giao diện");
  }

  btn.onclick=()=>{
    sync();
    panel.classList.toggle("open");
    panel.setAttribute(
      "aria-hidden",
      String(!panel.classList.contains("open"))
    );
  };

  close.onclick=()=>{
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden","true");
  };

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape")close.click();
  });

  qLang.onchange=preview;
  qTheme.onchange=preview;
  qBg.oninput=preview;

  document.querySelectorAll("[data-quick-bg]").forEach(b=>{
    b.onclick=()=>{
      qBg.value=b.dataset.quickBg;
      preview();
    };
  });

  document.getElementById("quickPreview").onclick=preview;
  document.getElementById("quickSave").onclick=save;

  document.getElementById("quickCookieDelete").onclick=()=>{
    if(window.ATCXCookie){
      ATCXCookie.delete();
      ATCXCookie.setConsent(false);
      qState.textContent="Cookie: Đã xóa";
      toast("Đã xóa dữ liệu cookie");
    }
  };

  sync();
})();

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('a[data-page-transition]').forEach(a=>{
    a.addEventListener('click',e=>{
      const url=a.href;
      if(!url||url.startsWith('javascript:')||a.target==='_blank')return;
      e.preventDefault();
      document.body.classList.add('atcx-page-leaving');
      setTimeout(()=>{window.location.href=url},280);
    });
  });
});
