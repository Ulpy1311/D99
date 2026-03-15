const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const snakeGames = new Map();

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

module.exports = {
    name: 'snake',
    description: 'Snake game',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (snakeGames.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung.');
        }

        const gridSize = 10;
        const snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
        const food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        const direction = 'RIGHT';
        const score = 0;

        const gameState = {
            snake, food, direction, score, gridSize,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        snakeGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🐍 Snake Game')
            .setDescription('Gunakan tombol untuk mengontrol ular!\nMakan 🍎 untuk skor!')
            .addFields({ name: '📊 Score', value: `${score}`, inline: true })
            .setColor(0x5865F2)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('snake_up').setLabel('⬆️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('snake_left').setLabel('⬅️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('snake_down').setLabel('⬇️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('snake_right').setLabel('➡️').setStyle(ButtonStyle.Primary)
            );

        message.reply({ embeds: [embed], components: [row] });
    }
};

module.exports.snakeGames = snakeGames;
module.exports.DIRECTIONS = DIRECTIONS;
