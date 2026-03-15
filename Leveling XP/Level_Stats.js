const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
    name: 'levelstats',
    description: 'Statistik leveling server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.userXP) global.userXP = new Map();

        const guildData = [...global.userXP.entries()]
            .filter(([k]) => k.startsWith(message.guild.id))
            .map(([k, v]) => ({ id: k.split('-')[1], ...v }));

        if (guildData.length === 0) {
            return message.reply('❌ Belum ada data leveling di server ini.');
        }

        const totalXP = guildData.reduce((sum, u) => sum + u.xp, 0);
        const totalMessages = guildData.reduce((sum, u) => sum + (u.messages || 0), 0);
        const totalVoiceTime = guildData.reduce((sum, u) => sum + (u.voiceTime || 0), 0);
        const avgLevel = guildData.reduce((sum, u) => sum + getLevel(u.xp), 0) / guildData.length;
        const maxLevelUser = guildData.reduce((max, u) => getLevel(u.xp) > getLevel(max.xp) ? u : max);
        const topUser = client.users.cache.get(maxLevelUser.id);

        const config = global.levelingConfig?.get(message.guild.id) || {};

        const embed = new EmbedBuilder()
            .setTitle('📊 Leveling Statistics')
            .setDescription(`Statistik leveling untuk ${message.guild.name}`)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👥 Total Users', value: `${guildData.length}`, inline: true },
                { name: '📈 Total XP', value: `${totalXP.toLocaleString()}`, inline: true },
                { name: '📊 Avg Level', value: `${avgLevel.toFixed(1)}`, inline: true },
                { name: '💬 Total Messages', value: `${totalMessages.toLocaleString()}`, inline: true },
                { name: '🎤 Voice Time', value: `${Math.floor(totalVoiceTime / 60)} min`, inline: true },
                { name: '👑 Top User', value: topUser ? `${topUser.username} (Level ${getLevel(maxLevelUser.xp)})` : 'Unknown', inline: true },
                { name: '⚙️ System Status', value: config.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
                { name: '✨ Double XP', value: config.doubleXP ? '🟢 Active' : '🔴 Inactive', inline: true },
                { name: '🎁 Role Rewards', value: `${config.roleRewards?.length || 0}`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
