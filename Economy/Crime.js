const { EmbedBuilder } = require('discord.js');

const crimeMessages = {
    success: [
        'Kamu berhasil merampok dan mendapat {reward}!',
        'Heli terbang! Kamu bawa {reward} hasil curian.',
        'Berhasil! Kantongmu penuh dengan {reward}.',
        'Sempurna! Kamu selamat dengan {reward}.'
    ],
    fail: [
        'Kamu tertangkap! Denda {fine}.',
        'Polisi datang! Kamu kehilangan {fine}.',
        'Gagal! Kamu harus bayar {fine}.',
        'Sial! Tertangkap basah. Denda: {fine}.'
    ]
};

module.exports = {
    name: 'crime',
    description: 'Lakukan kejahatan (risk/reward)',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null, lastWork: null, lastCrime: null,
            inventory: [], achievements: [], prestige: 0
        };

        const cooldown = config.cooldowns?.crime || 3600000;
        const now = Date.now();

        if (userData.lastCrime && now - userData.lastCrime < cooldown) {
            const remaining = cooldown - (now - userData.lastCrime);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Polisi masih mencarimu! Tunggu ${minutes} menit.`);
        }

        const minReward = config.crimeReward?.min || 100;
        const maxReward = config.crimeReward?.max || 1000;
        const minFine = config.crimeFine?.min || 100;
        const maxFine = config.crimeFine?.max || 500;

        const success = Math.random() > 0.45;

        let embed;
        if (success) {
            const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
            const msg = crimeMessages.success[Math.floor(Math.random() * crimeMessages.success.length)]
                .replace('{reward}', `${reward.toLocaleString()} ${config.currencyName}`);

            userData.wallet += reward;
            
            embed = new EmbedBuilder()
                .setTitle('🦹 Crime Success!')
                .setDescription(msg)
                .addFields(
                    { name: '💰 Dapat', value: `${reward.toLocaleString()} ${config.currencyName}`, inline: true },
                    { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
                )
                .setColor(0x00FF00);
        } else {
            const fine = Math.floor(Math.random() * (maxFine - minFine + 1)) + minFine;
            const actualFine = Math.min(fine, userData.wallet);
            userData.wallet -= actualFine;

            const msg = crimeMessages.fail[Math.floor(Math.random() * crimeMessages.fail.length)]
                .replace('{fine}', `${actualFine.toLocaleString()} ${config.currencyName}`);

            embed = new EmbedBuilder()
                .setTitle('🚔 Crime Failed!')
                .setDescription(msg)
                .addFields(
                    { name: '💸 Denda', value: `${actualFine.toLocaleString()} ${config.currencyName}`, inline: true },
                    { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
                )
                .setColor(0xFF0000);
        }

        userData.lastCrime = now;
        global.economyData.set(key, userData);

        embed.setTimestamp();
        message.reply({ embeds: [embed] });
    }
};
