function statsType(d) {
	d.time = parseDate(d.for_time);
	d.abs_high = +d.abs_high;
	d.abs_low = +d.abs_low;
	d.normal_low1 = +d.normal_low1;
	d.normal_low1_adj = +d.normal_low1_adj;
	d.normal_high1 = +d.normal_high1;
	d.normal_low2 = +d.normal_low2;
	d.normal_low2_adj = +d.normal_low2_adj;
	d.normal_high2 = +d.normal_high2;
	return d;
}

function type(d) {
  d.time = parseDate(d.time);
  d.volume = +d.volume;
  return d;
}