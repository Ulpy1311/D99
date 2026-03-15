const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'unlockserver',
    description: 'Buka kunci semua channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Hanya Administrator yang dapat membuka kunci server.');
        }

        const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
        
        for (const [id, channel] of channels) {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true
            }).catch(console.error);
        }

        message.reply('Semua channel teks telah dibuka kembali.');
    }
};
