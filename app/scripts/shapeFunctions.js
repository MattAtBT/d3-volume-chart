var line = d3.svg.line()
  	.interpolate("linear")
  	.x(function(d) { return x(d.time); })
  	.y(function(d) { return y(d.volume); });

var line2 = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return x2(d.time); })
    .y(function(d) { return y2(d.volume); });

var dragLine = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });		

var areaAbs = d3.svg.area()
    .interpolate("linear")
    .x(function(d) { return x(d.time); })
    .y0(function(d) { return y(d.abs_low); })
    .y1(function(d) { return y(d.abs_high); });

var areaSd2 = d3.svg.area()
    .interpolate("linear")
    .x(function(d) { return x(d.time); })
    .y0(function(d) { return y(d.normal_low2_adj); })
    .y1(function(d) { return y(d.normal_high2); });

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");