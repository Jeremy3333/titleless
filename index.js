const { TOKEN } = require("./config.json");
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.on("ready", async () => {
    console.log("Bot is online and ready to rock! 🚀");
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Watching ${client.guilds.cache.size} servers and ${client.users.cache.size} users`);
});

client.on("message", async (message) => {
    console.log(message.content);
    if (message.author.bot) return;
    if (message.content.startsWith("!ping")) {
        message.channel.send("pong!");
    }
}
)

client.login(TOKEN);