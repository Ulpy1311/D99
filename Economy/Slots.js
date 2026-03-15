const { EmbedBuilder } = require('discord.js');

const slotEmojis = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔', '⭐'];
const multipliers = {
    '7️⃣': 10,
    '💎': 5,
    '⭐': 4,
    '🔔': 3,
    '🍇': 2,
    '🍊': 1.5,
    '🍋': 1.2,
    '🍒': 1
};

module.exports = {
    name: 'slots',
    description: 'Slot machine gambling',
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

        const reels = [
            slotEmojis[Math.floor(Math.random() * slotEmojis.length)],
            slotEmojis[Math.floor(Math.random() * slotEmojis.length)],
            slotEmojis[Math.floor(Math.random() * slotEmojis.length)]
        ];

        let win = false;
        let multiplier = 0;
        let winText = '😢 No match';

        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            win = true;
            multiplier = multipliers[reels[0]] || 1;
            winText = `🎉 JACKPOT! 3x ${reels[0]}`;
        } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            win = true;
            multiplier = 0.5;
            winText = '✨ 2 match!';
        }

        let result = amount * multiplier;
        if (win) {
            userData.wallet += Math.floor(result);
        } else {
            userData.wallet -= amount;
        }

        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Slot Machine')
            .setDescription(`┌───────┐\n│ ${reels[0]} │ ${reels[1]} │ ${reels[2]} │\n└───────┘\n\n${winText}`)
            .addFields(
                { name: '🎲 Hasil', value: win ? `+${Math.floor(result).toLocaleString()} ${config.currencyName}` : `-${amount.toLocaleString()} ${config.currencyName}` },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(win ? 0x00FF00 : 0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
