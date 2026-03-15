const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Buka kunci channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: true
        });

        message.reply('Channel ini telah dibuka kembali.');
    }
};
