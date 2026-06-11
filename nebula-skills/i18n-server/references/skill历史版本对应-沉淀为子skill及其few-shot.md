1. 推荐的功能名称，若相同的，说明是需要合并的子skill，每个历史版本都是合并后skill的其中一个few-shot，这样示例比较多，方便agent执行时不跑错
2. 每个skill在运行时均需要参考方案文档`docs\前端国际化方案说明.md`
3. 是否已有沉淀skill（若有多个则需合并）需要agent读取现有skill，再做出正确判断，回填进来
## Microfb(基座)

仓库F:\Documents\Repertory\Sieyuan\nebula\microfb

| 历史版本提交信息                                                                             | 历史版本提交ID                                 | 沉淀为skill | skill类型 | 推荐的功能名称                            | 是否已有沉淀skill（若有多个则需合并） |
| ------------------------------------------------------------------------------------ | ---------------------------------------- | -------- | ------- | ---------------------------------- | --------------------- |
| refactor(i18n): 退化i18n的旧方案：全部硬切静态化                                                   | ac05eebfbe5f2d35125cec76ba84a545d35d1067 | 值得       | 更新      | 旧i18n-硬切静态化                        |                       |
| refactor(i18n): i18n 实例初始化-安装插件                                                      | aca321dcfbd75c0368481c4dbd4a46d88ddbf07b | 值得       | 更新      | 新i18n-安装插件                         |                       |
| refactor(i18n): i18n实例初始化-其他样板代码                                                     | 4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8 | 值得       | 更新      | 新i18n-样板代码                         |                       |
| refactor(i18n): 迁移i18n的新方案：修改语言选择器，定义语言下拉框的常量                                        | 06624c8d0c22a0b3094b94ad861b188eb307ac80 | 值得       | 更新      | 新i18n-基座-语言选择器                     |                       |
| refactor(i18n): 迁移i18n的新方案：补充翻译json                                                  | 198a60a2215c68d0aafef7bb0110d01b497cf803 | 值得       | 更新      | 新i18n-补充翻译json                     |                       |
| refactor(i18n): 迁移i18n的新方案：修改 Vue 模板中使用$t()                                          | 1763c88e24581ea46c71d9119f114299cd376fb7 | 值得       | 更新      | 新i18n-Vue 模板中使用$t()                |                       |
| refactor(i18n): 迁移i18n的新方案：修改 规则中心formRules，校验器的i18n消费点在formRules                    | 462a31dbe13af101443bac1869b021803af6e945 | 值得       | 更新      | 新i18n-编译宏外的定义点包trans+消费点包t         |                       |
| refactor(i18n): 迁移i18n的新方案：修改 ts或script sectup中使用t(),可以包变量                           | e87b6d1202c782a53dce05799af22d1760bf7b13 | 值得       | 更新      | 新i18n-ts或script sectup中使用t(),可以包变量 |                       |
| refactor(i18n): 迁移i18n的新方案：MVP：trans：让抽取脚本识别这是一条国际化 key,不翻译；所有引用他们的地方，还需要再调用t()      | c05f40d07ec4f4092305df331bc94277ef2272da | 值得       | 更新      | 新i18n-编译宏外的定义点包trans+消费点包t         |                       |
| refactor(i18n): 迁移i18n的新方案：MVP：解决函数的动态拼接翻译文件。trans不支持动态拼接，通过业务层回调t到函数定义中             | 6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe | 值得       | 更新      | 新i18n-动态拼接：业务层回调t到函数定义             |                       |
| refactor(i18n): 迁移i18n的新方案：trans:让抽取脚本识别这是一条国际化 key,不翻译；所有引用他们的地方，还需要再调用t()。基座国际化的收尾 | f3f6f109a3900577f5f56718813f95e82db5ab17 | 不值得      |         |                                    |                       |
| feat(views): 菜单树增加i18n国际化（导航栏、面包屑、角色管理-菜单树均受影响）                              | 3c01efd136719c237b72f77264e738cb0052af63 | 值得       | 新增      | 新增-i18nInput-读侧展示            | 基座-菜单壳层V1 few-shot     |
| feat(views): 菜单树增加i18n国际化V2（导航栏、面包屑、角色管理-菜单树均受影响）                            | 6dac3ff65376ec521ff1445c335ac7a5b34941af | 值得       | 更新      | 更新-i18nInput-缓存投影            | 基座-菜单缓存投影 few-shot     |

## Apex_dev(微服务)

仓库F:\Documents\Repertory\Sieyuan\nebula\apex_dev

| 历史版本提交信息                                                                              | 历史版本提交ID                                 | 沉淀为skill | skill类型 | 推荐的功能名称                | 是否已有沉淀skill（若有多个则需合并） |
| ------------------------------------------------------------------------------------- | ---------------------------------------- | -------- | ------- | ---------------------- | --------------------- |
| refactor(i18n): i18n 实例初始化-安装插件                                                       | ec8710f166b3ebf08bf14e93181266c9edbee27a | 值得       | 更新      | 新i18n-安装插件             |                       |
| refactor(i18n): i18n 退化旧方案，版本过渡：i18n内仍放置旧方案，未改为新i18n的样板代码                             | a612cb04d2d1a3273eb454601d51a7e7b6107968 | 值得       | 更新      | 迁移i18n-壳层接缝保留          |                       |
| refactor(i18n): i18n 新方案：样板代码与opsdeck一致                                               | 390662ac443ca838b519eca3adb0d40f2da2478a | 值得       | 更新      | 新i18n-样板代码             |                       |
| refactor(i18n): i18n 新方案：qiankun                                                      | 8679ae56fc5490b27a61c7e9760a202f12b4f91b | 值得       | 更新      | 迁移i18n-微服务-qiankun     |                       |
| refactor(i18n): i18n 新方案：全局组件：Transfer 穿梭框组件transfer                                  | a9f0eac95e915c63154792af710d144f1aee3d45 | 值得       | 更新      | 旧i18n-清理自定义的i18n函数     |                       |
| refactor(i18n): i18n 新方案：全局组件，导航栏组件NavbarActions                                      | 6b495b7888ab7742d67a0cf2362ba3fc0486c7ad | 不值得      |         |                        |                       |
| refactor(i18n): i18n 新方案：全局组件，包括 布局大小SizeSelect，语言切换入口LangSelect，模式切换入口DarkModeSwitch | 7eaed495706a459042b7c075636d81e185fbb60a | 值得       | 更新      | 新i18n-微服务-语言选择器        |                       |
| refactor(i18n): i18n 新方案：首页                                                           | ce313e13978acf418f39f3ca6a5e9f94a0f17c97 | 不值得      |         |                        |                       |
| refactor(i18n): Transfer 穿梭框组件transfer 的变量包t改成中文包t                                    | 45e68079b569e9c8e43437dddbd8d78c2a1a4b5c | 值得       | 更新      | 迁移i18n-变量改写为中文再包t     |                       |
| refactor(i18n): i18n 新方案：租户管理的相关i18n；收敛规则中心为硬编码+动态规则函数                                | fd02487fd927b3c35a02bea9ce3daac7a4228007 | 值得       | 更新      | 新i18n-动态拼接：业务层回调t到函数定义 |                       |
| feat(views): 告警配置名称采用国际化方式                                                         | 903392f8b51746317b457d9e0620a19d94b9d830 | 值得       | 新增      | 新增-i18nInput-表单字段          | 告警配置-首字段 few-shot     |
| fix(views): 告警配置描述、模板增加国际化编辑功能                                                   | 16db8f1d2e58877926344b00bcff71729b094fe1 | 值得       | 新增      | 新增-i18nInput-表单字段          | 告警配置-扩展多字段 few-shot   |
| feat(views): 菜单树增加i18n国际化（导航栏、面包屑、角色管理-菜单树均受影响）                              | cc503626cd6a162b9459cb28606a20f12bd62961 | 值得       | 新增      | 新增-i18nInput-表单字段/读侧展示    | 菜单树-表单 + 菜单树-读侧V1    |
| feat(views): 菜单树增加i18n国际化V2（导航栏、面包屑、角色管理-菜单树均受影响）                            | ebf4d5d002c87036b1b37c415dbf898a1cdbad59 | 值得       | 更新      | 更新-i18nInput-缓存投影          | 微服务-菜单缓存投影            |

## Opsdeck(中台)

仓库F:\Documents\Repertory\Sieyuan\nebula\opsdeck

| 历史版本提交信息                          | 历史版本提交ID                                 | 沉淀为skill | skill类型 | 推荐的功能名称                | 是否已有沉淀skill（若有多个则需合并）                                  |
| --------------------------------- | ---------------------------------------- | -------- | ------- | ---------------------- | ---------------------------------------------------- |
| feat:✨ ts文件t函数使用示例 | 453b4aa790aef84c915ae2b5ec4535b4f842254f | 值得       | 更新      | 新i18n-纯ts中用i18n.global.t | 与 `新i18n-ts或script setup中使用t(),可以包变量` 边界重划，不合并 |
