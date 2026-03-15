const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Kunci channel (no send)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false
        });

        message.reply('Channel ini telah dikunci.');
    }
};
