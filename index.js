const { TOKEN } = require("./config.json");
const { exec } = require('child_process');
const path = require('path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const Cerebraly = ".\\bin\\Cerebraly.exe"
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

client.on(Events.MessageCreate, async (message) => {
    console.log("Received message")
    exec(`${Cerebraly}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing C++ program: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`C++ program returned an error: ${stderr}`);
            return;
        }

        // Process the output from the C++ program (stdout)
        console.log(`C++ program output: ${stdout}`);
    });
});

client.login(TOKEN).then(r => console.log("Logged in"));