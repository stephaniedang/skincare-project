<script>
  import { onMount } from "svelte";
  import { writable, derived } from 'svelte/store';
  import * as d3 from 'd3';
  import { formatData } from '../utils/formatData';
  import { createChart } from '../utils/createChart';

  // chart variables
  let svgElement;
  let data;

  // Store for window dimensions
  const windowWidth = writable(0);

  // Derived store to calculate radius based on window width
  const radius = derived(windowWidth, $windowWidth => {
    return $windowWidth <= 500 ? 145 : 115;
  });

  let options = derived(radius, $radius => ({
    width: 928,
    height: 928,
    radius: $radius
  }));

  onMount(async () => {
    windowWidth.set(window.innerWidth);
    const resizeListener = () => {
      windowWidth.set(window.innerWidth);
    };
    window.addEventListener('resize', resizeListener);

    try {
      const csvData = await d3.csv('data/sunscreen.csv');
      data = formatData(csvData);
    } catch (error) {
      console.error('Error loading or processing data:', error);
    }

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  });

  $: if (data && svgElement && $options) {
    createChart(svgElement, data, $options);
  }
</script>

<svg class="chart" bind:this={svgElement} >

</svg>

<style>
 * {
  margin: 0;
  box-sizing: border-box;
 }
</style>