
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
    ? `A mystical and poetic fine art oil painting capturing the soul of the Latvian proverb "${proverb}". The atmosphere is heavy with Baltic mystery: ancient oaks, twilight mist, glowing embers, and sacred natural light. Use a deep, textured palette inspired by northern nature and folklore. ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO WRITING. Purely visual symbolism without any specific artist references like Van Gogh.`
    : `A cinematic historical oil painting illustrating a scene for the Latvian proverb "${proverb}": "${storyContext}". Authentic 19th-century Latvian farmhouse interior or countryside, traditional linen folk dress, soft candlelight or natural morning light through small windows, moody shadows (chiaroscuro). ABSOLUTELY NO TEXT, NO LABELS, NO CAPTIONS, NO WRITING. Pure visual art reflecting ancient Latvian life.`;

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
