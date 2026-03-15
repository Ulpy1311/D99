const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewellchannel',
    description: 'Set channel untuk farewell message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channel) {
            return message.reply('Silakan mention channel atau berikan channel ID yang valid.');
        }

        if (!global.farewellConfig) global.farewellConfig = new Map();

        const currentConfig = global.farewellConfig.get(message.guild.id) || {};
        currentConfig.channelId = channel.id;
        global.farewellConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('📢 Farewell Channel Diatur')
            .setDescription(`Channel farewell telah diatur ke ${channel}`)
            .addFields(
                { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
