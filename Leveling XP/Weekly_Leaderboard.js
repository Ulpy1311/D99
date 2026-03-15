const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
}

module.exports = {
    name: 'weeklyleaderboard',
    description: 'Leaderboard mingguan',
    async execute(message, args, client) {
        if (!global.weeklyXP) global.weeklyXP = new Map();

        const weekKey = `${message.guild.id}-${getWeekNumber()}`;
        const weekData = global.weeklyXP.get(weekKey) || {};

        const sortedData = Object.entries(weekData)
            .map(([id, xp]) => ({ id, xp }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        if (sortedData.length === 0) {
            return message.reply('❌ Belum ada data XP minggu ini.');
        }

        let leaderboardText = '';
        for (let i = 0; i < sortedData.length; i++) {
            const data = sortedData[i];
            const user = client.users.cache.get(data.id);
            const username = user ? user.username : 'Unknown User';
            const level = getLevel(data.xp);
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            leaderboardText += `${medal} **${username}**\n   Level ${level} • ${data.xp.toLocaleString()} XP\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('📅 Weekly Leaderboard')
            .setDescription(leaderboardText)
            .addFields(
                { name: '📅 Week', value: `Week ${getWeekNumber()}`, inline: true },
                { name: '📊 Participants', value: `${sortedData.length}`, inline: true }
            )
            .setColor(0x00BCD4)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
