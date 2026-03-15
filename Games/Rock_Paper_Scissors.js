const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const rpsGames = new Map();

module.exports = {
    name: 'rockpaperscissors',
    description: 'Rock Paper Scissors game',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();
        
        if (opponent && !opponent.bot && opponent.id !== message.author.id) {
            if (rpsGames.has(`${message.guild.id}-${message.channel.id}`)) {
                return message.reply('❌ Ada game yang sedang berlangsung.');
            }

            const gameState = {
                players: [message.author.id, opponent.id],
                choices: {},
                startedAt: Date.now()
            };

            rpsGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

            const embed = new EmbedBuilder()
                .setTitle('✊ Rock Paper Scissors')
                .setDescription(`**${message.author}** vs **${opponent}**\n\nPilih gerakanmu!`)
                .setColor(0x5865F2)
                .setTimestamp();

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('rps_rock_1').setLabel('✊ Rock').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('rps_paper_1').setLabel('✋ Paper').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('rps_scissors_1').setLabel('✌️ Scissors').setStyle(ButtonStyle.Danger)
                );

            return message.reply({ embeds: [embed], components: [row1] });
        }

        const choices = ['✊ Rock', '✋ Paper', '✌️ Scissors'];
        const botChoice = Math.floor(Math.random() * 3);
        
        let playerChoice;
        const choice = args[0]?.toLowerCase();
        if (choice === 'rock' || choice === 'r') playerChoice = 0;
        else if (choice === 'paper' || choice === 'p') playerChoice = 1;
        else if (choice === 'scissors' || choice === 's') playerChoice = 2;
        else {
            return message.reply('❌ Pilih: rock, paper, atau scissors');
        }

        let result;
        if (playerChoice === botChoice) result = '🤝 Seri!';
        else if ((playerChoice + 1) % 3 === botChoice) result = '😢 Kamu kalah!';
        else result = '🎉 Kamu menang!';

        const embed = new EmbedBuilder()
            .setTitle('✊ Rock Paper Scissors')
            .addFields(
                { name: '👤 Kamu', value: choices[playerChoice], inline: true },
                { name: '🤖 Bot', value: choices[botChoice], inline: true },
                { name: '📊 Hasil', value: result }
            )
            .setColor(result.includes('menang') ? 0x00FF00 : result.includes('kalah') ? 0xFF0000 : 0xFFA500)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.rpsGames = rpsGames;
