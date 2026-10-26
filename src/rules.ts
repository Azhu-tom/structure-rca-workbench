export type Stage = 0 | 1 | 2 | 3 | 4;
export const stages = ['现象锚定', '范畴筛选', '5WHY 深挖', 'TRIZ 矛盾映射', '措施收敛'];
export const requiredFields = [
  { key: 'form', label: '问题现象' }, { key: 'phase', label: '发生阶段' }, { key: 'location', label: '部位 / 声源位置' },
  { key: 'environment', label: '测试工况 / 环境' }, { key: 'ratio', label: '发生比例 / 样本数' },
] as const;
export type Phenomenon = Record<(typeof requiredFields)[number]['key'], string> & { material: string; regrindRatio: string; chemicalMedia: string };
export const initialPhenomenon: Phenomenon = { form: '', phase: '', location: '', environment: '', ratio: '', material: '', regrindRatio: '', chemicalMedia: '' };
export const fishbone = ['结构设计', '材料/零件', '模具/工装', '工艺/装配', '设备/测试', '环境/工况'] as const;
export type Factor = { id: string; name: string; weight: number; checked: boolean; source: string };

/** Single routing dictionary drives intake prompts, fishbone variants, 5WHY coaching and TRIZ candidates. */
export type ProblemDomain = 'appearance' | 'assembly' | 'performance' | 'reliability' | 'molding' | 'electrical' | 'general';
export type RouteQuestion = { key: string; label: string; placeholder: string };
export type VisualType = 'cross_section_stress' | 'tolerance_interference' | 'impact_load_path' | 'water_hammer' | 'triz_preaction' | 'triz_curvature' | 'before_after' | 'electromechanical_sync' | 'functional_transfer';
export type VisualSchema = { visualType: VisualType; title: string; params: Record<string, string | number | boolean>; legend: string[]; basis?: string };
export type ProblemRoute = {
  id: ProblemDomain; label: string; keywords: RegExp; questions: RouteQuestion[];
  bones: { id: string; name: string; weight: number; source: string }[];
  whyPrompts: string[]; triz: { title: string; principles: string[]; hint: string; side: string; visualSchema?:VisualSchema }[]; visualSchema: VisualSchema;
};
const routeDefinitions: Omit<ProblemRoute, 'visualSchema'>[] = [
  { id:'appearance', label:'外观 / CMF', keywords:/缩水|色差|熔接痕|银纹|气泡|流痕|烧焦|划伤|外观|cmf/i,
    questions:[{key:'location',label:'外观缺陷出现在什么表面/区域？',placeholder:'如：上盖正面浇口对侧，距分型线 15 mm'},{key:'environment',label:'缺陷与成型条件或颜色批次有什么关联？',placeholder:'如：保压 70 MPa 时明显；仅深灰色批次出现'},{key:'ratio',label:'抽检数量与不良数量？',placeholder:'如：8/50 件'}],
    bones:[{id:'design',name:'外观设计/壁厚',weight:4,source:'检查壁厚突变、外观面与进胶距离'},{id:'material',name:'材料/色粉',weight:4,source:'核对树脂、色粉批次和含水率'},{id:'mold',name:'浇口/排气/冷却',weight:4,source:'核对浇口位置、排气与模温均衡'},{id:'process',name:'成型参数',weight:5,source:'对照料温、保压、速度与干燥记录'},{id:'equipment',name:'设备/测量',weight:2,source:'核实计量稳定性和色差测量口径'},{id:'environment',name:'环境/批次',weight:2,source:'核对原料批次、温湿度与存储'}],
    whyPrompts:['缺陷位于何处、尺寸/色差值是多少？','该位置的料流、保压或温度记录有什么差异？','哪项材料/模具/工艺参数变化可复现缺陷？'],
    triz:[{title:'壁厚减薄降缩水 ↔ 刚度/耐压不足',principles:['复合材料','改变维度'],hint:'用筋/拱替代局部厚肉；先在非外观面验证，再检查光影面缩水。',side:'壁厚调整可能改变卡扣刚度、装配间隙和表面光影。',visualSchema:{visualType:'before_after',title:'厚肉减薄并以加强筋补刚度',params:{wallA:3.2,wallB:2.4,ribHeight:5,rAngle:.8},legend:['修改前：厚肉区有缩水风险','修改后：均匀壁厚 + 局部加强筋']}}]},
  { id:'assembly', label:'结构 / 装配 / 传动', keywords:/装配|干涉|卡滞|咬合|齿轮|蜗杆|公差|配合|间隙|卡扣|回弹|螺丝柱|断裂|干涉|超声波后/i,
    questions:[{key:'location',label:'干涉/卡滞/异响发生在哪个配合面或运动副？',placeholder:'如：电机齿轮与蜗杆啮合面；上盖超声波合模线'},{key:'environment',label:'关键配合尺寸、公差链或运动行程是多少？',placeholder:'如：中心距 18.00±0.10 mm，实测 18.16 mm'},{key:'material',label:'润滑/表面/装配条件是什么？',placeholder:'如：润滑脂牌号与涂布量；齿面 Ra 1.6 μm；锁付扭矩'}],
    bones:[{id:'design',name:'公差链/运动设计',weight:5,source:'优先核算基准链、中心距、行程和限位配合'},{id:'material',name:'来料一致性',weight:4,source:'测量关键件尺寸分布、批次与材料收缩'},{id:'mold',name:'模具尺寸偏差',weight:4,source:'核查型腔/型芯尺寸、收缩率与变形'},{id:'process',name:'装配/润滑',weight:5,source:'核对装配顺序、压入力、润滑脂和涂布量'},{id:'equipment',name:'工装/电控联动',weight:3,source:'检查治具重复精度，以及电控逻辑和机械限位配合'},{id:'environment',name:'温升/负载',weight:2,source:'核对负载、温升及润滑介质变化'}],
    whyPrompts:['配合面/运动副的间隙、过盈或中心距实测值是多少？','公差链中哪一尺寸贡献最大？来料/装配分布如何？','电控逻辑、机械限位与负载时序是否一致？'],
    triz:[{title:'降低配合间隙消除异响 ↔ 热膨胀后卡滞',principles:['预先作用','动态化','局部质量'],hint:'给齿轮副定义冷态中心距窗口，结合热态膨胀和偏心量；必要时用弹性预载补偿间隙。',side:'减小间隙可能导致热态咬死、磨损上升；校核全温区与润滑寿命。',visualSchema:{visualType:'triz_preaction',title:'弹性预载补偿间隙',params:{preloadN:8},legend:['预先施加弹性预载，补偿传动间隙','验证热态不咬死、噪声与磨损可接受']}}]},
  { id:'performance', label:'性能 / 功能', keywords:/漏水|漏气|噪音|噪声|异响|按键|手感|传动失效|功能|性能|振动|回弹/i,
    questions:[{key:'location',label:'功能异常的部件/声源/密封界面？',placeholder:'如：泵支架、密封面、按键导柱'},{key:'environment',label:'测试工况与判定标准？',placeholder:'如：额定电压、2.4 L/min、1 m 测距，限值 45 dB(A)'},{key:'ratio',label:'异常样本与总样本数？',placeholder:'如：4/10 台'}],
    bones:[{id:'design',name:'结构/功能设计',weight:4,source:'核查刚度、运动副、密封压缩量和传递路径'},{id:'material',name:'材料/零件',weight:3,source:'核对关键零件属性、尺寸与批次'},{id:'mold',name:'模具/工装',weight:2,source:'检查成型变形和测试装夹边界'},{id:'process',name:'装配/调试',weight:4,source:'检查装配状态、紧固力矩及调试参数'},{id:'equipment',name:'测试/控制',weight:5,source:'确认台架、传感器、软件逻辑与机械限位'},{id:'environment',name:'工况/介质',weight:4,source:'固定负载、温度、压力、流量与接触介质'}],
    whyPrompts:['异常发生时的输入、输出和判定值是多少？','机械结构与电控/软件指令是否同步？','哪个可调参数或界面能重复触发/消除异常？'],triz:[]},
  { id:'reliability', label:'可靠性 / 测试', keywords:/跌落|冲击|振动|高低温|老化|疲劳|寿命|可靠性|耐久|运输/i,
    questions:[{key:'environment',label:'测试高度/姿态/受力方向/标准是什么？',placeholder:'如：1.0 m，底面/棱边姿态，水泥地，企业标准 XYZ'},{key:'location',label:'裂纹/变形/失效的薄弱位置？',placeholder:'如：后壳内部螺丝柱根部，沿熔接线开裂'},{key:'ratio',label:'测试样本量、失效数与循环次数？',placeholder:'如：2/10 件，跌落 6 面各 1 次'}],
    bones:[{id:'design',name:'结构载荷/薄弱点',weight:5,source:'优先查壁厚、R角、筋位及载荷传递路径'},{id:'material',name:'材料韧性/批次',weight:4,source:'核对低温冲击韧性、批次与熔接线敏感性'},{id:'mold',name:'模具/成型缺陷',weight:2,source:'查熔接线、内应力、孔隙及螺丝柱成型质量'},{id:'process',name:'装配预应力',weight:3,source:'检查锁付扭矩、嵌件预紧与装配应力'},{id:'equipment',name:'测试方法/夹具',weight:3,source:'核实跌落姿态、夹具、冲击波形与标准'},{id:'environment',name:'环境/温度',weight:4,source:'低温、湿热和跌落面会改变材料韧性/冲击边界'}],
    whyPrompts:['跌落冲击的动量传递路径经过哪些结构？','薄弱点的壁厚、R角、筋根和应力/应变测量值？','什么结构杠杆可降低峰值应力并通过同标准复测？'],
    triz:[{title:'提高局部抗冲击强度 ↔ 重量/空间/刚度冲突',principles:['预先反作用','柔性缓冲','局部质量'],hint:'沿动量传递路径布置加强筋或局部缓冲；让可替换缓冲区先吸能，避免螺丝柱根部承受峰值冲击。',side:'加强筋可能把应力转移到筋端或邻近螺丝柱；需做冲击波形/应变对比及多姿态跌落验证。',visualSchema:{visualType:'triz_preaction',title:'预先反作用：加强筋与柔性缓冲',params:{preloadN:12},legend:['让加强筋/缓冲区先承接冲击动量','避免峰值载荷集中到螺丝柱根部']}}]},
  { id:'molding', label:'工艺 / 注塑 / 模具', keywords:/注塑|试模|模具|浇口|顶出|飞边|困气|排气|烘干|保压|缩水|银纹|熔接痕/i,
    questions:[{key:'location',label:'缺陷对应的浇口、分型面、顶出或型腔位置？',placeholder:'如：顶针附近拉伤，距浇口 40 mm'},{key:'environment',label:'材料、含水率、烘干及成型参数记录？',placeholder:'如：PC/ABS，含水 0.03%，料温/模温/保压记录'},{key:'ratio',label:'模次/穴号/不良比例？',placeholder:'如：T1 第 2 穴，6/30 件'}],
    bones:[{id:'design',name:'零件结构/脱模',weight:3,source:'检查拔模、筋厚、圆角和脱模方向'},{id:'material',name:'树脂/含水/回料',weight:5,source:'核对牌号、批次、含水率和回料比例'},{id:'mold',name:'浇口/排气/冷却',weight:5,source:'核对浇口、排气、冷却回路、顶出与分型面'},{id:'process',name:'注塑工艺窗口',weight:5,source:'核对料温、模温、速度、保压与干燥曲线'},{id:'equipment',name:'注塑机/传感器',weight:3,source:'确认计量、压力/温度传感器及锁模平行度'},{id:'environment',name:'储运/现场条件',weight:2,source:'核对原料暴露时间、环境湿度和周转条件'}],
    whyPrompts:['缺陷位置与型腔/浇口/顶出布局如何对应？','过程参数或材料状态的测量记录是什么？','哪项模具/工艺杠杆可通过连续稳定生产验证？'],triz:[]},
  { id:'electrical', label:'电控 / 机电联动', keywords:/电控|软件|程序|逻辑|传感器|限位|电机|联动|控制器/i,
    questions:[{key:'location',label:'机械执行件、传感器与限位位置？',placeholder:'如：推杆到位开关与齿轮机械止挡'},{key:'environment',label:'指令时序、反馈信号和机械动作的测量记录？',placeholder:'如：指令后 120 ms 到位，限位信号延迟 35 ms'},{key:'ratio',label:'异常复现条件/样本数？',placeholder:'如：低电压下 3/10 台复现'}],
    bones:[{id:'design',name:'机械行程/限位',weight:4,source:'复核机械限位、行程余量及过行程缓冲'},{id:'material',name:'执行件/传感器批次',weight:2,source:'核对电机、齿轮与传感器批次差异'},{id:'mold',name:'安装基准/工装',weight:2,source:'核对传感器支架、安装孔位和装配定位'},{id:'process',name:'标定/装配',weight:3,source:'核实装配间隙、标定值与紧固状态'},{id:'equipment',name:'电控逻辑/反馈',weight:5,source:'对齐指令、反馈信号、电机响应和机械限位'},{id:'environment',name:'电源/负载/温度',weight:3,source:'核实供电波动、负载和温升'}],
    whyPrompts:['输入指令、反馈信号和机械动作时间分别是多少？','电控状态与实际机械位置的偏差是多少？','哪个逻辑时序、限位位置或传感器参数可验证调整？'],triz:[]},
  { id:'general', label:'其他研发问题', keywords:/.*/, questions:[{key:'location',label:'问题涉及的部件/功能/界面？',placeholder:'填写当前已知的部件、功能或现象位置'},{key:'environment',label:'已知触发条件或验证数据？',placeholder:'温度、载荷、尺寸、记录编号等；未知可填“待确认”'},{key:'ratio',label:'复现情况/样本数（可选）？',placeholder:'未知可留空'}],
    bones:[{id:'design',name:'设计输入/结构',weight:3,source:'核对功能需求、结构边界和载荷路径'},{id:'material',name:'材料/零件',weight:3,source:'核对关键零件属性、规格与批次'},{id:'mold',name:'模具/工装',weight:2,source:'核对制造成形和测试装夹'},{id:'process',name:'工艺/装配',weight:3,source:'核对过程记录、装配状态与变更'},{id:'equipment',name:'设备/控制/测试',weight:3,source:'核实设备、控制逻辑和测量方法'},{id:'environment',name:'工况/环境',weight:3,source:'补齐温度、载荷、介质等边界'}],whyPrompts:['可以观察或测量到的异常量是什么？','哪些条件变化与异常出现同步？','能通过什么可控杠杆复现或消除异常？'],triz:[]},
];
const routeVisuals: Record<ProblemDomain, VisualSchema> = {
  appearance:{visualType:'before_after',title:'外观厚薄过渡与加强筋方案',params:{wallA:3.2,wallB:2.4,ribHeight:5,rAngle:0.8},legend:['左：厚肉区易形成缩水/光影','右：均匀壁厚并以筋补刚度']},
  assembly:{visualType:'tolerance_interference',title:'配合尺寸叠加与干涉区',params:{partA:'齿轮/轴',partB:'蜗杆/支架',overlap:true,overlapMm:0.16},legend:['蓝灰：零件名义轮廓','红色：公差叠加后的干涉区']},
  performance:{visualType:'functional_transfer',title:'功能输入到结构响应的传递路径',params:{input:'按键/泵/传动输入',response:'位移/噪声/流量'},legend:['蓝色箭头：能量/载荷传递','橙色标记：优先测量的响应点']},
  reliability:{visualType:'impact_load_path',title:'跌落冲击的载荷传递路径',params:{dropHeight:1.0,weakPoint:'螺丝柱根部',loadDirection:'冲击方向'},legend:['蓝色箭头：冲击动量传递路径','红色：薄弱点应力集中位置']},
  molding:{visualType:'cross_section_stress',title:'塑件截面与筋根应力集中示意',params:{wallThickness:2.5,ribHeight:5,rAngle:0.3,stressPoint:'inner_corner'},legend:['蓝灰：塑件壁厚与加强筋','红色晕圈：尖角/熔接区风险点','尺寸为示意值，需以图纸和实测为准']},
  electrical:{visualType:'electromechanical_sync',title:'电控指令、反馈与机械限位的同步关系',params:{commandMs:0,feedbackMs:35,travelMm:0.3},legend:['蓝色：电控指令/传感器反馈','橙色：时序差或机械余量待核查']},
  general:{visualType:'functional_transfer',title:'输入—结构—响应的通用排查路径',params:{input:'载荷/指令/环境',response:'尺寸/功能/测试结果'},legend:['沿箭头逐段记录输入、传递和响应','橙色节点为优先补充的测量点']},
};
export const problemRoutes: ProblemRoute[] = routeDefinitions.map(route => ({...route, visualSchema:routeVisuals[route.id]}));
export function visualForPhenomenon(form:string, fallback:VisualSchema, p?:Phenomenon, evidence:string[]=[]):VisualSchema {
  const context = [form,p?.location,p?.environment,...evidence].filter(Boolean).join(' ');
  let schema = fallback;
  if (/水锤|水压冲击|压力脉冲/.test(context)) schema={visualType:'water_hammer',title:'水锤压力波与裂纹位置关联',params:{pressurePeak:'待测'},legend:['蓝色：压力波传播方向；红色波形：峰值位置待实测','将压力传感器记录与裂纹位置、发生时刻对齐']};
  else if (/跌落|冲击|撞击/.test(context)) schema=routeVisuals.reliability;
  else if (/干涉|卡滞|咬合|齿轮|蜗杆|公差链|配合间隙/.test(context)) schema=routeVisuals.assembly;
  else if (/尖角|筋根|螺丝柱根部|应力集中|开裂|裂纹|断裂|漏水|漏气/.test(context)) schema=routeVisuals.molding;
  else if (/高低温|冷热冲击|老化|疲劳|寿命|振动/.test(context)) schema=routeVisuals.performance;
  const params={...schema.params};
  const location=p?.location?.trim();
  if (schema.visualType==='impact_load_path') {
    params.weakPoint=location || (/(螺丝柱|柱根|筋根|卡扣|转角)/.exec(context)?.[0] ?? '薄弱点待定位');
    const height=/(\d+(?:\.\d+)?)\s*m\b/i.exec(`${p?.environment??''} ${context}`);
    if(height) params.dropHeight=Number(height[1]); else delete params.dropHeight;
  }
  if(schema.visualType==='tolerance_interference'){
    params.partA=/电机|齿轮/.test(context)?'电机齿轮':'配合零件 A';
    params.partB=/蜗杆/.test(context)?'蜗杆':'配合零件 B';
    const overlap=/(?:过盈|干涉量|重叠量)\s*(?:约|为|=|：|:)?\s*(\d+(?:\.\d+)?)\s*mm/i.exec(context);
    if(overlap){params.overlap=true;params.overlapMm=Number(overlap[1]);}
    else {params.overlap=false;delete params.overlapMm;}
  }
  if(schema.visualType==='cross_section_stress'){
    const radius=/(?:R\s*角|圆角|R)\s*(?:半径)?\s*(?:约|为|=|：|:)?\s*(\d+(?:\.\d+)?)\s*mm/i.exec(context);
    const wall=/(?:壁厚|厚度)\s*(?:约|为|=|：|:)?\s*(\d+(?:\.\d+)?)\s*mm/i.exec(context);
    if(radius) params.rAngle=Number(radius[1]);
    if(wall) params.wallThickness=Number(wall[1]);
    params.measured=Boolean(radius||wall);
    params.stressPoint=location||'重点位置待确认';
  }
  const dataKnown=(schema.visualType==='impact_load_path'&&Boolean(location)) || (schema.visualType==='tolerance_interference'&&params.overlap===true) || (schema.visualType==='cross_section_stress'&&params.measured===true);
  return {...schema,params,basis:dataKnown?'图中已映射用户提供的位置或尺寸。':'当前缺少可用尺寸/位置数据，图形仅表达排查机理，不代表实测结果。',legend:dataKnown?schema.legend:[...schema.legend,'未提供的数值不作推定；图形为机理示意，尺寸需实测/图纸确认']};
}

export type WhyCoaching={question:string; basis:string; evidence:string};
export function buildWhyCoaching(route:ProblemRoute,p:Phenomenon,priorAnswers:string[],factor?:Factor):WhyCoaching{
  const context=[p.form,p.location,p.environment,p.phase,...priorAnswers].join(' ');
  const level=priorAnswers.length;
  if(route.id==='reliability') return level===0
    ? {question:'冲击输入如何传到断裂位置？请记录跌落高度/姿态、壳体接触点到螺丝柱的传力路径，以及可取得的峰值加速度或应变。',basis:'冲击工况下先建立边界条件和载荷路径，避免只凭断口猜原因。',evidence:'高度、姿态、冲击面、峰值加速度/应变或高速摄影记录'}
    : level===1 ? {question:'断裂起点处的局部结构数据是什么？测螺丝柱根部 R 角、壁厚、筋连接和断口起裂侧，并与未失效件对比。',basis:'前一层应已定位载荷路径；本层把路径收敛到局部几何与起裂证据。',evidence:'R 角/壁厚尺寸、断口起点、熔接线位置、仿真应力或应变'}
    : {question:'哪一个可控变量能区分几何薄弱、材料脆化或装配预应力？设计单变量对比并按相同姿态/高度复测。',basis:'验证假设需要控制其他条件，确认结果能否重复。',evidence:'对照组样件、材料批次/温度、锁付扭矩、相同测试标准与失效数'};
  if(route.id==='assembly' && /齿轮|蜗杆|咬合|异响/.test(context)) return level===0
    ? {question:'齿轮副在装配状态下的中心距、齿侧间隙和径向跳动实测是多少？异响是否与转速/负载同步？',basis:'啮合异响先区分几何啮合误差与润滑/负载影响。',evidence:'中心距与公差、齿侧间隙、跳动、转速、负载、声压/频谱'}
    : level===1 ? {question:'异响件与正常件的润滑脂牌号/涂布量、齿面粗糙度和接触斑点有何差异？',basis:'在几何差异已量化后，比较界面摩擦与接触状态。',evidence:'润滑脂批次/质量、涂布量、Ra、齿面接触斑点照片'}
    : {question:'通过中心距垫片/偏心量或定量润滑中的单一变量，能否重复消除异响且不增加温升和磨损？',basis:'末端应对应可执行工程杠杆，并用对照实验确认。',evidence:'单变量样件、相同转速负载下的噪声、温升和磨损结果'};
  if(route.id==='electrical') return level===0
    ? {question:'同一时间轴上，控制指令、传感器反馈、电机电流与机械到位时刻分别是多少？',basis:'先对齐控制逻辑和机械响应的时序，区分命令未发、反馈延迟或执行受阻。',evidence:'带时间戳的日志/示波记录、电流曲线、机械位移或限位状态'}
    : level===1 ? {question:'时序偏差随供电电压、负载或温度如何变化？用正常件作对照并记录重复次数。',basis:'条件相关性可以定位电源、负载或热态边界。',evidence:'电压、负载、温度及延迟毫秒数的对照记录'}
    : {question:'调整限位、滤波/去抖时间或驱动参数中的哪一项后，时序偏差可稳定回到规格内？',basis:'优先验证单一可调参数，避免同时改软件和结构导致归因不清。',evidence:'参数版本、响应时间、误触发率和机械行程余量'};
  if(route.id==='molding' && shouldEscalateMoistureCheck(p.form,p.material)) return level===0
    ? {question:'该批 PC/ABS 的成型前实际含水率和烘干曲线是什么？请给出取样方法、批次、温度/时间/露点记录。',basis:'PC/ABS 银纹、气泡或脆断触发材料首查规则，优先验证水解风险。',evidence:'卡尔费休含水率、材料批次、烘干温度/时间/露点'}
    : {question:'含水率合格后，缺陷是否仍随注射速度、保压或局部熔接线位置变化？对照记录是哪一项？',basis:'先排除材料含水，再按缺陷位置关联工艺窗口与熔接线。',evidence:'含水率合格对照、工艺曲线、缺陷位置/穴号'};
  return {question:route.whyPrompts[Math.min(level,route.whyPrompts.length-1)] || '哪项可测量的输入变化与异常同步？',basis:`当前优先因子：${factor?.name??route.label}。把假设拆成可对比的输入、传递过程和响应。`,evidence:'记录单位、测量位置、工况、样本量及对照结果'};
}
export function detectProblemRoute(text: string): ProblemRoute {
  const normalized = text.trim();
  // Strong test/impact context takes precedence over generic failure words such as “screw-boss fracture”.
  if (/跌落|冲击|振动测试|高低温|冷热冲击|老化|疲劳|耐久|寿命测试|运输测试/.test(normalized)) return getProblemRoute('reliability');
  if (/齿轮|蜗杆|中心距|啮合|装配干涉|公差链|卡滞|回弹/.test(normalized)) return getProblemRoute('assembly');
  if (/电控|软件|程序|逻辑|传感器|机械限位/.test(normalized)) return getProblemRoute('electrical');
  return problemRoutes.find(route => route.id !== 'general' && route.keywords.test(normalized)) ?? problemRoutes[problemRoutes.length-1];
}
export function getProblemRoute(id: ProblemDomain): ProblemRoute { return problemRoutes.find(route => route.id===id) ?? problemRoutes[problemRoutes.length-1]; }

export function shouldEscalateMoistureCheck(symptom: string, material: string): boolean {
  return /PC\s*\/?\s*ABS/i.test(material) && /银纹|气泡|脆断/.test(symptom);
}
export function isDelayedCracking(phase: string, form: string): boolean {
  return (/使用.*(月|周|天)|数月后|服役|售后/.test(phase) || /使用数月后|使用后/.test(form)) && /开裂|裂纹|脆断|断裂/.test(form);
}
export function isUncertainMedium(text: string): boolean {
  return /不确定|未知|待确认|未确认|不清楚|没查|待验证|不详|暂无/.test(text);
}
export function isNoiseProblem(text: string): boolean {
  return /噪音|噪声|异响/.test(text);
}
export function hasMoldingStressRisk(text: string): boolean {
  return /(提高|增加|上调|加大).{0,8}(射速|注射速度|保压|锁模力)|(射速|注射速度|保压|锁模力).{0,8}(提高|增加|上调|加大)/.test(text);
}
export function isStructuralRibCrack(location: string, form: string): boolean {
  return /竖向筋|筋根部/.test(location) && /漏水|裂纹|开裂/.test(form);
}
export function missingPhenomenon(p: Phenomenon): string[] {
  return requiredFields.filter(({key}) => !p[key].trim()).map(({label}) => label);
}
export function forbiddenWhy(text: string): boolean {
  return /操作不当|意识不足|工人疏忽|人为原因|责任心不强/.test(text);
}
export function whyAnswerIsObservable(text: string): boolean {
  const hasEvidence = /\d+(?:\.\d+)?\s*(?:mm|cm|m|MPa|kPa|Pa|℃|°C|%|秒|s\b|ms|毫秒|分钟|min\b|小时|h\b|次|件|批|V|mV|A\b|Hz|kHz|rpm|r\/min|dB(?:\(A\))?|N\b|N·m|g\b|μm|um|L\/min|mL|kg)?/i.test(text) || /(记录编号|报告编号|图纸编号|检验报告编号|数据记录编号)/.test(text);
  return text.trim().length >= 5 && !forbiddenWhy(text) && hasEvidence && /(mm|cm|MPa|℃|°C|%|秒|毫秒|时间|时序|次|批|件|值|测|检|记录|日志|偏差|含水|压力|半径|温度|速度|尺寸|间隙|应力|介质|dB|Hz|rpm|r\/min|分贝|声压|频谱|振动|电压|电流|流量|转速|扭矩|加速度|载荷|噪音|噪声|V\b|N\b|信号|传感器|反馈|延迟|波形|频率|报告|图纸)/i.test(text);
}
export function whyHasExecutableLever(text: string): boolean {
  return /(调整|修改|增加|降低|提高|控制|更换|追溯|校准|测量|评估|验证|限制|优化|补充|分区|退火|烘干|筛查|隔离|改善)/.test(text.trim());
}
export function canCloseWhy(whys: string[], verification: string): boolean {
  return whys.length >= 3 && whys.length <= 6 && whys.every(whyAnswerIsObservable) && !!verification.trim();
}
export function whyClosureIssues(whys: {text:string;lever:string}[], verification: string): string[] {
  const issues: string[] = [];
  if (whys.length < 3) issues.push('至少需要 3 层 Why；建议沿证据链继续追问。');
  whys.forEach((why, index) => {
    if (!why.text.trim()) issues.push(`WHY ${index+1} 还没有填写因果证据。`);
    else if (forbiddenWhy(why.text)) issues.push(`WHY ${index+1} 含有不可证伪表述，请改写为尺寸、测量值或可追溯记录。`);
    else if (!whyAnswerIsObservable(why.text)) issues.push(`WHY ${index+1} 缺少测量值/单位或记录编号；请把现象写成可核查的工程事实。`);
  });
  if (!whys.some(why => whyHasExecutableLever(why.lever))) issues.push('至少填写一个可执行杠杆，例如“调整机械限位 0.3 mm”或“将输出电压控制在 20.4 V”；测量结果请写在上方 Why 答案里。');
  if (!verification.trim()) issues.push('末端验证方式未填写，请补充样本、方法、工况和判定标准。');
  return issues;
}

const contradictionDefinitions: {id:string;title:string;principles:string[];hint:string;side:string;tags:RegExp}[] = [
  { id:'clamp', title:'提高锁模力消飞边 ↔ 残余应力与脱模困难上升', principles:['预先作用','预先反作用','柔性壳体/薄膜'], hint:'顺序阀浇口降低局部所需锁模力；困气区域用透气钢镶件局部排气。', side:'锁模力过高可能增加残余应力、顶出变形和脱模阻力；确认模具平行度与分型面状态。', tags:/锁模|飞边/ },
  { id:'wall', title:'壁厚减薄降缩水 ↔ 刚度/耐压不足', principles:['复合材料','多孔材料','改变维度'], hint:'用筋或拱替代增厚；局部加强而非全局加厚。', side:'需复核耐压、跌落刚度和螺钉柱/密封面的变形。', tags:/壁厚|缩水/ },
  { id:'radius', title:'尖角改 R 角降应力集中 ↔ 装配定位/密封面空间受限', principles:['曲面化','局部质量','预先反作用'], hint:'采用变半径过渡并在内侧减胶补偿，不做全局 R 角加大。', side:'复核装配干涉、定位基准与密封压缩量。', tags:/R角|圆角|尖角/ },
  { id:'cooling', title:'延长冷却降残余应力 ↔ 周期成本上升', principles:['预先冷却','热膨胀补偿','多阶段冷却'], hint:'模温分区控制；冷却前段快冷、后段缓冷。', side:'周期延长会降低产能，确认热平衡和尺寸稳定性。', tags:/冷却|残余应力/ },
  { id:'vent', title:'增加排气消困气 ↔ 模具复杂度与飞边风险上升', principles:['多孔材料','分离','预先排气'], hint:'使用透气钢镶件；采用分型面局部排气槽，而非全局增开。', side:'排气槽深度与维护频率需受控，避免局部飞边。', tags:/排气|困气/ },
];
export const contradictions = contradictionDefinitions.map(item => ({...item, visualSchema:visualForContradiction(item.title,item.principles)}));
export function visualForContradiction(title:string, principles:string[]=[]):VisualSchema {
  if (/R角|圆角|尖角/.test(title)) return {visualType:'triz_curvature',title:'曲面化：尖角过渡为变半径 R 角',params:{rAngle:.8},legend:['红色：修改前尖角应力集中','蓝灰：修改后变半径圆角，需检查密封/装配空间']};
  if (/壁厚|缩水/.test(title)) return {visualType:'before_after',title:'减薄厚肉并以筋/拱补刚度',params:{wallA:3.2,wallB:2.4,ribHeight:5,rAngle:.8},legend:['修改前：厚肉缩水风险','修改后：均匀壁厚与局部加强']};
  if (/间隙|咬合|异响/.test(title)) return {visualType:'triz_preaction',title:'预先作用：弹性预载补偿配合间隙',params:{preloadN:8},legend:['弹性预载补偿传动间隙','校核热膨胀后不咬死']};
  if (principles.some(item => /预先反作用|柔性/.test(item)) || /冲击/.test(title)) return {visualType:'triz_preaction',title:'预先反作用：加强筋与柔性缓冲',params:{preloadN:12},legend:['加强筋/缓冲区先承接冲击','验证载荷不转移到邻近薄弱处']};
  if (/排气|困气/.test(title)) return {visualType:'cross_section_stress',title:'局部排气与塑件截面位置',params:{wallThickness:2.5,ribHeight:5,rAngle:.6,stressPoint:'vent'},legend:['透气钢/局部排气布置位置','同时评估局部飞边风险']};
  return {visualType:'functional_transfer',title:'工程矛盾的输入—结构—响应关系',params:{input:'改善方向',response:'副作用'},legend:['沿路径确认功能输入与结构响应','对照矛盾两侧同步验证']};
}
export function matchingContradictions(direction: string, symptom = '') {
  if (!direction.trim() || isNoiseProblem(symptom)) return [];
  return contradictions.filter(item => item.tags.test(direction));
}
export function initialFactors(p: Phenomenon): Factor[] {
  const symptom = p.form;
  const moisture = shouldEscalateMoistureCheck(symptom, p.material);
  const esc = isDelayedCracking(p.phase, symptom);
  const rib = isStructuralRibCrack(p.location, symptom);
  const noise = /噪音|噪声|异响/.test(symptom);
  return [
    { id:'design', name:'结构设计', weight:rib ? 5 : noise ? 4 : 3, checked:rib||noise, source:rib ? '筋根裂纹：优先查 R 角、根部过渡及水锤输入' : noise ? '整机噪音：排查壳体/支架模态、间隙与振动传递路径' : '结构载荷、刚度与应力路径待核实' },
    { id:'material', name:'材料/零件', weight:moisture ? 5 : 3, checked:moisture, source:moisture ? 'PC/ABS + 银纹/气泡/脆断：首查含水率与烘干曲线' : '关键零件牌号、批次、配合与回料比例待核实' },
    { id:'mold', name:'模具/工装', weight:moisture ? 2 : 3, checked:false, source:moisture ? '材料水解类症状中排气不是首查项' : '模具排气、冷却、浇口、顶出或装配工装待核实' },
    { id:'process', name:'工艺/装配', weight:moisture ? 4 : noise ? 4 : 3, checked:moisture||noise, source:moisture ? '烘干曲线和成型窗口优先核实' : noise ? '核实装配顺序、紧固力矩、间隙及线束/管路接触' : '成型、装配、测试步骤与参数漂移待核实' },
    { id:'equipment', name:'设备/测试', weight:noise ? 5 : 2, checked:noise, source:noise ? '噪声测试：确认转速/负载、测距、背景噪声与传感器校准' : '设备重复精度、测试台架与传感器记录待核实' },
    { id:'environment', name:'环境/工况', weight:esc ? 5 : noise ? 3 : 2, checked:esc, source:esc ? '延迟开裂：拉应力与特定化学介质需联合排查' : noise ? '噪音需固定电压、转速、负载、流量和测试边界' : '温湿度、运行工况、测试边界与接触介质待核实' },
  ];
}

