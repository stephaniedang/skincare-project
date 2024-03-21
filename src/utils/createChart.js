import * as d3 from 'd3';

const categoryColors = {
  "Skin Type": "#946dde",
  "Skin Concern": "#a66d96",
  "SPF Range": "#f08554",
  "Formulation Type": "#de9b59",
  "UVA Rating": "#eb7457",
}
// purple toned
const specifiedColors = [
  "#8c73ff",
  "#ff6040",
  "#fcb683",
  "#ed3434",
  "#f68fff",
]

// "Skin Type": "#e35c36",
// "Skin Concern": "#e87c10",
// "SPF Range": "#fc5b21",
// "Formulation Type": "#fac184",
// "UVA Rating": "#fc5e3a",

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
    // const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    const color = d3.scaleOrdinal(specifiedColors);
  
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
        .style("font-size", "12px")
        .style("font-family", "Lato");
  
    // Append the arcs.
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
        .attr("fill", d => getNodeColor(d.current))
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.9 : 0.6) : 0)
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
        .attr("fill", "#0b090a")
        .style("font-weight", "700")
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
  
    let detailsGroup = svg.append("g")
                            .attr("class", "sunscreen-details")
                            .style("opacity", 0)
                            .attr("transform", `translate(0,0)`);
  
    const maxTextWidth = radius * 0.8;
    let lineHeight = 16;
    const startY = -radius * 0.5;
    const availableHeight = radius;
  
    // Ensures input is a string and ready for display
    function formatTextContent(input) {
      if (Array.isArray(input)) {
        return input.join(", "); // If it's an array, join elements with a comma
      } else if (input && typeof input === 'object') {
        return JSON.stringify(input); // For objects, stringify (customize as needed)
      } else if (typeof input === 'string') {
        return input; // If already a string, use as is
      }
      return ""; // Default for undefined, null, or other non-string types
    }
  
    function wrapText(text, y, isName, link="") {
      let words = formatTextContent(text).split(/\s+/);
      let line = '';
      let lineNumber = 0;
      let textHeight = 0;
  
      words.forEach(function(word) {
        let testLine = line + word + " ";
        let tempText = detailsGroup.append("text").text(testLine).style("visibility", "hidden");
        let metrics = tempText.node().getComputedTextLength();

        if (metrics > maxTextWidth && line !== '') {
          if (isName) {
            let textElement = detailsGroup.append("a")
                              .attr("href", node.data.link)
                              .attr("target", "_blank")
                              .attr("rel", "noopener noreferrer")
                              .style("cursor", "pointer")
                              .append("text")
                              .attr("x", 0)
                              .attr("y", y + (lineNumber * lineHeight))
                              .attr("text-anchor", "middle")
                              .style("font-size", "14px")
                              // .style("font-weight", "bold")
                              .style("font-style", "italic")
                              .style("fill", "#ffeccf")
                              .text(line.trim());
          } else {
            detailsGroup.append("text")
                        .text(line.trim())
                        .attr("x", 0)
                        .attr("y", y + (lineNumber * lineHeight))
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .style("font-weight", "normal")
                        .style("fill", "#ffeccf");
          }

          lineNumber++;
          line = word + ' ';
          textHeight += lineHeight;
        } else {
          line = testLine;
        }
        tempText.remove();
      });
  
      // Add the last (or only) line if it's not empty
      if (line.trim() !== '') {
        detailsGroup.append("text")
            .text(line)
            .attr("x", 0)
            .attr("y", y + (lineNumber * lineHeight))
            .attr("text-anchor", "middle")
            .style("font-size", isName ? "14px" : "12px")
            // .style("font-weight", isName ? "bold" : "normal")
            .style("fill", isName ? "#ffeccf" : "#ffeccf");
        textHeight += lineHeight;
      }
      
        return textHeight; // Return the total height used by this text
      }
  
    // Initial wrap attempt
    let usedHeight = wrapText(node.data.name, startY, true, node.data.link) + 5; // Includes space between
    usedHeight += wrapText(`Features: ${formatTextContent(node.data.features)}`, startY + usedHeight, false);

    // Check if the text exceeds the available space
    if (usedHeight > availableHeight) {
      lineHeight = 12; // Reduce line height for re-wrapping
      svg.selectAll(".sunscreen-details").remove(); // Clear the previous text
      detailsGroup = svg.append("g")
                        .attr("class", "sunscreen-details")
                        .style("opacity", 0)
                        .attr("transform", `translate(0,0)`);
      
      // Re-wrap with adjusted settings
      usedHeight = wrapText(node.data.name, startY, true) + 5; // Recalculate usedHeight
      usedHeight += wrapText(`Features: ${formatTextContent(node.data.features)}`, startY + usedHeight, false);
    }

    detailsGroup.transition()
    .duration(650)
    .style("opacity", 1);
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
                .transition()
                .duration(200)
                .attr('d', d => arcSelected(d.current))
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
              .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.9 : 0.6) : 0)
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