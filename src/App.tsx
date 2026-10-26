import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Card, Input, Select, Steps, Tag, Textarea } from 'tdesign-react';
import EngineeringVisual from './EngineeringVisual';
import { buildMeasureCards, type MeasureCard } from './measureRules';
import { contradictions, detectProblemRoute, getProblemRoute, hasMoldingStressRisk, initialFactors, initialPhenomenon, isDelayedCracking, isNoiseProblem, isUncertainMedium, matchingContradictions, forbiddenWhy, whyHasExecutableLever, visualForContradiction, visualForPhenomenon, type Factor, type Phenomenon, type ProblemDomain, type Stage } from './rules';

const options = (items: string[]) => items.map(value => ({ label: value, value }));
type Why = { text: string; evidence: string; lever: string; confirmed: boolean };
type Action = MeasureCard;
function Field({label,children}:{label:string;children:ReactNode}) { return <label className="field"><span>{label}</span>{children}</label>; }

export default function App() {
  const [stage, setStage] = useState<Stage>(0);
  const [phenomenon, setPhenomenon] = useState<Phenomenon>(initialPhenomenon);
  const [selectedDomain, setSelectedDomain] = useState<ProblemDomain | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [whys, setWhys] = useState<Why[]>([{text:'',evidence:'',lever:'',confirmed:false}]);
  const [verification, setVerification] = useState('');
  const [whyAttempted, setWhyAttempted] = useState(false);
  const [direction, setDirection] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('');
  const [trizThinking, setTrizThinking] = useState(false);
  const [trizSuggestionReady, setTrizSuggestionReady] = useState(false);
  const [trizAccepted, setTrizAccepted] = useState(false);
  const [moistureData, setMoistureData] = useState('');
  const [dryingCurve, setDryingCurve] = useState('');
  const [selectedContradiction, setSelectedContradiction] = useState('');
  const [trizGenerated, setTrizGenerated] = useState(false);
  const [trizNoMatch, setTrizNoMatch] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [activeTrace, setActiveTrace] = useState('');
  const [traceWhyIndex, setTraceWhyIndex] = useState<number | null>(null);
  const [traceSource, setTraceSource] = useState(false);
  const [notice, setNotice] = useState('先锚定可观察事实，再逐步收敛到可验证措施。');
  const suggestedRoute = detectProblemRoute(phenomenon.form);
  const route = getProblemRoute(selectedDomain ?? suggestedRoute.id);
  const failureVisual = visualForPhenomenon(phenomenon.form, route.visualSchema, phenomenon, whys.map(w=>w.text));
  const domainConfirmed = selectedDomain !== null;
  const delayed = isDelayedCracking(phenomenon.phase, phenomenon.form);
  const moistureRequired = /PC\s*\/?\s*ABS/i.test(phenomenon.material) && /银纹|气泡|脆断/.test(phenomenon.form);
  const moisturePercent = Number.parseFloat(moistureData.replace(',', '.'));
  const moistureOk = !moistureRequired || (Number.isFinite(moisturePercent) && moisturePercent < 0.04 && !!dryingCurve.trim());
  const routeTrizMatch:Record<ProblemDomain,RegExp>={appearance:/壁厚|缩水|加强筋|外观/,assembly:/间隙|咬合|齿轮|蜗杆|中心距|润滑|预载/,performance:/噪音|噪声|间隙|密封|流量|扬程|功耗/,reliability:/冲击|跌落|加强筋|缓冲|强度|R角/,molding:/锁模|飞边|壁厚|缩水|排气|困气|冷却|残余应力/,electrical:/反馈|控制|占空比|逻辑|传感器|参数/,general:/壁厚|缩水|R角|圆角|锁模|飞边|排气|困气|冷却|残余应力/};
  const routeContradictions = route.triz.map((item, index) => ({...item, id:`route-${route.id}-${index}`, tags:routeTrizMatch[route.id]}));
  const contradiction = routeContradictions.find(item => item.id === selectedContradiction) ?? contradictions.find(item => item.id === selectedContradiction);
  const candidates = useMemo(() => direction.trim() ? [...new Map([...routeContradictions.filter(item=>item.tags.test(direction)),...matchingContradictions(direction,phenomenon.form)].map(item=>[item.title,item])).values()] : [], [direction, phenomenon.form, route.id]);
  const confirmedWhys=whys.filter(w=>w.confirmed);
  const rootCause=confirmedWhys[confirmedWhys.length-1]?.text??phenomenon.form;
  const pumpCase=/水泵|泵体|占空比|出水流量|流量偏低/.test(`${phenomenon.form} ${confirmedWhys.map(w=>w.text+' '+w.evidence).join(' ')}`);
  const approachOptions=pumpCase?['改电控软件','换更大扬程水泵','优化管路阻力']:route.id==='assembly'?['调整中心距/间隙','改善润滑与装配','修正零件定位基准']:route.id==='reliability'?['优化局部 R 角/筋根','增加局部缓冲','调整材料韧性']:['修改关键结构','调整控制参数','优化工艺/测试条件'];
  const trizReasoning=pumpCase
    ? `目标“${direction}”如果通过持续提高水泵占空比实现，可能带来输入功率、噪音、温升增加。可考虑原理 23「反馈」：用实时流量反馈闭环调节泵功率；原理 35「参数变化」：根据流量偏差、温度或工况分段调整占空比，避免全工况固定高功率。根因线索：${rootCause}。`
    : `目标“${direction}”可能改善当前性能，但也会改变能耗、噪音、温升或结构载荷。可考虑原理 23「反馈」：增加关键输出的测量并闭环修正输入；原理 35「参数变化」：按工况分段调整关键参数，并用对照试验确认副作用。根因线索：${rootCause}。`;
  const closureIssues=[
    ...(confirmedWhys.length<3?['至少确认 3 层原因后再收敛因果链。']:[]),
    ...(confirmedWhys.some(w=>forbiddenWhy(w.text))?['请将不可验证的人为归因改写为具体状态或测量事实。']:[]),
    ...(!confirmedWhys.some(w=>whyHasExecutableLever(w.lever))?['在“验证与措施方向”中补充一个可执行动作。']:[]),
    ...(!verification.trim()?['补充一个末端验证方法。']:[]),
  ];
  const whyValid=closureIssues.length===0;
  const parentFactor = factors.filter(f=>f.checked).sort((a,b)=>b.weight-a.weight)[0];
  const sourceField = parentFactor?.id==='material' ? 'material' : parentFactor?.id==='environment'&&delayed ? 'chemicalMedia' : parentFactor?.id==='environment'||parentFactor?.id==='equipment' ? 'environment' : parentFactor?.id==='design' || parentFactor?.id==='mold' ? 'location' : parentFactor?.id==='process' ? 'phase' : 'form';
  const sourceFieldLabel = sourceField==='material'?'关键材料/零件':sourceField==='chemicalMedia'?'延迟开裂介质':sourceField==='environment'?'工况/环境':sourceField==='location'?'部位/声源位置':sourceField==='phase'?'发生阶段':'问题现象';
  const sourceFieldValue = sourceField==='material'?phenomenon.material:sourceField==='chemicalMedia'?phenomenon.chemicalMedia:sourceField==='environment'?phenomenon.environment:sourceField==='location'?phenomenon.location:sourceField==='phase'?phenomenon.phase:phenomenon.form;
  useEffect(()=>{
    if(stage!==3||!direction.trim()||candidates.length>0||trizAccepted)return;
    setTrizThinking(true);setTrizSuggestionReady(false);
    const timer=window.setTimeout(()=>{setTrizThinking(false);setTrizSuggestionReady(true);},700);
    return ()=>window.clearTimeout(timer);
  },[stage,direction,candidates.length,trizAccepted]);
  const tracedAction = actions.find(a=>a.id===activeTrace);
  const locateTrace = () => document.querySelector(`[data-why-node="${traceWhyIndex ?? 0}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
  const updateField = (key: keyof Phenomenon, value: string) => setPhenomenon(prev => ({...prev, [key]:value}));
  const selectDomain = (domain: ProblemDomain) => {
    if (selectedDomain === domain) return;
    setSelectedDomain(domain);
    setPhenomenon(prev => ({...initialPhenomenon, form:prev.form}));
    setMoistureData(''); setDryingCurve(''); setFactors([]); setActions([]);
    setWhys([{text:'',evidence:'',lever:'',confirmed:false}]); setVerification('');
    setWhyAttempted(false);
    setDirection(''); setSelectedApproach(''); setSelectedContradiction(''); setTrizGenerated(false); setTrizNoMatch(false); setTrizAccepted(false); setTrizSuggestionReady(false);
  };
  const enterStage = (next: Stage) => {
    if (next > stage + 1) { setNotice('阶段必须按顺序完成，请先完成当前阶段。'); return; }
    if (next === 1 && !phenomenon.form.trim()) { setNotice('先描述一个观察到的问题现象，再继续诊断。'); return; }
    if (next === 1 && moistureRequired && !moistureOk) { setNotice('PC/ABS 材料判据：需填写可解析的实测含水率（< 0.04%）和烘干曲线，方可进入范畴筛选。'); return; }
    if (next === 1 && delayed && (!phenomenon.chemicalMedia || isUncertainMedium(phenomenon.chemicalMedia))) { setNotice('延迟开裂必须先确认油脂/润滑剂、螺纹胶/胶粘剂、清洁剂/皂液、脱脂剂的接触情况。'); return; }
    if (next === 2 && !factors.some(f => f.checked)) { setNotice('请至少选择一个高权重因子簇。'); return; }
    if (next === 3 && !whyValid) { setWhyAttempted(true); setNotice('请先确认至少 3 层原因，并在收敛区补充措施方向和验证方式。'); return; }
    if (next === 3 && delayed && (!phenomenon.chemicalMedia || isUncertainMedium(phenomenon.chemicalMedia))) { setNotice('延迟开裂介质信息仍不确定。请先确认油脂、螺纹胶、清洁剂、皂液或脱脂剂接触情况。'); return; }
    if (next === 4 && !trizGenerated && !trizNoMatch) { setNotice('请先完成领域矛盾映射，或记录当前方向在领域库中无匹配。'); return; }
    setStage(next); setNotice('');
  };
  const addWhy = () => { if (whys.length < 6 && whys.every(w=>w.confirmed)) setWhys([...whys, {text:'',evidence:'',lever:'',confirmed:false}]); };
  const updateWhy = (index: number, key: keyof Why, value: string) => setWhys(old => old.map((w,i) => i===index ? {...w,[key]:value} : w));
  const confirmWhy = (index:number) => {
    const current=whys[index];
    if(!current?.text.trim()){setNotice('先写下这一层的直接原因。');return;}
    if(forbiddenWhy(current.text)){setNotice('请把“操作不当”等笼统归因改成可观察的设备、尺寸、参数或记录事实。');return;}
    setWhys(old=>old.map((w,i)=>i===index?{...w,confirmed:true}:w));
    setNotice('原因已加入因果链。');
    if(index===whys.length-1&&whys.length<6)setWhys(old=>[...old,{text:'',evidence:'',lever:'',confirmed:false}]);
  };
  const reviseWhy = (index:number) => setWhys(old=>[...old.slice(0,index),{...old[index],confirmed:false},...old.slice(index+1).map(()=>({text:'',evidence:'',lever:'',confirmed:false}))]);
  const makeActions = (sourceIndex?:number,singleLevel=false,approach=selectedApproach) => {
    const generated=buildMeasureCards({phenomenon,whys,direction,approach,verification,sourceIndex,singleLevel});
    setActions(generated);setNotice(singleLevel?'已从选中 WHY 节点生成一条定制措施。':'措施方案已按根因与所选方向更新。');
  };
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-icon">R</span><div><b>产品结构问题 RCA 工作台</b><small>结构开发 · 模具/注塑/装配/整机测试</small></div></div><div className="top-steps"><Steps current={stage} readonly><Steps.StepItem title="现象锚定"/><Steps.StepItem title="范畴筛选"/><Steps.StepItem title="5WHY 深挖"/><Steps.StepItem title="TRIZ 映射"/><Steps.StepItem title="措施收敛"/></Steps></div><div className="session"><span className="live-dot"/>诊断进行中</div></header>
    <main className="workspace">
      <aside className="guide-panel">
        <div className="guide-heading"><div><span className="eyebrow">GUIDED RCA</span><h2>诊断引导</h2></div><span className="step-pill">阶段 {stage+1} / 5</span></div>
        <div className="progress-track"><i style={{width:`${(stage+1)*20}%`}}/></div>
        <div className="chat-scroll">
          <div className="bubble assistant" aria-live="polite"><b>诊断助手</b><p>{notice || ['描述结构开发、试模、装配或产品测试中观察到的问题，不用先猜原因。','现象已记录。请按工程证据筛选结构、模具、工艺、测试和工况因素。','沿着选中的因子追问，用尺寸、压力、噪声、频谱、测量记录等事实回答。','若解决方向可能引入新问题，从领域矛盾中选择并评估副作用。','按围堵、参数调整、根因消除和系统预防收敛措施。'][stage]}</p></div>
          {stage===0 && <div className="prompt-block"><div className="prompt-title">先描述问题 <span>自然语言即可</span></div>
            <Field label="研发问题现象"><Textarea value={phenomenon.form} onChange={v=>{updateField('form',v);setSelectedDomain(null);setMoistureData('');setDryingCurve('')}} placeholder="例如：跌落测试后壳体内部螺丝柱断裂 / 装配时电机齿轮与蜗杆咬合异响" autosize /></Field>
            <div className="bubble assistant route-bubble"><b>问题域识别</b><p>{phenomenon.form.trim()?`初步识别为「${suggestedRoute.label}」，请确认或选择更合适的领域。`: '请先输入问题，我会识别领域并生成对应追问。'}</p></div>
            <div className="example-chips domain-chips"><span>确认问题领域</span>{['appearance','assembly','performance','reliability','molding','electrical','general'].map(id=>{const item=getProblemRoute(id as ProblemDomain);const highlighted=selectedDomain?selectedDomain===item.id:!!phenomenon.form.trim()&&suggestedRoute.id===item.id;return <button className={highlighted?'selected':''} key={id} onClick={()=>selectDomain(item.id)}>{item.label}</button>})}</div>
            {domainConfirmed&&<div className="dynamic-questions"><div className="prompt-title">{route.label} · 针对性追问 <span>可先填已知项</span></div>{route.questions.map(q=><Field key={q.key} label={q.label}><Input value={phenomenon[q.key as keyof Phenomenon] as string} onChange={v=>updateField(q.key as keyof Phenomenon,v)} placeholder={q.placeholder}/></Field>)}
              {route.id==='molding'&&<><Field label="关键材料 / 零件（可选）"><Input value={phenomenon.material} onChange={v=>{updateField('material',v);setMoistureData('');setDryingCurve('')}} placeholder="如：PC/ABS 外壳、POM 齿轮"/></Field><Field label="回料比例（如适用）"><Input value={phenomenon.regrindRatio} onChange={v=>updateField('regrindRatio',v)} placeholder="如：25%"/></Field></>}
              {delayed&&<Field label="延迟开裂介质接触"><Select value={phenomenon.chemicalMedia} options={options(['已确认无油脂/胶粘剂/清洁剂接触','接触油脂或润滑剂','接触螺纹胶/胶粘剂','接触清洁剂/皂液','接触脱脂剂','不确定，待确认'])} onChange={v=>updateField('chemicalMedia',String(v))} placeholder="确认接触情况；不确定时先留在本阶段"/></Field>}
            </div>}
            {moistureRequired && <div className="material-gate"><b>材料首查 · PC/ABS 含水与烘干</b><p>成型前含水量必须低于 0.04%，目标低于 0.02%。同一烘干参数不可跨材料复用。</p><Field label="原料实际含水率"><Input value={moistureData} onChange={setMoistureData} placeholder="如 0.03%（卡尔费休）" /></Field><Field label="烘干曲线"><Input value={dryingCurve} onChange={setDryingCurve} placeholder="温度、时间、露点或曲线编号" /></Field>{moistureData && (!Number.isFinite(moisturePercent)||moisturePercent>=0.04) && <div className="field-error">含水率须实测低于 0.04%。</div>}</div>}
            {delayed && <div className="inline-alert orange">延迟开裂需要确认拉应力与介质信息；可先选择“待确认”，但在补齐前不会进入矛盾评估。</div>}
            <Button tag="button" theme="primary" block disabled={!phenomenon.form.trim() || !domainConfirmed || !moistureOk || (delayed && (!phenomenon.chemicalMedia || isUncertainMedium(phenomenon.chemicalMedia)))} onClick={()=>{setFactors(initialFactors(phenomenon).map(f=>{const b=route.bones.find(x=>x.id===f.id)!;let weight=Math.max(f.weight,b.weight);let source=f.weight>b.weight?f.source:b.source; if(route.id==='reliability'&&/跌落|冲击/.test(phenomenon.form)){if(f.id==='design'){weight=5;source='跌落/冲击规则命中：优先核查传力路径、螺丝柱根部 R 角与筋过渡';} if(f.id==='mold'){weight=Math.min(weight,2);source='先完成冲击边界、结构起裂点与材料韧性核实，再排查成型缺陷';}if(f.id==='environment'&&/低温|冷态/.test(`${phenomenon.form} ${phenomenon.environment}`)){weight=5;source='低温会降低材料冲击韧性；按实际低温边界复测并核对材料牌号/批次';}if(f.id==='material'&&/低温|冷态|脆断/.test(`${phenomenon.form} ${phenomenon.environment}`)){weight=5;source='检查低温缺口冲击韧性、材料批次及熔接线敏感性';}} if(route.id==='assembly'&&/齿轮|蜗杆|咬合/.test(phenomenon.form)){if(f.id==='design'){weight=5;source='齿轮啮合问题：优先量中心距、齿侧间隙、跳动及公差链';} if(f.id==='process'){weight=5;source='并行核对润滑脂牌号/涂布量、装配偏心和齿面接触状态';}} if(route.id==='electrical'&&f.id==='equipment'){weight=5;source='电控联动问题：对齐指令、反馈、电机响应和机械到位的时间戳';}if(isNoiseProblem(phenomenon.form)&&f.id==='equipment'){weight=5;source='噪声诊断先固定测距/背景噪声，并记录转速、负载与频谱主峰';}return {...f,name:b.name,weight:Math.min(5,weight),source,checked:f.checked||b.weight>=4||weight>=5}}));enterStage(1);}}>确认问题域并生成诊断路径 →</Button>
          </div>}
          {stage===1 && <div className="prompt-block"><div className="prompt-title">选择优先排查簇 <span>权重自动计算</span></div><p className="helper">勾选高权重因子。六根主骨固定保留，可调整权重。</p>{factors.map((f,i)=><div className="factor-choice" key={f.id}><input aria-label={`选择${f.name}`} type="checkbox" checked={f.checked} onChange={e=>setFactors(old=>old.map((x,j)=>i===j?{...x,checked:e.target.checked}:x))}/><span className="factor-name">{f.name}</span><span className="weight">{f.weight}</span><input aria-label={`${f.name}权重`} className="weight-adjust" type="range" min="1" max="5" value={f.weight} onChange={e=>setFactors(old=>old.map((x,j)=>i===j?{...x,weight:Number(e.target.value)}:x))}/></div>)}<Button tag="button" theme="primary" block onClick={()=>enterStage(2)}>生成因果追问 →</Button></div>}
          {stage===2 && <div className="prompt-block why-flow"><div className="prompt-title">5WHY 因果链 <span>{confirmedWhys.length} 层已确认</span></div>
            <div className="why-history">{confirmedWhys.map((item,i)=><button type="button" key={i} className="why-history-row" onClick={()=>reviseWhy(i)}><span>WHY {i+1}</span><b>{item.text}</b><small>点击修改</small></button>)}</div>
            {whys.findIndex(w=>!w.confirmed)>=0 && (()=>{const i=whys.findIndex(w=>!w.confirmed);const w=whys[i];const previous=i===0?phenomenon.form:whys[i-1]?.text||phenomenon.form;return <section className="why-current" key={i}>
              <div className="why-previous"><span>上一层现象</span><b>{previous}</b></div><h3>为什么会出现“{previous}”？</h3>
              <Textarea value={w.text} onChange={v=>updateWhy(i,'text',v)} placeholder={i===0&&route.id==='reliability'?'例如：冲击载荷沿外壳传至螺丝柱根部，根部先出现裂纹':route.id==='assembly'&&/齿轮|蜗杆|异响/.test(phenomenon.form)?'例如：中心距偏大导致齿侧间隙，啮合时产生冲击声':'填写导致上一层现象的直接原因…'} autosize/>
              <Input value={w.evidence} onChange={v=>updateWhy(i,'evidence',v)} placeholder="证据（选填）：例如占空比 25%、中心距 18.16 mm、测试记录编号"/>
              {w.text&&forbiddenWhy(w.text)&&<div className="field-error">请改写为可观察、可验证的事实。</div>}
              <Button tag="button" theme="primary" block disabled={!w.text.trim()||forbiddenWhy(w.text)} onClick={()=>confirmWhy(i)}>确认并进入下一层 →</Button>
            </section>})()}
            {confirmedWhys.length>=3&&<details className="why-summary"><summary>验证与措施方向</summary><Field label="拟验证的可执行动作"><Input value={confirmedWhys[confirmedWhys.length-1]?.lever??''} onChange={v=>updateWhy(confirmedWhys.length-1,'lever',v)} placeholder="例如：将泵体占空比由 25% 调至 30% 做单变量复测"/></Field><Field label="末端验证（方法 / 工况 / 判定）"><Input value={verification} onChange={setVerification} placeholder="例如：额定工况运行 30 min，3 台流量均达到规格下限"/></Field></details>}
            {whyAttempted&&closureIssues.length>0&&<div className="why-closure" role="alert"><ul>{closureIssues.map(issue=><li key={issue}>{issue}</li>)}</ul></div>}
            {confirmedWhys.length>=3&&<Button tag="button" theme="primary" block disabled={!whyValid} onClick={()=>enterStage(3)}>收敛因果链并继续 →</Button>}
          </div>}
          {stage===3 && <div className="prompt-block"><div className="prompt-title">TRIZ 矛盾探讨 <span>领域映射 + 规则推演</span></div><Field label="您希望改善什么"><Input value={direction} onChange={v=>{setDirection(v);setSelectedContradiction('');setTrizGenerated(false);setTrizNoMatch(false);setTrizAccepted(false);setTrizSuggestionReady(false);setSelectedApproach('');setActions([])}} placeholder="例如：提高出水流量、降低齿轮啮合噪声、改善卡扣寿命"/></Field>{delayed&&isUncertainMedium(phenomenon.chemicalMedia)&&<div className="inline-alert">介质信息未确认，矛盾分析暂不可进入措施阶段。</div>}
            {candidates.length>0&&<><div className="contradiction-list">{candidates.map(c=><button className={'contradiction-option '+(selectedContradiction===c.id?'selected':'')} onClick={()=>{setSelectedContradiction(c.id);setTrizGenerated(false);setTrizNoMatch(false)}} key={c.id}>{c.title}</button>)}</div><Button tag="button" theme="primary" block disabled={!contradiction||(delayed&&isUncertainMedium(phenomenon.chemicalMedia))} onClick={()=>{setTrizGenerated(true);setTrizNoMatch(false);setNotice('已匹配领域矛盾，请评估候选原理和副作用。')}}>确认矛盾并继续 →</Button></>}
            {!direction.trim()&&<p className="helper">描述改善方向后，我会匹配领域矛盾；若无直接匹配，会结合因果链给出 TRIZ 推演建议。</p>}
            {direction.trim()&&candidates.length===0&&trizThinking&&<div className="triz-thinking"><span className="thinking-spinner"/><b>诊断助手正在结合根因与改善方向推演…</b></div>}
            {direction.trim()&&candidates.length===0&&trizSuggestionReady&&<div className="triz-suggestion"><b>诊断助手 · TRIZ 规则推演建议</b><p>{trizReasoning}</p><div className="principle-row"><span>原理 23 · 反馈</span><span>原理 35 · 物理/化学参数变化</span></div><small>这是可讨论的工程假设，不代表根因已被证实。</small><div className="triz-suggestion-actions"><Button tag="button" theme="primary" block disabled={delayed&&isUncertainMedium(phenomenon.chemicalMedia)} onClick={()=>{setTrizAccepted(true);setTrizNoMatch(true);setTrizGenerated(true);setSelectedApproach('');setActions([]);setStage(4);setNotice('已采纳 TRIZ 建议，请选择 L3 干预方向。')}}>采纳建议并协同选措施</Button><Button tag="button" variant="outline" block onClick={()=>{setDirection('');setTrizSuggestionReady(false);setTrizAccepted(false)}}>重新输入方向</Button></div></div>}
            {trizGenerated&&candidates.length>0&&<Button tag="button" variant="outline" block onClick={()=>enterStage(4)}>进入措施协同 →</Button>}
          </div>}
          {stage===4 && <div className="prompt-block"><div className="prompt-title">专家协同确认 <span>L1—L4 定制方案</span></div><div className="expert-coach"><b>诊断助手</b><p>基于末端原因“{rootCause}”，我会把措施逐条关联到因果链。请选择 L3 的核心干预方向，右侧措施卡会随选择即时更新。</p></div><div className="approach-options">{approachOptions.map(option=><button type="button" key={option} className={'approach-chip '+(selectedApproach===option?'selected':'')} onClick={()=>{setSelectedApproach(option);makeActions(undefined,false,option)}}>{option}</button>)}</div>{actions.length===0&&<div className="empty-state action-empty">选择一个方向，生成与 WHY 根因对应的围堵、微调、根因消除和系统预防措施。</div>}{actions.length>0&&<div className="success-note">已按“{selectedApproach||'选中 WHY 节点'}”更新右侧措施卡；点击卡片可回到来源 WHY。</div>}</div>}
          {stage>0 && <div className="stage-nav"><button disabled={stage===0} onClick={()=>setStage((stage-1) as Stage)}>← 上一步</button>{stage<4&&<button disabled={stage===2&&!whyValid} onClick={()=>enterStage((stage+1) as Stage)}>继续下一阶段 →</button>}</div>}
        </div>
        <footer className="guide-footer"><span className="secure-icon">✓</span>证据链随诊断卡片一并保存</footer>
      </aside>
      <section className="board-panel"><div className="board-header"><div><span className="eyebrow">DIAGNOSTIC BOARD</span><h1>诊断知识看板</h1><p>卡片从现象逐层生长，点击节点查看来源</p></div><div className="board-meta"><span className="meta-dot"/>实时更新 <span className="divider"/>卡片 {1+(factors.length?1:0)+(confirmedWhys.length>0?1:0)+((contradiction&&trizGenerated)||trizNoMatch?1:0)+actions.length} 张</div></div>
        {traceSource&&traceWhyIndex!==null&&<div className="trace-summary"><div><small>当前追溯路径{tracedAction?` · ${tracedAction.level}`:' · 因果节点'}</small><b>{tracedAction?.title||`WHY ${traceWhyIndex+1}`}　→　{parentFactor?.name||'鱼骨因子'}　→　{sourceFieldLabel}</b><span>{whys[traceWhyIndex]?.text||'因果答案待补充'}　·　现象证据：{sourceFieldValue||'待补充'}</span></div><button onClick={locateTrace}>定位因果节点 ↓</button></div>}
        <div className="board-grid">
          <Card bordered className={`knowledge-card phenomenon-card ${traceSource?'traced':''}`}><div className="card-accent blue"/><div className="card-heading"><div><span className="card-kicker">01 · OBSERVATION</span><h3>问题现象锚定</h3></div><Tag theme={phenomenon.form.trim()&&domainConfirmed?'success':'warning'} variant="light">{phenomenon.form.trim()&&domainConfirmed?'已识别':'待描述/确认领域'}</Tag></div><p className={`symptom-title ${traceSource&&sourceField==='form'?'source-highlight':''}`}>{phenomenon.form||'等待录入工程问题现象'}</p><div className="fact-grid">{[{k:'domain',l:'问题领域',v:phenomenon.form.trim()?route.label:''},{k:'phase',l:'发生阶段',v:phenomenon.phase},{k:'location',l:'部位/声源位置',v:phenomenon.location},{k:'environment',l:'测试工况/环境',v:phenomenon.environment},{k:'ratio',l:'发生比例/样本数',v:phenomenon.ratio},{k:'material',l:'关键材料/零件',v:phenomenon.material},{k:'regrindRatio',l:'回料比例',v:phenomenon.regrindRatio},...(delayed?[{k:'chemicalMedia',l:'延迟开裂介质',v:phenomenon.chemicalMedia}]:[])].filter(x=>x.v?.trim()).map(x=><div key={x.l} className={traceSource&&sourceField===x.k?'source-highlight':''}><small>{x.l}</small><b>{x.v}</b></div>)}</div>{moistureRequired&&<div className="rule-callout"><b>材料首查 · 含水率 / 烘干曲线</b><br/>实测 {moistureData||'待补'}（成型前需 &lt; 0.04%，目标 &lt; 0.02%） · 烘干记录：{dryingCurve||'待补'}。不得复用其他材料的烘干参数；排气不作为水解类首因。</div>}</Card>
          <Card bordered className="fishbone-card knowledge-card"><div className="card-accent slate"/><div className="card-heading"><div><span className="card-kicker">02 · SCREENING</span><h3>范畴筛选 · 鱼骨因子</h3></div><span className="subtle-label">{route.label} · 动态权重</span></div>{factors.length===0?<div className="empty-state">确认问题领域后，自动生成适配因子</div>:<><div className="fishbone-root"><span>待分析现象</span><b>{phenomenon.form||'研发问题'}</b></div><div className="bone-grid">{factors.map(f=><button type="button" key={f.id} className={'bone '+(f.checked?'bone-active ':'')+(f.id==='design'&&/竖向筋|筋根部/.test(phenomenon.location)?'bone-highlight':'')} onClick={()=>setActiveTrace(f.id)}><span className="bone-top"><b>{f.name}</b><em>权重 {f.weight}/5</em></span><small>{f.source}</small>{f.id==='design'&&/竖向筋|筋根部/.test(phenomenon.location)&&<small className="priority-note">重点：R 角、筋根过渡、水锤峰值输入</small>}</button>)}</div><div className="bone-note">{factors.filter(f=>f.checked).length} 个优先排查因子 · 选择节点可定位其来源</div></>}</Card>
          {confirmedWhys.length>0&&<Card bordered className="knowledge-card why-card"><div className="card-accent orange"/><div className="card-heading"><div><span className="card-kicker">03 · CAUSAL CHAIN</span><h3>5WHY 因果链</h3></div><Tag theme={whyValid?'success':'warning'} variant="light">{whyValid?'验证待确认':'分析中'}</Tag></div><div className="why-timeline"><div className="why-timeline-root"><span>现象</span><b>{phenomenon.form}</b></div>{confirmedWhys.map((w,i)=><div className="why-timeline-step" key={i}><div className="why-cause-arrow"><span>↓</span><small>导致</small></div><div className="why-timeline-node-wrap"><button type="button" data-why-node={i} className={'why-timeline-node '+(traceWhyIndex===i?'traced':'')} onClick={()=>{setActiveTrace('why-'+i);setTraceWhyIndex(i);setTraceSource(true)}}><span>WHY {i+1}</span><b>{w.text}</b>{w.evidence&&<small>证据：{w.evidence}</small>}<i>{parentFactor?.name||'鱼骨因子'} · 点击追溯来源</i></button><button type="button" className="convert-action" onClick={()=>{const approach=selectedApproach||approachOptions[0];setSelectedApproach(approach);setTraceWhyIndex(i);setActiveTrace('act-2');setStage(4);makeActions(i,true,approach)}}>转化为措施</button></div></div>)}</div>{verification&&<div className="verification"><b>末端验证</b><span>{verification}</span></div>}</Card>}
          {contradiction&&trizGenerated&&<Card bordered className="knowledge-card triz-card"><div className="card-accent purple"/><div className="card-heading"><div><span className="card-kicker">04 · ENGINEERING CONTRADICTION</span><h3>TRIZ 矛盾映射</h3></div><Tag theme="default" variant="light">领域矛盾</Tag></div><EngineeringVisual schema={contradiction.visualSchema??visualForContradiction(contradiction.title,contradiction.principles)}/><h4>{contradiction.title}</h4><div className="principle-row">{contradiction.principles.map(p=><span key={p}>{p}</span>)}</div><div className="hint-block"><b>工程具体化</b><p>{contradiction.hint}</p></div><div className="side-effect"><b>副作用预判</b><p>{contradiction.side}</p></div></Card>}
          {trizNoMatch&&<Card bordered className="knowledge-card triz-card"><div className="card-accent slate"/><div className="card-heading"><div><span className="card-kicker">04 · TRIZ ENGINEERING HYPOTHESIS</span><h3>TRIZ 推演建议</h3></div><Tag theme="warning" variant="light">待验证假设</Tag></div><div className="hint-block"><b>改善方向</b><p>{direction}</p></div><div className="hint-block"><b>诊断助手 · 规则推演</b><p>{trizReasoning}</p></div><div className="principle-row"><span>原理 23 · 反馈</span><span>原理 35 · 物理/化学参数变化</span></div><div className="side-effect"><b>验证关注</b><p>确认目标性能改善，同时记录输入功率、噪音、温升与相关结构边界；单变量对照后再固化。</p></div></Card>}
          {actions.map(a=><div className="action-hit" key={a.id} role="button" tabIndex={0} aria-label={`${a.level} ${a.title}，按回车追溯来源`} onClick={()=>{setActiveTrace(a.id);setTraceWhyIndex(a.whyIndex);setTraceSource(true)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActiveTrace(a.id);setTraceWhyIndex(a.whyIndex);setTraceSource(true)}}}><Card bordered className={`knowledge-card action-card ${activeTrace===a.id?'traced':''}`}><div className={`card-accent ${a.level.startsWith('L1')?'red':a.level.startsWith('L2')?'orange':a.level.startsWith('L3')?'green':'slate'}`}/><div className="card-heading"><div><span className="card-kicker">05 · ACTION</span><h3>{a.level}</h3></div><Tag theme={a.level.startsWith('L3')?'success':'default'} variant="light">待验证</Tag></div><h4>{a.title}</h4><span className="why-source-tag">解决 WHY {a.whyIndex+1}</span><div className="action-proposal"><b>具体动作</b><p>{a.action}</p></div><div className="action-detail"><b>预期验证结果</b><p>{a.expected}</p></div><div className="action-warning"><b>副作用预警</b><p>{a.side}</p></div><span className="trace-link">↳ 来源：{a.trace}</span></Card></div>)}
        </div>
        {stage<4&&<div className="board-hint"><span>✦</span> 完成当前阶段后，下一张知识卡会自动出现在看板中</div>}
      </section>
    </main>
  </div>;
}
