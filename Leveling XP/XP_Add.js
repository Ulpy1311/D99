const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getXPForLevel(level) {
    return Math.pow(level / 0.1, 2);
}

module.exports = {
    name: 'xpadd',
    description: 'Admin tambah XP manual ke user',
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

        if (amount > 100000) {
            return message.reply('❌ Maximum 100,000 XP per command.');
        }

        if (!global.userXP) global.userXP = new Map();
        const key = `${message.guild.id}-${target.id}`;
        const userData = global.userXP.get(key) || {
            xp: 0, level: 1, messages: 0, voiceTime: 0, prestige: 0, streak: 0
        };

        const oldLevel = getLevel(userData.xp);
        userData.xp += amount;
        const newLevel = getLevel(userData.xp);
        userData.level = newLevel;
        global.userXP.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('➕ XP Added')
            .setDescription(`${amount.toLocaleString()} XP telah ditambahkan ke ${target}`)
            .addFields(
                { name: 'User', value: `${target.tag}`, inline: true },
                { name: 'XP Added', value: `${amount.toLocaleString()}`, inline: true },
                { name: 'Total XP', value: `${userData.xp.toLocaleString()}`, inline: true },
                { name: 'Level', value: oldLevel !== newLevel ? `${oldLevel} → ${newLevel}` : `${newLevel}`, inline: true },
                { name: 'Added by', value: message.author.tag, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
