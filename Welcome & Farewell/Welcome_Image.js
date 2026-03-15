const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomeimage',
    description: 'Toggle welcome image card (Canvas)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};
        currentConfig.imageEnabled = !currentConfig.imageEnabled;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🖼️ Welcome Image Card')
            .setDescription(`Welcome image card telah **${currentConfig.imageEnabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.imageEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Background', value: currentConfig.backgroundImage ? 'Custom' : 'Default', inline: true }
            )
            .setColor(currentConfig.imageEnabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!welcomebackground untuk mengatur background custom' });

        message.reply({ embeds: [embed] });
    }
};
