const { EmbedBuilder } = require('discord.js');

function calculateHand(cards) {
    let total = 0;
    let aces = 0;
    
    cards.forEach(card => {
        if (card === 'A') {
            aces++;
            total += 11;
        } else if (['K', 'Q', 'J'].includes(card)) {
            total += 10;
        } else {
            total += parseInt(card);
        }
    });
    
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    
    return total;
}

module.exports = {
    name: 'blackjack',
    description: 'Blackjack card game',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const amount = parseInt(args[0]) || 100;
        if (amount <= 0) amount = 100;

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: config.startingBalance || 0 };

        if (userData.wallet < amount) {
            return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()}`);
        }

        const deck = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        const playerCards = [deck[Math.floor(Math.random() * deck.length)], deck[Math.floor(Math.random() * deck.length)]];
        const dealerCards = [deck[Math.floor(Math.random() * deck.length)], deck[Math.floor(Math.random() * deck.length)]];
        
        const playerTotal = calculateHand(playerCards);
        const dealerTotal = calculateHand(dealerCards);

        let result, winAmount;
        
        if (playerTotal === 21 && playerCards.length === 2) {
            result = '🎉 BLACKJACK!';
            winAmount = Math.floor(amount * 2.5);
            userData.wallet += winAmount;
        } else if (playerTotal > 21) {
            result = '💥 Bust! Kamu kalah.';
            winAmount = -amount;
            userData.wallet -= amount;
        } else if (dealerTotal > 21) {
            result = '🎉 Dealer bust! Kamu menang!';
            winAmount = Math.floor(amount * 2);
            userData.wallet += winAmount;
        } else if (playerTotal > dealerTotal) {
            result = '🎉 Kamu menang!';
            winAmount = Math.floor(amount * 2);
            userData.wallet += winAmount;
        } else if (playerTotal < dealerTotal) {
            result = '😢 Dealer menang.';
            winAmount = -amount;
            userData.wallet -= amount;
        } else {
            result = '🤝 Push! Seri.';
            winAmount = 0;
        }

        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🃏 Blackjack')
            .addFields(
                { name: '👤 Your Hand', value: `${playerCards.join(' ')} = **${playerTotal}**`, inline: true },
                { name: '🎰 Dealer', value: `${dealerCards.join(' ')} = **${dealerTotal}**`, inline: true },
                { name: '📊 Result', value: result },
                { name: '💰 ' + (winAmount >= 0 ? 'Dapat' : 'Hilang'), value: winAmount !== 0 ? `${Math.abs(winAmount).toLocaleString()} ${config.currencyName}` : '0', inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(winAmount > 0 ? 0x00FF00 : winAmount < 0 ? 0xFF0000 : 0xFFA500)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
