export function formatData(csvData) {
  const sunburstData = { name: "Sunscreen", children: [] };
  
  const featureCategories = {
    skinConcern: ["moisturizing", "soothing", "visiblepores"],
    uvaRating: ["uva3", "uva4"],
    spfRange: ["spf30", "spf50"],
    formulationType: ["mineral", "nowhitecast", "synthetic"],
    skinType: ["sensitive"]
  };

  const findOrCreateCategory = (parent, name) => {
    let category = parent.children.find(child => child.name === name);
    if (!category) {
      category = { name, children: [] };
      parent.children.push(category);
    }
    return category;
  };

  const addProductToCategory = (categoryName, feature, productName) => {
    const category = findOrCreateCategory(sunburstData, categoryName);
    const featureCategory = findOrCreateCategory(category, feature);
    featureCategory.children.push({ name: productName });
  };

  csvData.forEach(row => {
    Object.entries(featureCategories).forEach(([categoryName, features]) => {
      features.forEach(feature => {
        if(row[feature] == 1) {
          const featureName = feature.charAt(0).toUpperCase() + feature.slice(1); // Capitalize feature name
          addProductToCategory(categoryName, featureName.replace(/_/g, ' '), row.productName);
        }
      });
    });
  });

  return sunburstData;
}