const products = [
  { tenant: "woolworths", sku: "WW-ALMOND-MILK-1L", name: "Almond Milk 1L", synonyms: ["almond milk"], dietary: ["vegan","dairy-free"], price: 49.99, substitutes: ["WW-SOY-MILK-1L"] },
  { tenant: "woolworths", sku: "WW-GLUTEN-WRAP", name: "Gluten-free Wraps", synonyms: ["gluten free wraps"], dietary: ["gluten-free"], price: 34.99, promo: "R10 off" },
  { tenant: "woolworths", sku: "WW-SOY-MILK-1L", name: "Soy Milk 1L", synonyms: ["soy milk"], dietary: ["vegan","dairy-free"], price: 39.99 }
];

const inventories = [
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-ALMOND-MILK-1L", onHand: 0, backroom: 12, reorderPoint: 10 },
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-GLUTEN-WRAP", onHand: 0, backroom: 18, reorderPoint: 8 },
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-SOY-MILK-1L", onHand: 20, backroom: 10, reorderPoint: 10 }
];

const planograms = [
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-ALMOND-MILK-1L", location: { storeId: "NMB-STORE-001", zone: "Salesfloor", aisle: "7", bay: "3", shelf: "mid" } },
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-GLUTEN-WRAP", location: { storeId: "NMB-STORE-001", zone: "Salesfloor", aisle: "12", bay: "2", shelf: "top" } },
  { tenant: "woolworths", storeId: "NMB-STORE-001", sku: "WW-SOY-MILK-1L", location: { storeId: "NMB-STORE-001", zone: "Salesfloor", aisle: "7", bay: "3", shelf: "mid" } }
];

const sops = [
  {
    id: "SOP-REPLENISH-DAIRY-V1",
    tenant: "woolworths",
    version: "1.0",
    title: "Replenishment — Dairy Alternatives",
    tags: ["replenish","dairy-alt"],
    steps: [
      { step: 1, text: "Collect stock from backroom bin B12." },
      { step: 2, text: "Walk to Aisle 7, Bay 3, Shelf mid." },
      { step: 3, text: "Check expiry dates; place shortest dates at front." },
      { step: 4, text: "Front-face 3 units; scan shelf tag to confirm." }
    ],
    safetyNotes: ["Do not block customer access during replenishment."]
  }
];

const tasks = [
  {
    id: "TASK-001",
    tenant: "woolworths",
    storeId: "NMB-STORE-001",
    type: "REPLENISH",
    title: "Replenish Almond Milk (1L) — 6 units",
    sku: "WW-ALMOND-MILK-1L",
    location: { storeId: "NMB-STORE-001", zone: "Backroom", bin: "B12" },
    slaMin: 20,
    steps: ["Collect 6 units from bin B12", "Move to Aisle 7, Bay 3", "Check expiry", "Front-face"],
    evidence: ["scan","photo"],
    status: "PENDING",
    priority: "HIGH"
  }
];

module.exports = { products, inventories, planograms, sops, tasks };
