const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getXPForLevel(level) {
    return Math.pow(level / 0.1, 2);
}

function getXPForNextLevel(level) {
    return getXPForLevel(level + 1) - getXPForLevel(level);
}

module.exports = {
    name: 'rank',
    description: 'Lihat rank card kamu sendiri',
    async execute(message, args, client) {
        const user = message.author;

        if (!global.userXP) global.userXP = new Map();
        const userData = global.userXP.get(`${message.guild.id}-${user.id}`) || {
            xp: 0, level: 1, messages: 0, voiceTime: 0, prestige: 0, streak: 0, lastActive: null
        };

        const level = getLevel(userData.xp);
        const currentXP = userData.xp - getXPForLevel(level);
        const neededXP = getXPForNextLevel(level);

        const guildData = [...(global.userXP?.entries() || [])]
            .filter(([k]) => k.startsWith(message.guild.id))
            .sort((a, b) => b[1].xp - a[1].xp);

        const rank = guildData.findIndex(([k]) => k === `${message.guild.id}-${user.id}`) + 1 || 'N/A';

        const embed = new EmbedBuilder()
            .setTitle(`📊 Rank Card - ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🏆 Rank', value: `#${rank}`, inline: true },
                { name: '📈 Level', value: `${level}${userData.prestige > 0 ? ` (P${userData.prestige})` : ''}`, inline: true },
                { name: '⭐ XP', value: `${currentXP.toLocaleString()} / ${neededXP.toLocaleString()}`, inline: true },
                { name: '📊 Total XP', value: `${userData.xp.toLocaleString()}`, inline: true },
                { name: '💬 Messages', value: `${userData.messages.toLocaleString()}`, inline: true },
                { name: '🎤 Voice Time', value: `${Math.floor(userData.voiceTime / 60)} min`, inline: true },
                { name: '🔥 Streak', value: `${userData.streak || 0} days`, inline: true },
                { name: '📈 Progress', value: `${Math.floor((currentXP / neededXP) * 100)}% to next level`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp()
            .setFooter({ text: `Server: ${message.guild.name}` });

        message.reply({ embeds: [embed] });
    }
};

module.exports.getLevel = getLevel;
module.exports.getXPForLevel = getXPForLevel;
module.exports.getXPForNextLevel = getXPForNextLevel;
