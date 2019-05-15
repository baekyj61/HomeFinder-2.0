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
  let currentHouse = null;
  let currentDot = null;
  let compButtonClicked = false;
  let house1Filled = false;
  let house2Filled = false;
  let house3Filled = false;
  let house1 = null;
  let house2 = null;
  let house3 = null;
  let id1 = null;
  let id2 = null;
  let id3 = null;
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
    .attr("d", path.pointRadius(6))
    .attr("id", "dots")
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
        .text(d.properties.bedroomcnt);
      d3.select("#tooltip4")
        .text(d.properties.bathroomcnt);
      d3.select("#tooltip")
        .classed("hidden", false);
    })
    .on("mouseout", function(){
      d3.select("#tooltip").classed("hidden", true);
    })
    .on("click", function(d) {
      currentHouse = d.properties;

      if (!house1Filled || !house2Filled || !house3Filled) {
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
      }

      if(!compButtonClicked) {
        if (currentDot != null) {
          d3.select(currentDot).style("fill", "#FF0000");
        }
        currentDot = this;
        d3.select(this).style("fill", "#0000FF");
        
      } else {
        if (house1Filled && house2Filled && house3Filled) {
          alert("Please clear at least 1 house info to compare another house.");

        } else if (!house1Filled) {
          d3.select(this).style("fill", "#0000FF");
          fillHouse1(currentHouse);
          house1Filled = true;
          house1 = this;
          id1 = d.properties.parcelid;
          d3.select("#intro1").style("display", "none");

        } else if (!house2Filled) {
          d3.select(this).style("fill", "#06DC19");
          fillHouse2(currentHouse);
          house2Filled = true;
          house2 = this;
          id2 = d.properties.parcelid;
          d3.select("#intro2").style("display", "none");

        } else if (!house3Filled) {
          d3.select(this).style("fill", "#8806DC");
          fillHouse3(currentHouse);
          house3Filled = true;
          house3 = this;
          id3 = d.properties.parcelid;
          d3.select("#intro3").style("display", "none");
        }
      }

    });

  document.getElementById("clearHouse1").addEventListener("click", function() {
    clearHouse1();
    house1Filled = false;
    d3.select("#intro1").style("display", "block");
    if (house1 != null) {
      d3.select(house1).style("fill", "#FF0000");
      house1 = null;
      id1 = null;
    }
  });

  document.getElementById("clearHouse2").addEventListener("click", function() {
    clearHouse2();
    house2Filled = false;
    d3.select("#intro2").style("display", "block");
    if (house2 != null) {
      d3.select(house2).style("fill", "#FF0000");
      house2 = null;
      id2 = null;
    }
  });

  document.getElementById("clearHouse3").addEventListener("click", function() {
    clearHouse3();
    house3Filled = false;
    d3.select("#intro3").style("display", "block");
    if (house3 != null) {
      d3.select(house3).style("fill", "#FF0000");
      house3 = null;
      id3 = null;
    }
  });

  document.getElementById("compareButton").addEventListener("click", function() {
    if (!compButtonClicked) {
      d3.select("#compareBox").style("display", "block");
      compButtonClicked = true;

      if (currentHouse != null) {
        d3.select("#intro1").style("display", "none");
        fillHouse1(currentHouse);
        house1Filled = true;
      }
    } else {
      d3.select("#compareBox").style("display", "none");
      compButtonClicked = false;
      clearCurrent();
      clearHouse1();
      clearHouse2();
      clearHouse3();
      currentHouse = null;
      currentDot = null;
      house1Filled = false;
      house2Filled = false;
      house3Filled = false;
      d3.select("#intro1").style("display", "block");
      d3.select("#intro2").style("display", "block");
      d3.select("#intro3").style("display", "block");
      if (house1 != null) {
        d3.select(house1).style("fill", "#FF0000");
      }
      if (house2 != null) {
        d3.select(house2).style("fill", "#FF0000");
      }
      if (house3 != null) {
        d3.select(house3).style("fill", "#FF0000");
      }
    }
  });

  document.getElementById("clearButton").addEventListener("click", function() {
    if (!compButtonClicked) {
      d3.select(currentDot).style("fill", "#FF0000");
    }
    clearCurrent();
    currentHouse = null;
    currentDot = null;
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

    if (!compButtonClicked) {
      d3.select(currentDot).style("fill", "#FF0000");
      clearCurrent();
      currentHouse = null;
      currentDot = null;
    }

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

  function fillHouse1(info1) {
    d3.select("#cost1")
      .text(`Cost: ${info1.taxvaluedollarcnt}`);
    d3.select("#yb1")
      .text(`Year Built: ${info1.yearbuilt}`);
    d3.select("#rc1")
      .text(`Room Count: ${info1.roomcnt == "" ? 0 : info1.roomcnt}`);
    d3.select("#bathC1")
      .text(`Bathroom Count: ${info1.bathroomcnt == "" ? 0 : info1.bathroomcnt}`);
    d3.select("#bedC1")
      .text(`Bedroom Count: ${info1.bedroomcnt == "" ? 0 : info1.bedroomcnt}`);
    d3.select("#gc1")
      .text(`Garage Count: ${info1.garagecarcnt == "" ? 0 : info1.garagecarcnt}`);
    d3.select("#garageSquareFeet1")
      .text(`Total Garage Square Feet: ${info1.garagetotalsqft == "" ? 0 : info1.garagetotalsqft}`);
    d3.select("#squareFeet1")
      .text(`Total Square Feet: ${info1.calculatedfinishedsquarefeet}`);
    d3.select("#fireplace1")
      .text(`Fireplace Count: ${info1.fireplacecnt == "" ? 0 : info1.fireplacecnt}`);
    d3.select("#poolCount1")
      .text(`Pool Count: ${info1.poolcnt == "" ? 0 : info1.poolcnt}`);
    d3.select("#zip1")
      .text(`Zip Code: ${info1.regionidzip  == "" ? "" : info1.regionidzip - 5000}`);
  }

  function fillHouse2(info2) {
    d3.select("#cost2")
      .text(`Cost: ${info2.taxvaluedollarcnt}`);
    d3.select("#yb2")
      .text(`Year Built: ${info2.yearbuilt}`);
    d3.select("#rc2")
      .text(`Room Count: ${info2.roomcnt == "" ? 0 : info2.roomcnt}`);
    d3.select("#bathC2")
      .text(`Bathroom Count: ${info2.bathroomcnt == "" ? 0 : info2.bathroomcnt}`);
    d3.select("#bedC2")
      .text(`Bedroom Count: ${info2.bedroomcnt == "" ? 0 : info2.bedroomcnt}`);
    d3.select("#gc2")
      .text(`Garage Count: ${info2.garagecarcnt == "" ? 0 : info2.garagecarcnt}`);
    d3.select("#garageSquareFeet2")
      .text(`Total Garage Square Feet: ${info2.garagetotalsqft == "" ? 0 : info2.garagetotalsqft}`);
    d3.select("#squareFeet2")
      .text(`Total Square Feet: ${info2.calculatedfinishedsquarefeet}`);
    d3.select("#fireplace2")
      .text(`Fireplace Count: ${info2.fireplacecnt == "" ? 0 : info2.fireplacecnt}`);
    d3.select("#poolCount2")
      .text(`Pool Count: ${info2.poolcnt == "" ? 0 : info2.poolcnt}`);
    d3.select("#zip2")
      .text(`Zip Code: ${info2.regionidzip  == "" ? "" : info2.regionidzip - 5000}`);
  }

  function fillHouse3(info3) {
    d3.select("#cost3")
      .text(`Cost: ${info3.taxvaluedollarcnt}`);
    d3.select("#yb3")
      .text(`Year Built: ${info3.yearbuilt}`);
    d3.select("#rc3")
      .text(`Room Count: ${info3.roomcnt == "" ? 0 : info3.roomcnt}`);
    d3.select("#bathC3")
      .text(`Bathroom Count: ${info3.bathroomcnt == "" ? 0 : info3.bathroomcnt}`);
    d3.select("#bedC3")
      .text(`Bedroom Count: ${info3.bedroomcnt == "" ? 0 : info3.bedroomcnt}`);
    d3.select("#gc3")
      .text(`Garage Count: ${info3.garagecarcnt == "" ? 0 : info3.garagecarcnt}`);
    d3.select("#garageSquareFeet3")
      .text(`Total Garage Square Feet: ${info3.garagetotalsqft == "" ? 0 : info3.garagetotalsqft}`);
    d3.select("#squareFeet3")
      .text(`Total Square Feet: ${info3.calculatedfinishedsquarefeet}`);
    d3.select("#fireplace3")
      .text(`Fireplace Count: ${info3.fireplacecnt == "" ? 0 : info3.fireplacecnt}`);
    d3.select("#poolCount3")
      .text(`Pool Count: ${info3.poolcnt == "" ? 0 : info3.poolcnt}`);
    d3.select("#zip3")
      .text(`Zip Code: ${info3.regionidzip  == "" ? "" : info3.regionidzip - 5000}`);
  }

  function clearCurrent() {
    d3.select("#cost").text("");
    d3.select("#yb").text("");
    d3.select("#rc").text("");
    d3.select("#bathC").text("");
    d3.select("#bedC").text("");
    d3.select("#gc").text("");
    d3.select("#garageSquareFeet").text("");
    d3.select("#squareFeet").text("");
    d3.select("#fireplace").text("");
    d3.select("#poolCount").text("");
    d3.select("#zip").text("");
    d3.selectAll("#brHide")
      .style("display", "block");
  }

  function clearHouse1() {
    d3.select("#intro1").style("display", "block");
    d3.select("#cost1").text("");
    d3.select("#yb1").text("");
    d3.select("#rc1").text("");
    d3.select("#bathC1").text("");
    d3.select("#bedC1").text("");
    d3.select("#gc1").text("");
    d3.select("#garageSquareFeet1").text("");
    d3.select("#squareFeet1").text("");
    d3.select("#fireplace1").text("");
    d3.select("#poolCount1").text("");
    d3.select("#zip1").text("");
  }

  function clearHouse2() {
    d3.select("#intro2").style("display", "block");
    d3.select("#cost2").text("");
    d3.select("#yb2").text("");
    d3.select("#rc2").text("");
    d3.select("#bathC2").text("");
    d3.select("#bedC2").text("");
    d3.select("#gc2").text("");
    d3.select("#garageSquareFeet2").text("");
    d3.select("#squareFeet2").text("");
    d3.select("#fireplace2").text("");
    d3.select("#poolCount2").text("");
    d3.select("#zip2").text("");
  }

  function clearHouse3() {
    d3.select("#intro3").style("display", "block");
    d3.select("#cost3").text("");
    d3.select("#yb3").text("");
    d3.select("#rc3").text("");
    d3.select("#bathC3").text("");
    d3.select("#bedC3").text("");
    d3.select("#gc3").text("");
    d3.select("#garageSquareFeet3").text("");
    d3.select("#squareFeet3").text("");
    d3.select("#fireplace3").text("");
    d3.select("#poolCount3").text("");
    d3.select("#zip3").text("");
  }

  function zoomed() {
    california.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    california.attr("transform", d3.event.transform);
    dots.selectAll("#dots").attr("d", path.pointRadius(6/d3.event.transform.k));
    dots.selectAll("#dots").style("stroke-width", 1.5/d3.event.transform.k + "px");
    dots.attr("transform", d3.event.transform);
  }
}