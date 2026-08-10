(function(){
"use strict";

const $=id=>document.getElementById(id);
const lang=$("uiLang");
const theme=$("uiTheme");
const bg=$("uiBg");
const bgFile=$("uiBgFile");
const previewBtn=$("uiPreview");
const saveBtn=$("uiSave");
const cookieState=$("cookieState");
const cookieDelete=$("cookieDelete");
const cookieReask=$("cookieReask");

function toast(message){
    const t=$("toast");
    if(!t)return;
    t.textContent=message;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer=setTimeout(()=>t.classList.remove("show"),1800);
}

function cookie(){
    return window.ATCXCookie||null;
}

function read(){
    const c=cookie();
    return c?c.read():{};
}

function updateState(text){
    if(cookieState)cookieState.textContent=text;
}

function loadValues(){
    const p=read();
    if(lang)lang.value=p.lang||"vi";
    if(theme)theme.value=p.theme||"dark";
    if(bg)bg.value=(p.bg&&/^https?:/i.test(p.bg))?p.bg:"";
    const c=cookie();
    updateState(c&&c.hasConsent()?"Đã chấp nhận cookie":"Chưa chấp nhận cookie");
}

function values(){
    return{
        lang:lang?lang.value:"vi",
        theme:theme?theme.value:"dark",
        bg:bg?bg.value.trim():""
    };
}

function preview(){
    const c=cookie();
    if(c)c.apply(values());
}

function save(){
    const c=cookie();
    if(!c){
        toast("Không tìm thấy hệ thống cookie");
        return;
    }
    if(!c.hasConsent()){
        c.ask();
        toast("Hãy chấp nhận cookie trước khi lưu");
        return;
    }
    const v=values();
    c.save(v);
    c.apply(v);
    updateState("Đã chấp nhận cookie");
    toast("Đã lưu giao diện vào cookie");
}

if(lang)lang.addEventListener("change",preview);
if(theme)theme.addEventListener("change",preview);
if(bg)bg.addEventListener("input",preview);

if(bgFile){
    bgFile.addEventListener("change",()=>{
        const file=bgFile.files&&bgFile.files[0];
        if(!file)return;
        if(!file.type.startsWith("image/")){
            toast("Vui lòng chọn file ảnh");
            bgFile.value="";
            return;
        }
        const reader=new FileReader();
        reader.onload=()=>{
            if(bg)bg.value=reader.result;
            preview();
            toast("Đã xem trước ảnh nền");
        };
        reader.readAsDataURL(file);
    });
}

document.querySelectorAll("[data-bg]").forEach(button=>{
    button.addEventListener("click",()=>{
        if(bg)bg.value=button.dataset.bg||"";
        preview();
    });
});

if(previewBtn)previewBtn.addEventListener("click",()=>{
    preview();
    toast("Đã áp dụng xem trước");
});

if(saveBtn)saveBtn.addEventListener("click",save);

if(cookieDelete){
    cookieDelete.addEventListener("click",()=>{
        const c=cookie();
        if(!c)return;
        c.delete();
        c.setConsent(false);
        updateState("Đã xóa dữ liệu cookie");
        toast("Đã xóa cookie giao diện");
    });
}

if(cookieReask){
    cookieReask.addEventListener("click",()=>{
        const c=cookie();
        if(!c)return;
        c.setConsent(false);
        c.ask();
        updateState("Đã đặt lại yêu cầu đồng ý");
    });
}

loadValues();
})();
