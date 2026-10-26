import { hasMoldingStressRisk, type Phenomenon } from './rules';

export type MeasureLevel='L1 围堵'|'L2 参数微调'|'L3 根因消除'|'L4 系统预防';
export type MeasureCard={id:string;level:MeasureLevel;title:string;action:string;expected:string;side:string;trace:string;whyIndex:number};
export type MeasureInput={phenomenon:Phenomenon;whys:{text:string;evidence:string;lever:string;confirmed:boolean}[];direction:string;approach:string;verification:string;sourceIndex?:number;singleLevel?:boolean};

const unitPattern='(%|％|mm|cm|m³/h|L/min|ml/min|MPa|kPa|Pa|V|mA|A|W|kW|rpm|r/min|dB(?:\\(A\\))?|Hz|℃|°C|N|g)?';
function extractValues(text:string){
  const values=[...text.matchAll(new RegExp('(\\d+(?:\\.\\d+)?)\\s*'+unitPattern,'ig'))].map(m=>({full:m[0].trim(),number:Number(m[1])}));
  if(!values.length)return null;
  const target=new RegExp('(?:目标(?:值)?(?:为)?|提升(?:至|到)|提高(?:至|到)|调整?(?:至|到)|调至|调到)\\s*(\\d+(?:\\.\\d+)?\\s*'+unitPattern+')','i').exec(text)?.[1]?.trim()??null;
  let current=new RegExp('(?:由|从|当前(?:值|占空比|PWM|转速|流量|扬程|中心距|间隙|电压|电流)?(?:为)?|目前(?:值|占空比|PWM|转速|流量|扬程|中心距|间隙|电压|电流)?(?:为)?|现值(?:为)?|实测(?:值)?(?:为)?|限定为|设置为|设为|仅|设定值?(?:为)?)\\s*(\\d+(?:\\.\\d+)?\\s*'+unitPattern+')','i').exec(text)?.[1]?.trim()??null;
  if(!current&&values.length>1)current=values.find(v=>v.full!==target)?.full??null;
  return {current,target};
}
function chooseVariable(text:string){
  return ['占空比','PWM','转速','泵速','流量','扬程','中心距','齿侧间隙','过盈量','R角','壁厚','保压','射速','电压','电流','扭矩','间隙','噪声','温度','压力'].find(v=>new RegExp(v,'i').test(text))??null;
}
function choosePart(text:string,p:Phenomenon){
  if(/水泵|泵体|泵控制|出水流量|占空比/.test(text))return '水泵';
  return ['水泵','泵体','电机齿轮与蜗杆','齿轮副','螺丝柱','后壳','上盖','密封面','按键','管路','滤芯外壳','塑件'].find(v=>text.includes(v))??(p.material||'关键部件');
}

/** Builds actions from the selected causal node and measured/target values; never emits an unlinked generic action. */
export function buildMeasureCards(input:MeasureInput):MeasureCard[]{
  const chain=input.whys.filter(w=>w.confirmed);
  const whyIndex=Math.min(Math.max(0,input.sourceIndex??chain.length-1),Math.max(0,chain.length-1));
  const root=chain[whyIndex]??chain[chain.length-1];
  const context=[input.phenomenon.form,root?.text,root?.evidence,root?.lever,input.direction,input.approach].filter(Boolean).join(' ');
  const component=choosePart(context,input.phenomenon),variable=chooseVariable(context);
  const values=variable?extractValues([root?.text??'',root?.evidence??'',root?.lever??'',input.direction].join(' ')):null;
  const hasPair=Boolean(values?.current&&values?.target),current=values?.current,target=values?.target;
  const rootCause=root?.text??input.phenomenon.form,varName=variable??'关键参数';
  const trace=`解决 WHY ${whyIndex+1}：${rootCause}`;
  const pump=/水泵|泵体|占空比|流量|扬程/.test(context);
  const software=/电控|软件|固件|逻辑/.test(input.approach);
  const pumpSwap=/水泵|扬程/.test(input.approach)&&/换|更大|更换/.test(input.approach);
  const pipe=/管路|阻力/.test(input.approach);
  let l2:string,l3:string,l4:string;
  if(pump&&variable==='占空比'&&hasPair){
    l2=`在水泵性能测试台上，以 2% 为步长，从 ${current} 逐步调高占空比至 ${target}，记录流量扬程曲线和噪音变化。`;
    l3=software
      ?`修改电控固件逻辑，将水泵启动及稳态运行的占空比设定值由 ${current} 提升至 ${target}，并评估对整机功耗的影响。`
      :pumpSwap?`针对根因“${rootCause}”更换为满足目标流量/扬程的水泵，并以占空比 ${target} 作为对照工况，复测功耗与噪音。`
      :pipe?`针对根因“${rootCause}”优化管路局部阻力（优先核查弯头、缩径和滤芯压降），再将占空比设定至 ${target} 对照验证流量与功耗。`
      :`针对根因“${rootCause}”，把水泵占空比设定值由 ${current} 调整至 ${target}，并同步确认启动、稳态和整机功耗。`;
    const threshold=Number.parseFloat(target!.replace('%',''))-2;
    l4=software
      ?`在《水泵电控参数标定规范》中，明确最低占空比不得低于 ${Number.isFinite(threshold)?threshold:28}%；加入 DVT 阶段流量极值、噪音及功耗测试用例，并关联固件版本。`
      :pumpSwap?'在《水泵选型规范》中明确目标工况下的流量—扬程工作点及电源接口边界；将噪音、功耗和耐久纳入 DVT 水泵替代件验证。'
      :pipe?'在《水路设计规范》中明确弯头、缩径及滤芯压降的控制要求；在 DVT 加入额定流量/扬程、噪音及功耗测试。'
      :`在《水泵性能参数规范》中固化占空比 ${target} 对应的流量、扬程、噪音和功耗窗口，并加入 DVT 流量极值测试。`;
  }else{
    l2=`围绕“${rootCause}”对${component}的${varName}做单变量阶梯试验；每档记录${variable??'关键特性'}、功能输出与副作用，覆盖当前值和目标窗口。`;
    l3=input.approach.trim()
      ?`针对 WHY ${whyIndex+1}“${rootCause}”，执行所选方向：${input.approach}。具体调节动作：${root?.lever?.trim()||input.direction.trim()||'先用单变量样件验证该根因对应的设计/参数改变'}。`
      :`针对 WHY ${whyIndex+1}“${rootCause}”，实施因果链记录的工程杠杆：${root?.lever?.trim()||'先与研发确认可控参数，再进行单变量验证'}。`;
    l4=`将“${varName}”及其与${component}的控制要求纳入对应图纸/软件标定/检验规范；补充 DVT 用例，记录工况、限值、样本数和变更版本。`;
  }
  const l1=pump
    ?`对当前${component}及对应固件/物料批次进行隔离标识；在统一电压、流量需求和测试工况下复测，记录${variable??'流量'}与噪音，防止异常状态继续流出。`
    :`围堵 WHY ${whyIndex+1}“${rootCause}”涉及的${component}：标记受影响批次/版本，按同一工况复测该特性并保留异常件和测量记录。`;
  const expected=pump
    ?'目标工况下流量达到规格下限；同步记录扬程、噪音与输入功率，确认无超限。'
    :`对应现象可稳定复现/消除；${input.verification||'按同一测试标准对比变更前后样件并记录结果'}。`;
  let side=pump
    ?'占空比/泵扬程提升可能增加输入功率、噪音、温升和水路压力；同步监控电源余量、噪音及耐压/密封。'
    :`变更可能将风险转移至相邻配合、密封、耐久或整机性能；验证时同步检查${component}接口和相关边界。`;
  if(hasMoldingStressRisk(context)&&/缩水/.test(context))side+=' 提高射速/保压可能抬高成型残余应力并增加后续 ESC/延迟开裂风险；需评估模流残余应力分布或退火可行性。';
  if(/锁模力/.test(context)&&/(提高|增加|上调|加大)/.test(context))side+=' 提高锁模力可能增加残余应力与脱模困难；同步验证飞边、顶出和尺寸稳定性。';
  if(/R角|圆角|壁厚/.test(context))side+=' R角/壁厚变更须复核装配定位、配合间隙及密封面的空间和压缩量。';
  const cards:MeasureCard[]=[
    {id:'act-0',level:'L1 围堵',title:`围堵${component}“${rootCause}”相关异常`,action:l1,expected,side:`围堵期间可能增加筛检/复测工时；${side}`,trace,whyIndex},
    {id:'act-1',level:'L2 参数微调',title:`验证${varName}调整窗口`,action:l2,expected,side,trace,whyIndex},
    {id:'act-2',level:'L3 根因消除',title:l3,action:l3,expected,side,trace,whyIndex},
    {id:'act-3',level:'L4 系统预防',title:`固化${component}${varName}控制与验证`,action:l4+(Number.parseFloat(input.phenomenon.regrindRatio)>20?` 回料比例超过 20%，同步记录材料批次与回料比例。`:''),expected:`规范和 DVT 用例可追溯至 WHY ${whyIndex+1}；后续版本按同一判定标准验证。`,side:'新增控制项需要维护责任人、量测设备校准、软件/材料版本和数据保存要求。',trace,whyIndex},
  ];
  return input.singleLevel?[cards[2]]:cards;
}
