const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shopadd',
    description: 'Admin tambah item ke shop',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator.');
        }

        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!config.shopItems) config.shopItems = [];

        const price = parseInt(args[0]);
        const name = args.slice(1).join(' ');

        if (!price || price <= 0) {
            return message.reply('❌ Format: `g!shopadd <harga> <nama item>`');
        }

        if (!name) {
            return message.reply('❌ Berikan nama item.');
        }

        const item = {
            id: Date.now().toString(),
            name: name,
            price: price,
            description: `Item: ${name}`,
            emoji: '📦',
            type: 'item'
        };

        config.shopItems.push(item);
        global.economyConfig.set(message.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Item Added to Shop')
            .addFields(
                { name: '📦 Item', value: name, inline: true },
                { name: '💰 Harga', value: `${price.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
