const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'lockserver',
    description: 'Kunci semua channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Hanya Administrator yang dapat mengunci server.');
        }

        const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        
        for (const [id, channel] of channels) {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            }).catch(console.error);
        }

        message.reply('Semua channel teks telah dikunci.');
    }
};
