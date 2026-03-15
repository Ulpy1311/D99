const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roulette',
    description: 'Roulette gambling',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const betType = (args[0] || 'red').toLowerCase();
        const amount = parseInt(args[1]) || 100;

        if (amount <= 0) amount = 100;

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: config.startingBalance || 0 };

        if (userData.wallet < amount) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()}`);
        }

        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

        const result = Math.floor(Math.random() * 37);
        const isRed = redNumbers.includes(result);
        const isBlack = blackNumbers.includes(result);
        const isGreen = result === 0;

        let win = false;
        let multiplier = 0;

        if (betType === 'red' && isRed) { win = true; multiplier = 2; }
        else if (betType === 'black' && isBlack) { win = true; multiplier = 2; }
        else if (betType === 'green' && isGreen) { win = true; multiplier = 14; }
        else if (betType === 'odd' && result !== 0 && result % 2 === 1) { win = true; multiplier = 2; }
        else if (betType === 'even' && result !== 0 && result % 2 === 0) { win = true; multiplier = 2; }
        else if (!isNaN(parseInt(betType)) && parseInt(betType) === result) { win = true; multiplier = 36; }

        const colorEmoji = isGreen ? '🟢' : isRed ? '🔴' : '⚫';

        let resultAmount = win ? Math.floor(amount * multiplier) : -amount;
        userData.wallet += resultAmount;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Roulette')
            .setDescription(`Ball landed on: **${colorEmoji} ${result}**`)
            .addFields(
                { name: '🎲 Your Bet', value: betType.toUpperCase(), inline: true },
                { name: '📊 Result', value: win ? `🎉 WIN! (${multiplier}x)` : '😢 LOSE!', inline: true },
                { name: '💰 ' + (win ? 'Dapat' : 'Hilang'), value: `${Math.abs(resultAmount).toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(win ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
