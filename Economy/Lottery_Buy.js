const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lotterybuy',
    description: 'Beli tiket lotre',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const ticketPrice = 100;
        const quantity = parseInt(args[0]) || 1;

        if (quantity < 1 || quantity > 100) {
            return message.reply('❌ Beli 1-100 tiket.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: 0, bank: 0 };

        const totalCost = ticketPrice * quantity;

        if (userData.wallet < totalCost) {
            return message.reply(`❌ Kamu tidak punya cukup uang!\n💰 Butuh: ${totalCost.toLocaleString()} ${config.currencyName}\n👛 Wallet: ${userData.wallet.toLocaleString()}`);
        }

        if (!global.lottery) global.lottery = new Map();
        const lotteryData = global.lottery.get(message.guild.id) || {
            tickets: [],
            totalPot: 0,
            lastDraw: null
        };

        for (let i = 0; i < quantity; i++) {
            lotteryData.tickets.push({
                userId: message.author.id,
                boughtAt: Date.now()
            });
        }

        userData.wallet -= totalCost;
        lotteryData.totalPot += totalCost;

        global.economyData.set(key, userData);
        global.lottery.set(message.guild.id, lotteryData);

        const userTickets = lotteryData.tickets.filter(t => t.userId === message.author.id).length;

        const embed = new EmbedBuilder()
            .setTitle('🎰 Lottery Ticket Purchased!')
            .setDescription(`Kamu membeli **${quantity}** tiket lotre`)
            .addFields(
                { name: '🎫 Tickets', value: `${quantity}`, inline: true },
                { name: '💰 Cost', value: `${totalCost.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '📊 Your Tickets', value: `${userTickets}`, inline: true },
                { name: '🏆 Total Pot', value: `${lotteryData.totalPot.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '📈 Win Chance', value: `${((userTickets / lotteryData.tickets.length) * 100).toFixed(1)}%`, inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp()
            .setFooter({ text: 'Admin akan mengadakan draw dengan g!lotterydraw' });

        message.reply({ embeds: [embed] });
    }
};
