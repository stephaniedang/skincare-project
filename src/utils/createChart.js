import * as d3 from 'd3';

const categoryColors = {
  "Skin Type": "#fc7174",
  "Skin Concern": "#eb6859",
  "SPF Range": "#fc8862",
  "Formulation Type": "#fda26b",
  "UVA Rating": "#fdbb63",
}

function getNodeColor(node) {
  if (node.depth === 1) {
    return categoryColors[node.data.name] || "#cccccc";
  } else {
    let parent = node.parent;
    while (parent.depth > 1) {
      parent = parent.parent;
    }

    const parentColor = categoryColors[parent.data.name] || "#cccccc";

    const siblings = parent.children;
    const maxSiblingValue = Math.max(...siblings.map(d => d.value));
    const minSiblingValue = Math.min(...siblings.map(d => d.value));

    const scale = d3.scaleLinear()
                    .domain([minSiblingValue, maxSiblingValue])
                    .range([0.8, 0.2]);

    const relativeValueScale = scale(node.value);

    return d3.interpolate(parentColor, d3.rgb(parentColor).brighter(1.5))(relativeValueScale);
  }
}

function truncateText(text, maxLength) {
  const minVisibleChars = 12;
  const adjustedMaxLength = Math.max(minVisibleChars, maxLength);
  
  return text.length > adjustedMaxLength ? text.substring(0, adjustedMaxLength - 1) + '…' : text;
}

export function createChart(svgElement, data, options) {
    // Specify the chart’s dimensions.
    const { width, height, radius } = options;

    // Clear previous SVG contents if any
    d3.select(svgElement).selectAll("*").remove();
  
    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  
    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy);
    root.each(d => d.current = d);
  
    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const arcSelected = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius * 1.08));
  
    // Create the SVG container.
    const svg = d3.select(svgElement)
        .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif");
  
    // Append the arcs.
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
        .attr("fill", d => getNodeColor(d.current))
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.80 : 0.2) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current));
  
    // Make them clickable if they have children.
    path.style("cursor", "pointer")
        .on("click", clicked);
  
    const format = d3.format(",d");
    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
  
    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => {
          if (!d.children) {
            const innerRadius = (d.y0 * radius + d.y1 * radius) / 2;
            const arcLength = (d.x1 - d.x0) * innerRadius;

            const avgCharWidth = 6;
            const maxLength = Math.floor(arcLength / avgCharWidth);

            return truncateText(d.data.name, maxLength);
          } else {
            return d.data.name;
          }
        });
  
    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    // handle inner tooltip details
    function displaySunscreenDetails(node) {
      svg.selectAll(".sunscreen-details").remove();
  
      // Define the inner area for the details display
      const detailsGroup = svg.append("g")
                              .attr("class", "sunscreen-details")
                              .attr("transform", `translate(0,0)`);
  
      const details = [
          `${node.data.name}`,
      ];
  
      // Calculate the available circumference for text
      const innerRadius = radius * 0.5;
      const circumference = 2 * Math.PI * innerRadius;
      const textLength = circumference / 3; // Use a fraction of the circumference for text length
  
      // Adjust text wrapping based on the available space
      details.forEach((detail, index) => {
          let words = detail.split(' ');
          let line = '';
          let y = -innerRadius / 2 + index * 20; // Adjust vertical spacing
  
          words.forEach((word) => {
              let testLine = line + word + " ";
              // Create a temporary text to measure width
              let tempText = detailsGroup.append("text").text(testLine).attr("x", 0).attr("y", y).style("visibility", "hidden");
              let testWidth = tempText.node().getComputedTextLength();
  
              if (testWidth > textLength && line.length > 0) {
                  detailsGroup.append("text")
                      .text(line)
                      .attr("x", 0)
                      .attr("y", y)
                      .attr("text-anchor", "middle")
                      .style("font-size", "12px");
  
                  line = word + " ";
                  y += 20; // Move to next line
              } else {
                  line = testLine;
              }
              tempText.remove(); // Remove the temporary text
          });
  
          // Add the last line
          detailsGroup.append("text")
              .text(line)
              .attr("x", 0)
              .attr("y", y)
              .attr("text-anchor", "middle")
              .style("font-size", "12px");
      });
  }
  
    // Handle zoom on click.
    function clicked(event, p) {
      event.stopPropagation();
        // Determine if the segment is already in "selected" (popped-out) state
        const isSelected = d3.select(this).classed('selected');
        
        // Reset all segments to their default state
        svg.selectAll("path")
            .classed('selected', false)
            .attr('d', d => arc(d.current));
        
        // If the clicked segment was not already selected, pop it out
        if (!isSelected) {
            d3.select(this)
                .classed('selected', true)
                .attr('d', d => arcSelected(d.current))
                // .attr("fill", d => "red"); // Change color or apply any other indicator as needed
        }
        
        // Display details if a leaf node is selected, otherwise clear details
        if (!p.children) {
            displaySunscreenDetails(p);
        }

      if (p.children) {
        svg.selectAll(".sunscreen-details").remove();

        parent.datum(p.parent || root);
  
        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });
    
        const t = svg.transition().duration(750);
    
        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
            .tween("data", d => {
              const i = d3.interpolate(d.current, d.target);
              return t => d.current = i(t);
            })
            .filter(function(d) {
              return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
              .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.8 : 0.2) : 0)
              .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 
              .attrTween("d", d => () => arc(d.current));
    
        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
      }
    }
    
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
  
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }
  
    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  
    return svg.node();
}