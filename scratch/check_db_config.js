const { base44 } = require("../src/api/base44Client");

async function check() {
  try {
    const configProducts = await base44.entities.Product.filter({ name: "_CATEGORY_CONFIG_" });
    console.log("Config Products:", JSON.stringify(configProducts, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
