<p align="center">
  <a href="http://lowcodestudio.cn">
    <img width="200" src="https://minio.lowcodestudio.cn/obsidian/20260309223729_正方形logo-裁切-300_300.png">
  </a>
</p>
<h1 align="center">低码工坊 - 专业低代码</h1>
<div align="center">
    面向<b>开发者</b>设计的专业低代码，<br>
    旨在满足复杂业务场景的核心应用开发，实现<b>低成本工程化迭代</b>。<br>
    <br>
    <b>开发平台地址：</b><a href="https://develop.lowcodestudio.cn">https://develop.lowcodestudio.cn</a><br>
    <b>低码应用演示（持续更新）：</b><a href="https://lowcodestudio.cn">https://lowcodestudio.cn</a><br>
    <br><br>
</div>

![](https://minio.lowcodestudio.cn/obsidian/20260217192256_image.png)

# ✨ 特性

区别于其他低代码，低码工坊拥有“高上限”的开发能力，主要特点是：
- **前后端分离**：❗️❗️拒绝建模后生成前后端黑盒！遵循专业前后端分离开发流程，页面设计器负责前端开发，模型设计器负责后端api开发，页面设计器调用api完成联调。

- **生成式白盒**：提供代码生成容器沙箱，可实时查看和调试可视化配置生成的工程级代码。

- **SDK生态扩展**：❗️❗️无需通过组件封装，可直接在可视化设计器中安装第三方SDK。

- **应用独立部署**：应用开发完成后，脱离平台私有化部署。

# 📚 运行原理

低码工坊的应用运行环境，包括三个镜像：
- lowcode-platform
- lowcode-render
- lowcode-npm

通过低码工坊开发并导出的应用，包含：
- 前端制品包
- 后端容器镜像 +  后端源码（二选其一）

其中：
1. lowcode-render、lowcode-npm镜像用于前端制品包的导入、配置、运行。
2. 后端推荐直接部署独立的容器镜像，同时也可clone源代码在容器外命令行部署。
3. lowcode-platform镜像，是一个基于java的多租户平台权限管理系统，低代码开发的页面最终以菜单形式编排在platform内，实现菜单鉴权、数据权限等功能，同时platform还统一提供推送能力（邮箱、手机、站内信）、文件存储能力供低代码应用调用。

> lowcode-platform是一个all in one的微服务架构镜像，内部集成了mysql、redis、kong、minio等常用中间件，所以内存占用大（当前版本优化至约5~6GB内存占用），适合小规模并发用户使用。高可用部署方案是基于k8s的，尾部二维码咨询提供。

# ‼️ 环境要求

- 最低配置：4核8G内存
- 推荐配置：8核16G内存
- 已安装docker、git

> 若使用docker-desktop测试需设置提升容器最大内存为8G或以上

# 👉 启动低码运行环境

```bash
# 先clone项目到本地
git clone 

# cd 进入项目根目录
cd lowcode-studio

# docker compose 启动
docker compose up -d

```

通过 `docker logs lowcode-platform` 检查 lowcode-platform 容器日志，
看到显示下方日志，说明启动成功

```
2026-03-18 19:40:15 === 所有服务启动完成 ===
2026-03-18 19:40:15 Redis: localhost:6379 (无密码)
2026-03-18 19:40:15 MySQL: localhost:3306 (root/lowcodestudio)
2026-03-18 19:40:15 PostgreSQL: localhost:5432 (postgres/lowcodestudio)
2026-03-18 19:40:15 Kong Proxy: localhost:8000 (HTTP), localhost:8443 (HTTPS)
2026-03-18 19:40:15 Kong Admin: localhost:8001 (HTTP), localhost:8444 (HTTPS)
2026-03-18 19:40:15 Konga: localhost:1337
2026-03-18 19:40:15 MinIO: localhost:9000
2026-03-18 19:40:15 MinIO Console: localhost:9001

...

2026-03-18 19:42:06 === Platform 服务启动完成 ===
2026-03-18 19:42:06 platform-server:    http://localhost:8030/api/poros-permission
2026-03-18 19:42:06 platform-authcenter: http://localhost:8031/api/poros-authcenter
2026-03-18 19:42:06 platform-i18n:       http://localhost:8032/api/poros-i18n
2026-03-18 19:42:06 platform-notify:     http://localhost:8033/api/poros-notify
2026-03-18 19:42:06 platform-oss:        http://localhost:8034/api/poros-oss
```

访问 [http://localhost:8000](http://localhost:8000) 进入控制台登录，根管理员默认账号密码：admin/lowcode@2026

另外两个控制台
1. [http://localhost:1337](http://localhost:1337) konga网关的管理入口，管理主入口8000 -> 各服务的代理，默认账号密码：admin/lowcodestudio
2. [http://localhost:9001](http://localhost:9001) minio对象存储的管理入口，管理低码应用的存储桶，默认账号密码：admin/lowcodestudio
# 👉 导入低码应用

### 示例应用：Mermaid UI 时序图绘制工具

这里以一个低码工坊搭建的应用示例，来讲解如何：1. 部署应用的前、后端、2. 配置前、后端。

![前台](https://minio.lowcodestudio.cn/obsidian/20260318202730_image.png)

![后台](https://minio.lowcodestudio.cn/obsidian/20260318202976_image.png)

### 部署应用前端

#### 1. **制品包导入**

进入前端制品包管理登录界面，访问：[http://localhost:8000/lowcodeRender/manage](http://localhost:8000/lowcodeRender/manage)
输入默认管理密码：lowcodestudio （此管理密码可通过lowcode-render容器的环境变量修改）
然后导入 `/demo-apps/mermaid-ui/mermaid-ui_0.0.1.zip` 这个前端制品包

![](https://minio.lowcodestudio.cn/obsidian/20260318204845_image.png)

导入后即可访问不依赖后端的前端页面，如

- mermaid-ui官网页面：[http://localhost:8000/lowcodeRender/page/mermaid-ui/index](http://localhost:8000/lowcodeRender/page/mermaid-ui/index)
- mermaid-ui设计器页面：[http://localhost:8000/lowcodeRender/page/mermaid-ui/mermaid-ui-editor](http://localhost:8000/lowcodeRender/page/mermaid-ui/mermaid-ui-editor)

> 路由组装方式说明
> 1. 单页渲染： `/lowcodeRender/page/前端应用服务编码/页面编码`,<br>
> 此渲染方式不依赖lowcode-platform，除非业务逻辑中调用了平台相关的接口
> 
> 2. 系统渲染：`/lowcodeRender/sys/平台系统编码/菜单编码`<br>
> 此渲染方式需在后台管理中导入系统、菜单，。

#### 2. **前端常量配置**

前端制品包导入成功后，即可在 `/data/render-apps` 目录下看到制品包zip文件解压后的目录。
这个目录中以UUID命名的js文件为全局级utils/constants、应用级utils/constants。
依次点开这些js文件，找到应用级constants进行配置。

由于此demo应用比较简单，所以配置项不多，
可尝试修改主题色primaryColor色值，如下图

![](https://minio.lowcodestudio.cn/obsidian/20260318210291_image.png)

#### 3. **导入平台管理菜单**

**第一步，创建系统并导入菜单（编码：mermaid-ui）**

用根账号进入平台管理界面，点击左上角切换系统的图标，再点最下面的“后台管理”
![](https://minio.lowcodestudio.cn/obsidian/20260318211282_image.png)

然后切换菜单“系统管理”，创建系统
- 系统名称：时序图绘制工具 （可修改）
- 系统标识：mermaid-ui （系统标识必须与应用编码一致）
- url地址：`/lowcodeRender/sys/mermaid-ui`

![](https://minio.lowcodestudio.cn/obsidian/20260318211601_image.png)

切换到“菜单管理” ，切换系统“时序图绘制工具”，选择 `/demo-app/mermaid-ui/时序图绘图工具_菜单.xlsx` 文件导入菜单
![](https://minio.lowcodestudio.cn/obsidian/20260318212052_image.png)


**第二步，为租户授权系统**

![image.png](https://minio.lowcodestudio.cn/obsidian/20260318212716_image.png)

现在完整的前端配置已完成，可尝试访问后台管理界面（后端未部署，点击“我的时序图” 菜单应该是空白界面）
[http://localhost:8000/lowcodeRender/sys/mermaid-ui](http://localhost:8000/lowcodeRender/sys/mermaid-ui)

![](https://minio.lowcodestudio.cn/obsidian/20260318213305_image.png)
#### 4. **权限分配**（可后续操作）

由于admin账号是超级管理员，所以不需要授权就可访问所有系统。但普通用户需严格进行RBAC授权。

创建或导入新用户，在平台管理中创建角色并分配菜单，将角色绑定用户即授权成功



### 部署应用后端
#### 1. 创建数据库

执行下面的命令创建 `app_mermaid_ui` 数据库
```bash
docker exec -it lowcode-platform mysql -u root -plowcodestudio -e "CREATE DATABASE IF NOT EXISTS app_mermaid_ui CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```
#### 2. 镜像部署

先以“IS_PROD=False” 启动镜像，将会初始化数据库表结构。
```bash
docker run \
	--name mermaid-ui-server \
	--network lowcodestudio_lowcode \
	-e "IS_PROD=False" \
	-e "PLATFORM_SERVER_URL=http://lowcode-platform:8000" \
	-e "DATABASE_MYSQL_URL=root:lowcodestudio@lowcode-platform:3306/app_mermaid_ui" \
	lowcodestudio/mermaid-ui-server:0.0.1-20260127-223428
```

启动成功后，ctrl + c 取消，然后
再通过“IS_PROD=True”启动mermaid-ui-server镜像
```bash
docker run -d \
	--name mermaid-ui-server \
	--network lowcodestudio_lowcode \
	-e "IS_PROD=True" \
	-e "PLATFORM_SERVER_URL=http://lowcode-platform:8000" \
	-e "DATABASE_MYSQL_URL=root:lowcodestudio@lowcode-platform:3306/app_mermaid_ui" \
	lowcodestudio/mermaid-ui-server:0.0.1-20260127-223428
```

> 1. **端口**：所有低码后端服务端口都为9090，一般选择不暴露端口。加入lowcodestudio_lowcode（compose组名_网络名）网络后，通过配置kong代理访问，（konga内配置指向服务 mermaid-ui-server:9090 ）
>
> 2. **环境变量**：必须设置 IS_PROD=True ，否则将会以热更新方式启动影响并发！！
>
> 3. **其他的环境变量**，根据低代码模型设计器中自定义的全局参数进行设置。

#### 3. kong网关配置

访问 [http://localhost:1337](http://localhost:1337) 进入konga网关管理界面（默认账号密码：admin/lowcodestudio）。

第一步：创建service，指向 mermaid-ui-server 容器服务
![](https://minio.lowcodestudio.cn/obsidian/20260318223755_image.png)

第二部：在创建好的service内创建route，让 localhost:8000 匹配 `/lapi/mermaid-ui-server/v0` 此接口请求的path
![](https://minio.lowcodestudio.cn/obsidian/20260318224849_image.png)
![](https://minio.lowcodestudio.cn/obsidian/20260318224974_image.png)

打开接口地址测试
http://localhost:8000/lapi/mermaid-ui-server/v0/docs

若能访问到swagger接口说明服务部署及网关配置成功！

访问 http://localhost:8000/lowcodeRender/sys/mermaid-ui/my-sequence ，现在可以在这个界面里创建文件夹和时序图了：
![](https://minio.lowcodestudio.cn/obsidian/20260318225648_image.png)

到此，完成部署。

后续低代码开发平台内有新版本发布：
则前端需重新导入制品包（导入会解压覆盖，若修改了前端配置，请先备份），然后就是重新导入并更新后台管理中的菜单（若有变更）。
后端则更新镜像名即可

# ⁉️ 为什么要做“专业低代码”

如今，低代码平台选型众多，但多数低代码无法解决复杂工程的可持续性迭代难题，只一味追求“快速”的建，而不注重后期迭代的“可持续性”。尤其，在vibe-coding的快速发展背景下，很多简单的Demo式应用可以一句话生成，传统低代码的空间被进一步压缩。但是，低代码相比AI的幻觉问题，拥有更多的确定性优势，它可以生成符合UI规范的页面、严谨的逻辑、准确的数据、符合开发规范的代码。

**深入代码工程深水区，解决AI无法解决的工程化难题**，这是**专业低代码**和传统低代码的本质区别。

当前，传统低代码普遍存在的以下问题：

## 1. 前后端不分离

多数低代码在配置数据模型时，夹杂着前端相关的配置，比如设置数据字段类型，出现了“富文本”、“电话”、“邮箱“、“图片”等字段类型，将这些字段拖入到画布中会自动变为控件，“天然”拥有前端数据规则校验，与控件类型深度绑定并由框架或组件内部发起api调用。殊不知这对于专业开发者来说，实属鸡肋。
还有些低代码建设了异步的工作流系统，但不提供前端事件流或js编写，有些严格的业务规则校验都无法在前端阻断数据提交，需要强制运行到后端工作流中去做判断忽略，给后续维护带来严重隐患。

## 2. 黑盒封闭

黑盒问题不用多说了，尤其是无代码平台都是重灾区，其次是在架构上依赖A、B、C...“引擎”的模型解释型低代码平台。具有黑盒问题的平台，最终在大型项目实施中逃不过“改平台底层源代码”的命运。

## 3. 生态扩展成本高

传统低代码遇到一次性的SDK集成场景，都需要封装成组件或插件，流程上必须走一便：启动插件脚手架 -> 安装mvn/npm依赖 -> 编写代码 -> 编译 -> 部署的流程，才可以用到sdk的能力。然而，在传统开发中，只需要 mvn/npm/pip install 一行命令，然后直接调包。

## 4. 运行时很“重”很“慢”

一般生成式低代码平台不存在这个问题，问题主要集中在模型解释型低代码平台，你的代码要实现私有部署，那么必须先部署A、B、C...等引擎服务，然后才得以运行目标应用。
同时，一个简单的业务服务逻辑，依赖底层多个引擎的共同作用，相比生成式低代码产出的工程级代码效率上要慢的多。当业务复杂时，只能多节点扩展引擎服务，除了支付更高的计算资源费用，还“拖”慢整个业务效率。

## 5. 导出代码后，不可再使用低代码持续迭代

当低代码平台不能满足项目需求时，往往传统平台的方案是导出代码进行人工编写，一旦代码导出后被人工修改，项目就再不可使用低代码平台进行迭代。

---
**如果你在以往的低代码平台使用中，被上述痛苦困扰，**
**那么，低码工坊的专业低代码值得尝试，以上所有问题已在低码工坊平台被有效解决并形成最佳实践。**



# 🎯 平台定位

基于最新GB/T46900—2025低代码国标的平台分类文档进行平台定位。
与之不同的是，其“驱动方式”是以模型驱动+前后端分离的模式，对于“模型”的抽象方式为“工程化视角”，如数据模型Entity、接口模型Controler、数据传输模型DTO、编排模型Service和后端模块Module，相比其他模型驱动的低代码平台（表单模型、数据模型、流程模型等），具备前后端工程化、白盒透明化、开发人员易上手等诸多优势。

![](https://minio.lowcodestudio.cn/obsidian/20260216144599_image.png)


# ✅ 平台优势（工程化视角）

![](https://minio.lowcodestudio.cn/obsidian/20260217215175_image.png)


# 联系咨询

<div align="center">
    <img width="200" src="https://minio.lowcodestudio.cn/obsidian/20260318231480_低码工坊客服-企业微信-二维码.png">
<br><br>
可扫码联系<br>
咨询低码工坊平台、应用云托管、<br>
应用订制、应用私有部署等相关问题
</div>

