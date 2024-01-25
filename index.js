const { TOKEN, prefix } = require("./config.json");
const { Client, Events, GatewayIntentBits } = require('discord.js');
const fs= require("fs");
const path = require("path");
const baseFile = ("commandBase.js");
const commandBase = require(`./commands/${baseFile}`);
const commands = { commands: [] };

const client = new Client({
    intents: [
        GatewayIntentBits["Guilds"],
        GatewayIntentBits["GuildMessages"],
        GatewayIntentBits["MessageContent"],
        GatewayIntentBits["GuildMembers"],
    ],
});

client.on("ready", async () => {
    console.log("Bot is online and ready to rock! 🚀");
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Watching ${client.guilds.cache.size} servers and ${client.users.cache.size} users`);

    const readCommands = (dir) => {
        const files = fs.readdirSync(path.join(__dirname, dir));
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file));
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file));
            } else if (file !== baseFile) {
                const option = require(path.join(__dirname, dir, file));
                commandBase(option);
                if (typeof option.commands === "string") {
                    commands.commands.push({
                        name: option.commands,
                        value: option.description,
                    });
                } else {
                    commands.commands.push({
                        name: option.commands[0],
                        value: option.description,
                    });
                }
            }
        }
    };
    readCommands("commands");
    const json = JSON.stringify(commands);
    fs.writeFile("./json/commands.json", json, function (err) {
        if (err) return console.log(err);
    });
    commandBase.listen(client, Events.MessageCreate);
});
client.login(TOKEN).then(r => console.log(`Logged in: ${r}`));