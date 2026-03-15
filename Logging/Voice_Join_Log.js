const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'voicejoinlog',
    description: 'Log member yang join voice channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.logConfig) global.logConfig = new Map();
        
        const currentConfig = global.logConfig.get(message.guild.id) || {};
        currentConfig.voiceJoin = !currentConfig.voiceJoin;
        global.logConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('Voice Join Log')
            .setDescription(`Logging voice join telah **${currentConfig.voiceJoin ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.voiceJoin ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diubah oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.voiceJoin ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
