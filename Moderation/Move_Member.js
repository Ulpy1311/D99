const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'move',
    description: 'Pindahkan member ke VC lain',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Mohon tag atau berikan ID anggota.');

        const channelId = args[1];
        if (!channelId) return message.reply('Mohon berikan ID voice channel tujuan.');

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel || !channel.isVoiceBased()) return message.reply('Channel tujuan tidak valid.');

        await target.voice.setChannel(channel);
        message.reply(`Berhasil memindahkan ${target.user.tag} ke ${channel.name}.`);
    }
};
