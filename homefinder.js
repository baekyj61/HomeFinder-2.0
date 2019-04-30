function loadFile() {
  d3.json("http://localhost:8080/properties_2017.json").then(data => {
    let geojson = {
      type: "FeatureCollection",
      features: [],
    };
    
    for (i = 0; i < data.length; i++) {
      let longitude = data[i].longitude.split("");
      let latitude = data[i].latitude.split("");
      longitude.splice(4,0,".");
      latitude.splice(2,0,".");
      longitude = longitude.join("");
      latitude = latitude.join("");
      geojson.features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [Number(longitude), Number(latitude)]
        },
        "properties": data[i]
      });
    }
    mapPoints(geojson);
  });
}

function mapPoints(geojson) {
  let canvas = document.getElementById("vis");
  let width = parseInt(canvas.getAttribute("width"));
  let height = parseInt(canvas.getAttribute("height"));
  let svg = d3.select(canvas);
  let california = svg.append("g");
  let projection = d3.geoMercator()
                   .center([ -120, 37 ])
                   .translate([ width/2, height/2 ])
                   .scale([ width*3.3 ]);

  let path = d3.geoPath().projection(projection);

  california.selectAll("path")
    .data(california_json.features)
    .enter()
    .append("path")
    .attr("id", "county")
    .attr("d", path);
    // .on("mouseover", function(d){
    //   let xPosition = width / 2 + 150;
    //   let yPosition = height / 2;
    //   d3.select("#tooltip")
    //   .style("left", xPosition + "px")
    //   .style("top", yPosition + "px");
    //   d3.select("#county")
    //   .text(d.properties.NAME);
    //   d3.select("#tooltip")
    //   .classed("hidden", false);
    //   })
    //   .on("mouseout", function(){
    //   d3.select("#tooltip").classed("hidden", true);
    // });

  let dots = svg.append("g");
  dots.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", "dots");

}