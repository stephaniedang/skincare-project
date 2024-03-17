export function formatData(csvData) {
  const sunburstData = {
    name: "Sunscreen",
    children: []
  };

  // Helper function to find or create a category
  const findOrCreateCategory = (parent, name) => {
    let category = parent.children.find(child => child.name === name);
    if (!category) {
      category = { name, children: [] };
      parent.children.push(category);
    }
    return category;
  };

  // Feature mappings to their paths in the sunburst hierarchy
  const featureMappings = {
    moisturizing: ["Skin Concern", "Moisturizing"],
    soothing: ["Skin Concern", "Soothing"],
    visiblepores: ["Skin Concern", "Visible Pores"],
    uva3: ["UVA Rating", "3 Star"],
    uva4: ["UVA Rating", "4 Star"],
    spf30: ["SPF Range", "30-49 SPF"],
    spf50: ["SPF Range", "50+ SPF"],
    mineral: ["Formulation Type", "Mineral"],
    nowhitecast: ["Formulation Type", "No White Cast"],
    synthetic: ["Formulation Type", "Synthetic"],
    sensitive: ["Skin Type", "Sensitive"]
  };

  // Helper function to process each product and its features
  const processProductFeatures = (row) => {
    const features = Object.keys(row).reduce((acc, key) => {
      if (row[key] == 1 && featureMappings[key]) {
        // Extract the prettified name directly from the featureMappings
        const cleanFeatureName = featureMappings[key][1];
        acc.push(cleanFeatureName);
      }
      return acc;
    }, []);

    return features;
  };

  csvData.forEach(row => {
    const productName = row.productName;
    const productFeatures = processProductFeatures(row);

    productFeatures.forEach(feature => {
      // Find the original key from the prettyFeature
      const originalFeatureKey = Object.keys(featureMappings).find(key => 
        featureMappings[key][featureMappings[key].length - 1] === feature);
      const path = featureMappings[originalFeatureKey];
      let category = sunburstData;
      // Find or create category path
      path.forEach(name => {
        category = findOrCreateCategory(category, name);
      });
      // Add product with features to the final category
      // Ensure features array in each product node contains prettified names
      category.children.push({ name: productName, features: productFeatures, value: 1 });
    });
  });

  return sunburstData;
}