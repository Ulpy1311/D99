const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'voicedeafen',
    description: 'Server deafen di VC',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        await target.voice.setDeaf(true);
        message.reply(`Berhasil men-server deafen ${target.user.tag}.`);
    }
};
