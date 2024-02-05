const {  AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { configs } = require('../../data/levels.json');

const grid = {
    x: 8,
    y: 10,
    w: 5,
    h: 5,
    cw: 24,
    ch: 24,
    border: 8
}

const drawSend = async (message, thread, game) =>{
    const canvas = Canvas.createCanvas(400, 388);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./assets/background.png');
    const card = await Canvas.loadImage('./assets/card.png');
    const num = await Canvas.loadImage('./assets/num.png');

    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    for(let i = 0; i < grid.w; i++){
        for(let j = 0; j < grid.h; j++) {
            context.drawImage(card, (game.grid[i][j].index + 1) * (grid.cw + 1), 0, grid.cw, grid.ch, (grid.x + (i * (grid.cw + grid.border))) * 2, (grid.y + (j * (grid.ch + grid.border))) * 2, grid.cw * 2, grid.ch * 2);
        }
    }

    for(let i = 0; i < grid.w; i++){
        let totalTen = Math.floor(game.verticalEnd[i].total / 10);
        let totalOne = game.verticalEnd[i].total % 10;
        context.drawImage(num, 7 * totalTen, 0, 6, 8, ((grid.x + 9) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 7 * totalOne, 0, 6, 8, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 7 * game.verticalEnd[i].numVoltorbs, 0, 6, 8, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + 13 + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
    }

    for(let i = 0; i < grid.h; i++){
        let totalTen = Math.floor(game.horizontalEnd[i].total / 10);
        let totalOne = game.horizontalEnd[i].total % 10;
        context.drawImage(num, 7 * totalTen, 0, 6, 8, ((grid.x + 9) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 7 * totalOne, 0, 6, 8, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 7 * game.horizontalEnd[i].numVoltorbs, 0, 6, 8, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + 13 + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
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
}

const Voltorbataille = async (message, thread, game) =>{
    await drawSend(message, thread, game)
    const filter = m => m.author.id === message.author.id

    const collector = thread.createMessageCollector({ filter: filter, time: 3000 });

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
        if(m.content === "stop"){
            collector.stop();
        }
        else{
            thread.send("Voltorbataille is not yet implemented... YOU GOURMAND !");
        }
    });

    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
        thread.send("Voltorbataille stopped");
    });
};

const init = async (message, thread, level) =>{
    let game = {
        grid:[],
        verticalEnd:[],
        horizontalEnd:[]
    };

    for(let i = 0; i < grid.w; i++){
        game.grid.push([])
        for (let j = 0; j < grid.h; j++){
            game.grid[i].push({
                index: 1,
                reveled: false
            })
        }
    }
    for (let i = 0; i < grid.w; i++){
        game.verticalEnd.push({
            numVoltorbs: 0,
            total: 0
        });
    }
    for (let i = 0; i < grid.h; i++){
        game.horizontalEnd.push({
            numVoltorbs: 0,
            total: 0
        });
    }
    //get random number
    let randomLevelSeed = Math.random(10) + ((level - 1) * 10);
    let levelSpec = configs[Math.floor(randomLevelSeed)];
    let failCount = 0;

    //set the voltorbs
    for(let i = 0; i < levelSpec.voltorbs; i++){
        let x, y;
        do {
            x = Math.floor(Math.random() * grid.w);
            y = Math.floor(Math.random() * grid.h);
        } while (game.grid[x][y].index !== 1);
        game.grid[x][y].index = 0;
    }

    //set the twos
    for(let i = 0; i < levelSpec.twos; i++){
        let x, y;
        do {
            x = Math.floor(Math.random() * grid.w);
            y = Math.floor(Math.random() * grid.h);
        } while (game.grid[x][y].index !== 1);
        game.grid[x][y].index = 2;
    }

    //set the threes
    for(let i = 0; i < levelSpec.threes; i++){
        let x, y;
        do {
            x = Math.floor(Math.random() * grid.w);
            y = Math.floor(Math.random() * grid.h);
        } while (game.grid[x][y].index !== 1);
        game.grid[x][y].index = 3;
    }

    for(let i = 0; i < grid.w; i++){
        for(let j = 0; j < grid.h; j++){
            if(game.grid[i][j].index === 0){
                game.verticalEnd[i].numVoltorbs++;
                game.horizontalEnd[j].numVoltorbs++;
            }
            game.verticalEnd[i].total += game.grid[i][j].index;
            game.horizontalEnd[j].total += game.grid[i][j].index;
        }
    }

    await Voltorbataille(message, thread, game);
}

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
        await init(message, thread, 1);
    },
};