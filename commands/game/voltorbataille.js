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
            if(game.grid[i][j].reveled){
                context.drawImage(card, (game.grid[i][j].index + 1) * (grid.cw + 1) * 2, 0, grid.cw * 2, grid.ch * 2, (grid.x + (i * (grid.cw + grid.border))) * 2, (grid.y + (j * (grid.ch + grid.border))) * 2, grid.cw * 2, grid.ch * 2);
            }
            else{
                context.drawImage(card, 0, 0, grid.cw * 2, grid.ch * 2, (grid.x + (i * (grid.cw + grid.border))) * 2, (grid.y + (j * (grid.ch + grid.border))) * 2, grid.cw * 2, grid.ch * 2);
            }
        }
    }

    for(let i = 0; i < grid.w; i++){
        let totalTen = Math.floor(game.verticalEnd[i].total / 10);
        let totalOne = game.verticalEnd[i].total % 10;
        context.drawImage(num, 14 * totalTen, 0, 12, 16, ((grid.x + 9) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 14 * totalOne, 0, 12, 16, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 14 * game.verticalEnd[i].numVoltorbs, 0, 12, 16, ((grid.x + 17) + (i * (grid.cw + grid.border)))*2, (grid.y + 13 + ((grid.h) * (grid.ch + grid.border))) * 2, 12, 16)
    }

    for(let i = 0; i < grid.h; i++){
        let totalTen = Math.floor(game.horizontalEnd[i].total / 10);
        let totalOne = game.horizontalEnd[i].total % 10;
        context.drawImage(num, 14 * totalTen, 0, 12, 16, ((grid.x + 9) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 14 * totalOne, 0, 12, 16, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
        context.drawImage(num, 14 * game.horizontalEnd[i].numVoltorbs, 0, 12, 16, ((grid.x + 17) + (grid.w * (grid.cw + grid.border)))*2, (grid.y + 13 + ((i) * (grid.ch + grid.border))) * 2, 12, 16)
    }

    //const attachment = await new Discord.AttachmentBuilder('./assets/placeholder.jpg' );
    const attachment = await new AttachmentBuilder(await canvas.encode('png'), { name: 'background.png' });

    const footerOptions = {
        text: `request by ${message.author.tag}`,
        iconURL: message.author.avatarURL(),
    };

    const embed = new EmbedBuilder()
        .setTitle("Voltorbataille")
        .setDescription(`Score: ${game.score}`)
        .setColor([255, 50, 50])
        .setFooter(footerOptions)
        .setImage('attachment://background.png')
    await thread.send({ embeds: [embed], files: [attachment]})
}

const revele = (game, x, y) =>{
    if(game.grid[x][y].reveled){
        return;
    }
    game.grid[x][y].reveled = true;
    if(game.score === 0){
        game.score = game.grid[x][y].index;
    }
    else{
        game.score *= game.grid[x][y].index;
    }
}

const Voltorbataille = async (message, thread, game) =>{
    await drawSend(message, thread, game)
    const filter = m => m.author.id === message.author.id

    const collector = thread.createMessageCollector({ filter: filter, time: 30000 });

    collector.on('collect', async m => {
        console.log(`Collected ${m.content}`);
       switch (m.content) {
           case "stop":
               collector.stop();
               break;
           case "reveal":
               for(let i = 0; i < grid.w; i++){
                   for(let j = 0; j < grid.h; j++){
                       game.grid[i][j].reveled = true;
                   }
               }
               //reset the timer
                collector.resetTimer();
               await drawSend(message, thread, game);
               break;
           default:
               let x = parseInt(m.content.split(" ")[0]);
               let y = parseInt(m.content.split(" ")[1]);
               if(game.grid[x][y].reveled){
                   message.reply("This card is already revealed");
               }
               else{
                   revele(game, x, y);
               }
                //reset the timer
                collector.resetTimer();
                await drawSend(message, thread, game);
               break;
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
        horizontalEnd:[],
        score: 0
    };

    // delete everything in the grid, verticalEnd and horizontalEnd
    game.grid = [];
    game.verticalEnd = [];
    game.horizontalEnd = [];

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