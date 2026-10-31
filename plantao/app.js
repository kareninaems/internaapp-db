var KEYS=["PAS","FC","HGT","TEMP"];
var UN={PAS:"mmHg",FC:"bpm",HGT:"mg/dL",TEMP:"°C"},LB={PAS:"PAS",FC:"FC",HGT:"Glicemia capilar",TEMP:"Temperatura"};
var SAMPLE=[
{leito:"01",nome:"José Almeida (fictício)",idade:67,intern:"2026-10-27",caso:"Choque séptico de foco pulmonar. DPOC. Em ventilação mecânica.",peso:70,
 m:{PAS:[["2026-10-29T23:00",150],["2026-10-30T08:00",118],["2026-10-30T14:00",92],["2026-10-30T20:00",135],["2026-10-31T02:00",110],["2026-10-31T07:00",128]],
    FC:[["2026-10-30T08:00",88],["2026-10-30T14:00",112],["2026-10-30T20:00",76],["2026-10-31T02:00",70],["2026-10-31T05:00",70]],
    HGT:[["2026-10-30T08:00",140],["2026-10-30T12:00",210],["2026-10-30T20:00",98],[null,300]],
    TEMP:[["2026-10-30T09:00",36.4],["2026-10-30T15:00",38.1],["2026-10-30T21:00",36.8]]},
 evac:[["2026-10-30T11:00","Presente, fezes pastosas"],["2026-10-31T03:00","Presente, fezes líquidas"]],
 urine:[["2026-10-30T08:00",300],["2026-10-30T14:00",250],["2026-10-30T20:00",400],["2026-10-31T02:00",350]],
 meds:[{c:"DVA",n:"Noradrenalina 0,15 mcg/kg/min",s:"adm",t:["2026-10-30T20:00"]},{c:"Sedação",n:"Fentanil 50 mcg/h",s:"presc",t:[]},{c:"ATB",n:"Meropenem 1 g IV 8/8h",s:"adm",t:["2026-10-30T10:00","2026-10-30T18:00","2026-10-31T02:00"]}]},
{leito:"02",nome:"Maria Souza (fictícia)",idade:54,intern:"2026-10-29",caso:"Pós-operatório de laparotomia por abdome agudo obstrutivo.",peso:null,
 m:{PAS:[["2026-10-30T09:00",124],["2026-10-30T21:00",101]],FC:[],HGT:[["2026-10-30T10:00",165],["2026-10-30T22:00",132]],TEMP:[["2026-10-30T10:00",36.9],["2026-10-30T22:00",37.2]]},
 evac:[],urine:[["2026-10-30T10:00",200],["2026-10-30T22:00",400]],
 meds:[{c:"DVA",n:null,s:"none",t:[]},{c:"Sedação",n:"Midazolam 3 mg/h",s:"unk",t:[]},{c:"ATB",n:null,s:"none",t:[]}]},
{leito:"03",nome:"Antônio Lima (fictício)",idade:72,intern:"2026-10-28",caso:"Insuficiência cardíaca descompensada, com edema agudo de pulmão revertido.",peso:82,
 m:{PAS:[["2026-10-30T08:30",132],["2026-10-30T16:30",127],["2026-10-31T00:30",138]],FC:[["2026-10-30T08:30",64],["2026-10-30T16:30",68],["2026-10-31T00:30",61]],HGT:[["2026-10-30T08:30",118],["2026-10-30T16:30",124]],TEMP:[["2026-10-30T08:30",36.2],["2026-10-30T16:30",36.5],["2026-10-31T00:30",36.1]]},
 evac:[["2026-10-30T18:00","Presente, fezes normais"]],
 urine:[["2026-10-30T08:30",500],["2026-10-30T16:30",450],["2026-10-31T00:30",400]],
 meds:[{c:"DVA",n:null,s:"none",t:[]},{c:"Sedação",n:null,s:"none",t:[]},{c:"ATB",n:"Ceftriaxona 2 g IV 24/24h",s:"adm",t:["2026-10-30T09:00"]}]}
];
var DATA=SAMPLE,SOURCE="exemplo",SRCNAME="",WS="2026-10-30T07:00",WE="",OBS={},onlyPend=false,clrArmed=false;

function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function addH(s,h){var d=new Date(s+":00Z");d.setUTCHours(d.getUTCHours()+h);return d.toISOString().slice(0,16)}
function fmt(t){return t.slice(8,10)+"/"+t.slice(5,7)+" "+t.slice(11,16)}
function fnum(v){return String(v).replace(".",",")}
function dt(s){return s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4)}
function dias(p){return Math.round((new Date(WE.slice(0,10))-new Date(p.intern))/864e5)}
function reason(t){return !t?"sem horário":t<WS?"antes do início da janela":"a partir do fim da janela"}
function split(rows){var r={inn:[],out:[],nt:[]};rows.forEach(function(x){if(!x[0])r.nt.push(x);else if(x[0]>=WS&&x[0]<WE)r.inn.push(x);else r.out.push(x)});return r}
function mm(rows){var s=split(rows);if(!s.inn.length)return{s:s,none:true};
 var vs=s.inn.map(function(x){return x[1]}),lo=Math.min.apply(null,vs),hi=Math.max.apply(null,vs);
 var tl=function(v){return s.inn.filter(function(x){return x[1]===v}).map(function(x){return fmt(x[0])}).join(", ")};
 return{s:s,lo:lo,hi:hi,tlo:tl(lo),thi:tl(hi)}}
/* Diurese: total dos registros da janela. Débito 1 divide pelas 24 h da janela; débito 2 pelo intervalo entre o 1º e o último registro. */
function urine(p){var s=split(p.urine);if(!s.inn.length)return{miss:true,s:s};
 var tot=s.inn.reduce(function(a,x){return a+x[1]},0),n=s.inn.length,r={tot:tot,n:n,s:s,day:null,span:null,dayWhy:"",spanWhy:""};
 if(!p.peso){r.dayWhy=r.spanWhy="peso ausente";return r}
 r.day=tot/p.peso/24;
 if(n<2){r.spanWhy="intervalo insuficiente"}else{var h=(new Date(s.inn[n-1][0]+":00Z")-new Date(s.inn[0][0]+":00Z"))/36e5;r.h=h;r.span=tot/p.peso/h}
 return r}
function flagSplit(c,label,s){
 if(s.nt.length)c.push(label+": "+s.nt.length+" registro(s) sem horário, fora do cálculo");
 if(s.out.length)c.push(label+": "+s.out.length+" registro(s) fora da janela, fora do cálculo")}
function conf(p){var c=[];
 KEYS.forEach(function(k){var r=mm(p.m[k]);
  if(!p.m[k].length)c.push(LB[k]+": sem registro no PDF");else if(r.none)c.push(LB[k]+": nenhum registro dentro da janela");
  flagSplit(c,LB[k],r.s)});
 var ev=split(p.evac);if(!p.evac.length)c.push("Evacuação: sem registro no PDF");else if(!ev.inn.length)c.push("Evacuação: nenhum registro dentro da janela");
 flagSplit(c,"Evacuação",ev);
 var u=urine(p);
 if(!p.urine.length)c.push("Diurese: sem registro no PDF");else if(u.miss)c.push("Diurese: nenhum registro dentro da janela");
 flagSplit(c,"Diurese",u.s);
 if(!u.miss&&u.day===null)c.push("Débito urinário não calculável: "+u.dayWhy);
 else if(!u.miss&&u.span===null)c.push("Débito entre registros não calculável: "+u.spanWhy);
 p.meds.forEach(function(m){
  if(m.s==="none")c.push(m.c+": sem registro no PDF");
  if(m.s==="unk")c.push(m.c+": origem não identificada (prescrito ou administrado)");
  if(m.s==="presc")c.push(m.c+": prescrição sem registro de administração");
  if(m.s==="adm"&&!m.t.length)c.push(m.c+": administração sem horário no PDF");
  if(m.s==="adm"&&m.t.length&&!m.t.some(function(t){return t>=WS&&t<WE}))c.push(m.c+": nenhuma administração dentro da janela")});
 return c}
/* Registros que ficaram fora do cálculo, com valor, horário e motivo */
function exclusions(p){var L=[];
 KEYS.forEach(function(k){var s=split(p.m[k]);s.out.concat(s.nt).forEach(function(x){L.push(LB[k]+": "+fnum(x[1])+" "+UN[k]+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")})});
 var u=split(p.urine);u.out.concat(u.nt).forEach(function(x){L.push("Diurese: "+x[1]+" mL"+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")});
 var e=split(p.evac);e.out.concat(e.nt).forEach(function(x){L.push("Evacuação: "+x[1]+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")});
 return L}
function chipMed(m){return m.s==="adm"?'<span class="chip c-ok">Administrado</span>':m.s==="presc"?'<span class="chip c-warn">Prescrito</span>':m.s==="unk"?'<span class="chip c-bad">Origem não identificada</span>':''}
function medTime(m){if(!m.t.length)return"sem horário no PDF";return m.t.map(function(t){return fmt(t)+(t>=WS&&t<WE?"":" (fora da janela)")}).join("; ")}
function mmText(rows,k){var r=mm(rows);if(!rows.length)return"Sem registro no PDF";if(r.none)return"Nenhum registro dentro da janela";
 return fnum(r.lo)+" a "+fnum(r.hi)+" "+UN[k]+" (mín "+r.tlo+"; máx "+r.thi+")"}
function urText(p){var u=urine(p);if(u.miss)return p.urine.length?"Nenhum registro dentro da janela":"Sem registro no PDF";
 var t=u.tot+" mL em "+u.n+" registros. ";
 if(u.day===null)return t+"Débito não calculável ("+u.dayWhy+")";
 t+="Débito na janela de 24 h: "+fnum(u.day.toFixed(2))+" mL/kg/h ("+u.tot+" ÷ "+p.peso+" ÷ 24)";
 t+=u.span===null?". Entre registros: não calculável ("+u.spanWhy+")":". Entre o 1º e o último registro ("+fnum(u.h)+" h): "+fnum(u.span.toFixed(2))+" mL/kg/h";
 return t}
function toText(){var L=["PASSAGEM DE PLANTÃO (rascunho para conferência médica, não é registro clínico)"];
 if(SOURCE==="exemplo")L.push("DADOS FICTÍCIOS");
 L.push("Plantão anterior: "+fmt(WS)+" até "+fmt(WE)+" (exclusive)");
 DATA.forEach(function(p){var c=conf(p),ev=split(p.evac).inn,ex=exclusions(p);
  L.push("","Leito "+p.leito+" | "+p.nome+" | "+p.idade+" anos | dia "+dias(p)+" de internação",p.caso);
  KEYS.forEach(function(k){L.push(LB[k]+": "+mmText(p.m[k],k))});
  L.push("Diurese: "+urText(p));
  L.push("Evacuação: "+(ev.length?ev.map(function(x){return fmt(x[0])+" "+x[1]}).join("; "):"Sem registro no PDF"));
  p.meds.forEach(function(m){L.push(m.c+": "+(m.n?m.n+" ["+(m.s==="adm"?"administrado":m.s==="presc"?"prescrito":"origem não identificada")+"] "+medTime(m):"Sem registro no PDF"))});
  L.push(c.length?"Para conferir:":"Para conferir: nada");c.forEach(function(x){L.push("- "+x)});
  if(ex.length){L.push("Registros fora do cálculo:");ex.forEach(function(x){L.push("- "+x)})}
  if(OBS[p.leito]&&OBS[p.leito].trim())L.push("Observação do médico: "+OBS[p.leito].trim())});
 return L.join("\n")}

/* Observações: guardadas só neste navegador, por origem dos dados e início da janela */
function okey(){return"plantao-obs:"+SOURCE+":"+WS}
function loadObs(){OBS={};try{var v=localStorage.getItem(okey());if(v)OBS=JSON.parse(v)||{}}catch(e){}}
function saveObs(){try{localStorage.setItem(okey(),JSON.stringify(OBS))}catch(e){}}

function setWindow(ws){WS=ws;WE=addH(WS,24);$("wsIn").value=WS;$("win").innerHTML="<b>Plantão anterior:</b> "+fmt(WS)+" até "+fmt(WE)+" (exclusive)";loadObs()}
function render(){
 $("banner").textContent=SOURCE==="exemplo"?"DADOS FICTÍCIOS. Rascunho para conferência médica, não é registro clínico.":"DADOS IMPORTADOS"+(SRCNAME?" de "+SRCNAME:"")+". Rascunho para conferência médica, não é registro clínico.";
 $("sampleBtn").hidden=SOURCE==="exemplo";
 var info=DATA.map(function(p){return{p:p,c:conf(p)}}),sum="";
 info.forEach(function(x){sum+='<button type="button" class="sbtn '+(x.c.length?'w':'o')+'" data-go="'+esc(x.p.leito)+'">Leito '+esc(x.p.leito)+': '+(x.c.length?x.c.length+' a conferir':'ok')+'</button>'});
 var tot=info.reduce(function(a,x){return a+x.c.length},0);
 $("sum").innerHTML=(DATA.length?sum:'<span class="note">Nenhum leito.</span>')+'<span class="note sumnote">'+DATA.length+' leitos, '+tot+' itens para conferir</span>';
 var box=$("cards"),all="";
 info.forEach(function(x){var p=x.p,c=x.c;if(onlyPend&&!c.length)return;
  var u=urine(p),ex=exclusions(p),h="";
  h+='<div class="top"><div><div class="leito">Leito '+esc(p.leito)+'</div><div class="nome">'+esc(p.nome)+'</div><div class="note">'+esc(p.idade)+' anos, internado em '+dt(p.intern)+' (dia '+dias(p)+')'+(p.peso?', '+p.peso+' kg':', peso ausente')+'</div></div>'+
     '<div>'+(c.length?'<span class="chip c-warn">'+c.length+' para conferir</span>':'<span class="chip c-ok">Nada a conferir</span>')+'</div></div>';
  h+='<div class="caso">'+esc(p.caso)+'</div><div class="tiles">';
  KEYS.forEach(function(k){var r=mm(p.m[k]);
   h+='<div class="tile"><div class="l">'+LB[k]+' ('+UN[k]+')</div>'+(r.none?'<div class="miss">'+(p.m[k].length?'Nenhum registro na janela':'Sem registro no PDF')+'</div>':'<div class="v">'+fnum(r.lo)+' a '+fnum(r.hi)+'</div><div class="note">mín '+r.tlo+'<br>máx '+r.thi+'</div>')+'</div>'});
  h+='</div><div class="row"><h3>Diurese</h3>';
  if(u.miss)h+='<span class="miss">'+(p.urine.length?'Nenhum registro dentro da janela':'Sem registro no PDF')+'</span>';
  else{h+='<b>'+u.tot+' mL</b> em '+u.n+' registros.<br>';
   h+=u.day===null?'<span class="chip c-bad">Débito não calculável: '+u.dayWhy+'</span>':'Janela de 24 h: <b>'+fnum(u.day.toFixed(2))+' mL/kg/h</b> <span class="note">('+u.tot+' mL ÷ '+p.peso+' kg ÷ 24 h)</span><br>'+
    (u.span===null?'<span class="note">Entre registros: não calculável ('+u.spanWhy+')</span>':'<span class="note">Entre o 1º e o último registro ('+fnum(u.h)+' h): '+fnum(u.span.toFixed(2))+' mL/kg/h</span>');
   h+='<div class="note">O valor de 24 h presume que os registros cobrem o plantão inteiro.</div>'}
  var ev=split(p.evac).inn;
  h+='</div><div class="row"><h3>Evacuação</h3>'+(ev.length?ev.map(function(y){return fmt(y[0])+': '+esc(y[1])}).join('<br>'):'<span class="miss">'+(p.evac.length?'Nenhum registro dentro da janela':'Sem registro no PDF')+'</span>')+'</div>';
  h+='<div class="row"><h3>Medicações prioritárias</h3>';
  p.meds.forEach(function(m){h+='<div><b>'+esc(m.c)+':</b> '+(m.n?esc(m.n)+' '+chipMed(m)+' <span class="note">'+medTime(m)+'</span>':'<span class="miss">Sem registro no PDF</span>')+'</div>'});
  h+='</div><div class="row"><h3>Itens para conferir</h3>'+(c.length?'<ul>'+c.map(function(y){return'<li>'+esc(y)+'</li>'}).join('')+'</ul>':'<span class="note">Nenhum item pendente.</span>')+'</div>';
  if(ex.length)h+='<div class="row"><details><summary>Registros fora do cálculo ('+ex.length+')</summary><ul>'+ex.map(function(y){return'<li>'+esc(y)+'</li>'}).join('')+'</ul></details></div>';
  h+='<div class="row"><h3>Observações</h3><textarea rows="2" data-obs="'+esc(p.leito)+'" aria-label="Observações do leito '+esc(p.leito)+'" placeholder="Escreva aqui.">'+esc(OBS[p.leito]||"")+'</textarea><span class="chip c-info">Inserção manual do médico</span> <span class="note">Separada dos dados extraídos.</span></div>';
  all+='<div class="card'+(c.length?' pend':'')+'" id="leito-'+esc(p.leito)+'">'+h+'</div>'});
 box.innerHTML=all||'<p class="note">'+(DATA.length?'Nenhum leito com pendências.':'Nenhum leito para mostrar.')+'</p>'}

function status(t){$("status").textContent=t}
function copyAll(){var t=toText(),o=$("out");$("outwrap").hidden=false;o.value=t;o.focus();o.select();
 var ok=function(){status("Passagem copiada.")},no=function(){status("Não foi possível copiar sozinho. O texto abaixo está selecionado: use Ctrl+C.")};
 try{navigator.clipboard.writeText(t).then(ok,no)}catch(e){no()}}

/* Importação */
function normRows(a,nums,bad){if(!Array.isArray(a))return[];var r=[];a.forEach(function(x){
  if(!Array.isArray(x)||x.length<2||(nums&&typeof x[1]!=="number"&&!(typeof x[1]==="string"&&x[1].trim()!==""&&!isNaN(+x[1])))){bad.n++;return}
  var t=typeof x[0]==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x[0])?x[0].slice(0,16):null;
  r.push([t,nums?+x[1]:String(x[1])])});return r}
function normalize(raw){
 if(!Array.isArray(raw))throw new Error("O JSON precisa ser uma lista de leitos.");
 var bad={n:0};
 var out=raw.map(function(p,i){
  if(!p||typeof p!=="object")throw new Error("Leito "+(i+1)+": formato inválido.");
  if(!p.leito||!/^\d{4}-\d{2}-\d{2}/.test(String(p.intern||"")))throw new Error("Leito "+(i+1)+": faltam os campos leito e intern (AAAA-MM-DD).");
  var m={};KEYS.forEach(function(k){m[k]=normRows(p.m&&p.m[k],true,bad)});
  var meds=(Array.isArray(p.meds)?p.meds:[]).map(function(d){var t=Array.isArray(d.t)?d.t:(d.t?[d.t]:[]);
   return{c:String(d.c||"Medicação"),n:d.n?String(d.n):null,s:["adm","presc","unk","none"].indexOf(d.s)>-1?d.s:"unk",t:t.filter(function(x){return typeof x==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x)}).map(function(x){return x.slice(0,16)})}});
  return{leito:String(p.leito),nome:String(p.nome||"Sem nome"),idade:p.idade==null?"?":p.idade,intern:String(p.intern).slice(0,10),caso:String(p.caso||""),peso:typeof p.peso==="number"&&p.peso>0?p.peso:null,m:m,evac:normRows(p.evac,false,bad),urine:normRows(p.urine,true,bad),meds:meds}});
 return{data:out,bad:bad.n}}
function readPdf(file){
 var fs=$("fstatus");
 if(!window.pdfjsLib){fs.innerHTML='<span class="err">A biblioteca de PDF não carregou. Tente recarregar a página.</span>';return}
 pdfjsLib.GlobalWorkerOptions.workerSrc="vendor/pdf.worker.min.js";
 fs.textContent="Lendo o PDF...";
 file.arrayBuffer().then(function(buf){return pdfjsLib.getDocument({data:buf}).promise}).then(function(pdf){
  var jobs=[];for(var i=1;i<=pdf.numPages;i++)jobs.push(pdf.getPage(i).then(function(pg){return pg.getTextContent()}).then(function(tc){
   var lines=[],cur="",y=null;tc.items.forEach(function(it){var yy=Math.round(it.transform[5]);if(y!==null&&Math.abs(yy-y)>2){lines.push(cur);cur=""}y=yy;cur+=(cur&&it.str?" ":"")+it.str});lines.push(cur);return lines.join("\n")}));
  return Promise.all(jobs).then(function(pages){return{n:pdf.numPages,text:pages.map(function(t,i){return"--- página "+(i+1)+" ---\n"+t}).join("\n")}})
 }).then(function(r){
  $("pdftext").textContent=r.text;$("pdfout").hidden=false;
  fs.textContent="Texto extraído de "+r.n+" página(s). Os cartões ainda não são montados a partir do PDF: o leitor depende do layout do documento. Enquanto isso, use o formato JSON abaixo.";
 }).catch(function(e){fs.innerHTML='<span class="err">Não consegui ler este PDF ('+esc(e&&e.message||e)+'). Se ele for escaneado, o texto não está embutido.</span>'})}
function readJson(file){var fs=$("fstatus"),fr=new FileReader();
 fr.onload=function(){try{var r=normalize(JSON.parse(fr.result));DATA=r.data;SOURCE="importado";SRCNAME=file.name;loadObs();render();
   fs.textContent=DATA.length+" leito(s) importado(s)."+(r.bad?" "+r.bad+" registro(s) com formato inválido foram ignorados.":"")}
  catch(e){fs.innerHTML='<span class="err">'+esc(e.message)+'</span>'}};
 fr.onerror=function(){fs.innerHTML='<span class="err">Não consegui abrir o arquivo.</span>'};
 fr.readAsText(file)}

try{var th=localStorage.getItem("plantao-theme");if(th)document.documentElement.setAttribute("data-theme",th)}catch(e){}
$("tb").onclick=function(){var r=document.documentElement,t=r.getAttribute("data-theme");var dark=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var n=dark?"light":"dark";r.setAttribute("data-theme",n);try{localStorage.setItem("plantao-theme",n)}catch(e){}};
$("wsIn").onchange=function(){if(this.value){setWindow(this.value.slice(0,16));render()}};
$("onlyPend").onchange=function(){onlyPend=this.checked;render()};
$("copyBtn").onclick=copyAll;
$("clrBtn").onclick=function(){var b=this;
 if(!clrArmed){clrArmed=true;b.textContent="Confirmar: apagar tudo";setTimeout(function(){clrArmed=false;b.textContent="Apagar observações"},5000);return}
 clrArmed=false;b.textContent="Apagar observações";OBS={};try{localStorage.removeItem(okey())}catch(e){}render();status("Observações apagadas.")};
$("sampleBtn").onclick=function(){DATA=SAMPLE;SOURCE="exemplo";SRCNAME="";loadObs();render();$("fstatus").textContent="Dados de exemplo restaurados."};
$("file").onchange=function(){var f=this.files[0];if(!f)return;$("pdfout").hidden=true;
 if(/\.pdf$/i.test(f.name)||f.type==="application/pdf")readPdf(f);else if(/\.json$/i.test(f.name))readJson(f);else $("fstatus").innerHTML='<span class="err">Envie um arquivo .pdf ou .json.</span>'};
$("sum").onclick=function(e){var b=e.target.closest("[data-go]");if(!b)return;var el=$("leito-"+b.getAttribute("data-go"));
 if(el)el.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
 else{onlyPend=false;$("onlyPend").checked=false;render();var e2=$("leito-"+b.getAttribute("data-go"));if(e2)e2.scrollIntoView()}};
$("cards").addEventListener("input",function(e){var t=e.target;if(t.getAttribute&&t.getAttribute("data-obs")!==null){OBS[t.getAttribute("data-obs")]=t.value;saveObs()}});

setWindow(WS);render();

if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
