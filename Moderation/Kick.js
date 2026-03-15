const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick member dari server',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('Anda tidak memiliki izin untuk mengeluarkan anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota yang ingin dikeluarkan.');
        if (!target.kickable) return message.reply('Saya tidak bisa mengeluarkan anggota ini (role mungkin lebih tinggi).');

        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';

        await target.kick(reason);

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Kick',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Member Kicked')
            .setColor(0xFFA500)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Moderator', value: message.author.tag },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
