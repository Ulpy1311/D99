const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
    name: 'leaderboard',
    description: 'Server leaderboard (top 10)',
    async execute(message, args, client) {
        if (!global.userXP) global.userXP = new Map();

        const guildData = [...global.userXP.entries()]
            .filter(([k]) => k.startsWith(message.guild.id))
            .map(([k, v]) => ({ id: k.split('-')[1], ...v }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        if (guildData.length === 0) {
            return message.reply('❌ Belum ada data leveling di server ini.');
        }

        let leaderboardText = '';
        for (let i = 0; i < guildData.length; i++) {
            const data = guildData[i];
            const user = client.users.cache.get(data.id);
            const username = user ? user.username : 'Unknown User';
            const level = getLevel(data.xp);
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            leaderboardText += `${medal} **${username}**\n   Level ${level} • ${data.xp.toLocaleString()} XP\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Server Leaderboard')
            .setDescription(leaderboardText)
            .addFields(
                { name: '📊 Total Users', value: `${guildData.length}`, inline: true },
                { name: '📅 Updated', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
