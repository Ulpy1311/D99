const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'auctioncreate',
    description: 'Buat lelang untuk item',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: 0, bank: 0, inventory: [] };

        const itemIndex = parseInt(args[0]) - 1;
        const startingBid = parseInt(args[1]);

        if (isNaN(itemIndex) || itemIndex < 0 || !userData.inventory?.[itemIndex]) {
            return message.reply('❌ Nomor item tidak valid. Gunakan `g!inventory` untuk melihat.');
        }

        if (!startingBid || startingBid < 1) {
            return message.reply('❌ Masukkan harga awal lelang.');
        }

        const item = userData.inventory[itemIndex];

        if (!global.auctions) global.auctions = new Map();
        const auctionId = Date.now().toString();

        global.auctions.set(auctionId, {
            id: auctionId,
            guildId: message.guild.id,
            sellerId: message.author.id,
            item: item,
            startingBid: startingBid,
            currentBid: startingBid,
            highestBidder: null,
            bids: [],
            createdAt: Date.now(),
            endsAt: Date.now() + 3600000,
            status: 'active'
        });

        userData.inventory.splice(itemIndex, 1);
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🔨 Auction Created!')
            .setDescription(`**${item.name}** sedang dilelang!`)
            .addFields(
                { name: '📦 Item', value: item.name, inline: true },
                { name: '💰 Starting Bid', value: `${startingBid.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '⏰ Ends In', value: '<t:' + Math.floor((Date.now() + 3600000) / 1000) + ':R>', inline: true },
                { name: '🆔 Auction ID', value: auctionId, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!auctionbid <id> <amount> untuk bid' });

        message.reply({ embeds: [embed] });
    }
};
