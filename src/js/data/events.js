window.GMarket = window.GMarket || {};

window.GMarket.MARKET_EVENTS = [
  {
    day: 3,
    title: "市场资金追捧成长股",
    targetType: "sector",
    target: "科技",
    impact: 0.055,
    sentiment: 0.35,
    description: "资金集中流入科技板块，短期上涨较快，但后续波动也会变大。"
  },
  {
    day: 6,
    title: "能源价格大幅波动",
    targetType: "sector",
    target: "能源",
    impact: -0.07,
    sentiment: -0.35,
    description: "大宗商品价格下跌，引发能源股估值重估。"
  },
  {
    day: 9,
    title: "宏观预期转弱",
    targetType: "market",
    target: "ALL",
    impact: -0.035,
    sentiment: -0.25,
    description: "投资者风险偏好下降，多数股票承压。"
  },
  {
    day: 13,
    title: "明德医药新药试验结果积极",
    targetType: "symbol",
    target: "MEDI",
    impact: 0.12,
    sentiment: 0.5,
    description: "单一公司利好可以快速推高股价，但也可能带来追高风险。"
  },
  {
    day: 16,
    title: "制造业订单改善",
    targetType: "sector",
    target: "制造",
    impact: 0.06,
    sentiment: 0.28,
    description: "市场预期制造业盈利回暖，相关股票表现较强。"
  },
  {
    day: 20,
    title: "市场出现获利回吐",
    targetType: "market",
    target: "ALL",
    impact: -0.045,
    sentiment: -0.18,
    description: "前期上涨较多的股票开始回调，说明上涨后的风险会逐渐积累。"
  },
  {
    day: 25,
    title: "金融板块受益于利差改善",
    targetType: "sector",
    target: "金融",
    impact: 0.05,
    sentiment: 0.25,
    description: "低估值金融股上涨，市场风格从成长切换到价值。"
  },
  {
    day: 31,
    title: "云计算竞争加剧",
    targetType: "symbol",
    target: "CLOUD",
    impact: -0.11,
    sentiment: -0.45,
    description: "高成长公司一旦预期受损，价格调整可能非常剧烈。"
  },
  {
    day: 38,
    title: "物流需求恢复",
    targetType: "sector",
    target: "物流",
    impact: 0.045,
    sentiment: 0.22,
    description: "贸易活动改善带动物流股走强。"
  },
  {
    day: 45,
    title: "市场情绪修复",
    targetType: "market",
    target: "ALL",
    impact: 0.035,
    sentiment: 0.18,
    description: "经历调整后，部分资金开始重新买入风险资产。"
  }
];
