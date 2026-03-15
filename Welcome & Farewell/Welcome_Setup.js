const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomesetup',
    description: 'Setup welcome system untuk server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {
            enabled: false,
            channelId: null,
            message: null,
            embedEnabled: false,
            embedColor: '#00FF00',
            imageEnabled: false,
            backgroundImage: null,
            dmEnabled: false,
            dmMessage: null,
            autoRole: null,
            pingEnabled: false
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎉 Welcome System Setup')
            .setDescription(`Welcome system telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!welcomechannel untuk mengatur channel' });

        message.reply({ embeds: [embed] });
    }
};
