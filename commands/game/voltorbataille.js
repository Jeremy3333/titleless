const {  AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

const grid = {
    x: 8,
    y: 10,
    w: 5,
    h: 5,
    cw: 24,
    ch: 24,
    border: 8
}

const Voltorbataille = async (message, thread) =>{
    const canvas = Canvas.createCanvas(400, 388);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./assets/background.png');
    const card = await Canvas.loadImage('./assets/card.png');
    const num = await Canvas.loadImage('./assets/num.png');

    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    for(let i = 0; i < grid.w; i++){
        for(let j = 0; j < grid.h; j++) {
            context.drawImage(card, 0, 0, grid.cw, grid.ch, (grid.x + (i * (grid.cw + grid.border))) * 2, (grid.y + (j * (grid.ch + grid.border))) * 2, grid.cw * 2, grid.ch * 2);
        }
    }

    for(let i = 0; i < grid.w; i++){
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 9) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + 13 + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
    }

    for(let i = 0; i < grid.h; i++){
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 9) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 0, 0, 6, 8, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + 13 + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
    }

    //const attachment = await new Discord.AttachmentBuilder('./assets/placeholder.jpg' );
    const attachment = await new AttachmentBuilder(await canvas.encode('png'), { name: 'background.png' });

    const footerOptions = {
        text: `request by ${message.author.tag}`,
        iconURL: message.author.avatarURL(),
    };

    const embed = new EmbedBuilder()
        .setTitle("Voltorbataille")
        .setColor([255, 50, 50])
        .setFooter(footerOptions)
        .setImage('attachment://background.png')
    await thread.send({ embeds: [embed], files: [attachment]})
};

module.exports = {
    commands: "vb",
    description: "Start a game of Voltorbataille",
    callback: async (message, _) => {
        message.reply("Voltorbataille is not yet implemented... YOU GOURMAND !");
        let thread;
        if(message.channel.isThread()){
            thread = message.channel
        }
        else {
            thread = await message.startThread({
                name: 'Voltorbataille',
                autoArchiveDuration: 60,
                reason: 'Voltorbataille need more reason ?',
            });
        }
        await Voltorbataille(message, thread);
    },
};