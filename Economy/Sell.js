const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sell',
    description: 'Jual item dari inventory',
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
            return message.reply('❌ Inventory kosong. Gunakan `g!inventory` untuk melihat.');
        }

        const itemIndex = parseInt(args[0]) - 1;
        const quantity = parseInt(args[1]) || 1;

        if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= userData.inventory.length) {
            return message.reply(`❌ Nomor item tidak valid. Gunakan \`g!inventory\` untuk melihat.`);
        }

        const item = userData.inventory[itemIndex];
        const sellPrice = Math.floor(item.price * 0.5);
        const totalGain = sellPrice * Math.min(quantity, userData.inventory.filter(i => i.name === item.name).length);

        let sold = 0;
        for (let i = userData.inventory.length - 1; i >= 0 && sold < quantity; i--) {
            if (userData.inventory[i].name === item.name) {
                userData.inventory.splice(i, 1);
                sold++;
            }
        }

        userData.wallet += totalGain;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('💵 Item Sold!')
            .setDescription(`Kamu menjual **${item.name}** x${sold}`)
            .addFields(
                { name: '📦 Item', value: item.name, inline: true },
                { name: '📊 Jumlah', value: `${sold}`, inline: true },
                { name: '💰 Dapat', value: `${totalGain.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
