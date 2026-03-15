const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewellembed',
    description: 'Toggle farewell embed mode',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.farewellConfig) global.farewellConfig = new Map();

        const currentConfig = global.farewellConfig.get(message.guild.id) || {};
        
        if (args[0]) {
            const color = args[0].startsWith('#') ? args[0] : `#${args[0]}`;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                currentConfig.embedColor = color;
            }
        }
        
        currentConfig.embedEnabled = !currentConfig.embedEnabled;
        global.farewellConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎨 Farewell Embed Mode')
            .setDescription(`Farewell embed telah **${currentConfig.embedEnabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.embedEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Warna Embed', value: currentConfig.embedColor || '#FF0000', inline: true },
                { name: 'Server', value: message.guild.name, inline: true }
            )
            .setColor(parseInt(currentConfig.embedColor?.replace('#', '0x') || '0xFF0000'))
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
