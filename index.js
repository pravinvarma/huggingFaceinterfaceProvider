import 'dotenv/config';
import {HfInference} from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export default async function handler(req, res) {
    try {
        if (!req.body || !req.body.prompt) {
            return res.status(400).json({ error: "Missing prompt in request body" });
        }

        console.log(`\n💬 User prompt: "${req.body.prompt}"`);
        console.log(`📏 Prompt length: ${req.body.prompt.length} characters`);

        // Try chatCompletion with a model that supports it
        console.log(`🔄 Calling AI model...`);

        const result = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Provide detailed, comprehensive answers with multiple paragraphs and thorough explanations. Always include examples and context."
                },
                {
                    role: "user",
                    content: req.body.prompt
                }
            ],
            max_tokens: 1024,
            temperature: 0.7,
        });

        const assistantMessage = result.choices[0].message.content;
        const tokenCount = result.usage?.completion_tokens || 'unknown';
        console.log(`✅ Model: ${result.model}`);
        console.log(`✅ Tokens: ${tokenCount}`);
        console.log(`✅ Response: "${assistantMessage.substring(0, 150)}..."`);
        console.log(`📏 Length: ${assistantMessage.length} characters\n`);
        res.json({ generated_text: assistantMessage });
    } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: "Failed to generate text", details: error.message });
    }
}