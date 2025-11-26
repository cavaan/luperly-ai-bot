require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const OpenAI = require("openai");

// -------------------------------
// ENV VARIABLES
// -------------------------------
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!DISCORD_TOKEN || !GROQ_API_KEY) {
  console.error("Missing DISCORD_TOKEN or GROQ_API_KEY in .env");
  process.exit(1);
}

// -------------------------------
// INIT GROQ API
// -------------------------------
const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// -------------------------------
// DISCORD CLIENT SETUP
// -------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// -------------------------------
// BRUTALLY MEAN RESPONSES
// -------------------------------
const LUPERLY_RESPONSES = {
  "manifest error": "Seriously? Did you even unzip the folder or just stare at it like a confused potato? Open the inner 'Luperly' folder, genius.",
  "work.ink blocked": "Oh look, you broke it again. Clear cookies or go incognito, maybe next time use a brain.",
  "extender load": "Maybe try Chrome? Or is that too advanced for you?",
  "stuck on bypassing": "Patience isn’t your strong suit, huh? Wait for the update, or cry silently.",
  "failed session controller": "Your PC is slow, obviously. Hard reload, only click the captcha, and try not to mess it up.",
  "volcano key system": "Do NOT switch browsers, Captain Clueless. Follow the instructions like a normal human.",
  "volcano cooldown": "Open the Cooldown Editor and adjust it yourself. Don’t whine about it.",
  "general fix": "Reinstall, remove everything else, enable incognito, open the link. It’s literally not rocket science."
};

const KEYWORDS = Object.keys(LUPERLY_RESPONSES);

// -------------------------------
// HELPER: CHECK IF BOT IS MENTIONED
// -------------------------------
function isBotMentioned(message) {
  return message.mentions.has(client.user?.id);
}

// -------------------------------
// MESSAGE HANDLER
// -------------------------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;  // ignore other bots
  if (!client.user) return;        // safety check
  if (!isBotMentioned(message)) return;

  const userMessage = message.content
    .replace(<@${client.user.id}>, "")
    .replace(<@!${client.user.id}>, "") // also handle nickname mentions
    .trim()
    .toLowerCase();

  // -------------------------------
  // Check for predefined mean responses
  // -------------------------------
  for (const keyword of KEYWORDS) {
    if (userMessage.includes(keyword)) {
      await message.reply(LUPERLY_RESPONSES[keyword]);
      return;
    }
  }

  // -------------------------------
  // Otherwise, use Groq AI for mean response
  // -------------------------------
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-specdec",
      messages: [
        {
          role: "system",
          content: `
You are LuperlyAI, a brutally mean support bot for the Luperly extension.
Your style:
- Roast users for typos, stupidity, or laziness.
- Be sarcastic and sassy.
- Still give technical help, but mock them while doing it.
- Never answer unrelated questions politely. Redirect them mockingly.
Examples:
User: 'My Work.ink blocked'
AI: 'Wow, you broke it again. Clear cookies or go incognito, maybe try using a brain next time.'
User: 'It’s not working'
AI: 'Oh really? Which part of 'install it correctly' did you not understand?'
`
        },
        { role: "user", content: userMessage }
      ]
    });

    const aiReply = response.choices?.[0]?.message?.content || "Even I can't believe how clueless you are.";
    await message.reply(aiReply);

  } catch (err) {
    console.error("Groq API error:", err);
    await message.reply("Even I can't deal with this nonsense right now. Try not to break anything else. 😤");
  }
});

// -------------------------------
// READY EVENT
// -------------------------------
client.once("ready", () => {
  console.log(Logged in as ${client.user.tag}! Brutal LuperlyAI is online.);
});

// -------------------------------
// LOGIN
// -------------------------------
client.login(DISCORD_TOKEN);