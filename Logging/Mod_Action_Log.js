const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'modactionlog',
    description: 'Log semua aksi moderasi',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.logConfig) global.logConfig = new Map();
        
        const currentConfig = global.logConfig.get(message.guild.id) || {};
        currentConfig.modAction = !currentConfig.modAction;
        global.logConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('Mod Action Log')
            .setDescription(`Logging aksi moderasi telah **${currentConfig.modAction ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.modAction ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diubah oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.modAction ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
