
(function(){
function current(){return window.ATCXCookie?ATCXCookie.read():{}}
function setValues(){
 const p=current();
 uiLang.value=p.lang||"vi";uiTheme.value=p.theme||"dark";uiBg.value=p.bg&&/^https?:/i.test(p.bg)?p.bg:"";
 cookieState.textContent=ATCXCookie&&ATCXCookie.hasConsent()?"Đã chấp nhận cookie":"Chưa chấp nhận cookie";
}
function applyPreview(){
 const v={lang:uiLang.value,theme:uiTheme.value,bg:uiBg.value.trim()};
 ATCXCookie.apply(v);
}
function save(){
 const v={lang:uiLang.value,theme:uiTheme.value,bg:uiBg.value.trim()};
 ATCXCookie.save(v);
 ATCXCookie.apply(v);
 toast(ATCXCookie.hasConsent()?"Đã lưu giao diện vào cookie":"Đã lưu giao diện");
}
uiLang.onchange=applyPreview;uiTheme.onchange=applyPreview;uiBg.oninput=applyPreview;
uiBgFile.onchange=()=>{
 const f=uiBgFile.files&&uiBgFile.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{uiBg.value=r.result;applyPreview()};r.readAsDataURL(f);
};
document.querySelectorAll("[data-bg]").forEach(b=>b.onclick=()=>{uiBg.value=b.dataset.bg;applyPreview()});
uiPreview.onclick=applyPreview;
uiSave.onclick=save;
cookieDelete.onclick=()=>{ATCXCookie.delete();ATCXCookie.setConsent(false);cookieState.textContent="Đã xóa dữ liệu cookie";toast("Đã xóa cookie giao diện")};
cookieReask.onclick=()=>{ATCXCookie.setConsent(false);ATCXCookie.ask();cookieState.textContent="Đã đặt lại yêu cầu đồng ý"};
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
setValues();
})();
