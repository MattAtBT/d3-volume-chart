var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var color = d3.scale.category10();

color.domain(["Apple", "AirWatch", "BlackBerry", "Other"]); //TODO: get unique platforms from data