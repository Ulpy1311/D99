const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban member permanen',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Anda tidak memiliki izin untuk memblokir anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota yang ingin diblokir.');
        if (!target.bannable) return message.reply('Saya tidak bisa memblokir anggota ini.');

        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';

        await target.ban({ reason });

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Ban',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Member Banned')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Moderator', value: message.author.tag },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
