module.exports = {
    commands: "ping",
    description: "Pong!",
    callback: async (message, arguments, text) => {
        const answer = await message.reply('Pong!')
        const ping = answer.createdTimestamp - message.createdTimestamp;;
        answer.edit(`Pong! Latency: ${ping}ms`);
    },
};