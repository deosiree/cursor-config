# 词条翻译规则文档

## 术语库说明

### 优先级规则
- 优先使用"翻译简写说明"中的英文缩写
- 如果缩写中找不到，再使用"注意要点_中英"中的完整英文翻译

### 翻译简写说明（优先）

| 中文 | 英文缩写 |
|------|---------|
| 实时库 | TDB |
| 应用实时库 | TDB |
| 运行库 | RTDB |
| 数据库运行库 | RTDB |
| 维护库 | MTDB |
| 逻辑库 | MTDB |
| 关系数据库 | RDB |
| 时序数据库 | STDB |
| 历史库 | HDB |
| 系统运维 | Sysops |
| 运维管理 | O&M |
| 网络注册名 | RegName |
| 系统管理 | Sysmgr |
| 进程号 | Process IDPID |
| 责任区 | AOR |
| 命令行 | Cmd |
| 研发 | R&D |
| 开发 | Dev |
| 绝对值 | ABS |
| 平方根 | Sqrt |
| 立方根 | Cbrt |
| 平均值 | AVG |
| 时间差毫秒 | DeltaMs |
| 时间差秒 | DeltaS |
| 全与 | AND |
| 全或 | OR |
| 进程标识 | PID |
| 服务进程 | SP |
| 序号 | No. |
| 顺序号 | S/N |
| 列 | Col |
| 序列 | Seq |
| 背景色 | BG color |
| 导入/导出 | I/E |
| 拓扑 | Topo |
| 维护 | Maint. |
| 生成 | Gen |
| 注册 | Reg |
| 网络 | Net |
| 数据库 | DB |

### 注意要点_中英（备用）

| 中文 | 英文 | 备注 |
|------|------|------|
| 获取/检索 | v. retrieve<br>n. retrieval | v.不要用obtain、get、got、parsing、fetching<br>n.不要用acquisition<br>“retrieve” 主要侧重于从某个特定的存储位置把东西取回来，比如从数据库中检索数据、从衣帽间取回外套等，强调“找回、取回”的动作,在计算机领域中经常会用到;<br>xxx获取失败Failed to retrieve xxx<br>xxx获取错误Error in retrieving xxx<br>xxx获取不到xxx cannot be retrieved |
| 获得 | 根据语境判断使用obtain/get | “obtain” 强调通过一定的方式、途径去获取，在获取目录信息、本现场名、文件版本列表这类场景中，往往需要借助特定的操作、工具或遵循一定的流程来得到相应内容，使用 “obtain” 能体现出这种有目的、有方式的获取过程，更显正式和专业，适合在技术文档、专业报告等正式语境中使用。<br>"get"使用范围很广，强调“得到、获得”这一结果，不特别强调获得的方式或过程，既可以用于正式场合，也常用于日常随意交流中。 |
| 省略号 | ... | 中文最好统一为……,英文统一为... |
| , ret={} | ; ret={} | 逗号改为分号；也不要用with ret={}，统一用法:中文, ret，其中的逗号也不要缺<br>其实逗号也行，但是分号是最佳的，因为前后是有关联但是独立的信息单元，比如前面是提示错误，后面是提示操作或者返回值，分号的话可以增强信息的逻辑分隔和可读性，这个用逗号的话影响也不太大，只是说分号更好些 |
| xxx配置<br>(平台工具配置) | Platform Tool | 作为列名时可省略"配置",常见于数据库中的列头 |
| 前导 | predecessor | 统计前导、前导任务……不要用precursor、priors、leading。名词，形容词的场景下都可以使用 |
| 画面 | graph | 不要用screen、image(自动成图的图也是指画面) |
| 图模 | graph model | 画面模型 |
| 分图 | sub-graph | 不要用sub-screen,不要翻译成动词分画面split graph |
| 分画面 | sub-graph |  |
| 非画面 | non-graph |  |
| 图片 | picture | 不要用image |
| 屏幕(画面显示屏) | screen | 满屏、全屏、副屏、主屏等同理，不要用graph(fit graph、full graph)<br>主屏不要用Home screen<br>满屏fit screen<br>全屏full screen<br>主屏main screen<br>副屏Secondary screen<br>"满屏用fit是指内容把屏幕填满的大小，<br>和全屏full是指内容扩大到全部屏幕的大小区分开来" |
| 画面显示屏(屏) | Graph Display Screen | 是 |
| 场景 | scene | 不要用scenario |
| 图元 | icon | 不要用elements、graphic elements、entity、icnons、Metafile、graph icon、picture icons、Graphics、graphic、graphic icon |
| 画面图元 | icon |  |
| 非图元 | non-icon | 有时非图元xxx中的非不是指代的图元，注意词组语境，举例如下：<br>非图元默认态(是指不是'图元默认态'，而不是不是'图元'的'默认态')Not the icon default state<br>非图元默认态不能进行端点的插入!Unless it is the icon default state, endpoints cannot be inserted! |
| 图元态 | icon state |  |
| 图标 | icon | 其他部门也是图标和图元都通用icon的 |
| 元素 | element | 不要用icon |
| 子元素 | sub-elements | 不要用sub elements |
| 符号 | symbol |  |
| 字符 | character |  |
| 图形 | Graphic | 不要用graph，形容词用graphical<br>图形设计工具Graphic Designer(Tool缩写掉了)<br>图形监视工具Graphic Monitoring Tool<br>图形配置工具Graphic Config Tool<br>上述三个工具中的图形，说的是画面graph+图元icon等，等于说是图形意指一个统称 |
| 图标 | Chart |  |
| 视图 | view | 图元视图指针icon view pointer |
| 图例 | Legend |  |
| 环形图 | Ring chart | 图不要用graph、diagram |
| 柱状图 | Bar chart |  |
| 饼图 | Pie chart |  |
| 仪表盘 | Panel | 不使用Dashboard |
| 仪表 | Instrument | 不使用Gauge |
| 进度条 | Progress bar |  |
| 电池 | Battery |  |
| 报表 | report |  |
| 决策 | decision |  |
| 前景 | foreground |  |
| 界面 | interface |  |
| 接口 | interface |  |
| 会话 | session |  |
| 镜像 | Mirror | 不要用image |
| 目标<br>（目标文件夹/目标文件） | dest(the dest folder/file) | 不要用target，destination<br>des目标与source源更相对应，比tartget好 |
| 发生变化 | changes made，若有主语则xxx changed | 现在现在时更正式，但是changes made是changes have been made的省略句。<br>made更侧重于强调变化这个行为已经完成，有一种暗示有人对变化负责的感觉;<br>occurred可能更多强调变化自然发生，不一定是人为主动去做的 |
| [{}]-[{}] | [{}]-[{}]，更多的以此类推 | 不要翻译成[{}] - [{}]，举例：[{}]-[{}]-[{}]中填入scada run 0，应该翻译为scada-run-0更美观 |
| 游标 | cursor | 不要用vernier |
| 光字牌 | annunciator | 不要用light，light sign |
| 灯 | light | 如光字牌信号灯Annunciator signal light |
| 合成光字牌（合成光字） | Composite annunciator | 不要用Synthesized Light Signs，Synthesized Light Character<br>在电力行业里，它指的是将多个光字牌所代表的信息进行整合后呈现的装置，用于集中显示相关设备的状态或报警等信息。 |
| 光字合成(光字牌合成) | Annunciator composition | (n.强调光字牌的合成这个动作) |
| 光字合成结果 | Annunciator composition result | （同上） |
| 光字合成完成 | Annunciator composition completed | （同上） |
| 需要合成的光字牌 | Annunciators to be composed | (n.强调需要的这个动作)动词不定式的被动形式，表示 “将要被合成”，强调了这些光字牌有被合成的需求，突出了 “需要合成” 这个动作 |
| 没有需要合成的光字牌。 | No annunciators need to be composed. | 最直接对应，强调“没有需要被合成的光字牌”，因为是句子所以需要有动词need |
| 共%1个 | out of %1 xxxx | 就是要注意翻译不要发生以下情况：of%1 xxx、of %1xxx、of % 1 xxxx等 |
| 数值 | Number | 数值前景Number foreground |
| 字符 | Character | 字符前景Character foreground |
| 状态 | State | 内部抽象的状态都用state，也和图元态的态统一<br>外部可观察的如状态量，用status<br><br>状态前景State foreground |
| 域 | Field |  |
| 现场 | Site |  |
| 现场节点 | on-site node |  |
| 值班 | Duty |  |
| 审计 | Audit |  |
| 装库 | Load DB | 装库准备返回（装库准备的返回）Return of Load DB Preparation<br>装库准备开始(动作开始)Load DB Preparation starts<br>正在装库准备（正在进行装库准备）Executing Load DB Preparation...（强调动作的实时执行）<br>执行装库准备错误Error in executing Load DB Preparation<br>发送装库准备报文失败Failed to send Load DB Preparation message<br>{}.{}.{}应用装库准备完成！Load DB Preparation for Application {}.{}.{} completed!<br>装库验证返回（装库验证的返回）Return of Load DB Validation<br>添加装库连接失败！Failed to add Load DB Connection!<br>执行装库递交错误:{}{}Error in executing Load DB Submission: {}{}<br>发送装库执行报文成功 Send Load DB Execution message successfully<br>发送装库取消报文成功 Send Load DB Cancellation message successfully<br>系统装库(强调“为系统执行”)Load DB for the system<br>发生装库事件    Load DB Event Occurred<br>装库过程{}超时  Timeout in Load DB Process {}<br>更新{}的装库字段数据  Update the Load DB field data of {}<br>同步运行库【{}】装库数据失败！ Failed to synchronize Load DB data of RTDB [{}]!<br>非装库Non-Load DB<br>%1用户没有装库权限 %1 does not have Load DB Permission<br>装库失败n.   Load DB Failure<br>装库超时n.   Load DB Timeout |
| 标志 | ID |  |
| 检索器 | Retriever |  |
| 间隔<br>（电⼒⾏业物理区域或隔间） | Bay | 是 |
| 间隔<br>（时间间隔） | Interval | 是 |
| 周期(时间段) | Period | 是 |
| 周期(循环周期) | Cycle | 是 |
| 包含xx | Included xx | 是 |
| 属于xx/所属xx | Assigned xx | 是 |
| 关联 | Link | 关联是用association还是link？叶倩：link，之前是区分语境的<br>现在统一用link |
| 思源压缩包 | Sieyuan Compressed Package |  |
| 配置（如果单词短，不省略时） | Config | 不要用settings、configuration、setup，每个首字母都大写 |
| 设置 | settings | 每个首字母都大写，配置设置Config Settings |
| xx配置成功 | Successful xxx config | 名词短语，形容词+名词。例如配置语言成功Successful language config |
| xx配置成功。 | xxx Config succeeded | 句子，主谓结构。例如配置语言成功Language Config succeeded |
| ,返回值是{} | ; return value: {} | 不要用, return value is {}、, with a return value of {}等<br>其实逗号也行，但是分号是最佳的，因为前后是有关联但是独立的信息单元，比如前面是提示错误，后面是提示操作或者返回值，分号的话可以增强信息的逻辑分隔和可读性，这个用逗号的话影响也不太大，只是说分号更好些 |
| 线/线条 | Line | 是 |
| 直线 | Straight Line | Straight line、line |
| 折线 | Broken Line | Polyline、Broken line |
| 弧线/圆弧 | Arc | 是 |
| 曲线 | Curve |  |
| 网格线 | Grid Line | grid lines、gridlines |
| 网格框 | Grid box |  |
| xx框线 | xxx Border Line | xxx Border line、xxx border |
| 边框 | Border | 不要用frame<br>外框Outer border |
| 框架 | Framework |  |
| 框体 | box | 不要用frame<br>因为文本框the text box<br>启用后，文本会自动变形充满整个框体，对齐方式和字体大小将自动计算After being enabled, the text will automatically adjust to fill the entire frame; alignment and font size will be automatically calculated |
| 删除线 | Strikeout Line |  |
| 下划线 | Base Line | Underline、underscores |
| (效果)实线 | Solid Line | 是 |
| (效果)虚线 | Dashed Line | 是 |
| (效果)点线 | Dotted Line | 不要拼错成doted line |
| (效果)点划线 | Dot-dash Line | 点划线填充，填充不要忘记翻译 |
| (效果)点点划线 | Two-dot-dash Line | 中文名改成“双点划线”更合适 |
| (效果)点点点划线 | Three-dot-dash Line | 中文名改成“三点划线”更合适 |
| 连接线/联接线 | Connect Line | 连接线Connection line、Connect line，联接线Join line，而且两者是一种东西，中文要改成统一的 |
| 连接点 | Connect Point | 不要用Connection Point |
| 连接/链接 | connect to | 不用link to |
| 出线 | Outgoing Feeder | “feeder” 在电力行业里有“馈线”的意思，“outgoing feeder” 强调了这条线路是用于向外部馈送电能的出线。它更侧重于体现线路的供电功能，通常用于描述从变电站、开关站等向用户或下一级电网输送电能的线路。 |
| 进出线 | Incoming-and-outgoing Feeder​s | 同上 |
| 线宽 | line width |  |
| 矩形 | Rectangle |  |
| 圆形 | circle |  |
| 实心圆 | Solid circle |  |
| 空心圆 | Hollow circle |  |
| 圆角 | Rounded corner | 在技术设计、UI/UX、工业设计等领域中，“圆角”的标准译法是 "Rounded corner"，而非 "Circular corner"<br>头部圆角角度angle of header rounded corner<br>边框圆角角度angle of border rounded corner |
| 椭圆 | Ellipse<br>elliptic adj. | 是 |
| 多边形 | polygon |  |
| 对直线、弧线、折线等非闭合图形进行样式配置 | Style config of non-closed graphics such as straight lines, arcs, broken lines, etc | 不要翻译成rectangles, circles, polygons and other closed graphics<br>对矩形、圆形、多边形等闭合图形进行样式配置Style config of non-closed graphics such as rectangles, circles, polygons, etc |
| (坐标)轴 | (Coordinate) axis | 单数Coordinate axis；复数Coordinate axes；<br>不要单用Coordinate只是坐标的意思，<br>可以单用Axis，axis是轴的意思，坐标轴也是轴 |
| X(坐标)轴 | X-axis | 不要写成x轴，x要大写X；错误写法x-axis、x Axis、X-Axis、X axis等<br>举例：X轴网格线==X坐标轴网格线==X-axis |
| Y(坐标)轴 | Y-axis | 不要写成y轴，y要大写Y;错误写法同上 |
| XY(坐标)轴 | X-axis and Y-axis | 不要用XY axis<br>1.“XY axis” 也不是标准表达。它没有清晰地将X轴和Y轴区分开来，容易引起混淆，让人不清楚你说的到底是包含X和Y的一个综合概念的轴，还是同时提及了X轴和Y轴。<br>2.没加- |
| (轴)坐标 | (Axis) coordinate | 同理(坐标)轴 |
| X(轴)坐标 | X-coordinate | 是 |
| Y(轴)坐标 | Y-coordinate | 是 |
| 坐标轴颜色 | Axis color | 不要用Coordinate axis color |
| 坐标轴线宽 | Axis line width | 不要用Coordinate axis width |
| 坐标轴自适应 | Axis auto |  |
| X坐标轴显示 | X-axis display |  |
| 刻度 | tick | 当“主刻度”指 ​​坐标轴、仪表盘、标尺上较粗/较长的主要刻度线（通常带有数字标签）​​ 时，​​"major tick"​​ 是行业标准术语，尤其在数据可视化（如Matplotlib、Excel图表）、工程制图、仪器设计中广泛使用。<br>"tick"​​ 特指刻度线（小刻度线叫 ​​"minor tick"​​，主刻度线叫 ​​"major tick"​​）。<br>​​tick​​<br>主要功能是提供精确的位置参考，帮助用户准确地定位和读取数据。通过刻度线，人们可以快速找到数据在图表或量表上对应的大致位置，并且结合刻度标签可以获取具体的数值信息。<br>例如，在地图上，经纬度的刻度线（tick）可以帮助我们确定某个地点的精确位置。<br>​​scale​​<br>决定了数据的表示范围和比例关系，使得数据能够在有限的图表或量表空间内进行合理的展示和比较。它让我们能够理解数据之间的相对大小和变化趋势。<br>例如，在一个股票价格走势图表中，刻度系统（scale）规定了价格轴上每一格代表的价格幅度，通过这个刻度系统，我们可以直观地看到股票价格的涨跌幅度和变化趋势。 |
| 主刻度 | major tick | 不要用main scale、major scale、main tick<br>​​"major"​​ 明确区分于次要刻度（minor）。<br>​​"main"​​ 虽然能理解为“主要的”，但在技术术语中不如 ​​"major"​​ 精准（"major/minor" 是国际通用的刻度分级标准）。 |
| （区域/画面）放大/缩小/界面缩放<br>(图片缩放；强调通过交互操作来改变试图大小的行为；图形编辑) | zoom in/zoom out | 在浏览态的放大缩小等可以用zoom；不要用enlarge<br>“enlarge” 是一个更通用的词汇，意为“扩大、放大”，“area enlarge” 更侧重于描述将某个区域在尺寸、规模上进行扩大，强调结果，相对而言交互性和动态感的体现不如 “zoom in” 强烈，更常用于正式的书面语或较为宽泛的语境中。 |
| 缩放<br>(比例缩放；视觉+数学上的比例计算和调整；工程制图的缩放) | scale | 缩放高度、缩放宽度等应该使用scale;不要使用zoom、enlarge |
| 自动缩放 | Auto-scaling​​ | 不要用Auto scale |
| 同高缩放 | Uniform width scaling | 不要用Same height Scale<br>​​"Uniform"​​（统一的）对应 ​​"同等"​​（不是各自按比例，而是强制一致）<br>强调宽度动态调整，高度固定 |
| 同宽缩放​ | Uniform height scaling | 不要用Same width scale<br>强调高度动态调整，宽度固定 |
| 同等缩放 | Uniform width-and-height scaling | 统一宽高缩放：A参照B去同等缩放后，A和B的宽和高保持一致，不是跟自身等比例，而是跟B的宽高一样 |
| 统一 | n. uniform<br>v. unify | 过去式unified；名词uniform<br>统一行高n. Uniform row height / v. Unify row height<br>统一列宽n. Uniform column width / v. Unify column width<br>统一接口n. uniform interface<br>应用统一高度n. Apply uniform height |
| 磁盘空间 | disk space |  |
| 历史库 | HDB | 现有historical database、historical DB,Historical不统一<br>简写可以加一个历史库HDB:全称History Database，和简写里的结构是一样的 |
| n.校检 | verification | 不要用Validation<br>待导入资源校验Verification of resources to be imported<br>待导出资源校验Verification of resources to be exported<br>待导入画面校验Verification of graphs to be imported<br>待导出画面校验Verification of graphs to be exported<br>待导入决策校验Verification of decisions to be imported<br>待导出决策校验Verification of decisions to be exported<br>待导入图元校验Verification of icons to be imported<br>待导出图元校验Verification of icons to be exported |
| v.校验 | ​verify​​ | 过去式（Verified）​、进行时（Verifying）；不要用check |
| 检查 | check | 不要用inspection |
| 勾选(复选框☑️) | check | 是 |
| 勾选(单选框🔘/下拉框) | select | 最好中文改成选择，与复选框的勾选区分开来 |
| 选择/自选/选 | select | 已选selected,未选unselected |
| 时序(时序库) | Time-series | 是 |
| 实时(表/曲线) | real-time | 特殊情况：实时库Timing DatabaseTDB；运行库Run-Time DatabaseRTDB |
| 属性 | Attributes、attributes（缩写Attr） | 不要用Properties、Property |
| 历史记录 | history | history record中的record可以省略 |
| • 查询失败：%1 个路径 | • Query failed: %1 paths | 最前面的• 不要丢；冒号后空格 |
| 替换 | replace v.<br>replacement n. | 不要用substitution |
| 替换后路径 | post-replacement path | “被替换的路径”（原路径）：译为 original path（原路径）或 replaced path（被替换的路径，需结合上下文）。<br>“替换后路径”（新路径）：译为 new path（最简洁）或 path after replacement（更明确），避免直接用 replaced path（易歧义）。 |
| n.超出xx限制 | exceeding the... limit | “超出...限制”=“exceeding the... limit”：现在分词短语作后置定语，精准修饰“总个数”或“被计数对象”，符合英语语法习惯。<br>若追求极致简洁（如界面提示、日志输出）："Total number exceeding the graph limit:%1"<br>若需明确计数主体（如技术报告、详细统计）："Total number of items exceeding the graph limit:%1"<br>超出画面限制总个数Total number exceeding the graph limit<br>超出图元限制总个数Total number exceeding the icon limit |
| 修改xxx，需要停止xxx | To modify xxx, stop xxx | 不要翻译成it is necessary to stop xxx、xxx need to be stopped<br>修改“实时库名称”，需要停止所有使用该实时库名称的应用To modify 'TDB name', stop all applications using that TDB name<br>修改“进程路径”，需要停止所有节点的该应用To modify 'Process path', stop the application on all nodes<br>修改“进程名称”，需要停止所有节点的该应用To modify 'Process name', stop the application on all nodes<br>修改“基础应用名称”，需要停止所有节点的该应用To modify 'Basic App name', stop the application on all nodes<br>修改“是否维护库”，需要停止维护应用To modify 'MTDB', stop maintenance App<br>修改“是否维护进程”，需要停止所有节点的该维护应用及运行应用To modify 'Maintain process', stop the maintenance App and running App on all nodes<br>修改维护节点，需要停止维护节点应用To modify the maintain node, stop the application on all maintenance nodes<br>修改值班优先级，需要停止节点应用To modify the duty priority, stop the application on all nodes |
| 时曲线 | Hourly curve | “hourly”是形容词，意为“每小时的；按小时计算的”，直接强调数据按小时聚合或采样的特性（如每小时一个数据点），更精准传递“小时级”的时间粒度。<br>“hour curve”（名词“hour”作定语）虽也能理解为“小时的曲线”，但语义更偏向“与小时相关的曲线”，未明确突出“按小时划分”的统计特性。 |
| 本时曲线/今时曲线 | This hour curve | 老外喜欢this，不喜欢current |
| 历史时曲线/某时曲线 | Historical hour curve | 是 |
| 日曲线 | Daily curve |  |
| 今日曲线 | Today curve |  |
| 昨日曲线 | Yesterday curve |  |
| 历史日曲线 | Historical daily curve |  |
| 周曲线 | Weekly curve |  |
| 本周曲线 | This week curve |  |
| 历史周曲线/某周曲线 | Historical week curve | 是 |
| 月曲线 | Monthly curve |  |
| 本月曲线/当月曲线 | This month curve | 是 |
| 历史月曲线/某月曲线 | Historical month curve | 是 |
| 年曲线 | Yearly curve |  |
| 比较曲线 n. | comparison curve | 不要用Compare curves |
| 是否确认删除 | Confirm to delete | 不要用Are you sure you want to confirm the deletion |
| 左上 | top left |  |
| 右上 | top right |  |
| 左下 | bottom left |  |
| 右下 | bottom right |  |
| 共%1项 | Total: %1 |  |
| %2项成功 | %2 succeeded |  |
| %3项失败 | %3 failed |  |
| %4项未导出 | %4 not exported |  |
| %3项跳过 | %3 skipped |  |
| 不允许修改 | and modification is not allowed |  |
| 禁止修改 | and modification is prohibited |  |
| 原文件(源文件，图形-导入导出工具) | original file | 中文：使用原，不要使用源，以避免和源文件source file、资源文件source file混淆<br>不要用The original file of the icon来表示图元原文件<br>原文件the original file<br>图元原文件the original icon file<br>画面原文件the original graph file |
| 原文件(源文件夹，图形-导入导出工具) | original folder | 是 |
| 源文件 | source file | 源文件：指开发者直接编写、包含可执行代码或核心逻辑的文件，通常需要编译或解释后才能运行。 |
| 源文件夹 | source folder |  |
| 资源文件 | resource file |  |
| 目标文件 | target file |  |
| 重名/重复 | duplicate | v. adj. n.<br>不要用repeat<br>重名画面文件duplicate graph file<br>xxx不允许重名xxx cannot be duplicated<br>xxx重名xxx is duplicated |
| 复制 | copy | 不要用duplicate |
| 待导出xx | xxx to be exported failed | 不要用pending export<br>待导出图元icon to be exported |
| 待导入xx | to be imported | 是 |
| 导出完成 | export completed |  |
| 导入完成 | import completed |  |
| 导出终止 | export terminated |  |
| 该图元导出终止 | export of this icon terminated |  |
| 周期 | cycle | 不要用period |
| 测点 | Measuring point | 不要用the measurement point、Station |
| 许可 | license |  |
| 二维表 | 2D table |  |
| 撤销 | undo | 不要用Revocation |
| 恢复 | recovery<br>redo(图形设计，这个模块) | 没有用 redo重做<br>不要用restore<br>v. recover 过去式recovered |
| 不可撤销 | Cannot be undone |  |
| 不可恢复 | cannot be recovered |  |
| 不可访问 | Cannot be accessed | 暂不可访问Cannot be accessed temporarily |
| (不可编辑) | (not editable) | 是 |
| 还原 | restore | 不要用revert、reset、<br>n. restoration<br>系统还原System Restore |
| 归零 | Reset to zero | 不要用return to zero<br>归零Reset to zero<br>不归零(操作)Skip reset to zero<br>全部归零结果All results after resetting to zero<br>版本归零Version Reset to Zero<br>版本归零成功Version Reset to Zero Succeeded |
| 连接关系 | relationship | 不用翻译成connection relationship |
| 替换路径 | Replacement |  |
| 重统计 | Re-statistics | 不要用Re statistics |
| 重新导入 | re-imported | 不要用re imported |
| 重新输入 | re-enter |  |
| 重新选择 | Re-select |  |
| 重新加载 | Reload |  |
| 正在准备 | Preparing n.<br>Preparing to v. | 是 |
| 前缀 | prefix | 不要用preface |
| 导入过滤 | import filter |  |
| 导出过滤 | export filter |  |
| 清除历史版本 | clear historical versions | 不要用Clear history versions |
| 历史数据 | Historical Data | 不要写history data |
| 无版本托管配置文件 | Config file without version control | Configuration file缩写一下 |
| 无版本托管运行文件 | Running file without version control |  |
| 无版本托管：可不填 | Without version control: Optional |  |
| 隐式adj. | Implicit | 不要用副词implicitly:“Implicit”是形容词，修饰名词；“Implicitly”是副词，修饰动词、形容词或其他副词。在术语翻译中，尤其是名词短语，通常需要形容词来修饰名词，而不是副词。<br>“隐式”：技术场景中统一用 "Implicit"，强调“系统自动处理”的特性（区别于“显式”Explicit） |
| 显式adj. | Explicit | 是 |
| 新建 | new | 新建根目录New root directory |
| 新增 | add |  |
| 创建 | create |  |
| 光敏点 | Photosensitive point | 不要用Light sensitive，或者用G文件规范中的热点poke来表示光敏点？ |
| 说明 | Description | 不要用Instructions |
| 内部 | adj. internal<br>n. interior<br>adv.  internally | adj.不要用inner；n.不要用inside、internal |
| adj.剩余 | remaining | 是 |
| 保留天数 | retention days | 不要用petention period |
| G文件 | G-file | 不要用G file、file G<br>清除历史G文件Clear historical G-files<br>G文件上传文件服务失败G-file upload file service failed<br>G文件上传文件服务失败的节点Node where the G-file upload file service failed<br>导出指定G文件Export the specified G-file |
| 向上/下取整 | rounded up/down | 上下对应，不要用下downwards<br>浮点数x向下取整Floating point number x rounded down |
| 双击 | Double-click |  |
| 部分超出 | partially beyond | 不要用some elements beyond、Part of the position exceeds<br>删除部分超出画布外元素Delete elements completely beyond the canvas<br>(缩写,21字符)Del Partially Beyond |
| 全部超出 | completely beyond | 删除完全超出画布外元素Delete elements completely beyond the canvas<br>(缩写,21字符)Del Completely Beyond |
| 超出 | 根据语境判断使用<br>exceed<br>beyond<br>out of | 强调动态突破限制（如系统报错、规则违反）→ exceed 动词（独立作谓语）<br>例：“请求次数超出每日限制”→ Requests exceed the daily limit.<br>强调静态范围之外（如能力、理解、空间）→ beyond  介词/副词（需搭配对象）<br>例：“这个问题超出我的职责范围”→ This issue is beyond my responsibility.<br>强调脱离原有状态/范围（如控制、范围、版本）→ out of  介词短语（强调状态）<br>例：“设备信号超出覆盖范围”→ The device signal is out of coverage. |
| 删除失败 | Deletion failed | 不要用delete failed、fail to delete |
| 默认xxx | Set... as default“设置默认对象”<br>By default“默认行为”<br>Default xxx“默认的n.” | 默认本节点(以本节点为默认)："Take this node as the default."<br>默认展开表(默认会展开表格)："By default, the table expands."<br>默认展开表(列名：默认展开的表)Default-expanded table |
| 关闭 | turn off关闭设备、电源或功能<br>close关闭物理上的开口、窗口、文件或应用程序<br>disable禁用某个功能、权限或设备，使其无法使用 | 关闭设备/电源/功能（状态切换）→ turn off<br>例：“关机”→ Turn off the computer.；“关闭蓝牙”→ Turn off Bluetooth.<br>闭合开口/窗口/文件（结束开放）→ close<br>例：“关窗户”→ Close the window.；“关闭文件”→ Close the document.<br>禁用功能/权限/设备（设置失效）→ disable<br>例：“禁用通知”→ Disable notifications.；“禁用账户”→ Disable the account.<br>是否关闭词条定位功能Whether to disable the entry locating function |
| 执行/进行(正在xxx...) | execute | 不要用perform<br>“execute”常用于描述数据库、系统或程序的可操作指令 |
| 发布 | publish | 不要用release<br>批量发布Batch publish<br>批量发布执行Batch publishing execution |
| 文件 | file | 不要用document |
| 解析 | parse | 不要用analyze |
| 进程 | Process | 不要用Progress |
| 冻结 | freeze、Frozen | 是 |
| 解冻 | Unfreeze、unfrozen | 不要用thaw<br>解冻成功Unfrozen successfully（被动状态，适配日志记录）<br>解冻中：Unfreezing |
| 上线/在线 | Online | 是 |
| 离线/掉线 | offline | 不要用disconnected |
| 值班 | duty |  |
| 告警 | alarm | 不要用warning |
| 预警 | warning |  |
| 警告/预警 | warning | 不要用Forewarning |
| 全选/反选/取消选择 | Select All/Invert/Cancel | 是 |
| 搜索 | search |  |
| 查询 | Query |  |
| 规范 | standard | 不要用specification |
| 显示 | display |  |
| 反显 | auto-aync display | 反显：数据库路径名称改变时，编辑态画面中的对应路径也会发生变化<br>不反显Not auto-sync display |
| 向导 | wizard | 报表:%1，向导创建成功(报表是通过via向导创建的)Report: %1 created via wizard successfully |
| 子分类 | subcategory |  |
| 子系统 | subsystem |  |
| 异常 | 纯技术错误​ → Exception​<br>数据/行为异常​ → Abnormality​ 或 Abnormal​<br>安全风险​ → Suspicious​<br>意外中断​ → Unexpectedly<br>数据异常invalid | 分语境 |
| 提示 | tips | 不要用prompt |
| xx中......请等待 | ing... Please wait | 下载中......请等待Downloading... Please wait<br>加载中......请等待Loading... Please wait<br>发布中......请等待Publishing... Please wait<br>停止中......请等待Stopping... Please wait |
| 主备 | Primary-StandBy | 国家电网、IEC（国际电工委员会）标准中，“主备冗余系统”均表述为 Primary-StandBy Redundant System；<br>“主备切换”通常译为 Primary-StandBy Switching（而非Master或Backup）；<br>当描述“主用与备用设备状态/动作冲突”时，Primary-StandBy Conflict​ 是更自然的技术表达。 |
| 唯一标识 | onlyNo | 不要用unique identifier、Unique ID |
| 一次设备 | PE（Primary Equipment） | 结论​<br>缩写PE/SE：国家电网标准未强制规定，但行业非正式场景可偶用（PE=Primary Equipment，SE=Secondary Equipment）。<br>Equipment vs Device：<br>一次设备、大型二次系统优先用 Equipment；<br>小型、单一功能的二次组件可用 Device；<br>实际翻译中需结合设备特性与上下文，无需绝对区分。<br>建议：在正式文档（如标准、合同）中，优先使用完整表述（Primary/Secondary Equipment）；非正式场景（如界面、笔记）可使用缩写（PE/SE）或Device，但需确保上下文清晰无歧义。 |
| 二次设备 | SE（Secondary Equipment） | 是 |
| 设备 | 设备（一次设备、大型二次系统）Equipment<br>设备（二次组件）Device<br>没本事分，暂时先不管了 | 是 |
| 模板 | template | 数据库模板DB template |
| 型号 | model | 数据库型号DB model |
| 类型 | type | 数据库类型DB type |
| AB网 | net A/B | net A and net B的缩写，不要写A net and B net<br>AB网均未连上Neither of Net A/B is connected<br>不再用Neither A nor B Network Is Connected |
| 自适应 | auto | 不用adaptation<br>自适应的简洁表达（取“自动调整”含义，如“自适应布局”→ Auto Layout） |
| 接地 | Grounding | Grounding（最通用，电力行业标准术语） |
| 停电 | Power Outage | Power Outage（通用，指“供电中断”的状态） |
| 前向 | Forward​ | 时间轴递增方向（往后算，即向未来/后续时刻计算）<br>不要用Prorad |
| 后向 | Backward​ | 时间轴递减方向（往前算，即向过去/先前时刻计算）<br>不要用Rearward |
| 闪烁 | flashing | 不要用flicker,blink,Glitter，flicked<br>ficker：强调不稳定的、忽明忽暗的闪烁，常用于火焰、灯光或情感的短暂流露(如"a flicker of hope")。<br>flashing:：指快速、连续的闪光，通常带有突然或强烈的视觉效果（如警报灯、闪电)。 |
| 模拟量 | Analog | 不要用Simulation Quantity，Simulation Value，Analog Value，Analog Quantity |
| 状态量 | Status | 不要用State Quantity，State Value |
| 符号决策 | Symbol | 不要用Symbolic |
| （个）/（件）/（文件个数） | (pcs) | 不要用(pieces)，(number)<br>在表示“单位为个”时，优先用 pieces（或其缩写 pcs），而非 number。二者的核心区别在于：number是“数量”的抽象概念，pieces是“个/件”的具体单位词，需结合“单位”的功能（量化个体物品）选择。 |
| 普通 | General | 不要用regular、common、normal、oridinary<br>统一翻译：General（首选，适用于90%以上的“普通”场景）；<br>补充场景：若需强调“常见”用Common（如“常见问题”），强调“正常”用Normal（如“正常状态”），强调“平常”用Ordinary（如“普通用户”）。<br>示例（统一用General）：<br>普通设置→General Settings；<br>普通流程→General Process；<br>普通节点→General Node；<br>普通模式→General Mode。<br>此方案简洁、一致、符合技术文档习惯，是“普通”统一翻译的最佳选择。 |
| 分栏 | col-split | Layout和column都不能明确表达分栏是布局分栏，layout column又太长了，缩写column split来表达分栏<br>我们二维表有一个分栏功能，功能类似word的分栏显示，如果为2，屏幕中就会显示两栏数据，每一栏数据都是原二维表的大小，请问，这里的分栏怎么翻译比较好？我看原来有layout和column两种翻译，我觉得好像都不太准确，不知道word这部分功能是怎么翻译的<br>分栏的栏（显示布局）：<br>加布局相关修饰词（如Layout、Display、Multi-），例如：<br>Layout Columns（布局分栏，明确是布局层面的栏）；<br>Display Columns（显示分栏，强调显示效果的栏）；<br>Multi-column（多栏，如“多栏显示”→Multi-column Display）；<br>Column Split（分栏分割，强调“分割”动作，如“分栏功能”→Column Split Function）。<br>表格的列（结构单元）：<br>加表格相关修饰词（如Table），例如：<br>Table Column（表格列，单数）；<br>Table Columns（表格列，复数）；<br>Table Column Width（表格列宽）。 |
| 方案/计划 | plan | 统一用plan，不要用scheme、option<br>优先用 Plan：若方案侧重“可执行的具体步骤”（最常见场景）；<br>次选用 Scheme：若方案侧重“系统性/策略性设计”（技术复杂度高时）；<br>仅在对比时用 Option：明确指代“多个候选中的一个”（不可替代）。 |
| 分区 | 用Zone：当“分区”指地理/功能区域（有明确边界的运行、供电、调度范围）；<br>用Partition：当“分区”指逻辑/物理分割（模型、时间、数据、参数的拆分）； | 示例（电力场景）：<br>“模型分区与运行分区协同方法”→Coordination Method for Model Partition and Operation Zone；<br>“按年分区的负荷数据统计”→Load Data Statistics with Yearly Partition；<br>“分区类型对调度效率的影响”→Impact of Partition Type on Dispatch Efficiency（通用场景）。<br>此翻译符合电力行业习惯（如IEC标准中“时间分区”用Time Partition、“分区调度”用Zonal Dispatch），语义精准且覆盖所有场景。 |
| 时间片/时间分片 | time slice | 分片slice，不要用sharding，shards,segmentation<br>不分片without slice |
| 启动n. | startup | 是 |
| 启动v. | start | 注意词性<br>启动拓扑start topo |
| 停止v.（与启动相对应） | stop | 不要用close<br>关闭拓朴==停止拓扑stop topo |
| 标签文本 | label | 中文翻译冗余，实际上就是标签，如下：<br>数据配置的条件表名与标签文本取值域的表不一致<br>The condition table name for data config does not match the table in the value range of the label |
| 静态表格 | Static table | 不要用State table |
| 动态表格 | Dynamic table |  |

### 伪代码术语详细说明

- **获取/检索**: v. retrieve
n. retrieval - v.不要用obtain、get、got、parsing、fetching<br>n.不要用acquisition<br>“retrieve” 主要侧重于从某个特定的存储位置把东西取回来，比如从数据库中检索数据、从衣帽间取回外套等，强调“找回、取回”的动作,在计算机领域中经常会用到;<br>xxx获取失败Failed to retrieve xxx<br>xxx获取错误Error in retrieving xxx<br>xxx获取不到xxx cannot be retrieved
- **获得**: 根据语境判断使用obtain/get - “obtain” 强调通过一定的方式、途径去获取，在获取目录信息、本现场名、文件版本列表这类场景中，往往需要借助特定的操作、工具或遵循一定的流程来得到相应内容，使用 “obtain” 能体现出这种有目的、有方式的获取过程，更显正式和专业，适合在技术文档、专业报告等正式语境中使用。<br>"get"使用范围很广，强调“得到、获得”这一结果，不特别强调获得的方式或过程，既可以用于正式场合，也常用于日常随意交流中。
- **省略号**: ... - 中文最好统一为……,英文统一为...
- **, ret={}**: ; ret={} - 逗号改为分号；也不要用with ret={}，统一用法:中文, ret，其中的逗号也不要缺<br>其实逗号也行，但是分号是最佳的，因为前后是有关联但是独立的信息单元，比如前面是提示错误，后面是提示操作或者返回值，分号的话可以增强信息的逻辑分隔和可读性，这个用逗号的话影响也不太大，只是说分号更好些
- **xxx配置
(平台工具配置)**: Platform Tool - 作为列名时可省略"配置",常见于数据库中的列头
- **屏幕(画面显示屏)**: screen - 满屏、全屏、副屏、主屏等同理，不要用graph(fit graph、full graph)<br>主屏不要用Home screen<br>满屏fit screen<br>全屏full screen<br>主屏main screen<br>副屏Secondary screen<br>"满屏用fit是指内容把屏幕填满的大小，<br>和全屏full是指内容扩大到全部屏幕的大小区分开来"
- **画面显示屏(屏)**: Graph Display Screen - 是
- **目标
（目标文件夹/目标文件）**: dest(the dest folder/file) - 不要用target，destination<br>des目标与source源更相对应，比tartget好
- **发生变化**: changes made，若有主语则xxx changed - 现在现在时更正式，但是changes made是changes have been made的省略句。<br>made更侧重于强调变化这个行为已经完成，有一种暗示有人对变化负责的感觉;<br>occurred可能更多强调变化自然发生，不一定是人为主动去做的
- **[{}]-[{}]**: [{}]-[{}]，更多的以此类推 - 不要翻译成[{}] - [{}]，举例：[{}]-[{}]-[{}]中填入scada run 0，应该翻译为scada-run-0更美观
- **合成光字牌（合成光字）**: Composite annunciator - 不要用Synthesized Light Signs，Synthesized Light Character<br>在电力行业里，它指的是将多个光字牌所代表的信息进行整合后呈现的装置，用于集中显示相关设备的状态或报警等信息。
- **光字合成(光字牌合成)**: Annunciator composition - (n.强调光字牌的合成这个动作)
- **共%1个**: out of %1 xxxx - 就是要注意翻译不要发生以下情况：of%1 xxx、of %1xxx、of % 1 xxxx等
- **间隔
（电⼒⾏业物理区域或隔间）**: Bay - 是
- **间隔
（时间间隔）**: Interval - 是
- **周期(时间段)**: Period - 是
- **周期(循环周期)**: Cycle - 是
- **包含xx**: Included xx - 是
- **属于xx/所属xx**: Assigned xx - 是
- **配置（如果单词短，不省略时）**: Config - 不要用settings、configuration、setup，每个首字母都大写
- **xx配置成功**: Successful xxx config - 名词短语，形容词+名词。例如配置语言成功Successful language config
- **xx配置成功。**: xxx Config succeeded - 句子，主谓结构。例如配置语言成功Language Config succeeded
- **,返回值是{}**: ; return value: {} - 不要用, return value is {}、, with a return value of {}等<br>其实逗号也行，但是分号是最佳的，因为前后是有关联但是独立的信息单元，比如前面是提示错误，后面是提示操作或者返回值，分号的话可以增强信息的逻辑分隔和可读性，这个用逗号的话影响也不太大，只是说分号更好些
- **线/线条**: Line - 是
- **弧线/圆弧**: Arc - 是
- **xx框线**: xxx Border Line - xxx Border line、xxx border
- **(效果)实线**: Solid Line - 是
- **(效果)虚线**: Dashed Line - 是
- **(效果)点线**: Dotted Line - 不要拼错成doted line
- **(效果)点划线**: Dot-dash Line - 点划线填充，填充不要忘记翻译
- **(效果)点点划线**: Two-dot-dash Line - 中文名改成“双点划线”更合适
- **(效果)点点点划线**: Three-dot-dash Line - 中文名改成“三点划线”更合适
- **连接线/联接线**: Connect Line - 连接线Connection line、Connect line，联接线Join line，而且两者是一种东西，中文要改成统一的
- **连接/链接**: connect to - 不用link to
- **椭圆**: Ellipse
elliptic adj. - 是
- **(坐标)轴**: (Coordinate) axis - 单数Coordinate axis；复数Coordinate axes；<br>不要单用Coordinate只是坐标的意思，<br>可以单用Axis，axis是轴的意思，坐标轴也是轴
- **X(坐标)轴**: X-axis - 不要写成x轴，x要大写X；错误写法x-axis、x Axis、X-Axis、X axis等<br>举例：X轴网格线==X坐标轴网格线==X-axis
- **Y(坐标)轴**: Y-axis - 不要写成y轴，y要大写Y;错误写法同上
- **XY(坐标)轴**: X-axis and Y-axis - 不要用XY axis<br>1.“XY axis” 也不是标准表达。它没有清晰地将X轴和Y轴区分开来，容易引起混淆，让人不清楚你说的到底是包含X和Y的一个综合概念的轴，还是同时提及了X轴和Y轴。<br>2.没加-
- **(轴)坐标**: (Axis) coordinate - 同理(坐标)轴
- **X(轴)坐标**: X-coordinate - 是
- **Y(轴)坐标**: Y-coordinate - 是
- **（区域/画面）放大/缩小/界面缩放
(图片缩放；强调通过交互操作来改变试图大小的行为；图形编辑)**: zoom in/zoom out - 在浏览态的放大缩小等可以用zoom；不要用enlarge<br>“enlarge” 是一个更通用的词汇，意为“扩大、放大”，“area enlarge” 更侧重于描述将某个区域在尺寸、规模上进行扩大，强调结果，相对而言交互性和动态感的体现不如 “zoom in” 强烈，更常用于正式的书面语或较为宽泛的语境中。
- **缩放
(比例缩放；视觉+数学上的比例计算和调整；工程制图的缩放)**: scale - 缩放高度、缩放宽度等应该使用scale;不要使用zoom、enlarge
- **统一**: n. uniform
v. unify - 过去式unified；名词uniform<br>统一行高n. Uniform row height / v. Unify row height<br>统一列宽n. Uniform column width / v. Unify column width<br>统一接口n. uniform interface<br>应用统一高度n. Apply uniform height
- **n.校检**: verification - 不要用Validation<br>待导入资源校验Verification of resources to be imported<br>待导出资源校验Verification of resources to be exported<br>待导入画面校验Verification of graphs to be imported<br>待导出画面校验Verification of graphs to be exported<br>待导入决策校验Verification of decisions to be imported<br>待导出决策校验Verification of decisions to be exported<br>待导入图元校验Verification of icons to be imported<br>待导出图元校验Verification of icons to be exported
- **v.校验**: ​verify​​ - 过去式（Verified）​、进行时（Verifying）；不要用check
- **勾选(复选框☑️)**: check - 是
- **勾选(单选框🔘/下拉框)**: select - 最好中文改成选择，与复选框的勾选区分开来
- **选择/自选/选**: select - 已选selected,未选unselected
- **时序(时序库)**: Time-series - 是
- **实时(表/曲线)**: real-time - 特殊情况：实时库Timing DatabaseTDB；运行库Run-Time DatabaseRTDB
- **属性**: Attributes、attributes（缩写Attr） - 不要用Properties、Property
- **替换**: replace v.
replacement n. - 不要用substitution
- **n.超出xx限制**: exceeding the... limit - “超出...限制”=“exceeding the... limit”：现在分词短语作后置定语，精准修饰“总个数”或“被计数对象”，符合英语语法习惯。<br>若追求极致简洁（如界面提示、日志输出）："Total number exceeding the graph limit:%1"<br>若需明确计数主体（如技术报告、详细统计）："Total number of items exceeding the graph limit:%1"<br>超出画面限制总个数Total number exceeding the graph limit<br>超出图元限制总个数Total number exceeding the icon limit
- **修改xxx，需要停止xxx**: To modify xxx, stop xxx - 不要翻译成it is necessary to stop xxx、xxx need to be stopped<br>修改“实时库名称”，需要停止所有使用该实时库名称的应用To modify 'TDB name', stop all applications using that TDB name<br>修改“进程路径”，需要停止所有节点的该应用To modify 'Process path', stop the application on all nodes<br>修改“进程名称”，需要停止所有节点的该应用To modify 'Process name', stop the application on all nodes<br>修改“基础应用名称”，需要停止所有节点的该应用To modify 'Basic App name', stop the application on all nodes<br>修改“是否维护库”，需要停止维护应用To modify 'MTDB', stop maintenance App<br>修改“是否维护进程”，需要停止所有节点的该维护应用及运行应用To modify 'Maintain process', stop the maintenance App and running App on all nodes<br>修改维护节点，需要停止维护节点应用To modify the maintain node, stop the application on all maintenance nodes<br>修改值班优先级，需要停止节点应用To modify the duty priority, stop the application on all nodes
- **本时曲线/今时曲线**: This hour curve - 老外喜欢this，不喜欢current
- **历史时曲线/某时曲线**: Historical hour curve - 是
- **历史周曲线/某周曲线**: Historical week curve - 是
- **本月曲线/当月曲线**: This month curve - 是
- **历史月曲线/某月曲线**: Historical month curve - 是
- **比较曲线 n.**: comparison curve - 不要用Compare curves
- **原文件(源文件，图形-导入导出工具)**: original file - 中文：使用原，不要使用源，以避免和源文件source file、资源文件source file混淆<br>不要用The original file of the icon来表示图元原文件<br>原文件the original file<br>图元原文件the original icon file<br>画面原文件the original graph file
- **原文件(源文件夹，图形-导入导出工具)**: original folder - 是
- **重名/重复**: duplicate - v. adj. n.<br>不要用repeat<br>重名画面文件duplicate graph file<br>xxx不允许重名xxx cannot be duplicated<br>xxx重名xxx is duplicated
- **待导出xx**: xxx to be exported failed - 不要用pending export<br>待导出图元icon to be exported
- **待导入xx**: to be imported - 是
- **恢复**: recovery
redo(图形设计，这个模块) - 没有用 redo重做<br>不要用restore<br>v. recover 过去式recovered
- **(不可编辑)**: (not editable) - 是
- **正在准备**: Preparing n.
Preparing to v. - 是
- **隐式adj.**: Implicit - 不要用副词implicitly:“Implicit”是形容词，修饰名词；“Implicitly”是副词，修饰动词、形容词或其他副词。在术语翻译中，尤其是名词短语，通常需要形容词来修饰名词，而不是副词。<br>“隐式”：技术场景中统一用 "Implicit"，强调“系统自动处理”的特性（区别于“显式”Explicit）
- **显式adj.**: Explicit - 是
- **内部**: adj. internal
n. interior
adv.  internally - adj.不要用inner；n.不要用inside、internal
- **adj.剩余**: remaining - 是
- **向上/下取整**: rounded up/down - 上下对应，不要用下downwards<br>浮点数x向下取整Floating point number x rounded down
- **超出**: 根据语境判断使用
exceed
beyond
out of - 强调动态突破限制（如系统报错、规则违反）→ exceed 动词（独立作谓语）<br>例：“请求次数超出每日限制”→ Requests exceed the daily limit.<br>强调静态范围之外（如能力、理解、空间）→ beyond  介词/副词（需搭配对象）<br>例：“这个问题超出我的职责范围”→ This issue is beyond my responsibility.<br>强调脱离原有状态/范围（如控制、范围、版本）→ out of  介词短语（强调状态）<br>例：“设备信号超出覆盖范围”→ The device signal is out of coverage.
- **默认xxx**: Set... as default“设置默认对象”
By default“默认行为”
Default xxx“默认的n.” - 默认本节点(以本节点为默认)："Take this node as the default."<br>默认展开表(默认会展开表格)："By default, the table expands."<br>默认展开表(列名：默认展开的表)Default-expanded table
- **关闭**: turn off关闭设备、电源或功能
close关闭物理上的开口、窗口、文件或应用程序
disable禁用某个功能、权限或设备，使其无法使用 - 关闭设备/电源/功能（状态切换）→ turn off<br>例：“关机”→ Turn off the computer.；“关闭蓝牙”→ Turn off Bluetooth.<br>闭合开口/窗口/文件（结束开放）→ close<br>例：“关窗户”→ Close the window.；“关闭文件”→ Close the document.<br>禁用功能/权限/设备（设置失效）→ disable<br>例：“禁用通知”→ Disable notifications.；“禁用账户”→ Disable the account.<br>是否关闭词条定位功能Whether to disable the entry locating function
- **执行/进行(正在xxx...)**: execute - 不要用perform<br>“execute”常用于描述数据库、系统或程序的可操作指令
- **冻结**: freeze、Frozen - 是
- **解冻**: Unfreeze、unfrozen - 不要用thaw<br>解冻成功Unfrozen successfully（被动状态，适配日志记录）<br>解冻中：Unfreezing
- **上线/在线**: Online - 是
- **离线/掉线**: offline - 不要用disconnected
- **警告/预警**: warning - 不要用Forewarning
- **全选/反选/取消选择**: Select All/Invert/Cancel - 是
- **异常**: 纯技术错误​ → Exception​
数据/行为异常​ → Abnormality​ 或 Abnormal​
安全风险​ → Suspicious​
意外中断​ → Unexpectedly
数据异常invalid - 分语境
- **xx中......请等待**: ing... Please wait - 下载中......请等待Downloading... Please wait<br>加载中......请等待Loading... Please wait<br>发布中......请等待Publishing... Please wait<br>停止中......请等待Stopping... Please wait
- **一次设备**: PE（Primary Equipment） - 结论​<br>缩写PE/SE：国家电网标准未强制规定，但行业非正式场景可偶用（PE=Primary Equipment，SE=Secondary Equipment）。<br>Equipment vs Device：<br>一次设备、大型二次系统优先用 Equipment；<br>小型、单一功能的二次组件可用 Device；<br>实际翻译中需结合设备特性与上下文，无需绝对区分。<br>建议：在正式文档（如标准、合同）中，优先使用完整表述（Primary/Secondary Equipment）；非正式场景（如界面、笔记）可使用缩写（PE/SE）或Device，但需确保上下文清晰无歧义。
- **二次设备**: SE（Secondary Equipment） - 是
- **设备**: 设备（一次设备、大型二次系统）Equipment
设备（二次组件）Device
没本事分，暂时先不管了 - 是
- **（个）/（件）/（文件个数）**: (pcs) - 不要用(pieces)，(number)<br>在表示“单位为个”时，优先用 pieces（或其缩写 pcs），而非 number。二者的核心区别在于：number是“数量”的抽象概念，pieces是“个/件”的具体单位词，需结合“单位”的功能（量化个体物品）选择。
- **方案/计划**: plan - 统一用plan，不要用scheme、option<br>优先用 Plan：若方案侧重“可执行的具体步骤”（最常见场景）；<br>次选用 Scheme：若方案侧重“系统性/策略性设计”（技术复杂度高时）；<br>仅在对比时用 Option：明确指代“多个候选中的一个”（不可替代）。
- **分区**: 用Zone：当“分区”指地理/功能区域（有明确边界的运行、供电、调度范围）；
用Partition：当“分区”指逻辑/物理分割（模型、时间、数据、参数的拆分）； - 示例（电力场景）：<br>“模型分区与运行分区协同方法”→Coordination Method for Model Partition and Operation Zone；<br>“按年分区的负荷数据统计”→Load Data Statistics with Yearly Partition；<br>“分区类型对调度效率的影响”→Impact of Partition Type on Dispatch Efficiency（通用场景）。<br>此翻译符合电力行业习惯（如IEC标准中“时间分区”用Time Partition、“分区调度”用Zonal Dispatch），语义精准且覆盖所有场景。
- **时间片/时间分片**: time slice - 分片slice，不要用sharding，shards,segmentation<br>不分片without slice
- **启动n.**: startup - 是
- **启动v.**: start - 注意词性<br>启动拓扑start topo
- **停止v.（与启动相对应）**: stop - 不要用close<br>关闭拓朴==停止拓扑stop topo

## 翻译规则

### 核心原则
- **只修改英文翻译列，不修改中文词条**
- 如果中文不规范，在"备注1"列记录不规范现象

### 占位符保护
- 保持原文本中的占位符不变：`{}`, `{:.3f}`, `%1`, `%2` 等
- 占位符格式：`[{}]`, `{:.3f}`, `%1`, `%2`

### 标点符号处理
- 保持原文本中的标点符号（逗号、冒号、括号等）
- 中文标点转换为英文标点：`，` → `,`，`：` → `:`，`。` → `.`

### 特殊规则
- 省略号统一：中文 `……` → 英文 `...`
- 按钮文本：`关闭` → `Close`，`退出` → `Exit`
- 坐标轴：`X轴` → `X-axis`（大写X，不要写成x轴）

## 中文规范性检查规则

### 不规范现象示例
- 混用中英文标点：`，` 和 `,` 混用
- 多余空格：词条前后或中间有多余空格
- 标点符号错误：使用错误的标点符号
- 格式不一致：同一类词条格式不统一
- 占位符格式错误：占位符格式不符合规范
