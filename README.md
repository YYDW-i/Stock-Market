# GMarket Stock Simulator

一个纯前端、可直接打开运行的股票市场教育模拟器。项目已经拆分成类似 GitHub 仓库的结构，方便后续逐步增加功能，例如 K 线图、财报系统、板块轮动、融资融券、策略回测、用户登录等。

## 运行方式

### 方式一：直接运行

双击打开根目录下的 `index.html` 即可运行。

### 方式二：用本地服务器运行

如果你后面接入更多资源、模块化加载或接口，建议使用本地服务器：

```bash
python -m http.server 8080
```

然后在浏览器访问：

```text
http://localhost:8080
```

Windows 用户也可以双击 `start_windows.bat`，自动启动本地服务器。

## 项目结构

```text
GMarketStockSimulator/
├── index.html                 # 页面入口
├── README.md                  # 项目说明
├── LICENSE                    # 开源协议
├── .gitignore                 # Git 忽略规则
├── start_windows.bat          # Windows 一键本地启动脚本
├── docs/
│   └── DEV_GUIDE.md           # 二次开发说明
└── src/
    ├── css/
    │   ├── base.css           # 基础样式
    │   ├── layout.css         # 页面布局
    │   └── components.css     # 组件样式
    └── js/
        ├── data/
        │   ├── stocks.js      # 股票基础数据
        │   ├── events.js      # 市场新闻事件
        │   └── lessons.js     # 教育提示内容
        ├── core/
        │   ├── utils.js       # 工具函数
        │   ├── storage.js     # 本地存档
        │   ├── marketEngine.js# 行情模拟引擎
        │   ├── portfolio.js   # 账户、持仓、交易逻辑
        │   ├── risk.js        # 风险指标
        │   └── game.js        # 游戏总状态管理
        ├── ui/
        │   ├── chart.js       # Canvas 图表绘制
        │   └── renderer.js    # 页面渲染与交互
        └── main.js            # 启动入口
```

## 当前功能

- 多只虚拟股票行情模拟
- 按天推进市场
- 买入、卖出、持仓、现金、总资产统计
- 市场新闻事件冲击
- 板块属性、波动率、趋势、情绪影响
- 净值曲线和个股价格曲线
- 本地浏览器存档
- 重置模拟
- 风险指标：收益率、回撤、仓位、集中度
- 教育提示：帮助理解交易行为和风险

## 后续可扩展方向

1. 增加 K 线图和成交量柱状图。
2. 增加公司财报系统，例如营收、利润、估值、市盈率。
3. 增加宏观变量，例如利率、通胀、汇率、政策周期。
4. 增加不同类型订单，例如限价单、止损单、止盈单。
5. 增加融资融券、爆仓、保证金系统。
6. 增加策略回测模块。
7. 增加排行榜、成就系统、任务系统。
8. 后端化：用 Flask、FastAPI、Go 或 Node.js 保存用户数据。

## GitHub 上传建议

```bash
git init
git add .
git commit -m "Initial stock simulator project"
git branch -M main
git remote add origin 你的仓库地址
git push -u origin main
```

## 说明

本项目用于股票教育和编程学习，不构成任何真实投资建议。
