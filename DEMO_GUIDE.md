# Samooh Hackathon Demo Guide & Pitch Script

> **Scenario**: Parle-G 800g Family Pack Group Procurement  
> **Duration**: < 3 Minutes  
> **Target Audience**: Hackathon Judges, Investors, Retail Partners  
> **Branch**: `feature/demo-mode`

---

## 🎯 1. Executive Summary & Problem (30 Seconds)

"Small Kirana stores in India operate on razor-thin margins. While giant supermarket chains buy inventory directly from manufacturers at heavy wholesale discounts (20%+ off), single Kirana store owners purchase small quantities at full retail price.

**Samooh** solves this using AI: We aggregate demand across nearby independent Kirana stores, form spatial procurement pools, and unlock direct wholesale tier discounts previously reserved for retail giants."

---

## 📊 2. Deterministic Scenario Numbers (Mathematically Consistent)

| Attribute | Value |
| :--- | :--- |
| **Target Product** | **Parle-G Biscuit 800g Family Pack** (`prod_parle_g`) |
| **Retail Cluster Radius** | **1.85 km** (Banjara Hills / Jubilee Hills, Hyderabad) |
| **Participating Kirana Stores** | **5 Retailers** |
| **Supplier Minimum Threshold** | **100 Cartons** |
| **Single Store Retail Price** | **₹120.00 / carton** |
| **Samooh Pooled Wholesale Price** | **₹95.00 / carton** (**20.83% OFF**) |
| **Unit Discount Saved** | **₹25.00 / carton** |

### Per-Store Demand & Savings Itemization

$$\text{Total Group Demand} = 32 + 24 + 27 + 21 + 8 = \mathbf{112\text{ Cartons}}$$

$$\text{Threshold Progress} = \frac{112}{100} \times 100\% = \mathbf{112.0\%} \quad (\text{Threshold Status: }\mathbf{\text{ACHIEVED}})$$

$$\text{Total Individual Cost} = 112 \text{ units} \times ₹120.00 = \mathbf{₹13,440.00}$$

$$\text{Total Samooh Group Cost} = 112 \text{ units} \times ₹95.00 = \mathbf{₹10,640.00}$$

$$\mathbf{\text{Net Group Savings Amount}} = ₹13,440.00 - ₹10,640.00 = \mathbf{₹2,800.00} \quad (\mathbf{20.83\%})$$

```
+------------------------------------+------------------+-----------------+---------------+----------------+-------------------+
| Retailer Name                      | Predicted Demand | Individual Cost | Samooh Cost   | Net Saved (₹)  | Savings %         |
+------------------------------------+------------------+-----------------+---------------+----------------+-------------------+
| 1. Sri Lakshmi Kirana              | 32 cartons       | ₹3,840.00       | ₹3,040.00     | ₹800.00        | 20.83%            |
| 2. Balaji Superette                | 24 cartons       | ₹2,880.00       | ₹2,280.00     | ₹600.00        | 20.83%            |
| 3. Venkateshwara Traders           | 27 cartons       | ₹3,240.00       | ₹2,565.00     | ₹675.00        | 20.83%            |
| 4. Bhavani Provision Store         | 21 cartons       | ₹2,520.00       | ₹1,995.00     | ₹525.00        | 20.83%            |
| 5. Sai Ram Kirana                  | 8 cartons        | ₹960.00         | ₹760.00       | ₹200.00        | 20.83%            |
+------------------------------------+------------------+-----------------+---------------+----------------+-------------------+
| TOTAL GROUP SUM                    | 112 CARTONS      | ₹13,440.00      | ₹10,640.00    | ₹2,800.00      | 20.83% OFF        |
+------------------------------------+------------------+-----------------+---------------+----------------+-------------------+
```

---

## ⏱️ 3. Step-by-Step 3-Minute Live Demo Script

### Step 1: Launch Scenario (1-Click) (10 Seconds)
- Open the Samooh Web App in your browser (**`http://localhost:3000`**).
- Click the top right button **"🚀 Launch Hackathon Demo"** (or trigger `POST /demo/scenario`).
- *Script*: "With one click, our AI engine processes historical sales data and spatial cluster mapping for Parle-G 800g Family Packs across Banjara Hills."

### Step 2: Show Demand Forecasting & Matching Engine (60 Seconds)
- Navigate to **Retailer Insights** (`/insights`).
- Show the 5 Kirana stores and their 30-day forecast outputs (32, 24, 27, 21, 8 cartons).
- *Script*: "Our Scikit-learn Random Forest Regressor analyzes local sales trends. Notice store #5 only needs 8 cartons. Individually, they could never get a wholesale discount. But together with 4 nearby stores within 1.85 km, their aggregated demand reaches 112 cartons."

### Step 3: Show Procurement Opportunity & Savings (60 Seconds)
- Navigate to **Opportunities** (`/opportunities`).
- Click **"View Details"** on the Parle-G 800g card to open the **Pool Detail Modal**.
- Point to the **Progress Bar (112%)** and the **Status Badge (Threshold Achieved)**.
- *Script*: "Parle Biscuits requires a 100-carton minimum order for wholesale pricing. Because our 5 stores pooled 112 cartons, the threshold is met! Instead of paying ₹120 per carton individually, every store buys at ₹95. That saves the community ₹2,800 immediately on a single product order."

### Step 4: Show Business & ESG Impact (30 Seconds)
- Navigate to **Business Impact** (`/impact`).
- Show the logistics consolidation metric (1 consolidated delivery instead of 5 separate trips) and carbon reduction.
- Click **"Accept Pool"**.
- *Script*: "Samooh delivers 20.83% higher profit margins to small retailers, consolidates 5 delivery trips into 1 green dispatch, and levels the playing field against mega-retailers."

---

## 🛠️ 4. API & Seed Command Execution

### Trigger via API Endpoint
```cmd
curl -X POST http://localhost:8000/demo/scenario
```

### Trigger via Python Script
```cmd
python -c "from backend.database.demo_seed import seed_deterministic_demo; print(seed_deterministic_demo())"
```

---

## 🛡️ 5. Q&A Defense for Judges

**Q: What if a retailer drops out of the pool?**  
*A*: Samooh calculates dynamic buffer margins. Even if Retailer #5 (8 cartons) drops out, the remaining 4 stores still total 104 cartons ($32+24+27+21 = 104$), remaining above the 100-carton threshold!

**Q: How does distance matching work?**  
*A*: We use vectorized Haversine distance. All 5 stores in this cluster are within a tight 1.85 km radius, allowing a single delivery truck to drop off all order allocations in under 20 minutes.
