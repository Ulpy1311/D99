const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inventory',
    description: 'Lihat inventory kamu',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            inventory: []
        };

        if (!userData.inventory || userData.inventory.length === 0) {
            return message.reply('🎒 Inventory kosong.');
        }

        const itemCounts = {};
        userData.inventory.forEach(item => {
            if (!itemCounts[item.name]) {
                itemCounts[item.name] = { count: 0, item: item };
            }
            itemCounts[item.name].count++;
        });

        let itemsText = '';
        let index = 1;
        for (const [name, data] of Object.entries(itemCounts)) {
            itemsText += `**${index}.** ${name} x${data.count}\n`;
            itemsText += `   💰 Value: ${Math.floor(data.item.price * 0.5).toLocaleString()} ${config.currencyName}\n\n`;
            index++;
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventory - ${message.author.username}`)
            .setDescription(itemsText.substring(0, 4000))
            .addFields(
                { name: '📦 Total Items', value: `${userData.inventory.length}`, inline: true },
                { name: '📊 Unique Items', value: `${Object.keys(itemCounts).length}`, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!sell <nomor> untuk menjual' });

        message.reply({ embeds: [embed] });
    }
};
