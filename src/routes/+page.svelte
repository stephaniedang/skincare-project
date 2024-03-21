<svelte:head>
	<title>UV Universe</title>
	<link rel="stylesheet" href="/css/fonts.css">
</svelte:head>

<script>
	import Sunburst from "../components/Sunburst.svelte";
	import Header from "../components/Header.svelte";
</script>

<div class="container">
	<div class="header">
		<Header />
	</div>

	<div class="chart">
		<Sunburst />
	</div>
</div>

<style>
	* {
		margin: 0;
		box-sizing: border-box;
	}

	:global(body) {
		background-color: #27476e;
		margin: 0;
	}

	.container {
		display: grid;
		grid-template-columns: 30% 70%;
		height: 100vh;
	}

	/* Responsive styles */
	@media screen and (max-width: 690px) {
		.container {
			display: flex;
			flex-direction: column;
		}
  }

	/* @media screen and (max-width: 950px) {
		.header {
			padding: 6em 0 0 2em;
		}
	} */
</style>