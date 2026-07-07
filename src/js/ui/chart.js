window.GMarket = window.GMarket || {};

window.GMarket.Chart = (function () {
  function drawLineChart(canvas, series, options) {
    options = options || {};
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var padding = { top: 26, right: 28, bottom: 34, left: 58 };

    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);

    if (!series || series.length < 2) {
      drawEmpty(ctx, width, height, "数据不足");
      return;
    }

    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    if (Math.abs(max - min) < 0.000001) {
      max += 1;
      min -= 1;
    }

    var yMin = min - (max - min) * 0.12;
    var yMax = max + (max - min) * 0.12;
    var innerW = width - padding.left - padding.right;
    var innerH = height - padding.top - padding.bottom;

    drawGrid(ctx, padding, innerW, innerH, yMin, yMax);
    drawLine(ctx, series, padding, innerW, innerH, yMin, yMax);
    drawLabels(ctx, series, padding, innerW, innerH, yMin, yMax, options);
  }

  function drawBackground(ctx, width, height) {
    var gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(15, 23, 42, 0.3)");
    gradient.addColorStop(1, "rgba(2, 6, 23, 0.62)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGrid(ctx, padding, innerW, innerH, yMin, yMax) {
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.16)";
    ctx.lineWidth = 1;
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "rgba(148, 163, 184, 0.72)";

    for (var i = 0; i <= 4; i++) {
      var y = padding.top + innerH * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + innerW, y);
      ctx.stroke();

      var value = yMax - (yMax - yMin) * (i / 4);
      ctx.fillText(value.toFixed(2), 8, y + 4);
    }

    for (var j = 0; j <= 5; j++) {
      var x = padding.left + innerW * (j / 5);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + innerH);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLine(ctx, series, padding, innerW, innerH, yMin, yMax) {
    ctx.save();

    var points = series.map(function (value, index) {
      var x = padding.left + innerW * (index / Math.max(series.length - 1, 1));
      var y = padding.top + innerH * (1 - (value - yMin) / (yMax - yMin));
      return { x: x, y: y, value: value };
    });

    var area = ctx.createLinearGradient(0, padding.top, 0, padding.top + innerH);
    area.addColorStop(0, "rgba(56, 189, 248, 0.26)");
    area.addColorStop(1, "rgba(56, 189, 248, 0.02)");

    ctx.beginPath();
    points.forEach(function (point, index) {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + innerH);
    ctx.lineTo(points[0].x, padding.top + innerH);
    ctx.closePath();
    ctx.fillStyle = area;
    ctx.fill();

    ctx.beginPath();
    points.forEach(function (point, index) {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = "rgba(56, 189, 248, 0.92)";
    ctx.lineWidth = 3;
    ctx.stroke();

    var last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.95)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  function drawLabels(ctx, series, padding, innerW, innerH, yMin, yMax, options) {
    ctx.save();
    ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
    ctx.font = "bold 14px Microsoft YaHei, sans-serif";
    ctx.fillText(options.title || "走势", padding.left, 18);

    ctx.fillStyle = "rgba(148, 163, 184, 0.76)";
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.fillText("起点", padding.left, padding.top + innerH + 24);
    ctx.fillText("当前", padding.left + innerW - 28, padding.top + innerH + 24);

    var last = series[series.length - 1];
    ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
    ctx.font = "bold 13px Microsoft YaHei, sans-serif";
    ctx.fillText((options.prefix || "") + last.toFixed(2), padding.left + innerW - 72, padding.top + 18);
    ctx.restore();
  }

  function drawEmpty(ctx, width, height, message) {
    ctx.save();
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.font = "16px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, width / 2, height / 2);
    ctx.restore();
  }

  return {
    drawLineChart: drawLineChart
  };
})();
