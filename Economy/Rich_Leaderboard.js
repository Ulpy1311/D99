const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'richleaderboard',
    description: 'Leaderboard user terkaya',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();

        const guildData = [...global.economyData.entries()]
            .filter(([k]) => k.startsWith(message.guild.id))
            .map(([k, v]) => ({ id: k.split('-')[1], ...v }))
            .sort((a, b) => (b.wallet + b.bank) - (a.wallet + a.bank))
            .slice(0, 10);

        if (guildData.length === 0) {
            return message.reply('❌ Belum ada data ekonomi.');
        }

        let leaderboardText = '';
        for (let i = 0; i < guildData.length; i++) {
            const data = guildData[i];
            const user = client.users.cache.get(data.id);
            const username = user ? user.username : 'Unknown';
            const total = data.wallet + data.bank;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            leaderboardText += `${medal} **${username}**\n   💰 ${total.toLocaleString()} ${config.currencyName}\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`💰 Richest Users - ${message.guild.name}`)
            .setDescription(leaderboardText)
            .setColor(0xFFD700)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
