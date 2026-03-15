const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hourly',
    description: 'Klaim hadiah per jam',
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

        const cooldown = config.cooldowns?.hourly || 3600000;
        const now = Date.now();

        if (userData.lastHourly && now - userData.lastHourly < cooldown) {
            const remaining = cooldown - (now - userData.lastHourly);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            return message.reply(`❌ Tunggu ${minutes}m ${seconds}s lagi.`);
        }

        const reward = config.hourlyReward || 100;

        userData.wallet += reward;
        userData.lastHourly = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('⏰ Hourly Reward Claimed!')
            .setDescription(`Kamu mendapatkan **${reward.toLocaleString()} ${config.currencyName}** ${config.currencySymbol}`)
            .addFields({ name: '💰 Saldo Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true })
            .setColor(0x00BCD4)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
