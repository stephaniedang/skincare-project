# UV Universe: Charting the Brightest in Sun Defense
## Sunburst Data Visualization of January 2024 Top 100 Sunscreens from Olive Young

### Overview

This personal project presents a sunburst data visualization of the top 100 sunscreens sold at Olive Young in January 2024. The visualization aims to provide insights into the preferences and trends in sunscreen products among consumers, showcasing data such as SPF protection levels, skin concern, and formulation type.

### Data Source

The data for this visualization was sourced from Olive Young's website. I had manually scraped their top sunscreens by orders from Best Sellers page back in January. I loaded the HTML into a Python notebook for further cleaning and processing.

### Tools and Technologies

- **Data Processing**: Python (Pandas and NumPy)
- **Visualization**: D3.js
- **All the In-between**: HTML/CSS, Javascript, SvelteKit

### How to Use

The sunburst chart is interactive. Users can click over individual segments to see more information about each sunscreen category or product. Clicking on a segment will zoom in for a closer look at the subcategories or products within that section. Once you get to the final layer of individual sunscreens, feel free to click around and fit one that  calls to you!  Clicking the name of the sunscreen of the inner tooltip will link you to Olive Young's site where you can make your dreams be reality. A breadcrumb trail at the center radius of the visualization allows users to navigate back through their viewing history.

### Acknowledgments

Special thanks to Olive Young for providing the sales data and to Mike Bostock's robust [D3 gallery](https://observablehq.com/@d3/gallery) for an inspirational jumping off point.

