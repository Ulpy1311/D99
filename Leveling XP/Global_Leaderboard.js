const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
    name: 'globalleaderboard',
    description: 'Global leaderboard (cross-server)',
    async execute(message, args, client) {
        if (!global.userXP) global.userXP = new Map();

        const globalData = {};

        for (const [key, data] of global.userXP.entries()) {
            const userId = key.split('-')[1];
            if (!globalData[userId]) {
                globalData[userId] = { xp: 0, messages: 0, voiceTime: 0 };
            }
            globalData[userId].xp += data.xp;
            globalData[userId].messages += data.messages || 0;
            globalData[userId].voiceTime += data.voiceTime || 0;
        }

        const sortedData = Object.entries(globalData)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        if (sortedData.length === 0) {
            return message.reply('❌ Belum ada data leveling global.');
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
            .setTitle('🌍 Global Leaderboard')
            .setDescription(leaderboardText)
            .addFields(
                { name: '📊 Total Users', value: `${sortedData.length}`, inline: true },
                { name: '🌐 Servers', value: `${client.guilds.cache.size}`, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

        message.reply({ embeds: [embed] });
    }
};
