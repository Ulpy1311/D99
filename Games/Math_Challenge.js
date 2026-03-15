const { EmbedBuilder } = require('discord.js');

const mathGames = new Map();

function generateProblem(difficulty) {
    const ops = ['+', '-', '*', '/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    let a, b;
    
    switch (difficulty) {
        case 'easy':
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            break;
        case 'medium':
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * 50) + 10;
            break;
        case 'hard':
            a = Math.floor(Math.random() * 100) + 50;
            b = Math.floor(Math.random() * 100) + 50;
            break;
        default:
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
    }

    if (op === '/') {
        a = a * b;
    }

    let answer;
    switch (op) {
        case '+': answer = a + b; break;
        case '-': answer = a - b; break;
        case '*': answer = a * b; break;
        case '/': answer = a / b; break;
    }

    return { question: `${a} ${op} ${b}`, answer: Math.floor(answer) };
}

module.exports = {
    name: 'mathchallenge',
    description: 'Soal matematika cepat',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        const difficulty = args[0]?.toLowerCase() || 'easy';
        
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return message.reply('❌ Pilih difficulty: easy, medium, atau hard');
        }

        const { question, answer } = generateProblem(difficulty);

        const gameState = {
            answer,
            difficulty,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        mathGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🧮 Math Challenge')
            .setDescription(`Selesaikan: **${question}**\n\nKamu punya 30 detik!`)
            .addFields(
                { name: '📊 Difficulty', value: difficulty.toUpperCase(), inline: true },
                { name: '📝 Cara Jawab', value: 'Ketik `g!math <jawaban>`', inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.mathGames = mathGames;
module.exports.generateProblem = generateProblem;
