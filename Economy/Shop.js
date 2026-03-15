const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shop',
    description: 'Lihat toko items',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const shopItems = config.shopItems || [];

        if (shopItems.length === 0) {
            return message.reply('❌ Toko kosong. Admin belum menambah item.');
        }

        const itemsPerPage = 10;
        const page = parseInt(args[0]) || 1;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = shopItems.slice(start, end);

        let itemsText = '';
        pageItems.forEach((item, i) => {
            itemsText += `**${start + i + 1}. ${item.name}** ${item.emoji || ''}\n`;
            itemsText += `   💰 ${item.price.toLocaleString()} ${config.currencyName}\n`;
            itemsText += `   📝 ${item.description || 'No description'}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`🛒 Shop - ${message.guild.name}`)
            .setDescription(itemsText)
            .addFields({ name: '📄 Halaman', value: `${page}/${Math.ceil(shopItems.length / itemsPerPage)}`, inline: true })
            .setColor(0x9B59B6)
            .setTimestamp()
            .setFooter({ text: `Gunakan g!buy <nomor> untuk membeli` });

        message.reply({ embeds: [embed] });
    }
};
