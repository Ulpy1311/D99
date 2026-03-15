const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messagedeletelog',
    description: 'Log pesan yang dihapus dari server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.logConfig) global.logConfig = new Map();
        
        const currentConfig = global.logConfig.get(message.guild.id) || {};
        currentConfig.messageDelete = !currentConfig.messageDelete;
        global.logConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('Message Delete Log')
            .setDescription(`Logging pesan yang dihapus telah **${currentConfig.messageDelete ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.messageDelete ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diubah oleh', value: message.author.tag, inline: true }
            )
            .setColor(currentConfig.messageDelete ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
