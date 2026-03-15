const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'auctionlist',
    description: 'Lihat daftar lelang aktif',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.auctions) global.auctions = new Map();

        const activeAuctions = [...global.auctions.values()]
            .filter(a => a.guildId === message.guild.id && a.status === 'active');

        if (activeAuctions.length === 0) {
            return message.reply('❌ Tidak ada lelang aktif.');
        }

        let listText = '';
        activeAuctions.slice(0, 10).forEach((auction, i) => {
            const highestBidder = client.users.cache.get(auction.highestBidder);
            listText += `**${i + 1}. ${auction.item.name}**\n`;
            listText += `   🆔 ${auction.id}\n`;
            listText += `   💰 ${auction.currentBid.toLocaleString()} ${config.currencyName}\n`;
            listText += `   👤 ${highestBidder ? highestBidder.username : 'No bids'}\n`;
            listText += `   ⏰ <t:${Math.floor(auction.endsAt / 1000)}:R>\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🔨 Active Auctions')
            .setDescription(listText)
            .addFields({ name: '📊 Total', value: `${activeAuctions.length} lelang`, inline: true })
            .setColor(0x9B59B6)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
