const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'emojiupdatelog',
    description: 'Log emoji add/remove di server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.logConfig) global.logConfig = new Map();
        
        const currentConfig = global.logConfig.get(message.guild.id) || {};
        currentConfig.emojiUpdate = !currentConfig.emojiUpdate;
        global.logConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('Emoji Update Log')
            .setDescription(`Logging perubahan emoji telah **${currentConfig.emojiUpdate ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.emojiUpdate ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diubah oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.emojiUpdate ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
