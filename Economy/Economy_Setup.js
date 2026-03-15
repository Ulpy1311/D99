const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'economysetup',
    description: 'Setup economy system untuk server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.economyConfig) global.economyConfig = new Map();

        const currentConfig = global.economyConfig.get(message.guild.id) || {
            enabled: false,
            currencyName: 'Coins',
            currencySymbol: '🪙',
            dailyReward: 1000,
            hourlyReward: 100,
            weeklyReward: 5000,
            workReward: { min: 50, max: 500 },
            begReward: { min: 1, max: 100 },
            crimeReward: { min: 100, max: 1000 },
            crimeFine: { min: 100, max: 500 },
            bankInterest: 0.05,
            maxBank: 10000000,
            startingBalance: 500,
            shopItems: [],
            cooldowns: {
                daily: 86400000,
                hourly: 3600000,
                weekly: 604800000,
                work: 3600000,
                beg: 300000,
                crime: 3600000,
                rob: 3600000,
                fish: 600000,
                hunt: 600000,
                mine: 600000,
                farm: 1800000
            }
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.economyConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('💰 Economy System Setup')
            .setDescription(`Economy system telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true },
                { name: '💵 Currency', value: `${currentConfig.currencySymbol} ${currentConfig.currencyName}`, inline: true },
                { name: '🎁 Daily', value: `${currentConfig.dailyReward}`, inline: true },
                { name: '🎁 Weekly', value: `${currentConfig.weeklyReward}`, inline: true },
                { name: '⚙️ Default Settings', value: 
                    `• Starting Balance: ${currentConfig.startingBalance}\n` +
                    `• Bank Interest: ${(currentConfig.bankInterest * 100).toFixed(1)}%\n` +
                    `• Work: ${currentConfig.workReward.min}-${currentConfig.workReward.max}`, inline: false }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!help economy untuk melihat semua command' });

        message.reply({ embeds: [embed] });
    }
};
