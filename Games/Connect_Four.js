const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const games = new Map();

module.exports = {
    name: 'connectfour',
    description: 'Connect Four game',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();
        
        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention user yang valid untuk bermain.');
        }

        if (games.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ Ada game yang sedang berlangsung.');
        }

        const gameState = {
            players: [message.author.id, opponent.id],
            board: Array(6).fill(null).map(() => Array(7).fill(null)),
            turn: 0,
            startedAt: Date.now()
        };

        games.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const symbols = ['🔴', '🟡'];
        const colors = [0xFF0000, 0xFFFF00];

        const embed = new EmbedBuilder()
            .setTitle('🔴 Connect Four')
            .setDescription(`**${message.author}** (🔴) vs **${opponent}** (🟡)\n\nGiliran: <@${gameState.players[0]}>`)
            .setColor(colors[0])
            .setTimestamp();

        const rows = [];
        for (let row = 0; row < 6; row++) {
            const actionRow = new ActionRowBuilder();
            for (let col = 0; col < 7; col++) {
                actionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`cf_${col}`)
                        .setLabel('⬜')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            rows.push(actionRow);
        }

        const colRow = new ActionRowBuilder();
        for (let col = 1; col <= 7; col++) {
            colRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`cf_drop_${col - 1}`)
                    .setLabel(`${col}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        message.reply({ embeds: [embed], components: [colRow] });
    }
};

module.exports.games = games;
