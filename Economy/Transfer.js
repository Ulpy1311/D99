const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'transfer',
    description: 'Transfer uang ke user lain',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target) {
            return message.reply('❌ Siapa yang mau kamu transfer? Mention user.');
        }

        if (target.bot) {
            return message.reply('❌ Tidak bisa transfer ke bot.');
        }

        if (!amount || amount <= 0) {
            return message.reply('❌ Berapa banyak? Gunakan: `g!transfer <user> <jumlah>`');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const targetKey = `${message.guild.id}-${target.id}`;

        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null,
            inventory: [], achievements: [], prestige: 0
        };

        const targetData = global.economyData.get(targetKey) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null,
            inventory: [], achievements: [], prestige: 0
        };

        if (amount > userData.wallet) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()} ${config.currencyName}`);
        }

        userData.wallet -= amount;
        targetData.wallet += amount;

        global.economyData.set(key, userData);
        global.economyData.set(targetKey, targetData);

        const embed = new EmbedBuilder()
            .setTitle('💸 Transfer Success')
            .setDescription(`Kamu transfer **${amount.toLocaleString()} ${config.currencyName}** ke **${target.username}**`)
            .addFields(
                { name: '👤 Penerima', value: `${target.tag}`, inline: true },
                { name: '💰 Jumlah', value: `${amount.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Walletmu', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
