var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

var bisectDate = d3.bisector(function(d) { return d.time; }).right;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var color = d3.scale.category10();

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var selectBrush = d3.svg.brush()
		.x(x)
		.y(y)
	.on("brushend", selectByBrush);

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tool-tip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip");

var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.volume); });

var line2 = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return x2(d.time); })
    .y(function(d) { return y2(d.volume); });

var manipulations = d3.select("body").append("div")
	.attr("class", "manipulations");

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

d3.csv("cvs.csv", type, function(error, data) {
  x.domain(d3.extent(data.map(function(d) { return d.time; })));
  y.domain([0, d3.max(data.map(function(d) { return d.volume; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  color.domain(["Apple", "AirWatch", "BlackBerry", "Other"]);

  var ucObj = {};
  var uniqueClients = [];
  for(i=0;i<data.length;i++) ucObj[data[i].device] = data[i].device;
  for(i in ucObj) uniqueClients.push(ucObj[i]);

  var uctObj = {};
  var uniqueClientTypes = [];
  for(i=0;i<data.length;i++) uctObj[data[i].client] = data[i].client;
  for(i in uctObj) uniqueClientTypes.push(uctObj[i]);

  var freeSelectArea = manipulations.append("div")
			.attr("class", "freeSelectArea");

	freeSelectArea.append("h3")
			.text("Free Select Mode");

	var freeSelectOptions = freeSelectArea.append("div")
			.attr("class", "freeSelectOptions");

	freeSelectOptions.append("label")
		.text("Enable");

	freeSelectOptions.append("input")
			.attr("type", "checkbox")
		.on("click", function() {
			if(this.checked) {
				focus.append("g")
      		.attr("class", "x brush selectBrush")
      	.call(selectBrush)
    			.selectAll("rect");
			} else {
					focus.select(".selectBrush").remove();
			}
	});	

  var coloringOptionsArea = manipulations.append("div")
			.attr("class", "coloringOptions");

	coloringOptionsArea.append("h3")
		.text("Color By");

	var option1 = coloringOptionsArea.append("div")
		.attr("class", "colorOpt");

	option1.append("label")
		.text("Client Type");

	option1.append("input")
			.attr("type", "checkbox")
		.on("click", function() {
			for(i = 0; i < color.domain().length; i++) {
				d3.selectAll("[data-client-platform=" + color.domain()[i] + "]").style("stroke", this.checked ? color(color.domain()[i]) : "grey");
			}
		});

  var filterArea = manipulations.append("div")
			.attr("class", "dataFilters");

	filterArea.append("h3")
		.text("Show Devices");

	filter = filterArea.selectAll(".filter")
			.data(color.domain())
		.enter().append("div")
			.attr("class", "filter");

	filter.append("label")
		.text(function(d) { return d; });

	filter.append("input")
			.attr("type", "checkbox")
			.attr("checked", "true")
		.on("click", function(d) {
			d3.selectAll("[data-client-platform=" + d + "]").attr("visibility", this.checked ? "visible" : "hidden");
		});

  var clients = uniqueClients.map(function(name) {
    return {
      device: name,
      values: data.map(function(d) {
        if(d.device == name) {
        	var cp = 'Other';

        	if(d.client.indexOf("Apple") != -1)
        		cp = "Apple";
        	else if(d.client.indexOf("AirWatch") != -1)
        		cp = "AirWatch";
        	else if(d.client.indexOf("RIM") != -1)
        		cp = "BlackBerry";

          return {device: d.device, time: d.time, volume: +d.volume, client: d.client, clientPlatform: cp};
        }
      })
    };
  });

  clients.forEach(function(c) {
    c.values = c.values.filter(function(n){ return n != undefined });
  });
  
  var client = focus.selectAll(".client")
      .data(clients)
    .enter().append("g")
      .attr("class", "client");

  client.append("path")
    .attr("class", "line data-line")
    .attr("data-client-id", function(d) {return d.values[0].device}) 
    .attr("data-client-platform", function(d) {return d.values[0].clientPlatform}) 
    .attr("data-client", function(d) {return d.values[0].client}) // TODO: what happens when version changes mid-line?
    .attr("d", function(d) { return line(d.values); })

  client.append("path")
      .attr("class", "select-line")
      .attr("d", function(d) { return line(d.values); })
      .on("mouseover", function(d){
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function(d){
        var mouseX = d3.mouse(this)[0];
        var xValue = x.invert(mouseX);
        var index = bisectDate(d.values, xValue);

        var formattedDetails = '<h3>Client Instance #' + d.device + '</h3>' +
          '<div><strong>Client</strong>: ' + d.values[index].client + '</div>' +
          '<div><strong>Time</strong>: ' + d.values[index].time + '</div>' +
          '<div><strong>Command Volume</strong>: ' + d.values[index].volume + '</div>';

        tooltip.html(formattedDetails)           
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var contextClient = context.selectAll(".client")
      .data(clients)
    .enter().append("g")
      .attr("class", "client");

  contextClient.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line2(d.values.filter(function(n){ return n != undefined })); });

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);
});

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.selectAll(".line").attr("d", function(col) {return line(col.values);});
  focus.selectAll(".select-line").attr("d", function(col) {return line(col.values);});
  focus.select(".x.axis").call(xAxis);
}

function selectByBrush() {
	var ext = selectBrush.extent();

	var minTime = ext[0][0];
	var maxTime = ext[1][0];
	var minVol = ext[0][1];
	var maxVol = ext[1][1];

	focus.selectAll(".line").attr("visibility", "hidden");
	var dataLines = focus.selectAll(".line")[0];

	for(i=0;i<dataLines.length;i++) {
		var dlValues = dataLines[i].__data__.values;

		for(j=0;j<dlValues.length;j++) {
			timeVal = dlValues[j].time;
			volVal = dlValues[j].volume;
			if(timeVal >= minTime && timeVal <= maxTime && volVal >= minVol && volVal <= maxVol) {
				dataLines[i].attributes.visibility.value = "visible";
				continue;
			}
		}
	}
}

function type(d) {
  d.time = parseDate(d.time);
  d.volume = +d.volume;
  return d;
}