const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

module.exports = {
    name: 'monthlyleaderboard',
    description: 'Leaderboard bulanan',
    async execute(message, args, client) {
        if (!global.monthlyXP) global.monthlyXP = new Map();

        const monthKey = `${message.guild.id}-${getMonthKey()}`;
        const monthData = global.monthlyXP.get(monthKey) || {};

        const sortedData = Object.entries(monthData)
            .map(([id, xp]) => ({ id, xp }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        if (sortedData.length === 0) {
            return message.reply('❌ Belum ada data XP bulan ini.');
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

        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();

        const embed = new EmbedBuilder()
            .setTitle('📆 Monthly Leaderboard')
            .setDescription(leaderboardText)
            .addFields(
                { name: '📅 Bulan', value: `${months[now.getMonth()]} ${now.getFullYear()}`, inline: true },
                { name: '📊 Participants', value: `${sortedData.length}`, inline: true }
            )
            .setColor(0xE91E63)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
