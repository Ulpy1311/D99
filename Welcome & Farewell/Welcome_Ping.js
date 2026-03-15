const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomeping',
    description: 'Toggle ping member di welcome message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};
        currentConfig.pingEnabled = !currentConfig.pingEnabled;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🔔 Welcome Ping')
            .setDescription(`Ping member di welcome telah **${currentConfig.pingEnabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.pingEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true },
                { name: 'Efek', value: currentConfig.pingEnabled ? 'Member akan di-ping saat join' : 'Member tidak akan di-ping', inline: false }
            )
            .setColor(currentConfig.pingEnabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
