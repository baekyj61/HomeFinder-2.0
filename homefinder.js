function loadFile() {
  d3.json("http://localhost:8080/properties_2017.json").then(data => {
    let geojson = {
      type: "FeatureCollection",
      features: [],
    };
    console.log("working")
    for (i = 0; i < data.length; i++) {
      if (data[i].taxvaluedollarcnt == "" || data[i].yearbuilt == "" ||
          data[i].roomcnt == "" || data[i].bathroomcnt == "" ||
          data[i].bedroomcnt == "" || data[i].garagecarcnt == "" ||
          data[i].calculatedfinishedsquarefeet == "" || data[i].regionidzip == "") {
        continue;
      }
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

  let zoom = d3.zoom()
              .scaleExtent([1,10])
              .on("zoom", zoomed);

  svg.call(zoom);
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

  let dots = svg.append("g");
  dots.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", "dots")
    .attr("r", "10")
    .on("mouseover", function(d) {
      let xPosition = d3.event.pageX + 12;
      let yPosition = d3.event.pageY - 75;
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
      d3.select("#tooltip1")
        .text(d.properties.taxvaluedollarcnt);
      d3.select("#tooltip2")
        .text(d.properties.yearbuilt);
      d3.select("#tooltip3")
        .text(d.properties.roomcnt);
      d3.select("#tooltip4")
        .text(d.properties.bathroomcnt);
      d3.select("#tooltip")
        .classed("hidden", false);
    })
    .on("mouseout", function(){
      d3.select("#tooltip").classed("hidden", true);
    })
    .on("click", function(d) {
      d3.select("#cost")
        .text(`Cost: ${d.properties.taxvaluedollarcnt}`);
      d3.select("#yb")
        .text(`Year Built: ${d.properties.yearbuilt}`);
      d3.select("#rc")
        .text(`Room Count: ${d.properties.roomcnt == "" ? 0 : d.properties.roomcnt}`);
      d3.select("#bathC")
        .text(`Bathroom Count: ${d.properties.bathroomcnt == "" ? 0 : d.properties.bathroomcnt}`);
      d3.select("#bedC")
        .text(`Bedroom Count: ${d.properties.bedroomcnt == "" ? 0 : d.properties.bedroomcnt}`);
      d3.select("#gc")
        .text(`Garage Count: ${d.properties.garagecarcnt == "" ? 0 : d.properties.garagecarcnt}`);
      d3.select("#garageSquareFeet")
        .text(`Total Garage Square Feet: ${d.properties.garagetotalsqft == "" ? 0 : d.properties.garagetotalsqft}`);
      d3.select("#squareFeet")
        .text(`Total Square Feet: ${d.properties.calculatedfinishedsquarefeet}`);
      d3.select("#fireplace")
        .text(`Fireplace Count: ${d.properties.fireplacecnt == "" ? 0 : d.properties.fireplacecnt}`);
      d3.select("#poolCount")
        .text(`Pool Count: ${d.properties.poolcnt == "" ? 0 : d.properties.poolcnt}`);
      d3.select("#zip")
        .text(`Zip Code: ${d.properties.regionidzip  == "" ? "" : d.properties.regionidzip - 5000}`);
      d3.selectAll("#brHide")
        .style("display", "none");
    });

  document.getElementById("clear").addEventListener("click", function(){
    dots.selectAll("path").style("display", "block");
  });

  document.getElementById("submit").addEventListener("click", function(){
    let minCost = document.getElementById("costMin").value;
    let maxCost = document.getElementById("costMax").value;
    let minYearbuilt = document.getElementById("yearBuiltMin").value;
    let maxYearbuilt = document.getElementById("yearBuiltMax").value;
    let roomCount = document.getElementById("roomCount").value;
    let bathroomCount = document.getElementById("bathCount").value;
    let bedroomCount = document.getElementById("bedCount").value;
    let garageCount = document.getElementById("garageCount").value;

    dots.selectAll("path").style("display", function(d) {
      let show1 = true;
      let show2 = true;
      let show3 = true;
      let show4 = true;
      let show5 = true;
      let show6 = true;
      if (minCost != "" || maxCost != "") {
        if (minCost == "") {
          if (Number(d.properties.taxvaluedollarcnt) <= Number(maxCost)) {
            show1 = true;
          } else {
            show1 = false;
          }
        } else if (maxCost == "") {
          if (Number(d.properties.taxvaluedollarcnt) >= Number(minCost)) {
            show1 = true;
          } else {
            show1 = false;
          }
        } else if (minCost < maxCost) {
          if (Number(d.properties.taxvaluedollarcnt) >= Number(minCost) &&
              Number(d.properties.taxvaluedollarcnt) <= Number(maxCost)) {
            show1 = true;
          } else {
            show1 = false;
          }
        }
      }
      if (minYearbuilt != "" || maxYearbuilt != "") {
        if (minYearbuilt == "") {
          if (Number(d.properties.yearbuilt) <= Number(maxYearbuilt)) {
            show2 = true;
          } else {
            show2 = false;
          }
        } else if (maxYearbuilt == "") {
          if (Number(d.properties.yearbuilt) >= Number(minYearbuilt)) {
            show2 = true;
          } else {
            show2 = false;
          }
        } else if (minYearbuilt < maxYearbuilt) {
          if (Number(d.properties.yearbuilt) >= Number(minYearbuilt) &&
              Number(d.properties.yearbuilt) <= Number(maxYearbuilt)) {
            show2 = true;
          } else {
            show2 = false;
          }
        }
      }
      if (roomCount != "") {
        if (Number(d.properties.roomcnt) >= Number(roomCount)) {
          show3 = true;
        } else {
          show3 = false;
        }
      }
      if (bathroomCount != "") {
        if (Number(d.properties.bathroomcnt) >= Number(bathroomCount)) {
          show4 = true;
        } else {
          show4 = false;
        }
      }
      if (bedroomCount != "") {
        if (Number(d.properties.bedroomcnt) >= Number(bedroomCount)) {
          show5 = true;
        } else {
          show5 = false;
        }
      }
      if (garageCount != "") {
        if (Number(d.properties.garagecarcnt) >= Number(garageCount)) {
          show6 = true;
        } else {
          show6 = false;
        }
      }
      if (show1 && show2 && show3 && show4 && show5 && show6) {
        return "block";
      } else {
        return "none";
      }
    });
  });

  function zoomed() {
    california.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    california.attr("transform", d3.event.transform); 
    dots.attr("transform", d3.event.transform);
  }
}