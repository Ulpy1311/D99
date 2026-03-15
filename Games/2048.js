const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const games2048 = new Map();

module.exports = {
    name: '2048',
    description: '2048 puzzle game',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (games2048.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung.');
        }

        const size = 4;
        const board = Array(size).fill(null).map(() => Array(size).fill(0));
        
        const addRandom = () => {
            const empty = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (board[r][c] === 0) empty.push({ r, c });
                }
            }
            if (empty.length === 0) return false;
            const cell = empty[Math.floor(Math.random() * empty.length)];
            board[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
            return true;
        };

        addRandom();
        addRandom();

        const gameState = {
            board, size, score: 0,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        games2048.set(key, gameState);

        const colors = {
            0: '⬜', 2: '🟥', 4: '🟧', 8: '🟨', 16: '🟩',
            32: '🟦', 64: '🟪', 128: '🟫', 256: '⬛', 512: '🟥',
            1024: '🟧', 2048: '🟨'
        };

        let display = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                display += colors[board[r][c]] || '🟦';
            }
            display += '\n';
        }

        const embed = new EmbedBuilder()
            .setTitle('🧩 2048')
            .setDescription(display)
            .addFields({ name: '📊 Score', value: `${gameState.score}` })
            .setColor(0x5865F2)
            .setFooter({ text: 'Gunakan tombol atau emoji untuk bermain' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('2048_up').setLabel('⬆️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('2048_left').setLabel('⬅️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('2048_down').setLabel('⬇️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('2048_right').setLabel('➡️').setStyle(ButtonStyle.Primary)
            );

        message.reply({ embeds: [embed], components: [row] });
    }
};

module.exports.games2048 = games2048;
