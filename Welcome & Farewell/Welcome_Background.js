const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomebackground',
    description: 'Set custom background untuk welcome card',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const attachment = message.attachments.first();
        const url = args[0];

        if (!attachment && !url) {
            return message.reply('Silakan upload gambar atau berikan URL gambar untuk background.\n**Format:** PNG/JPG, Recommended: 800x200px');
        }

        const imageUrl = attachment ? attachment.url : url;

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};
        currentConfig.backgroundImage = imageUrl;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎨 Welcome Background Diatur')
            .setDescription('Background custom telah berhasil diatur.')
            .setImage(imageUrl)
            .addFields(
                { name: 'Status', value: '✅ Berhasil', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
