var drag = d3.behavior.drag()
    .on("drag", dragmove);

var brush = d3.svg.brush()
    .x(x2)
  .on("brush", brushed);

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.selectAll(".line").attr("d", function(col) {return line(col.values);});
  focus.selectAll(".select-line").attr("d", function(col) {return line(col.values);});

  focus.selectAll(".area-abs").attr("d", function(col) {return areaAbs(col);});
  focus.selectAll(".area-sd").attr("d", function(col) {return areaSd2(col);});

  focus.select(".x.axis").call(xAxis);
}

function dragmove(d) {
	var boundedY = Math.max(0, Math.min(d3.event.y,height));
	var yMax = y.invert(boundedY); // get command volume value from pixel value

	d3.select(this)
  	.datum([
			{x: 0 ,y: boundedY},
			{x: dragLineWidth, y: boundedY},
		])
  	.attr("d", function(val) {return dragLine(val);});

	focus.selectAll(".line").attr("visibility", "hidden");
	var dataLines = focus.selectAll(".line")[0];

	for(i=0;i<dataLines.length;i++) {
		var dlValues = dataLines[i].__data__.values;

		for(j=0;j<dlValues.length;j++) {
			volVal = dlValues[j].volume;
			if(volVal >= yMax) {
				dataLines[i].attributes.visibility.value = "visible";
				continue;
			}
		}
	}
}