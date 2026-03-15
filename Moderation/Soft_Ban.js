const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'softban',
    description: 'Ban & unban (hapus pesan saja)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('Anda tidak memiliki izin untuk memblokir anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota yang ingin di-softban.');
        if (!target.bannable) return message.reply('Saya tidak bisa memblokir anggota ini.');

        const reason = args.slice(1).join(' ') || 'Tidak ada alasan.';

        await target.ban({ deleteMessageDays: 7, reason: `Softban: ${reason}` });
        await message.guild.members.unban(target.id, 'Softban: Removing ban after message deletion');

        global.modHistory = global.modHistory || [];
        global.modHistory.push({
            type: 'Soft-Ban',
            user: target.user.tag,
            userId: target.id,
            moderator: message.author.tag,
            reason: reason,
            timestamp: new Date()
        });

        const embed = new EmbedBuilder()
            .setTitle('Member Soft-Banned')
            .setColor(0xFFFF00)
            .setDescription(`Pesan dari ${target.user.tag} dalam 7 hari terakhir telah dihapus dan user telah di-kick.`)
            .addFields(
                { name: 'Target', value: `${target.user.tag} (${target.id})` },
                { name: 'Moderator', value: message.author.tag }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
