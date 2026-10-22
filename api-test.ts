import 'dotenv/config';
import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('OPENROUTER_API_KEY .env faylida topilmadi');

const client = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });

const response = await client.chat.completions.create({
  model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash',
  messages: [{ role: 'user', content: "Salom! Bir jumlada o'zingni tanishtir." }],
});

console.log(response.choices[0].message.content);
