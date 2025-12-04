import{initializeApp as S}from"https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";import{getAuth as x,onAuthStateChanged as y,sendPasswordResetEmail as C,signOut as k,signInWithEmailAndPassword as D,createUserWithEmailAndPassword as R}from"https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";import{getFirestore as $,collection as w,query as b,orderBy as L,getDocs as v,doc as M,getDoc as P,setDoc as W,limit as B}from"https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";import{Loader as j}from"https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.2/+esm";const N=new j({apiKey:"AIzaSyBJzVaa2VGL0QBU-5R9hYKZTRBScwGnL5o",version:"weekly",libraries:["marker"],mapId:"3cac6ee76aa6116810dde040"});let h,f;const I={sw01:{position:{lat:49.25127479449927,lng:-123.0024951386435},name:"SW01"},sw02:{position:{lat:49.25009636123301,lng:-123.00274222112724},name:"SW02"},sw03:{position:{lat:49.25045666822442,lng:-123.00346817734105},name:"SW03"},sw05:{position:{lat:49.249769724464116,lng:-123.00266594285405},name:"SW05"},se12:{position:{lat:49.24993686765993,lng:-123.00158409787167},name:"SE12"},library:{position:{lat:49.24948329688611,lng:-123.00087181847898},name:"Library"},"tim hortons":{position:{lat:49.250385170857605,lng:-123.00185889695382},name:"Tim Hortons"},gymnasium:{position:{lat:49.248849177397794,lng:-123.00089677386947},name:"Gymnasium"}};function z(e){const t=new Date(e),n=(Date.now()-t.getTime())/1e3;if(n<60)return"just now";if(n<3600)return`${Math.floor(n/60)}m ago`;if(n<86400)return`${Math.floor(n/3600)}h ago`;const r=Math.floor(n/86400);return r===1?"1 day ago":`${r} days ago`}function F(e,t,n){if(n===1)return e;const r=t/n*Math.PI*2,o=1e-4;return{lat:e.lat+o*Math.cos(r),lng:e.lng+o*Math.sin(r)}}async function G(){f=await N.load(),h=new f.maps.Map(document.getElementById("map"),{center:{lat:49.2502,lng:-123.0018},zoom:16,mapId:"3cac6ee76aa6116810dde040"}),await U()}async function U(){const e=$(),t=w(e,"posts"),n=b(t,L("createdAt","desc")),r=await v(n),o={};r.forEach(i=>{const l=i.data(),s=(l.location||"").toLowerCase();I[s]&&(o[s]||(o[s]=[]),o[s].push(l))});for(const i in o){const l=o[i],s=I[i].position;l.forEach((a,c)=>{const m=F(s,c,l.length),p=`
        <div style="font-size:14px;">
          <b>${a.title}</b><br>
          ${a.location} — ${z(a.createdAt)}<br><br>
          ${a.description}<br><br>

          <a href="search.html" 
             style="
                background:#1e3a8a; 
                padding:6px 10px; 
                color:white; 
                border-radius:6px; 
                text-decoration:none;"
          >
            More Info
          </a>
        </div>
      `,H=new f.maps.InfoWindow({content:p}),E=new f.maps.marker.AdvancedMarkerElement({map:h,position:m,title:a.title});E.addListener("click",()=>{H.open({map:h,anchor:E}),confirm(`Open Google Maps directions to ${a.location}?`)&&window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`,"_blank")})})}}const O={apiKey:"AIzaSyCA7rXIeGG7iP181YWpPXfjjQjKemmWfyw",authDomain:"lostnfound-67ee0.firebaseapp.com",projectId:"lostnfound-67ee0",storageBucket:"lostnfound-67ee0.firebasestorage.app",messagingSenderId:"194790650701",appId:"1:194790650701:web:97d7fd597cb2350711bd04",measurementId:"G-LB257QGLV4"},T=S(O),d=x(T),u=$(T);function g(e,t){const n=document.getElementById(e);n&&(n.textContent=t)}function K(){const e=document.getElementById("nav-auth-links");e&&y(d,t=>{t?(e.innerHTML=`
        <a href="index.html">Home</a>
        <a href="main.html">Main</a>
        <button id="logout-btn" style="background:none; border:none; color:#d1d5db; cursor:pointer; font-size:16px; margin-left:20px;">
          Logout
        </button>
      `,document.getElementById("logout-btn").addEventListener("click",()=>{k(d).then(()=>{window.location.href="login.html"}).catch(r=>{console.error("Logout error:",r.message)})})):e.innerHTML=`
        <a href="index.html">Home</a>
        <a href="login.html">Login</a>
        <a href="signup.html">Sign Up</a>
      `})}function Y(e,t){return D(d,e,t)}function q(e,t){return R(d,e,t)}y(d,e=>{});document.addEventListener("DOMContentLoaded",()=>{K();const e=document.getElementById("login-form");e&&e.addEventListener("submit",s=>{s.preventDefault();const a=e.email.value,c=e.password.value;Y(a,c).then(()=>{g("message","Login successful!"),window.location.href="main.html"}).catch(m=>{g("message",`Login error: ${m.message}`)})});const t=document.getElementById("signup-form");t&&t.addEventListener("submit",s=>{s.preventDefault();const a=t.email.value,c=t.password.value;q(a,c).then(()=>{g("signup-message","Signup successful! You can now log in."),window.location.href="login.html"}).catch(m=>{g("signup-message",`Signup error: ${m.message}`)})});const n=document.getElementById("reset-password-form");n&&n.addEventListener("submit",s=>{s.preventDefault();const a=n["reset-email"].value;C(d,a).then(()=>{g("reset-message","Password reset email sent! Check your inbox.")}).catch(c=>{g("reset-message",`Error: ${c.message}`)})});const r=document.getElementById("logout-btn");r&&r.addEventListener("click",()=>{k(d).then(()=>{window.location.href="login.html"}).catch(s=>{console.error("Logout error:",s.message)})});const o=document.getElementById("notifications-toggle"),i=document.getElementById("status-message");o&&i&&(o.disabled=!0,y(d,async s=>{if(!s){window.location.href="login.html";return}try{const a=M(u,"users",s.uid,"notificationSettings","preferences"),c=await P(a);c.exists()?o.checked=c.data().enableNotifications||!1:o.checked=!1}catch(a){i.style.color="red",i.textContent="Error loading settings.",console.error(a)}finally{o.disabled=!1}}),o.addEventListener("change",async()=>{if(o.disabled)return;o.disabled=!0;const s=d.currentUser;if(!s){alert("You must be logged in to change notification settings."),o.checked=!o.checked,o.disabled=!1;return}try{const a=M(u,"users",s.uid,"notificationSettings","preferences");await W(a,{enableNotifications:o.checked}),o.checked&&alert("You have enabled notifications for this site."),i.style.color="#1e3a8a",i.textContent="Notification settings updated."}catch(a){alert("Failed to save settings. Please try again."),o.checked=!o.checked,i.style.color="red",i.textContent="Error saving settings.",console.error(a)}finally{o.disabled=!1}})),document.getElementById("recent-activity")&&Q(),V()});function A(e){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const n=(Date.now()-t.getTime())/1e3;if(n<60)return"just now";if(n<3600)return`${Math.floor(n/60)}m ago`;if(n<86400)return`${Math.floor(n/3600)}h ago`;const r=Math.floor(n/86400);return r===1?"1 day ago":r<7?`${r} days ago`:t.toLocaleDateString()}async function Q(){const e=document.getElementById("recent-activity");if(e){e.innerHTML=`
    <li>
      <span class="dot"></span>
      <div>Loading posts...</div>
    </li>
  `;try{const t=w(u,"posts"),n=b(t,L("createdAt","desc"),B(5)),r=await v(n);if(r.empty){e.innerHTML=`
        <li>
          <span class="dot"></span>
          <div>No posts yet. Be the first to make one.</div>
        </li>
      `;return}e.innerHTML="",r.forEach(o=>{const i=o.data(),l=i.title||"Untitled",s=i.description||"",a=i.location||"Unknown",c=i.category||"Other",m=A(i.createdAt);e.insertAdjacentHTML("beforeend",`
          <li>
            <span class="dot"></span>
            <div>
              <strong>${l}</strong><br>
              <span style="color:#64748b; font-size:0.9rem;">
                ${a} · ${c} · ${m}
              </span><br>
              <span>${s}</span>
            </div>
          </li>
        `)})}catch(t){console.error("Error loading recent posts:",t),e.innerHTML=`
      <li>
        <span class="dot"></span>
        <div style="color:#b91c1c;">Could not load posts. Try again later.</div>
      </li>
    `}}}async function V(){const e=document.getElementById("auto-cards");if(e){e.innerHTML='<p style="color:#64748b;">Loading...</p>';try{const t=w(u,"posts"),n=b(t,L("createdAt","desc"),B(3)),r=await v(n);if(r.empty){e.innerHTML='<p style="color:#64748b;">No recent items.</p>';return}e.innerHTML="",r.forEach(o=>{const i=o.data(),l=i.title||"Untitled Item",s=i.description||"",a=i.location||"Unknown",c=i.category||"Other",m=A(i.createdAt),p=`
        <div class="info-card" data-location="${a.toLowerCase()}">
          <h3>📍 ${l} • ${a}</h3>
          <p>${s}</p>
          <a href="search.html" class="btn more-info-btn">More Info</a>
        </div>
      `;e.insertAdjacentHTML("beforeend",p)})}catch(t){console.error("Card load error:",t),e.innerHTML='<p style="color:#b91c1c;">Failed to load cards.</p>'}}}window.addEventListener("DOMContentLoaded",()=>{G()});
