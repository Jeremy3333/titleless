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
    let Desc = "";

    if(game.finish){
        if(game.win){
            Desc = `You win ! Your score is ${game.score} !`
        }
        else{
            Desc = "You lose ! Your score is 0 !"
        }
    }
    else{
        Desc = `Score: ${game.score} !`
    }

    const embed = new EmbedBuilder()
        .setTitle("Voltorbataille")
        .setDescription(Desc)
        .setColor([255, 50, 50])
        .setFooter(footerOptions)
        .setImage('attachment://background.png')
    await thread.send({ embeds: [embed], files: [attachment]})
}

const revel = (game, x, y) =>{
    if(game.grid[x][y].reveled){
        return;
    }
    game.grid[x][y].reveled = true;
    if(game.grid[x][y].index === 0){
        game.finish = true;
        game.win = false;
        game.score = 0;
        return;
    }
    if(game.score === 0){
        game.score = game.grid[x][y].index;
    }
    else{
        game.score *= game.grid[x][y].index;
    }
    let win = true;
    for (let i = 0; i < grid.w; i++){
        for(let j = 0; j < grid.h; j++){
            if(!game.grid[i][j].reveled && game.grid[i][j].index !== 0 && game.grid[i][j].index !== 1){
                win = false;
            }
        }
    }
    if(win){
        game.finish = true;
        game.win = true;
    }
}

const Voltorbataille = async (message, thread, game) =>{
    await drawSend(message, thread, game)
    const filter = m => m.author.id === message.author.id

    const collector = thread.createMessageCollector({ filter: filter, time: 60000 });

    collector.on('collect', async m => {
        console.log(`Collected ${m.content}`);
        let x = m.content.split(" ");
       switch (x[0]) {
           case "stop":
               collector.stop();
               break;
           case "revAll":
               for(let i = 0; i < grid.w; i++){
                   for(let j = 0; j < grid.h; j++){
                       game.grid[i][j].reveled = true;
                   }
               }
               //reset the timer
                collector.resetTimer();
               await drawSend(message, thread, game);
               break;
           case "rev":
               if(game.grid[x[1]][x[2]].reveled){
                   message.reply("This card is already revealed");
               }
               else{
                     revel(game, x[1], x[2]);
               }
                //reset the timer
                collector.resetTimer();
               if(game.finish){
                   collector.stop();
               }
                await drawSend(message, thread, game);
               break;
           case "row":
               for (let i = 0; i < grid.w; i++){
                   if(!game.grid[i][x[1]].reveled){
                       revel(game, i, x[1]);
                   }
                   if(game.finish){
                       collector.stop();
                       break;
                   }
               }
               await drawSend(message, thread, game);
               break;
           case "col":
               for (let i = 0; i < grid.h; i++){
                   if(!game.grid[x[1]][i].reveled){
                       revel(game, x[1], i);
                   }
                   if(game.finish){
                       collector.stop();
                       break;
                   }
               }
               await drawSend(message, thread, game);
               break;
           default:
                message.reply("Invalid command");
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
        score: 0,
        finish: false
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