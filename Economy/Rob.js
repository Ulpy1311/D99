const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rob',
    description: 'Rampok user lain',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Siapa yang mau kamu rampok? Mention user.');
        }

        if (target.bot || target.id === message.author.id) {
            return message.reply('❌ Tidak bisa merampok bot atau diri sendiri.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const targetKey = `${message.guild.id}-${target.id}`;
        
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null, lastRob: null,
            inventory: [], achievements: [], prestige: 0
        };

        const targetData = global.economyData.get(targetKey) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null,
            inventory: [], achievements: [], prestige: 0
        };

        const cooldown = config.cooldowns?.rob || 3600000;
        const now = Date.now();

        if (userData.lastRob && now - userData.lastRob < cooldown) {
            const remaining = cooldown - (now - userData.lastRob);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Kamu masih waspada! Tunggu ${minutes} menit.`);
        }

        if (targetData.wallet < 100) {
            return message.reply('❌ Target terlalu miskin untuk dirampok.');
        }

        const success = Math.random() > 0.5;

        let embed;
        if (success) {
            const maxSteal = Math.min(targetData.wallet * 0.3, 5000);
            const stolen = Math.floor(Math.random() * maxSteal) + 100;

            userData.wallet += stolen;
            targetData.wallet -= stolen;

            embed = new EmbedBuilder()
                .setTitle('💰 Rob Success!')
                .setDescription(`Kamu berhasil merampok **${target.username}**!`)
                .addFields(
                    { name: '💰 Dicuri', value: `${stolen.toLocaleString()} ${config.currencyName}`, inline: true },
                    { name: '👤 Target', value: target.username, inline: true },
                    { name: '👛 Walletmu', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
                )
                .setColor(0x00FF00);
        } else {
            const fine = Math.min(Math.floor(userData.wallet * 0.2), 1000);

            userData.wallet -= fine;

            embed = new EmbedBuilder()
                .setTitle('🚔 Rob Failed!')
                .setDescription(`Kamu tertangkap mencoba merampok **${target.username}**!`)
                .addFields(
                    { name: '💸 Denda', value: `${fine.toLocaleString()} ${config.currencyName}`, inline: true },
                    { name: '👛 Walletmu', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
                )
                .setColor(0xFF0000);
        }

        userData.lastRob = now;
        global.economyData.set(key, userData);
        global.economyData.set(targetKey, targetData);

        embed.setTimestamp();
        message.reply({ embeds: [embed] });
    }
};
