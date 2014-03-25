function createOptions() {
  var coloringOptionsArea = optionsArea.append("div")
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
				d3.selectAll("[data-client-platform=" + color.domain()[i] + "]").style("stroke", this.checked ? color(color.domain()[i]) : "black");
			}
		});

  var filterArea = optionsArea.append("div")
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
}

function setupChart() {
	d3.csv("cvs_stats.csv", statsType, function(error, data) {
	  x.domain(d3.extent(data.map(function(d) { return d.time; })));
	  y.domain([0, d3.max(data.map(function(d) { return d.abs_high; }))]);
	  x2.domain(x.domain());
	  y2.domain(y.domain());

	  focus.append("path")
			.datum([
					{x: 0 ,y: height},
					{x: dragLineWidth, y: height},
				])
			.attr("class", "drag-line")
			.attr("d", dragLine)
		.call(drag);

	  createStatisticsAreas(data);

	  createDataLines();
	});
}

function createStatisticsAreas(data) {
	focus.append("path")
    .datum(data)
    .attr("class", "area-abs")
    .attr("d", areaAbs);

	focus.append("path")
    .datum(data)
		.attr("class", "area-sd")
    .attr("d", areaSd2);
}

function createDataLines() {
	d3.csv("cvs_top.csv", type, function(error, data) {
		var clients = buildClientCollection(data);
		createFocusArea(clients);
	  createContextArea(clients);
	});
}

function buildClientCollection(data) {
	var ucObj = {};
  var uniqueClients = [];
  for(i=0;i<data.length;i++) ucObj[data[i].device] = data[i].device;
  for(i in ucObj) uniqueClients.push(ucObj[i]);

  var uctObj = {};
  var uniqueClientTypes = [];
  for(i=0;i<data.length;i++) uctObj[data[i].client] = data[i].client;
  for(i in uctObj) uniqueClientTypes.push(uctObj[i]);

  var clients = uniqueClients.map(function(name) {
    return {
      device: name,
      values: data.map(function(d) {
        if(d.device == name) {
        	var cp = 'Other';

        	//TODO: return client platform with each data item
        	if(d.client.indexOf("Apple") != -1)
        		cp = "Apple";
        	else if(d.client.indexOf("AirWatch") != -1)
        		cp = "AirWatch";
        	else if(d.client.indexOf("RIM") != -1)
        		cp = "BlackBerry";

          return {
          	device: d.device, 
          	time: d.time, 
          	volume: +d.volume, 
          	client: d.client, 
          	clientPlatform: cp};
        }
      })
    };
  });

  clients.forEach(function(c) {
    c.values = c.values.filter(function(n){ return n != undefined });
  });

  return clients;
}

function createFocusArea(clients) {
  var client = focus.selectAll(".client")
      .data(clients)
    .enter().append("g")
      .attr("class", "client");

  client.append("path")
    .attr("class", "line data-line")
    .attr("data-client-id", function(d) {return d.values[0].device}) 
    .attr("data-client-platform", function(d) {return d.values[0].clientPlatform}) 
    .attr("data-client", function(d) {return d.values[0].client})
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

       	if(d.values[index]) {
	        var formattedDetails = '<h3>Client Instance #' + d.device + '</h3>' +
	          '<div><strong>Client</strong>: ' + d.values[index].client + '</div>' +
	          '<div><strong>Time</strong>: ' + d.values[index].time + '</div>' +
	          '<div><strong>Command Volume</strong>: ' + d.values[index].volume + '</div>';

	        tooltip.html(formattedDetails)           
	        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
	      }
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);	
}

function createContextArea(clients) {
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
}