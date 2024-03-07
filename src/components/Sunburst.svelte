<script>
  import { onMount } from "svelte";
  import * as d3 from 'd3';
  import { formatData } from '../utils/formatData'

  let data;
  let width = 600;
  let height = 600;

onMount(async () => {
  try {
    const csvData = await d3.csv('data/sunscreen.csv');
    data = formatData(csvData);
    console.log(data)
    } catch (error) {
      console.error('Error loading or processing data:', error);
    }
});

</script>



<style>

</style>