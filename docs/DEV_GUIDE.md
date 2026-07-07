# 二次开发说明

这个项目特意没有使用复杂框架，目的是让你可以先读懂、能运行，再一步一步改功能。

## 1. 想增加一只股票

打开：

```text
src/js/data/stocks.js
```

在数组里增加一项：

```js
{
  symbol: "NEW",
  name: "新科技",
  sector: "科技",
  initialPrice: 30,
  drift: 0.0008,
  volatility: 0.035,
  description: "一家处于高速成长阶段的虚拟科技公司。"
}
```

其中：

- `initialPrice`：初始价格。
- `drift`：长期平均趋势，越大越容易长期上涨。
- `volatility`：波动率，越大涨跌越刺激。

## 2. 想增加新闻事件

打开：

```text
src/js/data/events.js
```

增加一项：

```js
{
  day: 12,
  title: "科技板块受到政策支持",
  targetType: "sector",
  target: "科技",
  impact: 0.08,
  sentiment: 0.4,
  description: "市场预期科技企业盈利改善，相关股票出现上涨。"
}
```

其中：

- `day`：第几天触发。
- `targetType`：可以是 `market`、`sector`、`symbol`。
- `target`：目标板块或股票代码。
- `impact`：对价格的直接冲击。
- `sentiment`：对后续几天情绪的影响。

## 3. 想修改交易手续费

打开：

```text
src/js/core/portfolio.js
```

找到：

```js
const FEE_RATE = 0.001;
```

比如改成万分之三：

```js
const FEE_RATE = 0.0003;
```

## 4. 想修改初始资金

打开：

```text
src/js/core/game.js
```

找到：

```js
initialCash: 100000,
```

改成你想要的金额。

## 5. 想改页面样式

主要改这三个文件：

```text
src/css/base.css
src/css/layout.css
src/css/components.css
```

其中：

- `base.css`：全局字体、颜色、按钮、输入框。
- `layout.css`：页面整体布局。
- `components.css`：卡片、表格、新闻、股票列表等组件。

## 6. 想接入后端

目前所有数据都保存在浏览器 `localStorage` 里。如果后面要做账号系统，可以把这些文件先保留：

```text
src/js/core/marketEngine.js
src/js/core/portfolio.js
src/js/core/risk.js
```

然后新增后端目录，例如：

```text
backend/
├── main.py
├── database.py
└── models.py
```

前端再用 `fetch()` 请求后端接口。

## 7. 推荐的开发顺序

先不要急着上后端。建议按下面顺序逐步改：

1. 修改股票池和新闻事件。
2. 增加 K 线图。
3. 增加财报和估值系统。
4. 增加任务系统。
5. 增加限价单和止损单。
6. 最后再接后端和数据库。
