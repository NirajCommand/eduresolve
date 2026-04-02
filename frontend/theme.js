(function(){
  function applyTheme(){
    var saved=localStorage.getItem("theme");
    if(saved==="light"){
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }else{
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    }
    var btn=document.getElementById("modeBtn");
    if(btn){
      var icon=btn.querySelector("i");
      if(icon){
        icon.className=document.body.classList.contains("dark-mode")
          ?"fa-solid fa-moon"
          :"fa-solid fa-sun";
      }
    }
  }
  function toggleTheme(){
    if(document.body.classList.contains("dark-mode")){
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme","light");
    }else{
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme","dark");
    }
    var btn=document.getElementById("modeBtn");
    if(btn){
      var icon=btn.querySelector("i");
      if(icon){
        icon.className=document.body.classList.contains("dark-mode")
          ?"fa-solid fa-moon"
          :"fa-solid fa-sun";
      }
    }
  }
  document.addEventListener("DOMContentLoaded",function(){
    applyTheme();
    var btn=document.getElementById("modeBtn");
    if(btn){
      btn.addEventListener("click",toggleTheme);
    }
  });
})();
