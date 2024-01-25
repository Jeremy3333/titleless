const Discord = require('discord.js');
async function help(r, msg, embedStat, orgCommands, message){
    // Check what reaction was add
    if(r._emoji.name === "➡️") {
        if(embedStat >= orgCommands.length - 1){
            embedStat = 0
        } else {
            embedStat++
        }
    } else if(r._emoji.name === "⬅️"){
        if (embedStat <= 0){
            embedStat = orgCommands.length - 1
        } else {
            embedStat--
        }
    }

    // Create the new embed and edit the last one
    const embed = new Discord.EmbedBuilder()
        .setTitle("Help")
        .setColor("#1EF900")
        .setFooter(`request by ${message.author.tag}`, message.author.avatarURL())
        .addFields(orgCommands[embedStat])
    msg = await msg.edit(embed)

    // Listen to the reaction change
    const filter = () => 2 == 2;
    const collector = msg.createReactionCollector(filter, { time: 15000, max: 1 });
    collector.on('collect', r => help(r, msg, embedStat, orgCommands, message));
}

module.exports = {
    commands: "Help",
    description: "anwser with a list of all commands",
    callback: async (message, arguments, text) => {
        const answer = await message.reply('Pong!')
        const ping = answer.createdTimestamp - message.createdTimestamp;;
        answer.edit(`Pong! Latency: ${ping}ms`);
    },
};