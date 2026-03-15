const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setlogchannel',
    description: 'Set channel untuk logging server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channel) {
            return message.reply('Silakan mention channel atau berikan channel ID yang valid.');
        }

        if (!global.logChannels) global.logChannels = new Map();
        
        global.logChannels.set(message.guild.id, {
            general: channel.id,
            message: channel.id,
            member: channel.id,
            voice: channel.id,
            moderation: channel.id,
            server: channel.id
        });

        const embed = new EmbedBuilder()
            .setTitle('Log Channel Diatur')
            .setDescription(`Channel logging telah diatur ke ${channel}`)
            .addFields(
                { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
