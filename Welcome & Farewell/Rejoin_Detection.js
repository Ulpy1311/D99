const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rejoindetection',
    description: 'Toggle rejoin detection untuk member yang pernah join',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.rejoinConfig) global.rejoinConfig = new Map();

        const currentConfig = global.rejoinConfig.get(message.guild.id) || {
            enabled: false,
            notifyChannel: null,
            restoreRoles: false
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.rejoinConfig.set(message.guild.id, currentConfig);

        if (!global.memberHistory) global.memberHistory = new Map();

        const embed = new EmbedBuilder()
            .setTitle('🔄 Rejoin Detection')
            .setDescription(`Rejoin detection telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true },
                { name: 'Fitur', value: 'Bot akan mendeteksi member yang pernah join dan menampilkan info sebelumnya', inline: false }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
