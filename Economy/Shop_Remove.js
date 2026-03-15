const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shopremove',
    description: 'Admin hapus item dari shop',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator.');
        }

        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!config.shopItems || config.shopItems.length === 0) {
            return message.reply('❌ Toko kosong.');
        }

        const index = parseInt(args[0]) - 1;

        if (isNaN(index) || index < 0 || index >= config.shopItems.length) {
            return message.reply(`❌ Nomor item tidak valid. Total: ${config.shopItems.length} item.`);
        }

        const removed = config.shopItems.splice(index, 1)[0];
        global.economyConfig.set(message.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('❌ Item Removed from Shop')
            .addFields(
                { name: '📦 Item', value: removed.name, inline: true },
                { name: '💰 Harga', value: `${removed.price.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
