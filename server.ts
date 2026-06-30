import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client using server-side key
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Personal Finance analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const financeData = req.body;
      if (!financeData) {
        return res.status(400).json({ error: "Finance data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Yapay zeka analizini gerçekleştirebilmek için GEMINI_API_KEY tanımlanmalıdır. Lütfen AI Studio Secrets panelinden anahtarınızı tanımlayın." 
        });
      }

      const prompt = `Sen harika bir kişisel finans uzmanı ve asistanısın. Kullanıcının mali durumunu optimize etmek ve ona en sürdürülebilir, maliyeti en az ödeme planını çıkarmakla görevlisiniz.

Aşağıda kullanıcının güncel finansal verileri yer almaktadır:
- Toplam Nakit Bütçe: ${financeData.totalCashBudget} TL
- Kredi Kartları (Limit, Güncel Borç, Hesap Kesim Günü, Son Ödeme Günü):
${JSON.stringify(financeData.creditCards, null, 2)}
- Krediler (Aylık Taksit, Ödeme Günü):
${JSON.stringify(financeData.loans, null, 2)}
- Eksi Bakiyeler / KMH Hesapları (Limit, Güncel Borç, Aylık Faiz Oranı %):
${JSON.stringify(financeData.overdraftAccounts, null, 2)}
- Son Harcamalar:
${JSON.stringify(financeData.expenses, null, 2)}
- Birikim Hedefleri:
${JSON.stringify(financeData.savingsGoal, null, 2)}

Bu verileri analiz ederek kullanıcının borç faiz yükünü en aza indirecek, nakit akışını ve bütçesini koruyacak, bu ayki ve bu yılki birikim hedeflerine ulaşmasını kolaylaştıracak sürdürülebilir bir ödeme stratejisi oluştur.
Özellikle yüksek faizli eksi bakiyeleri kapatmaya öncelik verilmeli mi, kredi kartı asgari ödemeleri mi yapılmalı yoksa borcun tamamı mı kapatılmalı, nakit bütçesinin ne kadarı ödemelere ayrılmalı gibi soruları cevapla.
Bu hafta hangi karta veya eksi hesaba tam olarak kaç TL ödemesi gerektiğini belirle.

Lütfen yanıtı Türkçe dilinde, samimi, destekleyici, yol gösterici ve profesyonel bir üslupla ver. Yanıtı belirlenen JSON şemasına birebir uygun olarak döndür.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generalStatus: {
                type: Type.STRING,
                description: "Genel finansal durum özeti ve kullanıcıya sıcak bir hitap."
              },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Bütçe aşımı, yüksek faiz, yaklaşan son ödeme günleri vb. uyarılar."
              },
              recommendedPayments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Ödeme türü: 'kredi_karti', 'eksi_bakiye', 'kredi'" },
                    name: { type: Type.STRING, description: "Hesabın veya kartın adı" },
                    amount: { type: Type.NUMBER, description: "Bu hafta yapılması önerilen ödeme miktarı (TL)" },
                    reason: { type: Type.STRING, description: "Neden bu miktarın ödenmesi gerektiğinin kısa açıklaması" }
                  },
                  required: ["type", "name", "amount", "reason"]
                },
                description: "Bu hafta yapılması gereken sürdürülebilir ödemelerin listesi."
              },
              sustainabilityAnalysis: {
                type: Type.STRING,
                description: "En sürdürülebilir ödeme ve bütçe stratejisini detaylıca anlatan asistan metni. (Türkçe, samimi, paragraflar halinde, zengin ve yapıcı)."
              },
              savingTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Birikim hedeflerine ulaşmak için 2-3 adet özelleştirilmiş öneri."
              }
            },
            required: ["generalStatus", "warnings", "recommendedPayments", "sustainabilityAnalysis", "savingTips"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ error: "Gemini AI'dan boş yanıt alındı." });
      }

      const resultData = JSON.parse(responseText.trim());
      res.json(resultData);

    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ 
        error: "Yapay zeka analizi sırasında bir hata oluştu: " + (error instanceof Error ? error.message : String(error)) 
      });
    }
  });

  // Setup Vite/Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
