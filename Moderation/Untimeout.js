const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'untimeout',
    description: 'Remove timeout',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('Anda tidak memiliki izin untuk menghapus timeout anggota.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        if (!target.communicationDisabledUntil) return message.reply('Anggota ini tidak sedang dalam timeout.');

        await target.timeout(null);

        const embed = new EmbedBuilder()
            .setTitle('Timeout Removed')
            .setColor(0x00FF00)
            .setDescription(`Timeout untuk ${target.user.tag} telah dihapus.`)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
