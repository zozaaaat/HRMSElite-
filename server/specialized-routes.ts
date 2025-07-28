import { Express } from "express";

// Specialized routes for Gold & Fabrics businesses
export function registerSpecializedRoutes(app: Express) {
  
  // Gold Business Specialized APIs
  app.get('/api/gold/daily-prices', async (req, res) => {
    try {
      // Real-time gold prices (in real implementation, this would connect to actual gold price API)
      const goldPrices = {
        date: new Date().toISOString().split('T')[0],
        prices: {
          "gold_18k": {
            buy: 16.250,
            sell: 16.450,
            currency: "KWD per gram"
          },
          "gold_21k": {
            buy: 18.750,
            sell: 18.950,
            currency: "KWD per gram"
          },
          "gold_24k": {
            buy: 21.450,
            sell: 21.650,
            currency: "KWD per gram"
          }
        },
        trend: "up", // up, down, stable
        changePercent: "+2.3%"
      };
      
      res.json(goldPrices);
    } catch (error) {
      console.error("Error fetching gold prices:", error);
      res.status(500).json({ message: "Failed to fetch gold prices" });
    }
  });

  app.get('/api/gold/inventory/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      
      const goldInventory = [
        {
          id: "inv-001",
          category: "خواتم",
          goldType: "ذهب عيار 21",
          weight: "15.5 جرام",
          pieces: 25,
          costPrice: 18.500,
          sellingPrice: 19.200,
          lastUpdated: "2025-01-28"
        },
        {
          id: "inv-002", 
          category: "أساور",
          goldType: "ذهب عيار 18",
          weight: "32.8 جرام",
          pieces: 18,
          costPrice: 16.200,
          sellingPrice: 16.800,
          lastUpdated: "2025-01-28"
        },
        {
          id: "inv-003",
          category: "قلائد",
          goldType: "ذهب عيار 21",
          weight: "28.3 جرام", 
          pieces: 12,
          costPrice: 18.650,
          sellingPrice: 19.400,
          lastUpdated: "2025-01-27"
        }
      ];
      
      res.json(goldInventory);
    } catch (error) {
      console.error("Error fetching gold inventory:", error);
      res.status(500).json({ message: "Failed to fetch gold inventory" });
    }
  });

  app.post('/api/gold/calculate-order', async (req, res) => {
    try {
      const { goldType, weight, category, stones } = req.body;
      
      // Gold price calculation based on current rates
      const goldRates = {
        "ذهب عيار 18": 16.450,
        "ذهب عيار 21": 18.950,
        "ذهب عيار 24": 21.650
      };
      
      const goldCost = goldRates[goldType] * parseFloat(weight);
      const craftingFee = goldCost * 0.15; // 15% crafting fee
      const stonesCost = stones ? stones.reduce((sum: number, stone: any) => sum + stone.price, 0) : 0;
      
      const totalCost = goldCost + craftingFee + stonesCost;
      
      const orderCalculation = {
        goldType,
        weight: `${weight} جرام`,
        category,
        goldCost: goldCost.toFixed(3),
        craftingFee: craftingFee.toFixed(3),
        stonesCost: stonesCost.toFixed(3),
        totalCost: totalCost.toFixed(3),
        currency: "KWD",
        estimatedDays: "7-10 أيام عمل"
      };
      
      res.json(orderCalculation);
    } catch (error) {
      console.error("Error calculating gold order:", error);
      res.status(500).json({ message: "Failed to calculate order" });
    }
  });

  // Fabrics Business Specialized APIs
  app.get('/api/fabrics/seasonal-trends', async (req, res) => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      let season = "الصيف";
      
      if (currentMonth >= 3 && currentMonth <= 5) season = "الربيع";
      else if (currentMonth >= 6 && currentMonth <= 8) season = "الصيف";
      else if (currentMonth >= 9 && currentMonth <= 11) season = "الخريف";
      else season = "الشتاء";
      
      const seasonalTrends = {
        currentSeason: season,
        trendingFabrics: {
          "الربيع": ["شيفون", "قطن خفيف", "حرير", "كريب"],
          "الصيف": ["قطن", "كتان", "فسكوز", "قطن مخلوط"],
          "الخريف": ["جبردين", "صوف خفيف", "تريكو", "كشمير"],
          "الشتاء": ["صوف", "مخمل", "جلد صناعي", "فرو صناعي"]
        }[season],
        popularColors: {
          "الربيع": ["وردي فاتح", "أخضر نعناعي", "أزرق سماوي", "أصفر شمسي"],
          "الصيف": ["أبيض", "بيج", "أزرق بحري", "ألوان باستيل"],
          "الخريف": ["بني", "برتقالي محروق", "أحمر داكن", "أصفر خردلي"],
          "الشتاء": ["أسود", "رمادي", "كحلي", "بني داكن"]
        }[season],
        demandForecast: {
          high: ["قطن عالي الجودة", "أقمشة مقاومة للتجاعيد"],
          medium: ["حرير طبيعي", "صوف مروتين"],
          low: ["أقمشة صناعية ثقيلة"]
        }
      };
      
      res.json(seasonalTrends);
    } catch (error) {
      console.error("Error fetching seasonal trends:", error);
      res.status(500).json({ message: "Failed to fetch seasonal trends" });
    }
  });

  app.get('/api/fabrics/inventory/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      
      const fabricsInventory = [
        {
          id: "fab-001",
          fabricType: "حرير طبيعي",
          color: "أزرق كحلي",
          width: "150 سم",
          length: "50 متر",
          pricePerMeter: 12.500,
          supplier: "تركيا",
          quality: "درجة أولى",
          usage: "فساتين سهرة"
        },
        {
          id: "fab-002",
          fabricType: "قطن مصري",
          color: "أبيض ناصع",
          width: "120 سم", 
          length: "80 متر",
          pricePerMeter: 6.750,
          supplier: "مصر",
          quality: "ممتاز",
          usage: "قمصان وملابس داخلية"
        },
        {
          id: "fab-003",
          fabricType: "شيفون فرنسي",
          color: "وردي فاتح",
          width: "140 سم",
          length: "35 متر",
          pricePerMeter: 18.200,
          supplier: "فرنسا",
          quality: "ممتاز جداً",
          usage: "فساتين ومناسبات"
        },
        {
          id: "fab-004",
          fabricType: "دانتيل إيطالي",
          color: "كريمي",
          width: "110 سم",
          length: "25 متر",
          pricePerMeter: 25.500,
          supplier: "إيطاليا", 
          quality: "فاخر",
          usage: "فساتين زفاف"
        }
      ];
      
      res.json(fabricsInventory);
    } catch (error) {
      console.error("Error fetching fabrics inventory:", error);
      res.status(500).json({ message: "Failed to fetch fabrics inventory" });
    }
  });

  app.post('/api/fabrics/calculate-order', async (req, res) => {
    try {
      const { fabricType, meters, width, customerType } = req.body;
      
      // Fabric pricing based on customer type
      const fabricRates = {
        "حرير طبيعي": { جملة: 10.500, "نصف جملة": 11.750, تجزئة: 12.500 },
        "قطن مصري": { جملة: 5.250, "نصف جملة": 6.000, تجزئة: 6.750 },
        "شيفون فرنسي": { جملة: 15.800, "نصف جملة": 17.000, تجزئة: 18.200 },
        "دانتيل إيطالي": { جملة: 22.500, "نصف جملة": 24.000, تجزئة: 25.500 }
      };
      
      const pricePerMeter = fabricRates[fabricType]?.[customerType] || 0;
      const totalCost = pricePerMeter * parseFloat(meters);
      
      // Discount based on quantity
      let discount = 0;
      if (meters >= 50) discount = 0.10; // 10% for 50+ meters
      else if (meters >= 20) discount = 0.05; // 5% for 20+ meters
      
      const finalCost = totalCost * (1 - discount);
      
      const orderCalculation = {
        fabricType,
        meters: `${meters} متر`,
        width: `${width} سم`,
        customerType,
        pricePerMeter: pricePerMeter.toFixed(3),
        subtotal: totalCost.toFixed(3),
        discount: `${(discount * 100).toFixed(0)}%`,
        finalCost: finalCost.toFixed(3),
        currency: "KWD",
        estimatedDelivery: "3-5 أيام عمل"
      };
      
      res.json(orderCalculation);
    } catch (error) {
      console.error("Error calculating fabric order:", error);
      res.status(500).json({ message: "Failed to calculate order" });
    }
  });

  // Common specialized features for both industries
  app.get('/api/specialized/suppliers/:industry', async (req, res) => {
    try {
      const { industry } = req.params;
      
      const suppliers = {
        "مجوهرات وذهب": [
          {
            id: "sup-gold-001",
            name: "مؤسسة الذهب الخليجي",
            country: "الإمارات",
            speciality: "ذهب خام عيار 24",
            rating: 4.8,
            paymentTerms: "30 يوم",
            contact: "+971-4-123-4567"
          },
          {
            id: "sup-gold-002", 
            name: "شركة الأحجار الكريمة",
            country: "تايلاند",
            speciality: "أحجار كريمة طبيعية",
            rating: 4.6,
            paymentTerms: "تسليم فوري",
            contact: "+66-2-987-6543"
          }
        ],
        "أقمشة ومنسوجات": [
          {
            id: "sup-fab-001",
            name: "معامل النسيج التركية",
            country: "تركيا",
            speciality: "أقمشة حريرية وقطنية",
            rating: 4.9,
            paymentTerms: "45 يوم",
            contact: "+90-212-555-0123"
          },
          {
            id: "sup-fab-002",
            name: "مصانع القطن المصرية",
            country: "مصر", 
            speciality: "قطن طويل التيلة",
            rating: 4.7,
            paymentTerms: "30 يوم",
            contact: "+20-2-123-4567"
          }
        ]
      };
      
      res.json(suppliers[industry] || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
}