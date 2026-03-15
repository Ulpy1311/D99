const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpresetuser',
    description: 'Reset XP user tertentu',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const target = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;

        if (!target) {
            return message.reply('❌ Silakan mention user atau berikan user ID.');
        }

        if (!global.userXP) global.userXP = new Map();
        const key = `${message.guild.id}-${target.id}`;

        if (!global.userXP.has(key)) {
            return message.reply('❌ User tidak memiliki data XP.');
        }

        global.userXP.delete(key);

        const embed = new EmbedBuilder()
            .setTitle('🔄 XP Reset')
            .setDescription(`XP ${target} telah direset.`)
            .addFields(
                { name: 'User', value: `${target.tag}`, inline: true },
                { name: 'User ID', value: target.id, inline: true },
                { name: 'Reset by', value: message.author.tag, inline: true }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
