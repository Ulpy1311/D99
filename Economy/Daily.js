const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    description: 'Klaim hadiah harian',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null, lastWork: null,
            inventory: [], achievements: [], prestige: 0
        };

        const cooldown = config.cooldowns?.daily || 86400000;
        const now = Date.now();

        if (userData.lastDaily && now - userData.lastDaily < cooldown) {
            const remaining = cooldown - (now - userData.lastDaily);
            const hours = Math.floor(remaining / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            return message.reply(`❌ Kamu sudah klaim daily! Tunggu ${hours}h ${minutes}m lagi.`);
        }

        let reward = config.dailyReward || 1000;
        const streakBonus = Math.floor(reward * 0.1 * (userData.prestige || 0));
        reward += streakBonus;

        userData.wallet += reward;
        userData.lastDaily = now;
        global.economyData.set(key, userData);

        const fields = [
            { name: '💰 Saldo Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
        ];
        if (streakBonus > 0) {
            fields.push({ name: '⭐ Prestige Bonus', value: `+${streakBonus.toLocaleString()}`, inline: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎁 Daily Reward Claimed!')
            .setDescription(`Kamu mendapatkan **${reward.toLocaleString()} ${config.currencyName}** ${config.currencySymbol}`)
            .addFields(fields)
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
