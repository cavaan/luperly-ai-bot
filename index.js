require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const OpenAI = require("openai");

// Initialize Groq (OpenAI-format API)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// -------------------------------
// MEAN / PREDEFINED LUPERLY RESPONSES
// -------------------------------
const LUPERLY_RESPONSES = {
  "manifest error": `
*Manifest Error Fix (Don't panic 😄)*  
Extract the zip/rar file. If your PC refuses, download WinRAR.  
Select the Luperly folder. If the manifest error persists, pick the inner "Luperly" folder. Don't be dumb, try this first.
`,

  "work.ink blocked": `
*Work.ink Blocked?*  
Someone messed up. Clear cookies or go incognito.  
Enable "Allow in Incognito" in Chrome extensions.  
Boom. Fixed. Even you can do that. 🚀
`,

  "extender load": `
*Extender Not Loading?*  
Use Chrome. Brave shields? Turn them off.  
Adblockers? Disable them.  
Other browsers? Stop trying. 👍
`,

  "stuck on bypassing": `
*Stuck on “Bypassing...” ?*  
It’s not you, it’s Work.ink.  
Wait for the next update. ☕🙂
`,

  "failed session controller": `
*Failed to find the session controller*  
Your PC is slow. Hard reload a couple times.  
Only click the captcha, genius. 💡
`,

  "volcano key system": `
*Volcano Key System Error*  
User error 99% of the time.  
Don’t switch browsers mid-process.  
Follow instructions exactly.
`,

  "volcano cooldown": `
*Reset Volcano Cooldown to 40s:*  
Pin the newest Luperly extension.  
Click it → Open Cooldown Editor → Set 40s. Done. 🔥
`,

  "general fix": `
*Full Reset Method:*  
1. Install the latest version.  
2. Remove all other extensions.  
3. Re-add Luperly.  
4. Enable "Allow in Incognito".  
5. Open Incognito → Paste Volcano key link.  
99% fixed. 💯
`
};

const KEYWORDS = Object.keys(LUPERLY_RESPONSES);

// -------------------------------
// MESSAGE HANDLER
// -------------------------------
client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.mentions.has(client.user)) return;

    // Remove mention from text
    const userMessage = message.content.replace(<@${client.user.id}>, "").trim();
    const lower = userMessage.toLowerCase();

    // Check predefined responses
    for (const keyword of KEYWORDS) {
      if (lower.includes(keyword)) {
        await message.reply(LUPERLY_RESPONSES[keyword]);
        return;
      }
    }

    // Fallback AI response
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-specdec",
        messages: [
          {
            role: "system",
            content: "You are LuperlyAI, a mean and sarcastic assistant for Luperly extension. Only answer Luperly-related questions. If unrelated, respond sassy but bring back to Luperly."
          },
          { role: "user", content: userMessage }
        ]
      });

      const aiReply = response.choices?.[0]?.message?.content || "I can't answer that 😏";
      await message.reply(aiReply);

    } catch (err) {
      console.error("Groq API error:", err);
      await message.reply("Oops, even I can't handle that 😅");
    }

  } catch (err) {
    console.error("Message handler error:", err);
  }
});

// -------------------------------
client.once("ready", () => {
  console.log(Logged in as ${client.user.tag}! Brutal LuperlyAI is online.);
});

// -------------------------------
client.login(process.env.DISCORD_TOKEN);