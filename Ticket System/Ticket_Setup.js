const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketsetup',
    description: 'Setup ticket system untuk server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.ticketConfig) global.ticketConfig = new Map();

        const currentConfig = global.ticketConfig.get(message.guild.id) || {
            enabled: false,
            categoryId: null,
            supportRoleId: null,
            transcriptChannelId: null,
            ticketLimit: 1,
            autoClose: false,
            autoCloseTime: 24,
            categories: []
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.ticketConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket System Setup')
            .setDescription(`Ticket system telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true },
                { name: 'Langkah Selanjutnya', value: '1. Gunakan `g!ticketcategory` untuk mengatur kategori\n2. Gunakan `g!ticketpanel` untuk membuat panel\n3. Set role support dengan `g!ticketcategory`', inline: false }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
