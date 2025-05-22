const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Prompt missing");

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mixtral-8x7b",
      messages: [
        {
          role: "system",
          content: `You are a travel planning assistant. Format the itinerary in a JSON structure with:
- destination
- startDate, endDate
- days: [ { day, date, title, activities[], expenses{}, groupSplitOptions[], blogNotes } ]
- totalExpenses: {}
Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      temperature: 0.7,
    });

    const jsonText = response.choices[0].message.content;
    const structured = JSON.parse(jsonText);
    res.status(200).json(structured);
  } catch (err) {
    console.error("OpenRouter Error:", err);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};