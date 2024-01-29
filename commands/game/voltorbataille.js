const Discord = require("discord.js");
const Canvas = require('@napi-rs/canvas');
const Voltorbataille = async (message, thread) =>{
    const canvas = Canvas.createCanvas(526, 360);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./assets/placeholder.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    //const attachment = await new Discord.AttachmentBuilder('./assets/placeholder.jpg' );
    const attachment = await new Discord.AttachmentBuilder(await canvas.encode('png'), { name: 'placeholder.png' });

    const embed = new Discord.EmbedBuilder()
        .setTitle("Voltorbataille")
        .setColor([255, 50, 50])
        .setFooter({ text: `request by ${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setImage('attachment://placeholder.png')
    const msg = await thread.send({ embeds: [embed], files: [attachment]})
};

module.exports = {
    commands: "vb",
    description: "Start a game of Voltorbataille",
    callback: async (message, arguments, text) => {
        message.reply("Voltorbataille is not yet implemented... YOU GOURMAND !");
        const thread = await message.startThread({
            name: 'Voltorbataille',
            autoArchiveDuration: 60,
            reason: 'Voltorbataille need more reason ?',
        });
        await Voltorbataille(message, thread);
    },
};