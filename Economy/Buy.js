const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'buy',
    description: 'Beli item dari shop',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!config.shopItems || config.shopItems.length === 0) {
            return message.reply('❌ Toko kosong.');
        }

        const itemIndex = parseInt(args[0]) - 1;
        const quantity = parseInt(args[1]) || 1;

        if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= config.shopItems.length) {
            return message.reply(`❌ Nomor item tidak valid. Gunakan \`g!shop\` untuk melihat daftar.`);
        }

        if (quantity < 1 || quantity > 100) {
            return message.reply('❌ Jumlah tidak valid (1-100).');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null,
            inventory: [], achievements: [], prestige: 0
        };

        const item = config.shopItems[itemIndex];
        const totalCost = item.price * quantity;

        if (userData.wallet < totalCost) {
            return message.reply(`❌ Kamu tidak punya cukup uang!\n💰 Butuh: ${totalCost.toLocaleString()} ${config.currencyName}\n👛 Wallet: ${userData.wallet.toLocaleString()} ${config.currencyName}`);
        }

        userData.wallet -= totalCost;

        for (let i = 0; i < quantity; i++) {
            userData.inventory.push({
                name: item.name,
                price: item.price,
                boughtAt: Date.now(),
                type: item.type || 'item'
            });
        }

        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🛒 Purchase Success!')
            .setDescription(`Kamu membeli **${item.name}** x${quantity}`)
            .addFields(
                { name: '📦 Item', value: `${item.name} ${item.emoji || ''}`, inline: true },
                { name: '📊 Jumlah', value: `${quantity}`, inline: true },
                { name: '💰 Total', value: `${totalCost.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
