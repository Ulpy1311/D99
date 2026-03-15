const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Gambling coinflip',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const amount = parseInt(args[0]);

        if (!amount || amount <= 0) {
            return message.reply('❌ Berapa banyak yang mau kamu bet? `g!coinflip <jumlah>`');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: config.startingBalance || 0 };

        if (userData.wallet < amount) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()}`);
        }

        const choice = args[1]?.toLowerCase() || (Math.random() > 0.5 ? 'heads' : 'tails');
        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        const win = choice === result;

        if (win) {
            userData.wallet += amount;
        } else {
            userData.wallet -= amount;
        }

        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🪙 Coinflip')
            .setDescription(`Kamu pilih: **${choice.toUpperCase()}**\nHasil: **${result.toUpperCase()}**`)
            .addFields(
                { name: '🎲 Hasil', value: win ? '🎉 MENANG!' : '😢 KALAH!' },
                { name: '💰 ' + (win ? 'Dapat' : 'Hilang'), value: `${amount.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(win ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
