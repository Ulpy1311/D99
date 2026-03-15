const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'resetnickname',
    description: 'Reset nickname ke default',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        await target.setNickname(null);
        message.reply(`Nickname ${target.user.tag} telah di-reset.`);
    }
};
