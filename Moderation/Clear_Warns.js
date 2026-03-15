const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clearwarns',
    description: 'Hapus warnings member',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Anda tidak memiliki izin untuk menghapus peringatan.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        global.warns = global.warns || new Map();
        global.warns.delete(target.id);

        const embed = new EmbedBuilder()
            .setTitle('Warnings Cleared')
            .setColor(0x00FF00)
            .setDescription(`Semua warning untuk ${target.user.tag} telah dihapus.`)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
