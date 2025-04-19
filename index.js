const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// 🔐 API Key aus .env Datei
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// 🔮 Story + Bild-Prompt generieren
app.post('/api/karma', async (req, res) => {
  const userInput = req.body.input;

  const prompt = `
Du bist die AI Karma Cam. Jemand hat folgendes Verhalten: "${userInput}"

Gib eine witzige, übertriebene Zukunfts-Vorhersage (max. 5 Sätze) ab und bewerte das Karma mit einem Score von 1–10. Gib auch ein kurzes Bildprompt an, um ein KI-Bild zu generieren.

Format:
Story: ...
KarmaScore: ...
ImagePrompt: ...
`;

  try {
    const gptResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = gptResponse.data.choices[0].message.content;

    // Parsen der GPT-Antwort
    const storyMatch = text.match(/Story:\s(.+?)\n/);
    const karmaMatch = text.match(/KarmaScore:\s(\d+)/);
    const imagePromptMatch = text.match(/ImagePrompt:\s(.+)/);

    const story = storyMatch ? storyMatch[1] : 'Keine Story gefunden';
    const karmaScore = karmaMatch ? karmaMatch[1] : 'N/A';
    const imagePrompt = imagePromptMatch ? imagePromptMatch[1] : 'A surreal future scene, humorous tone';

    // Optional: DALL·E Bild-Generierung einbauen
    const imageGen = await openai.createImage({
      prompt: imagePrompt,
      n: 1,
      size: "512x512"
    });

    const imageUrl = imageGen.data.data[0].url;

    res.json({ story, karmaScore, imageUrl });

  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler bei der Karma-Vorhersage.");
  }
});

app.listen(port, () => {
  console.log(`⚡ AI Karma Cam Backend läuft auf http://localhost:${port}`);
});
