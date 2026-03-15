const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'withdraw',
    description: 'Ambil uang dari bank',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null,
            inventory: [], achievements: [], prestige: 0
        };

        const amount = args[0];

        if (!amount) {
            return message.reply(`❌ Berapa banyak? Gunakan: \`g!withdraw <jumlah/all>\`\n🏦 Bank: ${userData.bank.toLocaleString()} ${config.currencyName}`);
        }

        let withdrawAmount;
        if (amount.toLowerCase() === 'all') {
            withdrawAmount = userData.bank;
        } else {
            withdrawAmount = parseInt(amount);
            if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                return message.reply('❌ Jumlah tidak valid.');
            }
        }

        if (withdrawAmount > userData.bank) {
            return message.reply(`❌ Kamu tidak punya cukup uang di bank! Bank: ${userData.bank.toLocaleString()} ${config.currencyName}`);
        }

        userData.bank -= withdrawAmount;
        userData.wallet += withdrawAmount;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('💸 Withdraw Success')
            .setDescription(`Kamu mengambil **${withdrawAmount.toLocaleString()} ${config.currencyName}** dari bank.`)
            .addFields(
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '🏦 Bank', value: `${userData.bank.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
