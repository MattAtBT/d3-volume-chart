var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

var bisectDate = d3.bisector(function(d) { return d.time; }).right;

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tool-tip");

var optionsArea = d3.select("body").append("div")
	.attr("class", "optionsArea");

var svg = d3.select("body").append("svg")
		.attr("id", "svgContainer")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

createOptions();

setupChart();