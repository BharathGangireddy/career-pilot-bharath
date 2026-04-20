const express = require('express');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ================= CONFIG =================

// 🔁 Multiple Gemini keys
const GEMINI_KEYS = process.env.GEMINI_API_KEYS
  ? process.env.GEMINI_API_KEYS.split(',')
  : [process.env.GEMINI_API_KEY];

// 🤖 Model
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// 🔄 Rotate keys
let currentKeyIndex = 0;
function getNextKey() {
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

console.log("🔑 Loaded Gemini Keys:", GEMINI_KEYS.length);

// ================= GEMINI =================

async function generateGemini(prompt) {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const apiKey = getNextKey();

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();

      // ✅ SUCCESS
      if (res.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`✅ Gemini success with key ${i + 1}`);
        return text || "⚠️ Empty AI response";
      }

      // 🔥 REAL ERROR MESSAGE
      const msg = data.error?.message || "Unknown error";
      console.error(`❌ Key ${i + 1} FAILED:`, msg);

      const lowerMsg = msg.toLowerCase();

      // ⚠️ Quota / rate
      if (lowerMsg.includes("quota") || lowerMsg.includes("rate")) {
        console.warn(`⚠️ Key ${i + 1} quota exceeded, trying next...`);
        continue;
      }

      // ❌ Invalid key
      if (lowerMsg.includes("api key not valid") || lowerMsg.includes("invalid")) {
        console.error(`❌ Key ${i + 1} is INVALID`);
        continue;
      }

      // ❌ Model issue
      if (lowerMsg.includes("not found")) {
        console.error(`❌ Model not supported: ${MODEL}`);
        break;
      }

      // ❌ Unknown error → try next key
      console.warn(`⚠️ Unknown error, trying next key...`);
      continue;

    } catch (err) {
      console.error(`🔥 Fetch error (key ${i + 1}):`, err.message);
    }
  }

  // 🔁 Fallback
  return await fallbackAI(prompt);
}

// ================= FALLBACK =================

async function fallbackAI(prompt) {
  try {
    console.log("⚠️ Using fallback AI");

    return "⚠️ AI service busy. Please try again later.";

  } catch (err) {
    console.error("🔥 Fallback error:", err.message);
    return "❌ All AI providers failed";
  }
}

// ================= ROUTES =================

// Cover Letter
router.post('/cover-letter/:jobId', async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      user: req.user._id
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const prompt = `
Write a professional cover letter.

Company: ${job.company}
Role: ${job.role}
Description: ${job.jobDescription || 'N/A'}

Resume:
${req.user.resumeText || 'Software developer'}
`;

    const text = await generateGemini(prompt);

    await Job.findByIdAndUpdate(job._id, { coverLetter: text });

    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Resume Tips
router.post('/resume-tips/:jobId', async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      user: req.user._id
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const prompt = `
Improve this resume.

Job: ${job.role}
Company: ${job.company}

Resume:
${req.user.resumeText || 'N/A'}
`;

    const text = await generateGemini(prompt);

    await Job.findByIdAndUpdate(job._id, { resumeTips: text });

    res.json({ text });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Interview Questions
router.post('/interview-questions/:jobId', async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      user: req.user._id
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const prompt = `
Generate interview questions.

Role: ${job.role}
Company: ${job.company}
`;

    const text = await generateGemini(prompt);

    await Job.findByIdAndUpdate(job._id, {
      interviewQuestions: text
    });

    res.json({ text });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;