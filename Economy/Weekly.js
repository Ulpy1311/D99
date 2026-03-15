const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'weekly',
    description: 'Klaim hadiah mingguan',
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

        const cooldown = config.cooldowns?.weekly || 604800000;
        const now = Date.now();

        if (userData.lastWeekly && now - userData.lastWeekly < cooldown) {
            const remaining = cooldown - (now - userData.lastWeekly);
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            return message.reply(`❌ Kamu sudah klaim weekly! Tunggu ${days}d ${hours}h lagi.`);
        }

        let reward = config.weeklyReward || 5000;
        const prestigeBonus = Math.floor(reward * 0.2 * (userData.prestige || 0));
        reward += prestigeBonus;

        userData.wallet += reward;
        userData.lastWeekly = now;
        global.economyData.set(key, userData);

        const fields = [
            { name: '💰 Saldo Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
        ];
        if (prestigeBonus > 0) {
            fields.push({ name: '⭐ Prestige Bonus', value: `+${prestigeBonus.toLocaleString()}`, inline: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎁 Weekly Reward Claimed!')
            .setDescription(`Kamu mendapatkan **${reward.toLocaleString()} ${config.currencyName}** ${config.currencySymbol}`)
            .addFields(fields)
            .setColor(0xFFD700)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
