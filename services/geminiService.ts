
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProverbStory = async (proverb: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tu esi latviešu folklorists un vieds stāstnieks. Izskaidro latviešu sakāmvārda vai teiciena "${proverb}" nozīmi. 
    1. Ko šis teiciens tieši nozīmē (skaidrojums)?
    2. Kāda ir tā izcelsme vai vēsturiskais fons latviešu zemnieku vai tautas dzīvē?
    3. Kā šo gudrību mēs varam piemērot mūsdienu dzīvē (darbā, attiecībās)?
    4. Uzraksti vienu ļoti īsu, aizkustinošu vai pamācošu stāstu (max 120 vārdi), kas ilustrē šo teicienu darbībā.
    Atbildi formātā JSON ar laukiem: definition, history, modernUsage, story.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          history: { type: Type.STRING },
          modernUsage: { type: Type.STRING },
          story: { type: Type.STRING }
        },
        required: ["definition", "history", "modernUsage", "story"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateProverbIllustration = async (proverb: string, storyContext?: string, isSymbolic: boolean = false) => {
  const ai = getAI();
  
  const prompt = isSymbolic 
    ? `Create a mystical, ethereal oil painting inspired by the essence of the Latvian proverb "${proverb}". Use a surreal, poetic style with atmospheric lighting, rich textures, and symbolic Latvian nature elements (mist, glowing amber, oak, twilight). Similar to a Van Gogh or starry night vibe but with Baltic folk motifs. STRICTLY NO TEXT, NO LETTERS, NO NUMBERS, AND NO CAPTIONS IN THE IMAGE. Purely visual fine art.`
    : `A cinematic and realistic historical oil painting of a traditional Latvian scene: "${storyContext}". Set in 19th-century Latvia, showing authentic folk clothing, wooden tools, moody chiaroscuro lighting, and emotional human interaction. STRICTLY NO TEXT, NO WRITING, NO LABELS, NO LETTERS, AND NO CAPTIONS IN THE IMAGE. Purely visual storytelling through painting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("Attēla dati nav pieejami.");
};
