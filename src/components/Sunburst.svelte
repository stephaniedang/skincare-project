<script>
  import { onMount } from "svelte";
  import { writable, derived } from 'svelte/store';
  import * as d3 from 'd3';
  import { formatData } from '../utils/formatData';
  import { createChart } from '../utils/createChart';

  // chart variables
  let svgElement;
  let data;
  let width, height;

  // Store for window dimensions
  const windowWidth = writable(window.innerWidth);

  // Update windowWidth on resize
  window.addEventListener('resize', () => {
    windowWidth.set(window.innerWidth);
  });

  // Derived store to calculate radius based on window width
  const radius = derived(windowWidth, $windowWidth => {
    // Larger radius for smaller screens
    if ($windowWidth <= 430) {
      return 145; 
    } else {
      return 115; // Default radius for larger screens
    }
  });

  let options = derived(radius, $radius => ({
    width: 928,
    height: 928,
    radius: $radius
  }));

  onMount(async () => {
    try {
      const csvData = await d3.csv('data/sunscreen.csv');
      data = formatData(csvData);
      radius.subscribe($radius => {
        if (data && svgElement) {
          createChart(svgElement, data, { width, height, radius: $radius });
        }
      });
    } catch (error) {
      console.error('Error loading or processing data:', error);
    }
  });

  $: data && $options && createChart(svgElement, data, $options);
</script>

<svg class="chart" bind:this={svgElement} >

</svg>

<style>
 * {
  margin: 0;
  box-sizing: border-box;
 }
</style>