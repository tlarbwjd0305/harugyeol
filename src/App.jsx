import { useState, useEffect } from "react";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function formatDate(str) {
  const [y,m,d] = str.split("-");
  const days = ["일","월","화","수","목","금","토"];
  return { full:`${y}년 ${parseInt(m)}월 ${parseInt(d)}일`, dow:days[new Date(str).getDay()]+"요일" };
}
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const ACCENT = "#1A1A1A";
const SOFT   = "#F5F3EF";
const CHECK  = "#2D6A4F";
const BORDER = "#E8E4DC";
const FONT   = "'Noto Sans KR','Apple SD Gothic Neo',sans-serif";
const DAYS   = ["일","월","화","수","목","금","토"];

function HistoryCalendar({ daily, today }) {
  const now = new Date(today);
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [sel, setSel] = useState(null);
  const [histView, setHistView] = useState("calendar");

  function getPct(dateStr) {
    const hh = load(`habits-${dateStr.slice(0,7)}`, []);
    if (!hh.length) return null;
    const dd = daily[dateStr];
    return Math.round(hh.filter(h => dd?.checks?.[h.id]).length / hh.length * 100);
  }
  function dotColor(pct) {
    if (pct === null) return null;
    if (pct === 100) return CHECK;
    if (pct >= 50)  return "#74B49B";
    return "#D0C9BC";
  }

  const totalDays = new Date(yr, mo+1, 0).getDate();
  const firstDay  = new Date(yr, mo, 1).getDay();
  const selHabits = sel ? load(`habits-${sel.slice(0,7)}`, []) : [];
  const selData   = sel ? daily[sel] : null;
  const selPct    = sel ? getPct(sel) : null;
  const isNextDis = yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth());

  function prevMo() { if(mo===0){setYr(y=>y-1);setMo(11);}else setMo(m=>m-1); setSel(null); }
  function nextMo() { if(isNextDis)return; if(mo===11){setYr(y=>y+1);setMo(0);}else setMo(m=>m+1); setSel(null); }

  const graphDays = Array.from({length:totalDays},(_,i)=>{
    const day = i+1;
    const dateStr = `${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return { day, dateStr, pct: getPct(dateStr) };
  });

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>
        <div>
          <div style={s.pageTitleMain}>기록</div>
          <div style={s.pageTitleSub}>달력 또는 그래프로 보기</div>
        </div>
        <div style={{display:"flex",gap:2,background:"#EDE9E2",borderRadius:20,padding:3}}>
          <button onClick={()=>setHistView("calendar")} style={{...s.tab,...(histView==="calendar"?s.tabActive:{}),padding:"5px 12px"}}>📅 달력</button>
          <button onClick={()=>setHistView("graph")} style={{...s.tab,...(histView==="graph"?s.tabActive:{}),padding:"5px 12px"}}>📊 그래프</button>
        </div>
      </div>

      <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"center"}}>
        <button onClick={prevMo} style={s.calNavBtn}>‹</button>
        <span style={{fontSize:14,fontWeight:600,minWidth:72,textAlign:"center",fontFamily:FONT}}>{yr}년 {mo+1}월</span>
        <button onClick={nextMo} style={{...s.calNavBtn,opacity:isNextDis?0.3:1}} disabled={isNextDis}>›</button>
      </div>

      {histView==="calendar" && (<>
        <div style={s.calDayHeaders}>
          {DAYS.map(d=><div key={d} style={{...s.calDayHeader,color:d==="일"?"#E07070":d==="토"?"#7090C8":"#AAA"}}>{d}</div>)}
        </div>
        <div style={s.calGrid}>
          {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:totalDays}).map((_,i)=>{
            const day=i+1;
            const dateStr=`${yr}-${String(mo+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const pct=getPct(dateStr); const dot=dotColor(pct);
            const isToday=dateStr===today; const isSel=dateStr===sel; const isFuture=dateStr>today;
            return (
              <button key={day} onClick={()=>!isFuture&&setSel(isSel?null:dateStr)} disabled={isFuture}
                style={{...s.calCell,...(isSel?{background:ACCENT,borderColor:ACCENT}:{}),...(isToday&&!isSel?{borderColor:CHECK,borderWidth:"1.5px"}:{}),...(isFuture?{opacity:0.2,cursor:"default"}:{})}}>
                <span style={{...s.calDayNum,color:isSel?"#fff":isToday?CHECK:ACCENT}}>{day}</span>
                {dot&&!isSel&&<div style={{...s.calDot,background:dot}}/>}
                {isSel&&daily[dateStr]&&<div style={{...s.calDot,background:"#fff"}}/>}
              </button>
            );
          })}
        </div>
        <div style={s.calLegend}>
          {[[CHECK,"100%"],["#74B49B","50% 이상"],["#D0C9BC","기록 있음"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#AAA",fontFamily:FONT}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>{l}
            </div>
          ))}
        </div>
        {sel&&(
          <div style={s.detailCard}>
            <div style={s.detailHeader}>
              <div>
                <div style={s.detailDate}>{formatDate(sel).full}</div>
                <div style={s.detailDow}>{formatDate(sel).dow}</div>
              </div>
              {selPct!==null&&<div style={{...s.detailBadge,background:selPct===100?CHECK:selPct>=50?"#74B49B":"#D0C9BC"}}>{selPct}%</div>}
            </div>
            {selData?.note&&<div><div style={s.detailLabel}>한 줄</div><div style={s.detailNoteText}>"{selData.note}"</div></div>}
            {selHabits.length>0&&(
              <div>
                <div style={s.detailLabel}>습관</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {selHabits.map(h=>{
                    const done=!!selData?.checks?.[h.id];
                    return (
                      <div key={h.id} style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{...s.detailCheck,...(done?{background:CHECK,borderColor:CHECK}:{})}}>{done&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}</div>
                        <span style={{fontSize:14,fontFamily:FONT,color:done?ACCENT:"#BBB"}}>{h.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {!selData&&<div style={{color:"#CCC",fontSize:13,fontFamily:FONT,textAlign:"center",padding:"8px 0"}}>이 날은 기록이 없어요</div>}
          </div>
        )}
      </>)}

      {histView==="graph"&&(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:16,padding:"20px 16px"}}>
            <div style={{fontSize:12,color:"#AAA",fontFamily:FONT,marginBottom:14,letterSpacing:"0.1em",textTransform:"uppercase"}}>일별 달성률</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:100}}>
              {graphDays.map(({day,dateStr,pct})=>{
                const isToday=dateStr===today; const isFuture=dateStr>today;
                const h=pct!==null?Math.max(4,pct):0;
                const bg=pct===100?CHECK:pct>=50?"#74B49B":pct!==null?"#D0C9BC":"#F0EDE8";
                return (
                  <div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",background:isFuture?"#F0EDE8":bg,outline:isToday?`2px solid ${CHECK}`:"none",opacity:isFuture?0.3:1,transition:"height 0.4s ease"}}/>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:3,marginTop:4}}>
              {graphDays.map(({day})=>(
                <div key={day} style={{flex:1,textAlign:"center",fontSize:9,color:"#CCC",fontFamily:FONT}}>{day%5===0?day:""}</div>
              ))}
            </div>
          </div>
          <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:16,padding:"20px"}}>
            <div style={{fontSize:12,color:"#AAA",fontFamily:FONT,marginBottom:14,letterSpacing:"0.1em",textTransform:"uppercase"}}>이달 요약</div>
            {(()=>{
              const recorded=graphDays.filter(d=>d.pct!==null&&d.dateStr<=today);
              const perfect=recorded.filter(d=>d.pct===100).length;
              const avg=recorded.length>0?Math.round(recorded.reduce((a,d)=>a+(d.pct||0),0)/recorded.length):0;
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
                  {[[recorded.length+"일","기록"],[perfect+"일","완벽"],[avg+"%","평균"]].map(([val,label])=>(
                    <div key={label} style={{background:SOFT,borderRadius:12,padding:"14px 8px"}}>
                      <div style={{fontSize:20,fontWeight:700,fontFamily:FONT,color:ACCENT}}>{val}</div>
                      <div style={{fontSize:11,color:"#AAA",fontFamily:FONT,marginTop:4}}>{label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          {(()=>{
            const mHabits=load(`habits-${yr}-${String(mo+1).padStart(2,"0")}`,[]);
            if(!mHabits.length)return null;
            const pastDays=graphDays.filter(d=>d.dateStr<=today);
            return (
              <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:16,padding:"20px"}}>
                <div style={{fontSize:12,color:"#AAA",fontFamily:FONT,marginBottom:14,letterSpacing:"0.1em",textTransform:"uppercase"}}>습관별 달성</div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {mHabits.map(h=>{
                    const done=pastDays.filter(d=>daily[d.dateStr]?.checks?.[h.id]).length;
                    const pct=pastDays.length>0?Math.round(done/pastDays.length*100):0;
                    return (
                      <div key={h.id}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:13,fontFamily:FONT,color:ACCENT}}>{h.name}</span>
                          <span style={{fontSize:12,fontFamily:FONT,color:"#AAA"}}>{done}/{pastDays.length}일 · {pct}%</span>
                        </div>
                        <div style={{height:6,background:"#F0EDE8",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:pct===100?CHECK:pct>=50?"#74B49B":"#D0C9BC",transition:"width 0.5s ease"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const today = todayKey();
  const month = monthKey();
  const {full, dow} = formatDate(today);

  const [habits, setHabits] = useState(()=>load(`habits-${month}`,[]));
  const [daily,  setDaily]  = useState(()=>load("daily",{}));
  const [view,   setView]   = useState("today");
  const [editMode,  setEditMode]  = useState(false);
  const [newHabit,  setNewHabit]  = useState("");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(()=>{save(`habits-${month}`,habits);},[habits]);
  useEffect(()=>{save("daily",daily);},[daily]);

  const todayData    = daily[today] || {checks:{},note:""};
  const checkedCount = habits.filter(h=>todayData.checks?.[h.id]).length;
  const pct          = habits.length>0?Math.round(checkedCount/habits.length*100):0;

  function toggleCheck(id) { setDaily(p=>({...p,[today]:{...todayData,checks:{...todayData.checks,[id]:!todayData.checks?.[id]}}})); }
  function setNote(val) { setDaily(p=>({...p,[today]:{...todayData,note:val}})); }
  function handleSave() { setJustSaved(true); setTimeout(()=>setJustSaved(false),2000); }
  function addHabit() {
    if(!newHabit.trim()||habits.length>=10)return;
    setHabits(p=>[...p,{id:Date.now().toString(),name:newHabit.trim()}]);
    setNewHabit("");
  }
  function removeHabit(id) { setHabits(p=>p.filter(h=>h.id!==id)); }

  let streak=0;
  for(let i=0;i<60;i++){
    const d=new Date(today); d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    const hh=load(`habits-${k.slice(0,7)}`,[]);
    if(!hh.length)break;
    if(hh.filter(h=>daily[k]?.checks?.[h.id]).length===hh.length)streak++;
    else break;
  }

  return (
    <div style={s.root}>
      <div style={s.grain}/>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>하루결</div>
          <div style={s.tabs}>
            {[["today","오늘"],["habits","습관"],["history","기록"]].map(([id,label])=>(
              <button key={id} onClick={()=>setView(id)} style={{...s.tab,...(view===id?s.tabActive:{})}}>{label}</button>
            ))}
          </div>
        </div>
      </header>
      <main style={s.main}>
        {view==="today"&&(
          <div style={s.page}>
            <div>
              <div style={s.dateMain}>{full}</div>
              <div style={s.dateSub}>{dow}</div>
            </div>
            <div style={s.ringWrap}>
              <svg width="96" height="96" style={{transform:"rotate(-90deg)"}}>
                <circle cx="48" cy="48" r="40" fill="none" stroke={BORDER} strokeWidth="5"/>
                <circle cx="48" cy="48" r="40" fill="none" stroke={CHECK} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*40}`}
                  strokeDashoffset={`${2*Math.PI*40*(1-pct/100)}`}
                  style={{transition:"stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)"}}/>
              </svg>
              <div style={s.ringLabel}>
                <span style={s.ringPct}>{pct}<span style={s.ringUnit}>%</span></span>
              </div>
            </div>
            <div style={s.ringCaption}>{habits.length>0?`${checkedCount} / ${habits.length} 완료`:"습관을 먼저 설정해보세요"}</div>
            {habits.length>0&&(
              <div style={s.checkList}>
                {habits.map(h=>{
                  const checked=!!todayData.checks?.[h.id];
                  return (
                    <button key={h.id} onClick={()=>toggleCheck(h.id)}
                      style={{...s.checkItem,background:checked?"#F0F7F4":"#fff",borderColor:checked?"#2D6A4F33":BORDER}}>
                      <div style={{...s.checkbox,...(checked?s.checkboxOn:{})}}>{checked&&<span style={s.checkmark}>✓</span>}</div>
                      <span style={{...s.checkLabel,...(checked?s.checkLabelDone:{})}}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div>
              <div style={s.noteLabel}>오늘 한 줄</div>
              <input value={todayData.note||""} onChange={e=>setNote(e.target.value)} placeholder="오늘 하루를 한 문장으로..." style={s.noteInput} maxLength={80}/>
            </div>
            <button onClick={handleSave} style={{...s.saveBtn,...(justSaved?{background:CHECK}:{})}}>{justSaved?"✓  저장됐어요":"저장"}</button>
            {streak>1&&<div style={s.streakBadge}>🔥 {streak}일 연속 달성 중</div>}
          </div>
        )}
        {view==="habits"&&(
          <div style={s.page}>
            <div style={s.pageTitle}>
              <div>
                <div style={s.pageTitleMain}>이달의 습관</div>
                <div style={s.pageTitleSub}>{new Date().getMonth()+1}월 · 최대 10개</div>
              </div>
              <button onClick={()=>setEditMode(!editMode)} style={{...s.editToggle,...(editMode?{background:ACCENT,color:"#fff",borderColor:ACCENT}:{})}}>{editMode?"완료":"편집"}</button>
            </div>
            <div style={s.habitList}>
              {habits.map((h,i)=>(
                <div key={h.id} style={s.habitRow}>
                  <div style={s.habitNum}>{String(i+1).padStart(2,"0")}</div>
                  <div style={s.habitName}>{h.name}</div>
                  {editMode&&<button onClick={()=>removeHabit(h.id)} style={s.removeBtn}>✕</button>}
                </div>
              ))}
              {habits.length===0&&<div style={s.emptyState}>아직 습관이 없어요.<br/>아래에서 추가해보세요 🌱</div>}
            </div>
            {habits.length<10?(
              <div style={s.addRow}>
                <input value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addHabit()} placeholder="새 습관 추가..." style={s.addInput} maxLength={30}/>
                <button onClick={addHabit} style={s.addBtn}>+</button>
              </div>
            ):<div style={s.maxNote}>10개 모두 설정됐어요 👍</div>}
          </div>
        )}
        {view==="history"&&<HistoryCalendar daily={daily} today={today}/>}
      </main>
    </div>
  );
}

const s = {
  root:{minHeight:"100vh",background:SOFT,fontFamily:FONT,color:ACCENT,position:"relative"},
  grain:{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,backgroundRepeat:"repeat",backgroundSize:"128px",opacity:0.6},
  header:{position:"sticky",top:0,zIndex:50,background:"rgba(245,243,239,0.9)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${BORDER}`},
  headerInner:{maxWidth:520,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logo:{fontSize:17,fontWeight:600,letterSpacing:"0.06em",color:ACCENT,fontFamily:FONT},
  tabs:{display:"flex",gap:2,background:"#EDE9E2",borderRadius:20,padding:3},
  tab:{background:"transparent",border:"none",color:"#999",borderRadius:16,padding:"5px 14px",fontSize:13,cursor:"pointer",transition:"all 0.2s",fontFamily:FONT},
  tabActive:{background:"#fff",color:ACCENT,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"},
  main:{maxWidth:520,margin:"0 auto",padding:"32px 24px 80px",position:"relative",zIndex:1},
  page:{display:"flex",flexDirection:"column",gap:24},
  dateMain:{fontSize:22,fontWeight:500,letterSpacing:"0.02em",fontFamily:FONT},
  dateSub:{fontSize:13,color:"#999",marginTop:4,fontFamily:FONT},
  ringWrap:{display:"flex",justifyContent:"center",position:"relative",width:96,margin:"0 auto"},
  ringLabel:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"},
  ringPct:{fontSize:20,fontWeight:700,letterSpacing:"-0.03em",fontFamily:FONT},
  ringUnit:{fontSize:12,fontWeight:400},
  ringCaption:{textAlign:"center",fontSize:13,color:"#999",marginTop:-8,fontFamily:FONT},
  checkList:{display:"flex",flexDirection:"column",gap:8},
  checkItem:{display:"flex",alignItems:"center",gap:14,border:`1px solid ${BORDER}`,borderRadius:14,padding:"13px 16px",cursor:"pointer",transition:"all 0.18s",textAlign:"left",width:"100%"},
  checkbox:{width:22,height:22,borderRadius:7,border:"1.5px solid #D0CBC0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.18s"},
  checkboxOn:{background:CHECK,borderColor:CHECK},
  checkmark:{color:"#fff",fontSize:13,fontWeight:700},
  checkLabel:{fontSize:15,color:ACCENT,fontFamily:FONT,transition:"all 0.18s"},
  checkLabelDone:{color:"#999",textDecoration:"line-through"},
  noteLabel:{fontSize:11,letterSpacing:"0.12em",color:"#AAA",marginBottom:8,textTransform:"uppercase",fontFamily:FONT},
  noteInput:{width:"100%",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:14,padding:"14px 16px",fontSize:15,color:ACCENT,outline:"none",boxSizing:"border-box",fontFamily:FONT},
  saveBtn:{width:"100%",padding:"15px",background:ACCENT,border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",transition:"all 0.25s",letterSpacing:"0.08em",fontFamily:FONT},
  streakBadge:{textAlign:"center",fontSize:13,color:"#888",fontFamily:FONT},
  pageTitle:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},
  pageTitleMain:{fontSize:20,fontWeight:600,letterSpacing:"0.02em",fontFamily:FONT},
  pageTitleSub:{fontSize:13,color:"#999",marginTop:4,fontFamily:FONT},
  editToggle:{background:"transparent",border:`1px solid ${BORDER}`,borderRadius:20,padding:"6px 16px",fontSize:13,color:"#999",cursor:"pointer",fontFamily:FONT,transition:"all 0.2s"},
  habitList:{display:"flex",flexDirection:"column",gap:6},
  habitRow:{display:"flex",alignItems:"center",gap:14,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:14,padding:"14px 16px"},
  habitNum:{fontSize:11,color:"#CCC",fontWeight:700,letterSpacing:"0.05em",flexShrink:0,fontFamily:FONT},
  habitName:{flex:1,fontSize:15,color:ACCENT,fontFamily:FONT},
  removeBtn:{background:"none",border:"none",color:"#CCC",fontSize:14,cursor:"pointer",padding:"0 4px"},
  addRow:{display:"flex",gap:8},
  addInput:{flex:1,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,padding:"12px 14px",fontSize:14,color:ACCENT,outline:"none",fontFamily:FONT},
  addBtn:{width:46,height:46,background:ACCENT,border:"none",borderRadius:12,color:"#fff",fontSize:22,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
  maxNote:{textAlign:"center",fontSize:13,color:"#AAA",fontFamily:FONT},
  emptyState:{textAlign:"center",color:"#BBB",fontSize:14,lineHeight:1.8,padding:"28px 0",fontFamily:FONT},
  calNavBtn:{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:18,color:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT},
  calDayHeaders:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",marginBottom:4},
  calDayHeader:{fontSize:11,padding:"4px 0",fontFamily:FONT},
  calGrid:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5},
  calCell:{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"6px 4px 5px",cursor:"pointer",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:46},
  calDayNum:{fontSize:13,fontWeight:500,fontFamily:FONT},
  calDot:{width:5,height:5,borderRadius:"50%"},
  calLegend:{display:"flex",gap:16,justifyContent:"center"},
  detailCard:{background:"#fff",border:`1px solid ${BORDER}`,borderRadius:18,padding:"20px",display:"flex",flexDirection:"column",gap:16},
  detailHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},
  detailDate:{fontSize:16,fontWeight:600,fontFamily:FONT},
  detailDow:{fontSize:12,color:"#AAA",marginTop:3,fontFamily:FONT},
  detailBadge:{borderRadius:20,padding:"4px 12px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:FONT},
  detailLabel:{fontSize:10,letterSpacing:"0.12em",color:"#BBB",textTransform:"uppercase",marginBottom:8,fontFamily:FONT},
  detailNoteText:{fontSize:14,color:"#666",fontFamily:FONT,lineHeight:1.6},
  detailCheck:{width:20,height:20,borderRadius:6,border:"1.5px solid #D0CBC0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
};