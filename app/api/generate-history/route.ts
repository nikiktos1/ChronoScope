import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: "Ты — эксперт по альтернативной истории. Твоя задача — анализировать исторические развилки и описывать их последствия. Отвечай только на русском языке. Будь подробным, пиши 3-4 абзаца на каждый ответ."
    };

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [systemMessage, ...messages],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("HF API Error:", result.error);
      return NextResponse.json({
        text: "Ошибка API: " + (result.error.message || JSON.stringify(result.error))
      });
    }

    const generatedText = result.choices?.[0]?.message?.content || "Не удалось получить текст";
    return NextResponse.json({ text: generatedText.trim() });
  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
