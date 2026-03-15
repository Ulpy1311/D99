const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewellimage',
    description: 'Toggle farewell image card (Canvas)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.farewellConfig) global.farewellConfig = new Map();

        const currentConfig = global.farewellConfig.get(message.guild.id) || {};
        currentConfig.imageEnabled = !currentConfig.imageEnabled;
        global.farewellConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🖼️ Farewell Image Card')
            .setDescription(`Farewell image card telah **${currentConfig.imageEnabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.imageEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Background', value: currentConfig.backgroundImage ? 'Custom' : 'Default', inline: true }
            )
            .setColor(currentConfig.imageEnabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
