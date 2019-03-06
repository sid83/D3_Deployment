// function to be called when window is resized
d3.select(window).on("resize", makeResponsive);

makeResponsive();
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  };
  // Step1: Define variables with figure canvas size and margins relative to window size
  var svgWidth = window.innerWidth - 120;
  var svgHeight = window.innerHeight -150;
  // var svgHeight = 500;
  // var svgWidth = 960;
  var margin = {
    top: 60,
    right: 300,
    bottom: 100,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // step2: Create svg group (or canvas to draw chart)
  var svg = d3.select("#scatter").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
    // Append SVG group that will hold chart
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // step3: function used for updating x-scale and y-scale var upon click on axis label

  // Initial Params
  var chosenXAxis = "poverty";  // poverty
  var chosenYAxis = "obesity";  // obesity
  function xyscale (data, chosenXAxis, chosenYAxis) {
    if (chosenXAxis !== "income") {
      var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d=>d[chosenXAxis])-1, d3.max(data, d=>d[chosenXAxis])] )
      .range([0, width]);
    }
    else {
      var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d=>d[chosenXAxis])-4000, d3.max(data, d=>d[chosenXAxis])] )
      .range([0, width]);

    }
                        
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d=>d[chosenYAxis])-1, d3.max(data, d=>d[chosenYAxis])] )
      .range([height, 0]);
    return [xLinearScale, yLinearScale];
  };

  // step4: function used for updating x and y axis
  function renderAxis (newXScale, newYScale, xAxis, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return [xAxis, yAxis];
  };

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    // .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
  }

  function stateAbbrs(circleAbbr, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleAbbr.transition()
      .duration(1000)
      .attr("dx", d=> newXScale(d[chosenXAxis]))
      .attr("dy", d=> newYScale(d[chosenYAxis])+5)
    return circleAbbr;
  };

  // Step5: function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    // .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
    })
    // onmouseout event
    .on("mouseout", function(d, index) {
      toolTip.hide(d);
    });

   return circlesGroup;
  };

  // step6: Retrieve data from csv file and plot
  const url = "https://raw.githubusercontent.com/sid83/D3-Visualization/master/data.csv"
  d3.csv(url).then(succesHandle, errorHandle);
  function errorHandle(error) {console.log(error)};

  function succesHandle(data) {
      console.log(data)
      // parse data
      data.forEach(d=> {
        d.poverty = +d.poverty; d.age = +d.age; d.income = +d.income;
        d.obesity = +d.obesity; d.smokes = +d.smokes; d.healthcare = +d.healthcare;
      });
    // step6a x and y scale
    var scale = xyscale(data, chosenXAxis, chosenYAxis);
    var xScale = scale[0];
    var yScale = scale[1];

    // step6b: Create initial axis functions
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // step6c: append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // step6d: append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

      // step7: append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[chosenXAxis]))
    .attr("cy", d => yScale(d[chosenYAxis]))
    .attr("r", 10)
    .classed("stateCircle", true)
    // .attr("fill", "pink")
    // .attr("opacity", ".5");

    // State Abbreviations on circles
    var circleAbbr = chartGroup.append("g").selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .classed("stateText", true)
            .text(d=> d.abbr)
            .attr("dx", d=> xScale(d[chosenXAxis]))
            .attr("dy", d=> yScale(d[chosenYAxis])+5)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            ;
    // console.log("circle abbr:" + circleAbbr)
      // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (median)");

      // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left+12)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left+12+20)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left+12+20+20)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");



    // updateToolTip function defined above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

    // EVENT LISTENERS
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        // console.log(value)
        // console.log(chosenXAxis)
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x,y scale for new data
          xLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[0];
          yLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[1];
        
        // updates x,y axis with transition
          xAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[0];
          yAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[1];
        
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          // update state abbr. locations 
          circleAbbr = stateAbbrs(circleAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis); 
          // console.log("circle abbr:" + circleAbbr)

              // changes classes to change bold axis label text
          if (chosenXAxis === "poverty") {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          }
          else if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          }
          else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false)
          } 


        }
        // console.log(chosenXAxis)
      });


    // EVENT LISTENERS (YAXIS)
    // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        // console.log(value)
        // console.log(chosenYAxis)
        if (value !== chosenYAxis) {

          // replaces chosenYAxis with value
          chosenYAxis = value;

          // functions here found above csv import
          // updates x,y scale for new data
          xLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[0];
          yLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[1];
        
        // updates x,y axis with transition
          xAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[0];
          yAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[1];
        
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          
          // update state abbr. locations 
          circleAbbr = stateAbbrs(circleAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis); 

              // changes classes to change bold axis label text
          if (chosenYAxis === "obesity") {
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true)
          }
          else if (chosenYAxis === "smokes") {
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true)
          }
          else {
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false)
          } 


        }
        // console.log(chosenXAxis)
      });
  }
}






