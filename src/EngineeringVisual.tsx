import { useId, useState } from 'react';
import { Dialog } from 'tdesign-react';
import type { VisualSchema } from './rules';

type DrawingProps = { schema: VisualSchema; enlarged?: boolean };
type StressPointProps = { x:number; y:number; intensity?:'medium'|'high'; label:string };
type CrossSectionProps = { wallThickness:number; ribHeight:number; rAngle:number };
type ToleranceStackProps = { partA:string; partB:string; overlap:boolean; overlapMm:number };

const blue = '#61778e';
const line = '#aeb9c7';
const pale = '#f4f6f8';
const red = '#d54941';
const orange = '#e37318';
const ink = '#44566d';
const plastic = '#e8d49a';

/** Isometric injection-moulded enclosure used as a visual anchor for the mechanism. */
function ProductHousing({crack=false}:{crack?:boolean}) {
  return <g className="product-render">
    <path d="M45 88L145 37Q153 33 162 38L263 91Q270 95 270 104V151Q270 158 263 162L164 199Q155 202 147 198L45 154Q38 151 38 143V99Q38 92 45 88Z" fill="#dfc77e" stroke={ink} strokeWidth="1.8"/>
    <path d="M45 88L145 37Q153 33 162 38L263 91L163 137Q155 141 147 137Z" fill="#f4e4ad" stroke={ink} strokeWidth="1.6"/>
    <path d="M163 137L263 91Q270 95 270 104V151Q270 158 263 162L164 199Z" fill="#d1b76c" stroke={ink} strokeWidth="1.6"/>
    <path d="M57 96L148 52Q155 49 162 53L248 98L161 130Q155 133 149 130Z" fill="#f7edce" stroke="#8a805f" strokeWidth="1.2"/>
    <path d="M57 96V139L153 181V133M161 130V181M248 98V145L161 181" fill="none" stroke="#8a805f" strokeWidth="1.2"/>
    <path d="M76 105L91 98L91 136L76 143Z M220 111L235 104V140L220 147Z" fill="#d9c481" stroke="#837957" strokeWidth="1"/>
    {[ [105,88],[200,94],[120,158],[214,156] ].map(([x,y],i)=><g key={i}><ellipse cx={x} cy={y} rx="10" ry="5" fill="#dfd2aa" stroke={ink} strokeWidth="1"/><ellipse cx={x} cy={y-2} rx="6" ry="3" fill="#f8f4e7" stroke="#82785d" strokeWidth=".8"/><path d={`M${x-7} ${y+2}v12l7 4 7-4V${y+2}`} fill="#cfb66d" stroke={ink} strokeWidth=".8"/></g>)}
    <path d="M85 113L85 130M183 74L183 119M132 147L132 171" stroke="#a39872" strokeWidth="1.4"/>
    {crack&&<path d="M208 153l-5 8 7 2-8 10 12-7-3-4 8-7" fill="none" stroke={red} strokeWidth="3" strokeLinejoin="round"/>}
    <text x="42" y="198" className="diagram-small">塑件外壳 / 加强筋 / 螺丝柱</text>
  </g>;
}

function GearPair(){return <g>
  <circle cx="192" cy="111" r="43" fill="#d9e0e8" stroke={ink} strokeWidth="2"/>
  <circle cx="192" cy="111" r="31" fill="#f9fbfc" stroke={blue} strokeWidth="2" strokeDasharray="5 3"/>
  <circle cx="192" cy="111" r="10" fill="#c5ced9" stroke={ink} strokeWidth="1.5"/>
  <circle cx="283" cy="111" r="28" fill="#d9e0e8" stroke={ink} strokeWidth="2"/>
  <circle cx="283" cy="111" r="17" fill="#f9fbfc" stroke={blue} strokeWidth="2" strokeDasharray="4 3"/>
  <circle cx="283" cy="111" r="7" fill="#c5ced9" stroke={ink} strokeWidth="1.2"/>
  <path d="M154 70l7 8m-12 1 7 8m-9 4 8 7m-9 4 8 7m-8 5 8 7m-6 10 8 5m5 12 7-7m8 13 4-9m10 10 1-10m10 7-2-10m12 2-5-8m13-2-8-6m78-20-8 4m8 10-9 3m5 10-9 1m0 11-8-2m-7 16-6-6m-13 10-3-9m-11 9 1-9" stroke={ink} strokeWidth="3" strokeLinecap="round"/>
  <path d="M90 65H135Q151 65 159 78L173 92" fill="none" stroke="#8493a6" strokeWidth="8" strokeLinecap="round"/>
  <path d="M92 65H135Q151 65 159 78L173 92" fill="none" stroke="#eef2f6" strokeWidth="4" strokeLinecap="round"/>
  <path d="M158 89L168 98m-14-1 10 9m-13-1 10 9" stroke={orange} strokeWidth="2"/>
  <text x="145" y="174" className="diagram-small">啮合区 / 中心距</text>
</g>}

export function StressPoint({x,y,intensity='high',label}:StressPointProps) {
  const radius = intensity==='high' ? 23 : 16;
  return <g className="visual-hotspot" tabIndex={0} role="img" aria-label={label}>
    <title>{label}</title>
    <circle cx={x} cy={y} r={radius} fill="none" stroke={red} strokeWidth="2" strokeDasharray="3 3" opacity=".8"/>
    <circle cx={x} cy={y} r="5" fill={red}/>
    <path d={`M${x-radius-7} ${y}h8 M${x+radius-1} ${y}h8 M${x} ${y-radius-7}v8 M${x} ${y+radius-1}v8`} stroke={red} strokeWidth="2"/>
  </g>;
}

export function CrossSection({wallThickness,ribHeight,rAngle,measured=false,compact=false}:CrossSectionProps & {measured?:boolean;compact?:boolean}) {
  const radius = Math.max(3,Math.min(16,rAngle*12));
  const ribTop = Math.max(72,150-ribHeight*11);
  return <g>
    <path d={`M105 158V48H445V${48+wallThickness*7}H135V158Z`} fill={pale} stroke={blue} strokeWidth="3" strokeLinejoin="round"/>
    <path d={`M260 158V${ribTop}Q260 ${ribTop-5} 268 ${ribTop-5}H292Q300 ${ribTop-5} 300 ${ribTop}V158Z`} fill="#e9edf2" stroke={blue} strokeWidth="2"/>
    <path d={`M135 ${48+wallThickness*7}H${135+radius}Q${135+radius+4} ${48+wallThickness*7} ${135+radius+4} ${48+wallThickness*7+radius}`} fill="none" stroke={orange} strokeWidth="2"/>
    {!compact&&<>
      <text x="108" y="177" className="diagram-label">壁厚 {measured?`${wallThickness.toFixed(1)} mm`:'待测'}</text>
      <text x="258" y="177" className="diagram-label">筋高 {measured?`${ribHeight.toFixed(1)} mm`:'示意'}</text>
      <text x="145" y="105" className="diagram-small">R{measured?`${rAngle.toFixed(1)} mm`:'待测'}</text>
      <StressPoint x={139+radius} y={48+wallThickness*7+radius+4} intensity="high" label={`内侧筋根圆角${measured?` R${rAngle.toFixed(1)} mm`:''}，为待验证的应力集中风险点；非实测尺寸。`}/>
    </>}
  </g>;
}

export function ToleranceStack({partA,partB,overlap,overlapMm}:ToleranceStackProps) {
  const aEnd=330, bStart=overlap?aEnd-38:aEnd+2;
  return <g>
    <rect x="95" y="66" width={aEnd-95} height="74" rx="5" fill="#eef2f6" stroke={blue} strokeWidth="2"/>
    <rect x={bStart} y="86" width="175" height="54" rx="5" fill="#f8f9fb" stroke={blue} strokeWidth="2"/>
    {overlap&&<rect x={bStart} y="86" width={aEnd-bStart} height="54" fill={red} opacity=".22" stroke={red} strokeWidth="2"/>}
    <text x="110" y="106" className="diagram-label">{partA}</text>
    <text x={bStart+12} y="119" className="diagram-label">{partB}</text>
    <path d="M95 157v8 M95 162H445 M445 157v8" stroke={line} strokeWidth="2"/>
    <text x="225" y="181" className="diagram-label">公差叠加 {overlap?`过盈 ${overlapMm.toFixed(2)} mm`:'干涉量待实测'}</text>
    {overlap&&<text x={bStart+4} y="78" fill={red} fontSize="12">干涉区</text>}
  </g>;
}

function ArrowDefs({prefix}:{prefix:string}){return <defs><marker id={`${prefix}-arrow`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill={blue}/></marker><marker id={`${prefix}-warn`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill={orange}/></marker></defs>;}

function Diagram({schema}:DrawingProps){
  const markerPrefix=`engineering-${useId().replace(/:/g,'')}`;
  const p=schema.params;
  const wall=Number(p.wallThickness??2.5), rib=Number(p.ribHeight??5), r=Number(p.rAngle??.3);
  const label=(key:string,fallback:string)=>String(p[key]??fallback);
  return <svg className="engineering-svg" viewBox="0 0 560 205" role="img" aria-label={schema.title}>
    <ArrowDefs prefix={markerPrefix}/>
    {schema.visualType==='cross_section_stress'&&<g>
      <ProductHousing crack={/开裂|裂纹|断裂|漏水/.test(schema.title)}/>
      <path d="M202 133C250 111 264 90 300 87" fill="none" stroke={orange} strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx="202" cy="133" r="5" fill={red}/>
      <rect x="293" y="22" width="248" height="163" rx="4" fill="#fbfcfd" stroke="#cbd3dd" strokeWidth="1.2"/>
      <text x="306" y="39" className="diagram-small">局部剖面 · 筋根 / 转角</text>
      <g transform="translate(292 10) scale(.47)"><CrossSection wallThickness={wall} ribHeight={rib} rAngle={r} measured={Boolean(p.measured)} compact/></g>
      <StressPoint x={385} y={91} label={`${label('stressPoint','局部转角')}：高应力/残余应力风险待验证。检查R角、筋根过渡及断口起裂位置。`}/>
      <path d="M380 97L350 129" stroke={red} strokeWidth="1.4"/>
      <text x="317" y="169" className="diagram-small">红色：关注区；与真实断口/测量对照</text>
    </g>}
    {schema.visualType==='tolerance_interference'&&<g>
      <text x="42" y="29" className="diagram-label">装配状态 · 齿轮副啮合关系</text>
      <GearPair/>
      <path d="M314 111H361" stroke={blue} strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="356" y="48" width="176" height="118" rx="5" fill="#f7f9fb" stroke="#cbd3dd"/>
      <rect x="371" y="77" width="63" height="47" rx="3" fill="#dbe3ec" stroke={ink} strokeWidth="1.5"/>
      <path d="M421 67L445 77V124L421 134Z" fill="#bfcbd8" stroke={ink} strokeWidth="1.5"/>
      <rect x="446" y="86" width="70" height="29" rx="3" fill="#edf1f5" stroke={ink} strokeWidth="1.5"/>
      {Boolean(p.overlap)&&<path d="M441 80V122" stroke={red} strokeWidth="5" opacity=".8"/>}
      <text x="366" y="146" className="diagram-small">中心距 / 齿侧间隙</text>
      <text x="82" y="174" className="diagram-small">{label('partA','主动齿轮')}　↔　{label('partB','从动蜗杆')}</text>
      <text x="370" y="183" fill={Boolean(p.overlap)?red:blue} fontSize="10">{Boolean(p.overlap)?`实测干涉 ${Number(p.overlapMm).toFixed(2)} mm`:'叠加干涉需按尺寸链实测'}</text>
    </g>}
    {schema.visualType==='impact_load_path'&&<g>
      <text x="35" y="24" className="diagram-label">壳体跌落 · 冲击载荷传递路径 {p.dropHeight?`· ${p.dropHeight} m`:''}</text>
      <ProductHousing crack/>
      <path d="M223 116C281 102 292 91 336 91" fill="none" stroke={orange} strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="324" y="37" width="217" height="135" rx="5" fill="#fbfcfd" stroke="#cbd3dd"/>
      <path d="M348 66H511V142H348Z" fill="#e7edf3" stroke={blue} strokeWidth="2"/>
      <path d="M405 142V104Q405 90 419 90H441Q455 90 455 104V142" fill="#d4dee8" stroke={ink} strokeWidth="2"/>
      <path d="M348 127H404M456 127H511M377 66V127M482 66V127" fill="none" stroke="#8b9aab" strokeWidth="2"/>
      <path d="M390 49V78M420 49V80M450 49V78" stroke={blue} strokeWidth="2.4" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <path d="M420 97l-7 10 8 3-7 12 14-12-7-3 8-10" fill="none" stroke={red} strokeWidth="2.5"/>
      <StressPoint x={430} y={105} label={`${label('weakPoint','待定位薄弱点')}：冲击载荷转向/截面突变位置。用断口起点、应变或仿真确认，不能仅凭示意图定因。`}/>
      <text x="345" y="160" className="diagram-small">局部剖面：接触面 → 外壁 → 加强筋 → 螺丝柱根</text>
      <text x="40" y="184" className="diagram-small">冲击动量沿外壳与筋传递；红色标记为待核查起裂区</text>
    </g>}
    {schema.visualType==='water_hammer'&&<g>
      <path d="M62 70H498V130H62Z" fill="#f4f6f8" stroke={blue} strokeWidth="3"/>
      <path d="M100 100H450" stroke={blue} strokeWidth="3" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <path d="M300 98L320 98L332 80L345 120L360 60L375 135L390 91L405 100" fill="none" stroke={red} strokeWidth="3"/>
      <StressPoint x={360} y={60} label="压力峰值位置：核实水锤峰值是否进入设计输入，并与裂纹位置关联。"/>
      <text x="72" y="58" className="diagram-label">流向 →</text><text x="390" y="54" fill={red} fontSize="12">压力峰值</text>
    </g>}
    {schema.visualType==='triz_preaction'&&<g>
      <rect x="350" y="68" width="35" height="80" rx="4" fill="#eef2f6" stroke={blue} strokeWidth="2"/>
      <path d="M90 108H180L195 83L215 133L235 83L255 133L275 83L295 108H350" fill="none" stroke={blue} strokeWidth="3"/>
      <path d="M395 108H485" stroke={orange} strokeWidth="3" markerEnd={`url(#${markerPrefix}-warn)`}/>
      <path d="M315 82H260" stroke={blue} strokeWidth="2" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <text x="80" y="68" className="diagram-label">预压弹性件</text><text x="390" y="92" fill={orange} fontSize="12">反向预载</text><text x="393" y="136" className="diagram-small">先抵消工作载荷</text>
    </g>}
    {schema.visualType==='triz_curvature'&&<g>
      <path d="M80 145V62H230" fill="none" stroke={red} strokeWidth="5"/><path d="M325 145V96Q325 62 360 62H500" fill="none" stroke={blue} strokeWidth="5"/>
      <path d="M95 125L150 94L205 125" fill="none" stroke={orange} strokeWidth="2" markerEnd={`url(#${markerPrefix}-warn)`}/><path d="M340 125Q365 91 403 91T480 73" fill="none" stroke={blue} strokeWidth="2" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <StressPoint x={81} y={62} label="尖角应力集中：圆角化前的高风险转折点。"/>
      <text x="90" y="175" fill={red} fontSize="12">修改前：尖角</text><text x="350" y="175" fill={blue} fontSize="12">修改后：变半径 R 角</text>
    </g>}
    {schema.visualType==='before_after'&&<g>
      <line x1="280" y1="35" x2="280" y2="178" stroke="#e1e5ea" strokeWidth="2"/>
      <text x="90" y="35" className="diagram-label">修改前 · 局部厚肉</text><path d="M65 132H235V72H270V155H65Z" fill="#eef2f6" stroke={blue} strokeWidth="2"/>
      <StressPoint x={235} y={72} intensity="medium" label="厚薄突变处易缩水或形成应力集中；需要检查外观和变形。"/>
      <text x="315" y="35" className="diagram-label">修改后 · 均匀壁厚 + 筋</text><g transform="translate(235 0) scale(.62)"><CrossSection wallThickness={Number(p.wallB??2.4)} ribHeight={rib} rAngle={Number(p.rAngle??.8)}/></g>
    </g>}
    {schema.visualType==='electromechanical_sync'&&<g>
      <rect x="50" y="67" width="115" height="60" rx="6" fill="#f4f6f8" stroke={blue} strokeWidth="2"/><text x="70" y="101" className="diagram-label">电控指令</text>
      <path d="M165 97H255" stroke={blue} strokeWidth="3" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <rect x="265" y="67" width="115" height="60" rx="6" fill="#f4f6f8" stroke={blue} strokeWidth="2"/><text x="280" y="101" className="diagram-label">电机/传动</text>
      <path d="M380 97H455" stroke={orange} strokeWidth="3" markerEnd={`url(#${markerPrefix}-warn)`}/>
      <path d="M455 145V60H500" fill="none" stroke={blue} strokeWidth="3"/><text x="423" y="165" className="diagram-label">机械限位</text>
      <text x="180" y="153" fill={orange} fontSize="12">反馈延迟 {Number(p.feedbackMs??35)} ms</text>
      <StressPoint x={455} y={97} intensity="medium" label="检查指令时间戳、传感器反馈与机械到位时刻的偏差。"/>
    </g>}
    {schema.visualType==='functional_transfer'&&<g>
      <rect x="45" y="72" width="125" height="58" rx="6" fill="#f4f6f8" stroke={blue} strokeWidth="2"/><text x="58" y="105" className="diagram-label">{label('input','工程输入')}</text>
      <path d="M170 101H235" stroke={blue} strokeWidth="3" markerEnd={`url(#${markerPrefix}-arrow)`}/>
      <rect x="240" y="72" width="115" height="58" rx="6" fill="#eef2f6" stroke={blue} strokeWidth="2"/><text x="267" y="105" className="diagram-label">结构传递</text>
      <path d="M355 101H420" stroke={orange} strokeWidth="3" markerEnd={`url(#${markerPrefix}-warn)`}/>
      <rect x="425" y="72" width="125" height="58" rx="6" fill="#fff7ed" stroke={orange} strokeWidth="2"/><text x="438" y="105" className="diagram-label">{label('response','响应结果')}</text>
      <StressPoint x={300} y={72} intensity="medium" label="优先在结构传递节点布置测量：力、位移、振动或信号时序。"/>
    </g>}
  </svg>;
}

export default function EngineeringVisual({schema}:DrawingProps){
  const [open,setOpen]=useState(false);
  return <>
    <button type="button" className="engineering-visual" onClick={()=>setOpen(true)} aria-label={`${schema.title}，点击放大查看`}>
      <Diagram schema={schema}/><span className="visual-expand">点击示意图放大</span>
    </button>
    <div className="visual-legend"><b>图例</b>{schema.legend.map(item=><span className={`legend-item ${item.includes('红')?'warn':item.includes('橙')?'caution':''}`} key={item}>{item}</span>)}</div>{schema.basis&&<div className="visual-basis">{schema.basis}</div>}
    <Dialog visible={open} header={schema.title} footer={false} width="min(920px, 94vw)" placement="center" onClose={()=>setOpen(false)}>
      <div className="engineering-modal-visual"><Diagram schema={schema} enlarged/><div className="visual-legend">{schema.legend.map(item=><span className={`legend-item ${item.includes('红')?'warn':item.includes('橙')?'caution':''}`} key={item}>{item}</span>)}</div><p>工程示意图用于讨论假设；尺寸/应力值须由图纸、实测或仿真确认。</p></div>
    </Dialog>
  </>;
}
