import { useState } from 'react';
import Head from 'next/head';

const ACCENT = { trendy:'#ff3b3b', informative:'#00c2a0', emotional:'#a259ff', listicle:'#ffde59' };
const ACCENT2 = { trendy:'#ffde59', informative:'#00e5c0', emotional:'#ff79c6', listicle:'#ff8c42' };
const QUICK = ['2026 아카데미 시상식 결과','K드라마 OST 트렌드','OTT 신작 추천','아이돌 컴백 소식','팝업스토어 핫플','요즘 뜨는 전시회'];
const ACADEMY_DATA = `
[실제 데이터 — 제98회 아카데미 시상식 2026.03.15 최종 결과]
작품상+감독상+각색상+편집상 4관왕: 원 배틀 애프터 어나더
남우주연상: 마이클 B. 조던 (씨너스 — 쌍둥이 1인 2역)
여우주연상: 제시 버클리 (햄넷)
여우조연상: 에이미 매디건
장편 애니메이션+주제가상(Golden): 케이팝 데몬 헌터스 (Netflix)
국제영화상: 감상적 가치 (노르웨이)
미술+의상+분장상 3관왕: 프랑켄슈타인
시각효과상: 아바타 파이어 앤 애시
최다 노미네이션: 씨너스 16개 부문 (역대 최다)
호스트: 코난 오브라이언 2년 연속`;

function SlideCard({ slide, idx, total, accent, accent2, seriesTitle }) {
  const base = { width:260, height:260, borderRadius:8, flexShrink:0, position:'relative', overflow:'hidden', fontFamily:'sans-serif' };
  if (slide.type === 'cover') return (
    <div style={{...base, background:'#0a0a0a', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:18}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${accent},${accent2},#00c2a0)`}}/>
      <div style={{position:'absolute',top:12,right:14,fontFamily:'monospace',fontSize:9,color:'#333'}}>{String(idx+1).padStart(2,'0')}/{String(total).padStart(2,'0')}</div>
      <div style={{color:accent,fontFamily:'monospace',fontSize:8,letterSpacing:3,textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
        <span style={{width:12,height:1,background:accent,display:'inline-block'}}/>{slide.tag||'TREND'}
      </div>
      <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,color:'#f5f4ef',marginBottom:6}}>{slide.headline}</div>
      <div style={{fontSize:10,color:'#666',lineHeight:1.6}}>{slide.subtitle}</div>
    </div>
  );
  if (slide.type === 'body') return (
    <div style={{...base, background:'#111', padding:18, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
      <div>
        <div style={{width:22,height:3,background:accent,borderRadius:2,marginBottom:8}}/>
        <div style={{fontSize:16,fontWeight:900,lineHeight:1.2,color:'#f5f4ef',marginBottom:7}}>{slide.headline}</div>
        <div style={{background:'rgba(255,255,255,0.04)',borderLeft:`3px solid ${accent2}`,padding:'5px 9px',borderRadius:'0 3px 3px 0',fontSize:10,fontWeight:600,color:accent2,lineHeight:1.5,marginBottom:7}}>{slide.highlight}</div>
        <div style={{fontSize:10,color:'#aaa',lineHeight:1.75}}>{slide.content}</div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #222',paddingTop:7}}>
        <div style={{fontFamily:'monospace',fontSize:7,color:'#444',letterSpacing:2}}>{seriesTitle}</div>
        <div style={{fontFamily:'monospace',fontSize:8,color:'#333'}}>{String(idx+1).padStart(2,'0')}/{String(total).padStart(2,'0')}</div>
      </div>
    </div>
  );
  return (
    <div style={{...base, background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:22}}>
      <div style={{position:'absolute',width:140,height:140,border:`30px solid ${accent}`,borderRadius:'50%',opacity:0.05,top:-45,right:-45}}/>
      <div style={{position:'absolute',width:100,height:100,border:`22px solid ${accent2}`,borderRadius:'50%',opacity:0.05,bottom:-30,left:-30}}/>
      <div style={{fontSize:20,fontWeight:900,color:accent2,marginBottom:7,lineHeight:1.2}}>{slide.headline}</div>
      <div style={{fontSize:10,color:'#555',lineHeight:1.7,marginBottom:12}}>{slide.content}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center'}}>
        {(slide.hashtags||[]).map((h,i)=><span key={i} style={{fontFamily:'monospace',fontSize:8,color:'#444',padding:'2px 5px',border:'1px solid #222',borderRadius:2}}>#{h}</span>)}
      </div>
    </div>
  );
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('trendy');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [sheetsStatus, setSheetsStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [stage, setStage] = useState('idle');
  const [log, setLog] = useState([]);
  const [steps, setSteps] = useState({ai:'',review:'',archive:'',done:''});

  const addLog = (msg, type='') => setLog(l=>[...l,{msg,type,time:new Date().toLocaleTimeString('ko-KR')}]);
  const setStep = (s,v) => setSteps(p=>({...p,[s]:v}));
  const acc = ACCENT[tone], acc2 = ACCENT2[tone];

  async function testSheets() {
    if (!sheetsUrl.trim()) return;
    setSheetsStatus('testing');
    try {
      const res = await fetch('/api/sheets', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sheetsUrl: sheetsUrl.trim(), payload: { test: true, timestamp: new Date().toISOString() } })
      });
      if (res.ok) { setSheetsStatus('ok'); addLog('Google Sheets 연결 확인 ✓','ok'); }
      else throw new Error('failed');
    } catch(e) { setSheetsStatus('err'); addLog('Sheets 연결 실패 — URL 확인하세요','err'); }
  }

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setData(null); setStage('idle'); setLog([]);
    setSteps({ai:'active',review:'',archive:'',done:''});
    const isAcademy = /아카데미|오스카|Oscar/i.test(topic);
    try {
      const res = await fetch('/api/generate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ topic, tone, academyData: isAcademy ? ACADEMY_DATA : '' })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setData(parsed); setStep('ai','done'); setStep('review','active'); setStage('review');
    } catch(e) {
      setStep('ai','error'); addLog('생성 실패: '+e.message,'err');
    } finally { setLoading(false); }
  }

  function updateField(idx, field, value) {
    setData(d=>({...d, slides:d.slides.map((s,i)=>i===idx?{...s,[field]:value}:s)}));
  }

  async function approve() {
    setStep('review','done'); setStep('archive','active');
    if (sheetsUrl.trim()) {
      try {
        const res = await fetch('/api/sheets', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            sheetsUrl: sheetsUrl.trim(),
            payload: { timestamp:new Date().toISOString(), topic, tone, series_title:data.series_title, hashtags:(data.hashtags||[]).join(', '), slides:data.slides.map((s,i)=>({num:i+1,type:s.type,headline:s.headline,content:s.content||s.subtitle||''})) }
          })
        });
        const ok = res.ok;
        setStep('archive', ok?'done':'error');
        addLog(ok?'Google Sheets 저장 완료 ✓':'Sheets 저장 실패','ok');
      } catch(e) { setStep('archive','error'); addLog('Sheets 오류: '+e.message,'err'); }
    } else {
      setStep('archive','done'); addLog('Sheets URL 없음 — CSV로 저장하세요','info');
    }
    setStep('done','done'); setStage('done');
    addLog(`"${data.series_title}" 승인 완료 ✓`,'ok');
  }

  function downloadCSV() {
    if (!data) return;
    const rows=[['번호','타입','헤드라인','하이라이트','본문','시리즈','해시태그','주제','생성일'],
      ...data.slides.map((s,i)=>[i+1,s.type,s.headline,s.highlight||'',s.content||s.subtitle||'',data.series_title,(data.hashtags||[]).join(' '),topic,new Date().toLocaleDateString('ko-KR')])];
    const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    a.download=`cardwave-${data.series_title||'export'}.csv`; a.click();
    addLog('CSV 다운로드 완료','ok');
  }

  function downloadJSON() {
    if (!data) return;
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download=`cardwave-${data.series_title||'export'}.json`; a.click();
    addLog('JSON 다운로드 완료 → Figma 플러그인으로 임포트','ok');
  }

  const dotC={'':'#2a2a2a',active:'#ffde59',done:'#00c2a0',error:'#ff3b3b'};

  return (
    <>
      <Head><title>CARDWAVE — AI 카드뉴스 스튜디오</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0a0a;color:#f5f4ef;font-family:'Noto Sans KR',sans-serif;}
        textarea,input{font-family:inherit;}
        textarea:focus,input:focus{outline:none;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'rgba(10,10,10,0.97)',zIndex:100}}>
        <div style={{fontSize:20,fontWeight:900,letterSpacing:4}}>CARD<span style={{color:'#ff3b3b'}}>WAVE</span></div>
        <div style={{display:'flex',gap:4,alignItems:'center'}}>
          {[['ai','AI생성'],['review','검토'],['archive','저장'],['done','완료']].map(([k,n],i)=>(
            <span key={k} style={{display:'flex',alignItems:'center',gap:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:dotC[steps[k]],display:'inline-block'}}/>
              <span style={{fontFamily:'monospace',fontSize:8,color:steps[k]?'#888':'#333',letterSpacing:1}}>{n}</span>
              {i<3&&<span style={{color:'#1a1a1a',margin:'0 2px'}}>—</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{display:'flex',height:'calc(100vh - 53px)'}}>
        {/* Left Panel */}
        <div style={{width:270,borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column',overflowY:'auto',flexShrink:0}}>
          {/* 주제 */}
          <div style={{padding:'18px 18px 14px'}}>
            <div style={{fontFamily:'monospace',fontSize:8,color:'#555',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>— 주제</div>
            <textarea value={topic} onChange={e=>setTopic(e.target.value)} placeholder="예: 2026 아카데미 시상식 결과..." style={{width:'100%',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:4,padding:'10px 12px',color:'#f5f4ef',fontSize:12,resize:'none',height:64,lineHeight:1.6}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>
              {QUICK.map(q=><button key={q} onClick={()=>setTopic(q)} style={{fontSize:9,padding:'2px 7px',border:'1px solid #222',borderRadius:2,background:'none',color:'#555',cursor:'pointer'}}>{q}</button>)}
            </div>
          </div>

          {/* 톤 */}
          <div style={{padding:'0 18px 14px',borderBottom:'1px solid #1a1a1a'}}>
            <div style={{fontFamily:'monospace',fontSize:8,color:'#555',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>— 톤 & 스타일</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
              {[['trendy','🔥','트렌디','MZ 감성'],['informative','📊','정보형','팩트'],['emotional','💫','감성형','스토리'],['listicle','📝','리스티클','TOP N']].map(([k,icon,name,sub])=>(
                <button key={k} onClick={()=>setTone(k)} style={{padding:'8px',background:'#111',border:`1px solid ${tone===k?ACCENT2[k]:'#222'}`,borderRadius:4,color:tone===k?ACCENT2[k]:'#555',cursor:'pointer',textAlign:'left'}}>
                  <div style={{fontSize:12,marginBottom:2}}>{icon}</div>
                  <div style={{fontSize:10,fontWeight:600}}>{name}</div>
                  <div style={{fontSize:9,color:tone===k?ACCENT[k]:'#333',marginTop:1}}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Google Sheets */}
          <div style={{padding:'14px 18px',borderBottom:'1px solid #1a1a1a'}}>
            <div style={{fontFamily:'monospace',fontSize:8,color:'#555',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>— Google Sheets</div>
            <div style={{fontSize:10,color:'#444',lineHeight:1.6,marginBottom:8}}>Apps Script 웹훅 URL 입력 시 승인 후 자동 저장</div>
            <div style={{display:'flex',gap:5}}>
              <input value={sheetsUrl} onChange={e=>{setSheetsUrl(e.target.value);setSheetsStatus('idle');}} placeholder="https://script.google.com/macros/s/..."
                style={{flex:1,background:'#111',border:`1px solid ${sheetsStatus==='ok'?'#00c2a0':sheetsStatus==='err'?'#ff3b3b':'#222'}`,borderRadius:3,padding:'7px 9px',color:'#f5f4ef',fontSize:9,fontFamily:'monospace',minWidth:0}}/>
              <button onClick={testSheets} disabled={!sheetsUrl.trim()||sheetsStatus==='testing'}
                style={{padding:'7px 9px',background:'none',border:`1px solid ${sheetsStatus==='ok'?'#00c2a0':sheetsStatus==='err'?'#ff3b3b':'#2a2a2a'}`,borderRadius:3,color:sheetsStatus==='ok'?'#00c2a0':sheetsStatus==='err'?'#ff3b3b':'#666',fontFamily:'monospace',fontSize:9,cursor:'pointer',whiteSpace:'nowrap'}}>
                {sheetsStatus==='testing'?'...':sheetsStatus==='ok'?'OK ✓':sheetsStatus==='err'?'ERR':'TEST'}
              </button>
            </div>
          </div>

          {/* Generate */}
          <div style={{padding:18}}>
            <button onClick={generate} disabled={loading||!topic.trim()} style={{width:'100%',padding:13,background:loading||!topic.trim()?'#1a1a1a':'#ff3b3b',border:'none',borderRadius:4,color:loading||!topic.trim()?'#444':'#fff',fontWeight:900,fontSize:13,letterSpacing:3,cursor:loading||!topic.trim()?'not-allowed':'pointer'}}>
              {loading?'생성 중...':'GENERATE'}
            </button>
          </div>

          {/* Log */}
          {log.length>0&&(
            <div style={{margin:'0 18px 18px',padding:10,background:'#060606',border:'1px solid #1a1a1a',borderRadius:4,maxHeight:110,overflowY:'auto'}}>
              {log.map((l,i)=><div key={i} style={{fontFamily:'monospace',fontSize:9,color:l.type==='ok'?'#00c2a0':l.type==='err'?'#ff3b3b':'#ffde59',lineHeight:1.8}}>[{l.time}] {l.msg}</div>)}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Idle */}
          {stage==='idle'&&!loading&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
              <div style={{fontSize:40,opacity:0.15}}>⚡</div>
              <div style={{fontWeight:900,fontSize:22,letterSpacing:4,color:'#1e1e1e'}}>READY TO CREATE</div>
              <div style={{fontSize:11,color:'#2a2a2a',textAlign:'center',lineHeight:1.9}}>주제를 입력하고 GENERATE를 눌러보세요</div>
            </div>
          )}

          {/* Loading */}
          {loading&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}}>
              <div style={{width:28,height:28,border:`3px solid #1a1a1a`,borderTopColor:acc,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
              <div style={{fontFamily:'monospace',fontSize:10,color:'#444',letterSpacing:2}}>AI GENERATING...</div>
            </div>
          )}

          {/* Review */}
          {stage==='review'&&data&&(
            <>
              <div style={{padding:'12px 20px',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                <div style={{fontWeight:900,fontSize:14,letterSpacing:2}}>REVIEW <span style={{color:acc2,fontSize:11,fontWeight:400}}>— 편집 후 승인</span></div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={generate} style={{padding:'6px 12px',background:'none',border:'1px solid #2a2a2a',borderRadius:3,color:'#888',fontSize:10,fontWeight:700,letterSpacing:1,cursor:'pointer'}}>↻ 재생성</button>
                  <button onClick={approve} style={{padding:'6px 14px',background:'#00c2a0',border:'none',borderRadius:3,color:'#000',fontSize:10,fontWeight:900,letterSpacing:1,cursor:'pointer'}}>✓ 승인</button>
                </div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
                {data.slides.map((slide,idx)=>(
                  <div key={idx} style={{display:'flex',gap:14,padding:14,background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:8}}>
                    <SlideCard slide={slide} idx={idx} total={data.slides.length} accent={acc} accent2={acc2} seriesTitle={data.series_title}/>
                    <div style={{flex:1,display:'flex',flexDirection:'column',gap:7,minWidth:0}}>
                      <div style={{display:'flex',gap:5,alignItems:'center'}}>
                        <span style={{fontFamily:'monospace',fontSize:8,color:'#444',letterSpacing:2}}>SLIDE {String(idx+1).padStart(2,'0')}</span>
                        <span style={{fontSize:8,padding:'1px 5px',borderRadius:2,background:slide.type==='cover'?'#ff3b3b18':slide.type==='body'?'#00c2a018':'#a259ff18',color:slide.type==='cover'?'#ff3b3b':slide.type==='body'?'#00c2a0':'#a259ff',border:`1px solid ${slide.type==='cover'?'#ff3b3b33':slide.type==='body'?'#00c2a033':'#a259ff33'}`,fontFamily:'monospace'}}>
                          {slide.type==='cover'?'커버':slide.type==='body'?'본문':'마무리'}
                        </span>
                      </div>
                      <textarea value={slide.headline} onChange={e=>updateField(idx,'headline',e.target.value)} style={{background:'#111',border:'1px solid #222',borderRadius:3,padding:'7px 10px',color:'#f5f4ef',fontSize:11,fontWeight:700,resize:'none',height:42,width:'100%'}}/>
                      {slide.highlight&&<textarea value={slide.highlight} onChange={e=>updateField(idx,'highlight',e.target.value)} style={{background:'#111',border:'1px solid #222',borderRadius:3,padding:'7px 10px',color:acc2,fontSize:10,resize:'none',height:36,width:'100%'}}/>}
                      <textarea value={slide.content||slide.subtitle||''} onChange={e=>updateField(idx,slide.type==='cover'?'subtitle':'content',e.target.value)} style={{background:'#111',border:'1px solid #222',borderRadius:3,padding:'7px 10px',color:'#888',fontSize:10,resize:'none',flex:1,minHeight:70,width:'100%',lineHeight:1.7}}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Done */}
          {stage==='done'&&data&&(
            <>
              <div style={{padding:'12px 20px',borderBottom:'1px solid #1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                <div style={{fontWeight:900,fontSize:14,letterSpacing:2}}>EXPORT <span style={{color:'#00c2a0',fontSize:11,fontWeight:400}}>— 내보내기</span></div>
                <button onClick={()=>{setStage('idle');setData(null);setTopic('');setLog([]);setSteps({ai:'',review:'',archive:'',done:''}); }} style={{padding:'6px 12px',background:'none',border:'1px solid #2a2a2a',borderRadius:3,color:'#888',fontSize:10,fontWeight:700,letterSpacing:1,cursor:'pointer'}}>← 새 카드뉴스</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
                <div style={{fontFamily:'monospace',fontSize:8,color:'#444',letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>— 완성 슬라이드</div>
                <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:14}}>
                  {data.slides.map((slide,idx)=><SlideCard key={idx} slide={slide} idx={idx} total={data.slides.length} accent={acc} accent2={acc2} seriesTitle={data.series_title}/>)}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}>
                  {[[downloadCSV,'📊','Sheets 아카이브','CSV 다운로드 → Sheets 붙여넣기','#0f9d58'],[downloadJSON,'🎨','Figma JSON','JSON 다운로드 → 플러그인 임포트','#00c2a0']].map(([fn,icon,title,sub,hc],i)=>(
                    <div key={i} onClick={fn} style={{padding:18,background:'#0d0d0d',border:'1px solid #1a1a1a',borderRadius:8,cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.borderColor=hc} onMouseOut={e=>e.currentTarget.style.borderColor='#1a1a1a'}>
                      <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
                      <div style={{fontWeight:900,fontSize:13,letterSpacing:1,marginBottom:4}}>{title}</div>
                      <div style={{fontSize:10,color:'#555',lineHeight:1.6}}>{sub}</div>
                    </div>
                  ))}
                </div>
                {log.length>0&&(
                  <div style={{marginTop:14,padding:12,background:'#060606',border:'1px solid #1a1a1a',borderRadius:6}}>
                    {log.map((l,i)=><div key={i} style={{fontFamily:'monospace',fontSize:9,color:l.type==='ok'?'#00c2a0':l.type==='err'?'#ff3b3b':'#ffde59',lineHeight:1.8}}>[{l.time}] {l.msg}</div>)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
