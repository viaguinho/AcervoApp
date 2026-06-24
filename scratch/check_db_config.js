const { api } = require("../src/api/apiClient");

async function check() {
  try {
    const configProducts = await api.entities.Product.filter({ name: "_CATEGORY_CONFIG_" });
    console.log("Config Products:", JSON.stringify(configProducts, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
