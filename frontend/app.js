const API="http://127.0.0.1:5000";
const titles={dashboard:"Compliance Dashboard",scan:"Scan Product",history:"Inspection History",reports:"Reports",rules:"Compliance Rules"};
const views=document.querySelectorAll(".view");
function showView(id){views.forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===id));document.getElementById("pageTitle").textContent=titles[id];if(id==="history")loadHistory();}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.getElementById("newScan").onclick=()=>showView("scan");
document.getElementById("dashboardScan").onclick=()=>showView("scan");
const input=document.getElementById("fileInput"), choose=document.getElementById("chooseFile"), analyze=document.getElementById("analyzeBtn");
choose.onclick=()=>input.click();
input.onchange=()=>{if(input.files[0]){document.getElementById("fileName").textContent=input.files[0].name;analyze.disabled=false;}};
analyze.onclick=async()=>{
  if(!input.files[0])return;
  const status=document.getElementById("scanStatus");status.textContent="Analyzing...";
  analyze.disabled=true;
  const form=new FormData();form.append("image",input.files[0]);
  try{
    const res=await fetch(API+"/api/scan",{method:"POST",body:form});const data=await res.json();
    renderResult(data);status.textContent="Analysis complete.";loadDashboard();
  }catch(e){status.textContent="Backend unavailable. Start Flask with: python app.py";analyze.disabled=false;}
};
function renderResult(d){
  document.getElementById("analysisResult").innerHTML=`<div class="result"><b>Prototype compliance result</b><div class="result-grid">
  <div class="mini"><b>Status</b><br><span class="${d.status==="Compliant"?"green":"red"}">${d.status}</span></div>
  <div class="mini"><b>Score</b><br>${d.score}%</div>
  <div class="mini"><b>Detected declarations</b><br>${d.detected}/${d.total}</div></div>
  <div style="margin-top:14px;font-size:13px;color:#687386">${d.message}</div></div>`;
}
async function loadDashboard(){
  try{const d=await fetch(API+"/api/inspections").then(r=>r.json());document.getElementById("scannedCount").textContent=d.length;renderRows(d.slice(-3).reverse(),"recentTable",false);}
  catch(e){renderRows([{product:"Packaged Food — 500 g",detected:9,total:9,status:"Compliant"},{product:"Household Cleaner — 1 L",detected:7,total:9,status:"Review"},{product:"Personal Care — 200 ml",detected:6,total:9,status:"Non-compliant"}],"recentTable",false);}
}
async function loadHistory(){try{const d=await fetch(API+"/api/inspections").then(r=>r.json());renderRows(d,"historyTable",true)}catch(e){renderRows([],"historyTable",true)}}
function renderRows(rows,id,history){document.getElementById(id).innerHTML=rows.map(x=>`<tr>${history?`<td>${x.date||"—"}</td>`:""}<td>${x.product||"Uploaded product"}</td><td>${x.detected}/${x.total}</td>${history?"":`<td>${x.readability||"Review"}</td>`}<td><span class="badge ${x.status==="Compliant"?"pass":x.status==="Non-compliant"?"fail":"review"}">${x.status}</span></td></tr>`).join("")||`<tr><td colspan="5">No inspections yet.</td></tr>`}
document.getElementById("exportBtn").onclick=()=>toast("Prototype report export requested.");
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",2200)}
loadDashboard();
