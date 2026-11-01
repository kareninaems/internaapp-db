var KEYS=["PAS","PAD","PAM","FC","FR","SPO2","TEMP","HGT"],SHOW=["PAS","PAM","FC","FR","SPO2","TEMP","HGT"],CORE=["PAS","FC","TEMP","HGT"];
var UN={PAS:"mmHg",PAD:"mmHg",PAM:"mmHg",FC:"bpm",FR:"irpm",SPO2:"%",HGT:"mg/dL",TEMP:"°C"},LB={PAS:"PAS",PAD:"PAD",PAM:"PAM",FC:"FC",FR:"FR",SPO2:"SpO2",HGT:"Glicemia capilar",TEMP:"Temperatura"};
function tiles(p){return SHOW.filter(function(k){return CORE.indexOf(k)>-1||(p.m[k]&&p.m[k].length)})}
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
var DATA=SAMPLE,SOURCE="exemplo",SRCNAME="",WS="2026-10-30T07:00",WE="",OBS={},PESO={},SRCKIND="",onlyPend=false,clrArmed=false;

function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function addH(s,h){var d=new Date(s+":00Z");d.setUTCHours(d.getUTCHours()+h);return d.toISOString().slice(0,16)}
function fmt(t){return t.slice(8,10)+"/"+t.slice(5,7)+" "+t.slice(11,16)}
function fnum(v){return String(v).replace(".",",")}
function pesoOf(p){var v=PESO[p.leito];return typeof v==="number"&&v>0?v:(p.peso||null)}
function idadeTxt(p){var a=String(p.idade);return/^\d+A?$/i.test(a)?parseInt(a,10)+" anos":(a==="?"?"idade sem registro":a)}
function internTxt(p){return p.intern?"internado em "+dt(p.intern)+" (dia "+dias(p)+")":"internação sem registro no PDF"}
function dt(s){return s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4)}
function dias(p){return Math.round((new Date(WE.slice(0,10))-new Date(p.intern))/864e5)}
function reason(t){return !t?"sem horário":t<WS?"antes do início da janela":"a partir do fim da janela"}
function split(rows){var r={inn:[],out:[],nt:[]};rows.forEach(function(x){if(!x[0])r.nt.push(x);else if(x[0]>=WS&&x[0]<WE)r.inn.push(x);else r.out.push(x)});return r}
function mm(rows){var s=split(rows);if(!s.inn.length)return{s:s,none:true};
 var vs=s.inn.map(function(x){return x[1]}),lo=Math.min.apply(null,vs),hi=Math.max.apply(null,vs);
 var tl=function(v){var l=s.inn.filter(function(x){return x[1]===v}).map(function(x){return fmt(x[0])});return l.length>2?l.slice(0,2).join(", ")+" (+"+(l.length-2)+")":l.join(", ")};
 return{s:s,lo:lo,hi:hi,tlo:tl(lo),thi:tl(hi)}}
/* Diurese: total dos registros da janela. Débito 1 divide pelas 24 h da janela; débito 2 pelo intervalo entre o 1º e o último registro. */
function urine(p){var s=split(p.urine);if(!s.inn.length)return{miss:true,s:s};
 var tot=s.inn.reduce(function(a,x){return a+x[1]},0),n=s.inn.length,r={tot:tot,n:n,s:s,day:null,span:null,dayWhy:"",spanWhy:""};
 if(!pesoOf(p)){r.dayWhy=r.spanWhy="peso ausente";return r}
 r.day=tot/pesoOf(p)/24;
 if(n<2){r.spanWhy="intervalo insuficiente"}else{var h=(new Date(s.inn[n-1][0]+":00Z")-new Date(s.inn[0][0]+":00Z"))/36e5;r.h=h;r.span=tot/pesoOf(p)/h}
 return r}
function flagSplit(c,label,s){
 if(s.nt.length)c.push(label+": "+s.nt.length+" registro(s) sem horário, fora do cálculo");
 if(s.out.length)c.push(label+": "+s.out.length+" registro(s) fora da janela, fora do cálculo")}
function conf(p){var c=[];
 tiles(p).forEach(function(k){var r=mm(p.m[k]);
  if(!p.m[k].length)c.push(LB[k]+": sem registro no PDF");else if(r.none)c.push(LB[k]+": nenhum registro dentro da janela");
  flagSplit(c,LB[k],r.s)});
 var ev=split(p.evac);if(!p.evac.length&&!p.evacNote)c.push("Evacuação: sem registro no PDF");else if(p.evac.length&&!ev.inn.length)c.push("Evacuação: nenhum registro dentro da janela");
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
 if(p.bal)balChecks(p,c);padCheck(p,c);
 return c}
function sumRow(r){return r.v.reduce(function(a,x){return a+x[1]},0)}
function balChecks(p,c){var b=p.bal,sg=0,sp=0;
 b.gan.concat(b.per).forEach(function(r){if(r.tot!=null&&Math.abs(sumRow(r)-r.tot)>0.5)c.push("Balanço: soma de "+r.n+" ("+sumRow(r)+") difere do total do PDF ("+r.tot+")")});
 b.gan.forEach(function(r){sg+=sumRow(r)});b.per.forEach(function(r){sp+=sumRow(r)});
 if(b.totG==null){c.push("Balanço: totais não encontrados no PDF");return}
 if(Math.abs(sg-b.totG)>0.5)c.push("Balanço: soma dos ganhos ("+sg+") difere do total do PDF ("+b.totG+")");
 if(Math.abs(sp+(b.pi||0)-Math.abs(b.totP))>0.5)c.push("Balanço: soma das perdas com perdas insensíveis ("+(sp+(b.pi||0))+") difere do total do PDF ("+Math.abs(b.totP)+")");
 if(Math.abs(b.totG-Math.abs(b.totP)-b.bal)>0.5)c.push("Balanço 24 h não confere com ganhos menos perdas");
 if(Math.abs(b.bal+b.ant-b.atual)>0.5)c.push("Total atual não confere com balanço 24 h mais BH anterior")}
function padCheck(p,c){if(!p.m.PAS||!p.m.PAD)return;p.m.PAD.forEach(function(d){var s=p.m.PAS.filter(function(x){return x[0]===d[0]})[0];if(s&&d[1]>s[1])c.push("PAD maior que PAS às "+fmt(d[0])+" (PAS "+s[1]+", PAD "+d[1]+")")})}
function sgn(n){return(n>0?"+":n<0?"\u2212":"")+Math.abs(n)}
/* Registros que ficaram fora do cálculo, com valor, horário e motivo */
function exclusions(p){var L=[];
 tiles(p).forEach(function(k){var s=split(p.m[k]);s.out.concat(s.nt).forEach(function(x){L.push(LB[k]+": "+fnum(x[1])+" "+UN[k]+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")})});
 var u=split(p.urine);u.out.concat(u.nt).forEach(function(x){L.push("Diurese: "+x[1]+" mL"+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")});
 var e=split(p.evac);e.out.concat(e.nt).forEach(function(x){L.push("Evacuação: "+x[1]+(x[0]?" em "+fmt(x[0]):"")+" ("+reason(x[0])+")")});
 return L}
function chipMed(m){return m.s==="adm"?'<span class="chip c-ok">Administrado</span>':m.s==="presc"?'<span class="chip c-warn">Prescrito</span>':m.s==="unk"?'<span class="chip c-bad">Origem não identificada</span>':m.s==="vol"?'<span class="chip c-info">Volume registrado</span>':''}
function medTime(m){if(!m.t.length)return"sem horário no PDF";return m.t.map(function(t){return fmt(t)+(t>=WS&&t<WE?"":" (fora da janela)")}).join("; ")}
function mmText(rows,k){var r=mm(rows);if(!rows.length)return"Sem registro no PDF";if(r.none)return"Nenhum registro dentro da janela";
 return fnum(r.lo)+" a "+fnum(r.hi)+" "+UN[k]+" (mín "+r.tlo+"; máx "+r.thi+")"}
function urText(p){var u=urine(p);if(u.miss)return p.urine.length?"Nenhum registro dentro da janela":"Sem registro no PDF";
 var t=u.tot+" mL em "+u.n+" registros. ";
 if(u.day===null)return t+"Débito não calculável ("+u.dayWhy+")";
 t+="Débito na janela de 24 h: "+fnum(u.day.toFixed(2))+" mL/kg/h ("+u.tot+" ÷ "+pesoOf(p)+" ÷ 24)";
 t+=u.span===null?". Entre registros: não calculável ("+u.spanWhy+")":". Entre o 1º e o último registro ("+fnum(u.h)+" h): "+fnum(u.span.toFixed(2))+" mL/kg/h";
 return t}
function toText(){var L=["PASSAGEM DE PLANTÃO (rascunho para conferência médica, não é registro clínico)"];
 if(SOURCE==="exemplo")L.push("DADOS FICTÍCIOS");
 L.push("Plantão anterior: "+fmt(WS)+" até "+fmt(WE)+" (exclusive)");
 DATA.forEach(function(p){var c=conf(p),ev=split(p.evac).inn,ex=exclusions(p);
  L.push("","Leito "+p.leito+" | "+p.nome+" | "+idadeTxt(p)+" | "+internTxt(p),p.caso);
  tiles(p).forEach(function(k){L.push(LB[k]+": "+mmText(p.m[k],k))});
  L.push("Diurese: "+urText(p));
  if(p.bal&&p.bal.totG!=null)L.push("Balanço hídrico: ganhos "+sgn(p.bal.totG)+" mL; perdas "+sgn(p.bal.totP)+" mL"+(p.bal.pi!=null?" (inclui perdas insensíveis "+p.bal.pi+")":"")+"; balanço 24 h "+sgn(p.bal.bal)+" mL; BH anterior "+sgn(p.bal.ant)+"; total atual "+sgn(p.bal.atual));
  L.push("Evacuação: "+(ev.length?ev.map(function(x){return fmt(x[0])+" "+x[1]}).join("; "):(p.evac.length?"Nenhum registro dentro da janela":p.evacNote||"Sem registro no PDF")));
  p.meds.forEach(function(m){L.push(m.c+": "+(m.n?m.n+" ["+(m.s==="adm"?"administrado":m.s==="presc"?"prescrito":m.s==="vol"?"volume registrado":"origem não identificada")+"] "+medTime(m):"Sem registro no PDF"))});
  L.push(c.length?"Para conferir:":"Para conferir: nada");c.forEach(function(x){L.push("- "+x)});
  if(ex.length){L.push("Registros fora do cálculo:");ex.forEach(function(x){L.push("- "+x)})}
  if(OBS[p.leito]&&OBS[p.leito].trim())L.push("Observação do médico: "+OBS[p.leito].trim())});
 return L.join("\n")}

/* Observações: guardadas só neste navegador, por origem dos dados e início da janela */
function okey(){return"plantao-dados:"+SOURCE+":"+WS}
function loadObs(){OBS={};PESO={};try{var v=localStorage.getItem(okey());if(v){v=JSON.parse(v)||{};OBS=v.o||{};PESO=v.p||{}}}catch(e){}}
function saveObs(){try{localStorage.setItem(okey(),JSON.stringify({o:OBS,p:PESO}))}catch(e){}}

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
  h+='<div class="top"><div><div class="leito">Leito '+esc(p.leito)+'</div><div class="nome">'+esc(p.nome)+'</div><div class="note">'+esc(idadeTxt(p))+', '+internTxt(p)+(pesoOf(p)?', '+fnum(pesoOf(p))+' kg':', peso ausente')+'</div></div>'+
     '<div>'+(c.length?'<span class="chip c-warn">'+c.length+' para conferir</span>':'<span class="chip c-ok">Nada a conferir</span>')+'</div></div>';
  h+=(p.caso?'<div class="caso">'+esc(p.caso)+'</div>':'<div class="caso note">Resumo do caso: sem registro no PDF</div>')+'<div class="tiles">';
  tiles(p).forEach(function(k){var r=mm(p.m[k]);
   h+='<div class="tile"><div class="l">'+LB[k]+' ('+UN[k]+')</div>'+(r.none?'<div class="miss">'+(p.m[k].length?'Nenhum registro na janela':'Sem registro no PDF')+'</div>':'<div class="v">'+fnum(r.lo)+' a '+fnum(r.hi)+'</div><div class="note">mín '+r.tlo+'<br>máx '+r.thi+'</div>')+'</div>'});
  h+='</div><div class="row"><h3>Diurese</h3><div class="pesoin"><label>Peso (kg) <input type="number" inputmode="decimal" step="0.1" min="0" max="300" data-peso="'+esc(p.leito)+'" value="'+(PESO[p.leito]||'')+'" placeholder="'+(p.peso||'informar')+'"></label></div>';
  if(u.miss)h+='<span class="miss">'+(p.urine.length?'Nenhum registro dentro da janela':'Sem registro no PDF')+'</span>';
  else{h+='<b>'+u.tot+' mL</b> em '+u.n+' registros.<br>';
   h+=u.day===null?'<span class="chip c-bad">Débito não calculável: '+u.dayWhy+'</span>':'Janela de 24 h: <b>'+fnum(u.day.toFixed(2))+' mL/kg/h</b> <span class="note">('+u.tot+' mL ÷ '+pesoOf(p)+' kg ÷ 24 h)</span><br>'+
    (u.span===null?'<span class="note">Entre registros: não calculável ('+u.spanWhy+')</span>':'<span class="note">Entre o 1º e o último registro ('+fnum(u.h)+' h): '+fnum(u.span.toFixed(2))+' mL/kg/h</span>');
   h+='<div class="note">O valor de 24 h presume que os registros cobrem o plantão inteiro.</div>'}
  var ev=split(p.evac).inn;
  h+='</div>'+balHtml(p)+'<div class="row"><h3>Evacuação</h3>'+(ev.length?ev.map(function(y){return fmt(y[0])+': '+esc(y[1])}).join('<br>'):(p.evacNote&&!p.evac.length?'<span class="note">'+esc(p.evacNote)+'</span>':'<span class="miss">'+(p.evac.length?'Nenhum registro dentro da janela':'Sem registro no PDF')+'</span>'))+'</div>';
  h+='<div class="row"><h3>Medicações prioritárias</h3>';
  p.meds.forEach(function(m){h+='<div><b>'+esc(m.c)+':</b> '+(m.n?esc(m.n)+' '+chipMed(m)+' <span class="note">'+medTime(m)+'</span>':'<span class="miss">Sem registro no PDF</span>')+'</div>'});
  h+='</div><div class="row"><h3>Itens para conferir</h3>'+(c.length?'<ul>'+c.map(function(y){return'<li>'+esc(y)+'</li>'}).join('')+'</ul>':'<span class="note">Nenhum item pendente.</span>')+'</div>';
  if(ex.length)h+='<div class="row"><details><summary>Registros fora do cálculo ('+ex.length+')</summary><ul>'+ex.map(function(y){return'<li>'+esc(y)+'</li>'}).join('')+'</ul></details></div>';
  h+='<div class="row"><h3>Observações</h3><textarea rows="2" data-obs="'+esc(p.leito)+'" aria-label="Observações do leito '+esc(p.leito)+'" placeholder="Escreva aqui.">'+esc(OBS[p.leito]||"")+'</textarea><span class="chip c-info">Inserção manual do médico</span> <span class="note">Separada dos dados extraídos.</span></div>';
  all+='<div class="card'+(c.length?' pend':'')+'" id="leito-'+esc(p.leito)+'">'+h+'</div>'});
 box.innerHTML=all||'<p class="note">'+(DATA.length?'Nenhum leito com pendências.':'Nenhum leito para mostrar.')+'</p>'}

function bhTile(l,v){return'<div class="tile"><div class="l">'+l+'</div>'+(v==null?'<div class="miss">Sem registro no PDF</div>':'<div class="v">'+sgn(v)+' mL</div>')+'</div>'}
function balHtml(p){if(!p.bal)return"";var b=p.bal,li="";
 b.gan.concat(b.per).forEach(function(r){var t=sumRow(r);if(!r.v.length&&!r.t.length)return;li+="<li>"+(b.gan.indexOf(r)>-1?"Ganho":"Perda")+": "+esc(r.n)+": "+t+" mL"+(r.tot!=null?" (total do PDF "+r.tot+")":"")+(r.t.length?"; texto: "+esc(r.t.map(function(x){return fmt(x[0])+" "+x[1]}).join(", ")):"")+"</li>"});
 return'<div class="row"><h3>Balanço hídrico (PDF)</h3><div class="bh">'+bhTile("Ganhos",b.totG)+bhTile("Perdas"+(b.pi!=null?" (com perdas insensíveis "+b.pi+")":""),b.totP)+bhTile("Balanço 24 h",b.bal)+bhTile("BH anterior",b.ant)+bhTile("Total atual",b.atual)+'</div>'+(li?'<details><summary>Linhas do balanço</summary><ul>'+li+'</ul></details>':'')+'</div>'}
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
  if(!p.leito)throw new Error("Leito "+(i+1)+": falta o campo leito.");
  if(p.intern&&!/^\d{4}-\d{2}-\d{2}/.test(String(p.intern)))throw new Error("Leito "+(i+1)+": intern precisa estar no formato AAAA-MM-DD.");
  var m={};KEYS.forEach(function(k){m[k]=normRows(p.m&&p.m[k],true,bad)});
  var meds=(Array.isArray(p.meds)?p.meds:[]).map(function(d){var t=Array.isArray(d.t)?d.t:(d.t?[d.t]:[]);
   return{c:String(d.c||"Medicação"),n:d.n?String(d.n):null,s:["adm","presc","unk","none","vol"].indexOf(d.s)>-1?d.s:"unk",t:t.filter(function(x){return typeof x==="string"&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x)}).map(function(x){return x.slice(0,16)})}});
  return{leito:String(p.leito),nome:String(p.nome||"Sem nome"),idade:p.idade==null?"?":p.idade,intern:p.intern?String(p.intern).slice(0,10):null,caso:String(p.caso||""),peso:typeof p.peso==="number"&&p.peso>0?p.peso:null,m:m,evac:normRows(p.evac,false,bad),urine:normRows(p.urine,true,bad),meds:meds}});
 return{data:out,bad:bad.n}}
/* Leitor do PDF "Balanço Hídrico" (um leito por página). Lê o texto embutido e atribui cada valor à coluna de hora pela posição horizontal. */
var NUM=/^[+\-−]?\d+(?:[.,]\d+)?$/;
function toNum(s){return parseFloat(String(s).replace("−","-").replace(",","."))}
function pad2(n){return(n<10?"0":"")+n}
function addDay(d,n){var x=new Date(d+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
function pdfRows(items){
 var its=items.filter(function(i){return i.str&&i.str.trim()}).map(function(i){return{s:i.str.trim(),x:i.transform[4],c:i.transform[4]+i.width/2,y:i.transform[5]}});
 its.sort(function(a,b){return b.y-a.y});
 var rows=[];its.forEach(function(i){var r=rows[rows.length-1];if(r&&Math.abs(r.y-i.y)<=3)r.it.push(i);else rows.push({y:i.y,it:[i]})});
 rows.forEach(function(r){r.it.sort(function(a,b){return a.x-b.x});r.txt=r.it.map(function(i){return i.s}).join(" ")});
 return rows}
function hdrCols(cells){var cols=[];cells.forEach(function(i){if(/^\d{1,2}$/.test(i.s))cols.push({h:+i.s,c:i.c});else if(/^TOTAL$/i.test(i.s))cols.push({tot:true,c:i.c})});return cols}
function nearestCol(cols,c){var b=null,d=1e9;cols.forEach(function(k){var e=Math.abs(k.c-c);if(e<d){d=e;b=k}});return d<=12?b:null}
var VIT=[[/^temp/i,"TEMP"],[/^fc\b/i,"FC"],[/^fr\b/i,"FR"],[/^pas\b/i,"PAS"],[/^pad\b/i,"PAD"],[/^pam\b/i,"PAM"],[/^spo/i,"SPO2"],[/^hgt/i,"HGT"],[/^insulina/i,"INS"]];
var CAT=[["DVA",/noradren|adrenal|dobut|dopam|vasopres|nitropr|milrin/i],["Sedação",/midazol|fentan|precedex|dexmed|propofol|ketam|cetam/i],["ATB",/vanco|mero|pipera|tazoc|cefe|ceftri|amic|polimix|linez|teico|ampic|clinda|metron|cipro|levoflo|gentam|oxac|penic|anfot|fluconaz/i]];
function parsePdfPage(rows,full){
 var P={leito:"",nome:"",idade:"?",intern:null,caso:"",peso:null,m:{},evac:[],evacNote:"",urine:[],meds:[],ins:[],bal:{gan:[],per:[],pi:null,totG:null,totP:null,bal:null,ant:null,atual:null},dataRef:"",fonte:"pdf",avisos:[]};
 KEYS.forEach(function(k){P.m[k]=[]});
 var cols=null,mode="",sect="",d0=null,evMarks=0,i;
 function iso(h){return(h>=7?d0:addDay(d0,1))+"T"+pad2(h)+":00"}
 for(i=0;i<rows.length;i++){var r=rows[i];
  var lab=r.it.filter(function(x){return x.x<125}).map(function(x){return x.s}).join(" "),cells=r.it.filter(function(x){return x.x>=125});
  var mt=r.txt.match(/PACIENTE:\s*(.*?)\s+IDADE:\s*(\S+)\s+LEITO:\s*(\S+)\s+DATA:\s*(\d{1,2})\/(\d{1,2})/i);
  if(mt){P.nome=mt[1];P.idade=mt[2];P.leito=/^\d$/.test(mt[3])?"0"+mt[3]:mt[3];
   var dd=+mt[4],mo=+mt[5],yr=new Date().getFullYear(),py=full.match(/(\d{2})\/(\d{2})\/(\d{4})/);
   if(py){yr=+py[3];if(mo>+py[2]||(mo===+py[2]&&dd>+py[1]))yr--}else P.avisos.push("ano da data não encontrado no PDF; usado o ano atual");
   d0=yr+"-"+pad2(mo)+"-"+pad2(dd);P.dataRef=d0;continue}
  if(/^TOTAL GANHOS/i.test(r.txt)){var pm=r.txt.match(/\+PI\s*(\d+)/i);if(pm)P.bal.pi=+pm[1];
   var nx=rows[i+1];if(nx){var ns=nx.it.filter(function(x){return/^[+\-−]?\d+$/.test(x.s)}).map(function(x){return toNum(x.s)});
    if(ns.length===5){P.bal.totG=ns[0];P.bal.totP=ns[1];P.bal.bal=ns[2];P.bal.ant=ns[3];P.bal.atual=ns[4];i++}}
   mode="";continue}
  if(lab==="ITEM"){cols=hdrCols(cells);mode="bal";continue}
  if(/^SINAIS/i.test(lab)){cols=hdrCols(cells);mode="vit";continue}
  if(/^GANHOS/i.test(lab)&&!cells.length){sect="gan";continue}
  if(/^PERDAS/i.test(lab)&&!cells.length){sect="per";continue}
  if(!d0||!cols||!mode||!lab||!cells.length)continue;
  var cm={},tot=null;
  cells.forEach(function(x){var k=nearestCol(cols,x.c);if(!k)return;
   if(k.tot){if(NUM.test(x.s))tot=toNum(x.s);return}
   var e=cm[k.h]||(cm[k.h]={});if(NUM.test(x.s)&&e.n===undefined)e.n=toNum(x.s);else e.t=(e.t?e.t+" ":"")+x.s});
  var vals=[],txts=[];Object.keys(cm).forEach(function(h){var e=cm[h];if(e.n!==undefined)vals.push([iso(+h),e.n]);if(e.t)txts.push([iso(+h),e.t])});
  var byT=function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0};vals.sort(byT);txts.sort(byT);
  if(mode==="vit"){var key=null;VIT.forEach(function(v){if(!key&&v[0].test(lab))key=v[1]});
   if(key==="INS")P.ins=P.ins.concat(vals);else if(key)P.m[key]=P.m[key].concat(vals);continue}
  if(/^evacua/i.test(lab)){txts.forEach(function(x){if(/^\++$/.test(x[1]))P.evac.push([x[0],x[1]]);else evMarks++});evMarks+=vals.length;continue}
  var row={n:lab,v:vals,t:txts,tot:tot};
  (sect==="per"?P.bal.per:P.bal.gan).push(row);
  if(/^diurese/i.test(lab))P.urine=vals.slice()}
 if(!P.leito||!d0||!cols)return null;
 if(!P.evac.length&&evMarks)P.evacNote="Nenhuma evacuação marcada com +. O PDF traz «-» ou «0» em "+evMarks+" horário(s); o significado desses símbolos não consta no PDF.";
 P.meds=CAT.map(function(ct){var rs=P.bal.gan.filter(function(x){return ct[1].test(x.n)&&x.v.some(function(y){return y[1]>0})});
  if(!rs.length)return{c:ct[0],n:null,s:"none",t:[]};
  var ts={};rs.forEach(function(x){x.v.forEach(function(y){if(y[1]>0)ts[y[0]]=1})});
  return{c:ct[0],n:rs.map(function(x){return x.n}).join(", ")+" (volume registrado, dose não consta no PDF)",s:"vol",t:Object.keys(ts).sort()}});
 return P}
function readPdfFile(file){return file.arrayBuffer().then(function(buf){return pdfjsLib.getDocument({data:buf}).promise}).then(function(pdf){
 var jobs=[];for(var n=1;n<=pdf.numPages;n++)jobs.push(pdf.getPage(n).then(function(pg){return pg.getTextContent()}).then(function(tc){var rows=pdfRows(tc.items);return{rows:rows,text:rows.map(function(r){return r.txt}).join("\n")}}));
 return Promise.all(jobs)})}
function readPdfs(files){var fs=$("fstatus");
 if(!window.pdfjsLib){fs.innerHTML='<span class="err">A biblioteca de PDF não carregou. Tente recarregar a página.</span>';return}
 pdfjsLib.GlobalWorkerOptions.workerSrc="vendor/pdf.worker.min.js";
 fs.textContent="Lendo "+files.length+" PDF(s)...";
 var pats=[],texts=[],fails=0;
 files.reduce(function(pr,f){return pr.then(function(){return readPdfFile(f)}).then(function(pages){pages.forEach(function(pg){texts.push(pg.text);var p=null;try{p=parsePdfPage(pg.rows,pg.text)}catch(e){}if(p)pats.push(p);else fails++})})},Promise.resolve()).then(function(){
  $("pdftext").textContent=texts.join("\n--- página ---\n");$("pdfout").hidden=false;
  if(!pats.length){fs.innerHTML='<span class="err">Não reconheci o layout do balanço hídrico neste PDF. O texto extraído está em "diagnóstico" abaixo. Se for escaneado, o texto não está embutido.</span>';return}
  var ref=pats[0].dataRef,base=(SOURCE==="importado"&&SRCKIND==="pdf"&&DATA.length&&DATA[0].dataRef===ref)?DATA.slice():[],outras=0;
  pats.forEach(function(p){if(p.dataRef!==ref){outras++;return}base=base.filter(function(x){return x.leito!==p.leito});base.push(p)});
  base.sort(function(a,b){return a.leito<b.leito?-1:a.leito>b.leito?1:0});
  DATA=base;SOURCE="importado";SRCKIND="pdf";SRCNAME=files.length+" PDF(s)";
  setWindow(ref+"T07:00");render();
  fs.textContent=pats.length-outras+" leito(s) lido(s). Data do balanço: "+dt(ref)+"; janela ajustada para 07:00 a 07:00."+(outras?" "+outras+" página(s) com outra data foram ignoradas.":"")+(fails?" "+fails+" página(s) não reconhecida(s).":"")+" Informe o peso em cada leito para calcular o débito urinário."
 }).catch(function(e){fs.innerHTML='<span class="err">Não consegui ler este PDF ('+esc(e&&e.message||e)+').</span>'})}
function readJson(file){var fs=$("fstatus"),fr=new FileReader();
 fr.onload=function(){try{var r=normalize(JSON.parse(fr.result));DATA=r.data;SOURCE="importado";SRCKIND="json";SRCNAME=file.name;loadObs();render();
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
 if(!clrArmed){clrArmed=true;b.textContent="Confirmar: apagar tudo";setTimeout(function(){clrArmed=false;b.textContent="Apagar observações e pesos"},5000);return}
 clrArmed=false;b.textContent="Apagar observações e pesos";OBS={};PESO={};try{localStorage.removeItem(okey())}catch(e){}render();status("Observações e pesos apagados.")};
$("sampleBtn").onclick=function(){DATA=SAMPLE;SOURCE="exemplo";SRCKIND="";SRCNAME="";loadObs();render();$("fstatus").textContent="Dados de exemplo restaurados."};
$("file").onchange=function(){var fl=Array.prototype.slice.call(this.files);if(!fl.length)return;$("pdfout").hidden=true;
 var isPdf=function(f){return/\.pdf$/i.test(f.name)||f.type==="application/pdf"};
 if(fl.every(isPdf))readPdfs(fl);else if(fl.length===1&&/\.json$/i.test(fl[0].name))readJson(fl[0]);else $("fstatus").innerHTML='<span class="err">Envie um ou mais PDFs, ou um único arquivo .json.</span>'};
$("sum").onclick=function(e){var b=e.target.closest("[data-go]");if(!b)return;var el=$("leito-"+b.getAttribute("data-go"));
 if(el)el.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
 else{onlyPend=false;$("onlyPend").checked=false;render();var e2=$("leito-"+b.getAttribute("data-go"));if(e2)e2.scrollIntoView()}};
$("cards").addEventListener("change",function(e){var t=e.target;if(!t.getAttribute||t.getAttribute("data-peso")===null)return;
 var lt=t.getAttribute("data-peso"),v=parseFloat(String(t.value).replace(",","."));if(v>0&&v<=300)PESO[lt]=v;else delete PESO[lt];saveObs();render();
 Array.prototype.forEach.call(document.querySelectorAll("input[data-peso]"),function(n){if(n.getAttribute("data-peso")===lt)n.focus()})});
$("cards").addEventListener("input",function(e){var t=e.target;if(t.getAttribute&&t.getAttribute("data-obs")!==null){OBS[t.getAttribute("data-obs")]=t.value;saveObs()}});

setWindow(WS);render();

if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
