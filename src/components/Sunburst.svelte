<script>
  import { onMount } from "svelte";
  import * as d3 from 'd3';
  import { formatData } from '../utils/formatData'
  import { createChart } from '../utils/createChart'

  // chart variables
  let svgElement;
  let data;
  const options = {
   width: 928,
   height: 928,
   radius: 115
  }

  onMount(async () => {
    try {
      const csvData = await d3.csv('data/sunscreen.csv');
      data = formatData(csvData);
      createChart(svgElement, data, options);
      console.log(data)
      } catch (error) {
        console.error('Error loading or processing data:', error);
      }
  });

  $: data && createChart(svgElement, data, options);
</script>

<svg class="chart" bind:this={svgElement} >

</svg>

<style>
 * {
  margin: 0;
  box-sizing: border-box;
 }
</style>