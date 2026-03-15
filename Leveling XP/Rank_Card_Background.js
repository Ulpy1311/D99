const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rankcardbackground',
    description: 'Set custom background untuk rank card',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!global.rankCardConfig) global.rankCardConfig = new Map();
        const cardConfig = global.rankCardConfig.get(message.guild.id) || {};

        const attachment = message.attachments.first();
        const url = args[0];

        if (!attachment && !url) {
            const embed = new EmbedBuilder()
                .setTitle('🖼️ Rank Card Background')
                .setDescription('Background custom untuk rank card.')
                .addFields(
                    { name: 'Current', value: cardConfig.background ? '[View Image](' + cardConfig.background + ')' : 'Default' },
                    { name: 'Usage', value: 
                        '• Upload gambar dengan command\n' +
                        '• `g!rankcardbackground <url>`\n' +
                        '• `g!rankcardbackground reset`'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            if (cardConfig.background) {
                embed.setImage(cardConfig.background);
            }

            return message.reply({ embeds: [embed] });
        }

        if (url?.toLowerCase() === 'reset') {
            delete cardConfig.background;
            global.rankCardConfig.set(message.guild.id, cardConfig);

            return message.reply('✅ Background rank card direset ke default.');
        }

        const imageUrl = attachment ? attachment.url : url;

        cardConfig.background = imageUrl;
        global.rankCardConfig.set(message.guild.id, cardConfig);

        const embed = new EmbedBuilder()
            .setTitle('✅ Background Updated')
            .setDescription('Background rank card telah diatur.')
            .setImage(imageUrl)
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
