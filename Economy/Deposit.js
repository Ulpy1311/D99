const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'deposit',
    description: 'Simpan uang ke bank',
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
            return message.reply(`❌ Berapa banyak? Gunakan: \`g!deposit <jumlah/all>\`\n💼 Wallet: ${userData.wallet.toLocaleString()} ${config.currencyName}`);
        }

        let depositAmount;
        if (amount.toLowerCase() === 'all') {
            depositAmount = userData.wallet;
        } else {
            depositAmount = parseInt(amount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
                return message.reply('❌ Jumlah tidak valid.');
            }
        }

        if (depositAmount > userData.wallet) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()} ${config.currencyName}`);
        }

        const maxBank = config.maxBank || 10000000;
        if (userData.bank + depositAmount > maxBank) {
            return message.reply(`❌ Bank penuh! Maksimum: ${maxBank.toLocaleString()} ${config.currencyName}`);
        }

        userData.wallet -= depositAmount;
        userData.bank += depositAmount;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🏦 Deposit Success')
            .setDescription(`Kamu menyimpan **${depositAmount.toLocaleString()} ${config.currencyName}** ke bank.`)
            .addFields(
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '🏦 Bank', value: `${userData.bank.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
