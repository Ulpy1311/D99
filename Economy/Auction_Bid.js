const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'auctionbid',
    description: 'Bid di lelang',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const auctionId = args[0];
        const bidAmount = parseInt(args[1]);

        if (!auctionId || !bidAmount || bidAmount <= 0) {
            return message.reply('❌ Format: `g!auctionbid <auction_id> <amount>`');
        }

        if (!global.auctions) global.auctions = new Map();
        const auction = global.auctions.get(auctionId);

        if (!auction || auction.guildId !== message.guild.id) {
            return message.reply('❌ Lelang tidak ditemukan.');
        }

        if (auction.status !== 'active') {
            return message.reply('❌ Lelang sudah selesai.');
        }

        if (auction.sellerId === message.author.id) {
            return message.reply('❌ Kamu tidak bisa bid di lelangmu sendiri.');
        }

        if (bidAmount <= auction.currentBid) {
            return message.reply(`❌ Bid harus lebih dari ${auction.currentBid.toLocaleString()} ${config.currencyName}`);
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: 0, bank: 0 };

        if (userData.wallet < bidAmount) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()}`);
        }

        if (auction.highestBidder) {
            const prevBidderKey = `${message.guild.id}-${auction.highestBidder}`;
            const prevBidderData = global.economyData.get(prevBidderKey) || { wallet: 0 };
            prevBidderData.wallet += auction.currentBid;
            global.economyData.set(prevBidderKey, prevBidderData);
        }

        userData.wallet -= bidAmount;
        global.economyData.set(key, userData);

        auction.currentBid = bidAmount;
        auction.highestBidder = message.author.id;
        auction.bids.push({ userId: message.author.id, amount: bidAmount, time: Date.now() });
        global.auctions.set(auctionId, auction);

        const embed = new EmbedBuilder()
            .setTitle('🎯 Bid Placed!')
            .setDescription(`**${message.author.username}** bid **${bidAmount.toLocaleString()} ${config.currencyName}**`)
            .addFields(
                { name: '📦 Item', value: auction.item.name, inline: true },
                { name: '💰 Current Bid', value: `${bidAmount.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '⏰ Ends', value: '<t:' + Math.floor(auction.endsAt / 1000) + ':R>', inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
