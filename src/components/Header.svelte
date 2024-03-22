<script>

</script>

<div class="header-container">
  <h1 class="title">UV Universe: Charting the Brightest in Sun Defense</h1>
  
  <div class="summary-container">
    <p>
      Embark on a unique journey through the sun care landscape with our 
      this interactive sunburst chart that highlights <a href="https://oliveyoung.com/" target="_blank" rel="noopener noreferrer">
      Olive Young's</a> January 2024 top 100 sunscreens. This digital exploration tool 
      is your guide to making the world of sun protection a little easier to explore.
    </p>
    <p>
      With every click, navigate through a curated selection of sunscreens, 
      discovering the perfect match for your skin. Once you've gotten to the end of a ray,
      click on sunscreen names to learn more about them on their product pages. 
      And when you’re ready to trace your steps back, a simple click at the 
      center makes it all happen.
    </p>
    <p>
      Let this chart be the starting point of a daily routine that feels 
      less like a chore and more like a small, joyful discovery. After all, 
      protecting your skin should always feel good.
    </p>

    <p class="outro-container">
      The data for this project was pulled from Olive Young's site displaying
      the top 100 ordered sun care products of January 2024. I was inspired to 
      build this visualization during my quest for a new sunscreen and after 
      exploring all of amazing creations of <a href="https://observablehq.com/@d3/gallery" target="_blank" rel="noopener noreferrer">Mike Bostock.</a>
    </p>
  </div>
</div>

<style>
 * {
  margin: 0;
  box-sizing: border-box;
  color: #faf0f4;
 }
 
 .header-container {
  display: flex;
  flex-direction: column;
  padding-top: 8em;
  padding-left: 8em;
 }

 .title {
  font-family: "Grandstander Variable";
  font-weight: 500;
  font-size: 2em;
 }

 p {
  font-family: "Lato", sans-serif;
  font-weight: 400;
  padding-bottom: 0.5em;
 }

 .summary-container {
  padding-top: 0.5em;
 }

 .outro-container {
  font-weight: 200;
  font-style: italic;
 }

 /* Responsive styles */
  @media screen and (max-width: 1400px) {
    .header-container {
      padding: 8em 0 0 5em;
    }

    .title {
      font-size: 2em; 
    }
    
    p {
      font-size: 0.9em;
      padding: 0.5em 0;
    }
  }

  @media screen and (max-width: 1200px) {
    .header-container {
      padding: 4em 0 0 5em;
    }

    .title {
      font-size: 1.8em; 
    }
    
    p {
      font-size: 0.85em;
      padding: 0.5em 0;
    }
  }
  
  @media screen and (max-width: 950px) {
    .header-container {
      padding: 6em 0 0 3em;
    }

    .title {
      font-size: 1.5em; 
    }
    
    p {
      font-size: 0.7em;
      padding: 0.5em 0;
    }
  }

  @media screen and (max-width: 430px) {
      .header-container {
        padding: 2.5em 2em 0 2em;
      }

      .title {
        font-size: 0.92em; 
      }
      
      p {
        font-size: 0.68em;
        padding: 0.5em 0;
      }
    }
</style>