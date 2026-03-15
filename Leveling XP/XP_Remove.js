const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
    name: 'xpremove',
    description: 'Admin kurangi XP dari user',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const target = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
        const amount = parseInt(args[1]);

        if (!target) {
            return message.reply('❌ Silakan mention user atau berikan user ID.');
        }

        if (!amount || amount < 1) {
            return message.reply('❌ Silakan berikan jumlah XP yang valid (minimum 1).');
        }

        if (!global.userXP) global.userXP = new Map();
        const key = `${message.guild.id}-${target.id}`;
        const userData = global.userXP.get(key);

        if (!userData || userData.xp === 0) {
            return message.reply('❌ User tidak memiliki XP.');
        }

        const oldLevel = getLevel(userData.xp);
        userData.xp = Math.max(0, userData.xp - amount);
        const newLevel = getLevel(userData.xp);
        userData.level = newLevel;
        global.userXP.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('➖ XP Removed')
            .setDescription(`${amount.toLocaleString()} XP telah dikurangi dari ${target}`)
            .addFields(
                { name: 'User', value: `${target.tag}`, inline: true },
                { name: 'XP Removed', value: `${amount.toLocaleString()}`, inline: true },
                { name: 'Total XP', value: `${userData.xp.toLocaleString()}`, inline: true },
                { name: 'Level', value: oldLevel !== newLevel ? `${oldLevel} → ${newLevel}` : `${newLevel}`, inline: true },
                { name: 'Removed by', value: message.author.tag, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
