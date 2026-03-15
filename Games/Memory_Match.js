const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const memoryGames = new Map();

const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥', '🍌', '🫐', '🍈', '🍐', '🫒'];

module.exports = {
    name: 'memorymatch',
    description: 'Memory card matching game',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (memoryGames.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung.');
        }

        const pairs = parseInt(args[0]) || 8;
        const actualPairs = Math.min(Math.max(pairs, 4), 16);
        const selectedEmojis = emojis.slice(0, actualPairs);
        const cards = [...selectedEmojis, ...selectedEmojis];
        
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        const gameState = {
            cards,
            flipped: [],
            matched: [],
            moves: 0,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        memoryGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🧠 Memory Match')
            .setDescription('Temukan pasangan kartu yang sama!\nKlik kartu untuk membuka.')
            .addFields(
                { name: '📊 Pairs', value: `${actualPairs}`, inline: true },
                { name: '🎯 Moves', value: `${gameState.moves}`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        const rows = [];
        const cardsPerRow = 4;
        for (let i = 0; i < cards.length; i += cardsPerRow) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < cardsPerRow && i + j < cards.length; j++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`memory_${i + j}`)
                        .setLabel('❓')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            rows.push(row);
        }

        message.reply({ embeds: [embed], components: rows });
    }
};

module.exports.memoryGames = memoryGames;
module.exports.emojis = emojis;
