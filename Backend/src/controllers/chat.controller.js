import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyChatAccess(req, res) {
  try {
    const { targetUserId } = req.params;
    const currentUser = req.user;

    if (currentUser.id === targetUserId) {
      return res.status(400).json({ allowed: false, message: "Cannot chat with yourself" });
    }

    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === targetUserId
    );

    if (!isFriend) {
      return res.status(403).json({
        allowed: false,
        message: "You must be friends with this user to start a conversation",
      });
    }

    res.status(200).json({ allowed: true });
  } catch (error) {
    console.error("Error in verifyChatAccess controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyCallAccess(req, res) {
  try {
    const { callId } = req.params;
    const currentUserId = req.user.id;

    const userIds = callId.split("-");
    if (userIds.length === 2) {
      if (!userIds.includes(currentUserId)) {
        return res
          .status(403)
          .json({ allowed: false, message: "Not an authorized participant of this call" });
      }
      const otherUserId = userIds.find((id) => id !== currentUserId);
      const isFriend = req.user.friends.some((friendId) => friendId.toString() === otherUserId);
      if (!isFriend) {
        return res
          .status(403)
          .json({ allowed: false, message: "Participants must be connected as friends" });
      }
    }

    res.status(200).json({ allowed: true });
  } catch (error) {
    console.error("Error in verifyCallAccess controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function aiLanguageAssistant(req, res) {
  try {
    const { action, text, targetLanguage, nativeLanguage, partnerName } = req.body;

    if (!action || !["translate", "grammar-check", "icebreakers"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Supported actions: 'translate', 'grammar-check', 'icebreakers'",
      });
    }

    if ((action === "translate" || action === "grammar-check") && (!text || !text.trim())) {
      return res.status(400).json({
        message: "Text is required for translation and grammar checks",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured on the server",
      });
    }

    let prompt = "";
    if (action === "translate") {
      prompt = `You are an expert bilingual language tutor.
Translate the following text into ${targetLanguage || "English"}.
Original text: "${text.trim()}"
Native/Source context: ${nativeLanguage || "auto-detected"}

Respond in valid JSON format matching this exact schema:
{
  "translation": "Translated text accurately capturing conversational nuance",
  "phonetic": "Phonetic pronunciation guide or romanization",
  "explanation": "Brief cultural context, formality notes, or grammar tip (1-2 sentences)",
  "alternatives": ["More casual or formal alternative phrase 1", "Alternative phrase 2"]
}`;
    } else if (action === "grammar-check") {
      prompt = `You are an expert language teacher and proofreader.
Analyze the following sentence for grammar, spelling, natural phrasing, and idiomatic flow in ${targetLanguage || "the source language"}.
Sentence to evaluate: "${text.trim()}"

Respond in valid JSON format matching this exact schema:
{
  "corrected": "Corrected and naturally phrased version of the sentence",
  "hasErrors": true,
  "explanation": "Clear, friendly explanation of what was corrected and why",
  "suggestions": ["Natural conversational variation 1", "Formal/casual variation 2"]
}`;
    } else if (action === "icebreakers") {
      prompt = `You are a friendly language exchange conversation coordinator.
Generate 4 engaging, culturally interesting conversation starters or practice questions in ${targetLanguage || "Spanish"}.
The conversation is between a language learner and their exchange partner ${partnerName ? `(${partnerName})` : ""}.
Target language being practiced: ${targetLanguage || "Spanish"}.
Learner's native language: ${nativeLanguage || "English"}.

Respond in valid JSON format matching this exact schema:
{
  "icebreakers": [
    {
      "topic": "Topic category (e.g. Travel, Daily Life, Food, Hobbies)",
      "prompt": "Engaging question in ${targetLanguage || "Spanish"}",
      "translation": "English translation of the question",
      "tip": "Short vocabulary hint or follow-up question tip"
    }
  ]
}`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return res.status(502).json({
        message: errorData?.error?.message || "Failed to communicate with Gemini AI",
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(502).json({ message: "No response received from AI model" });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(candidateText);
    } catch {
      parsedResult = { raw: candidateText };
    }

    res.status(200).json({
      success: true,
      action,
      data: parsedResult,
    });
  } catch (error) {
    console.error("Error in aiLanguageAssistant controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}