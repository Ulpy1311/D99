const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'disconnect',
    description: 'Disconnect member dari VC',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        if (!target.voice.channel) return message.reply('Anggota tersebut tidak berada dalam voice channel.');

        await target.voice.disconnect();
        message.reply(`Berhasil memutus koneksi ${target.user.tag} dari voice channel.`);
    }
};
