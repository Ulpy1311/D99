const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewellsetup',
    description: 'Setup farewell system untuk server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.farewellConfig) global.farewellConfig = new Map();

        const currentConfig = global.farewellConfig.get(message.guild.id) || {
            enabled: false,
            channelId: null,
            message: null,
            embedEnabled: false,
            embedColor: '#FF0000',
            imageEnabled: false,
            backgroundImage: null
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.farewellConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('👋 Farewell System Setup')
            .setDescription(`Farewell system telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!farewellchannel untuk mengatur channel' });

        message.reply({ embeds: [embed] });
    }
};
