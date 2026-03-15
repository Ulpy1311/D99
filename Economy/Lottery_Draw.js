const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lotterydraw',
    description: 'Draw pemenang lotre (Admin)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator.');
        }

        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.lottery) global.lottery = new Map();
        const lotteryData = global.lottery.get(message.guild.id);

        if (!lotteryData || lotteryData.tickets.length === 0) {
            return message.reply('❌ Tidak ada tiket lotre yang terjual.');
        }

        const winnerIndex = Math.floor(Math.random() * lotteryData.tickets.length);
        const winnerTicket = lotteryData.tickets[winnerIndex];
        const winner = client.users.cache.get(winnerTicket.userId);

        if (!global.economyData) global.economyData = new Map();
        const winnerKey = `${message.guild.id}-${winnerTicket.userId}`;
        const winnerData = global.economyData.get(winnerKey) || { wallet: 0, bank: 0 };

        winnerData.wallet += lotteryData.totalPot;
        global.economyData.set(winnerKey, winnerData);

        const embed = new EmbedBuilder()
            .setTitle('🎰 LOTTERY WINNER!')
            .setDescription(`🎉 **${winner ? winner.username : 'Unknown'}** memenangkan lotre!`)
            .addFields(
                { name: '🏆 Hadiah', value: `${lotteryData.totalPot.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '🎫 Total Tickets', value: `${lotteryData.tickets.length}`, inline: true },
                { name: '👤 Winner ID', value: winnerTicket.userId, inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp();

        if (winner) {
            embed.setThumbnail(winner.displayAvatarURL({ dynamic: true }));
        }

        message.reply({ embeds: [embed] });

        global.lottery.delete(message.guild.id);
    }
};
