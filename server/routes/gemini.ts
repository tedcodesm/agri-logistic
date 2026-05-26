import { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export function registerGeminiRoutes(app: Express, ai: GoogleGenAI | null) {
  app.post("/api/gemini/chat", async (req: Request, res: Response): Promise<void> => {
    const { message, history, language } = req.body;
    const isSwh = language === "kiswahili" || language === "swh";

    if (!ai) {
      const fallbackAnswer = isSwh
        ? `[Simulated AI - Sanidi API_KEY] Jambo! Nashukuru kwa swali lako kuhusu "${message}". Kwa sasa tunatumia mfumo salama wa kiintelijensia katika bandari 3000. Bepresha ya soko la viazi ni KES 3,200 kwa gunia Wote.`
        : `[Simulated AI - API_KEY Not Set] Jambo! Thank you for querying "${message}". Currently, internal analytics show Nairobi wholesale market maize prices is averaging KES 4,100 per 90Kg bag this week. Spoilage risk is high due to Meru rains.`;
      res.json({ text: fallbackAnswer });
      return;
    }

    try {
      const isVoiceListing = req.body.isVoiceListing || false;
      let systemPrompt = `You are "Mkulima Intel", an elite Agri-Logistics & Supply-Chain Optimization AI specialized in Kenyan agriculture.
    You assist farmers, buyers, and transporters with:
    1. Direct English-Kiswahili agricultural technical support.
    2. Pricing trends (e.g., maize, potatoes, tomatoes in markets like Nairobi, Wote, Mombasa, Eldoret).
    3. Warehousing climate tips (moisture below 13.5% for grains).
    4. Post-harvest loss mitigation advice.
    
    If the user requests voice listing transcription, extract and return a pure structured JSON following this model: 
    cropName, quantityKg, pricePerKgKes, description. Otherwise, deliver highly helpful answers.
    Tone: Friendly, professional, localized (mentions counties like Makueni, Nakuru, Nyandarua, Meru).`;

      if (isSwh) {
        systemPrompt += " Jibu kwa Kiswahili fasaha chenye msaada kwa mkulima mdogo.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "I was unable to process that. Please try again." });
    } catch (error: any) {
      console.error("Error invoking Gemini:", error);
      res.status(500).json({ error: "Gemini server call failed", detail: error.message });
    }
  });
}
