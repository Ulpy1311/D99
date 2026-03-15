const { EmbedBuilder } = require('discord.js');

const crops = [
    { name: 'Wortel', emoji: '🥕', value: 40, chance: 0.3 },
    { name: 'Tomat', emoji: '🍅', value: 60, chance: 0.25 },
    { name: 'Jagung', emoji: '🌽', value: 80, chance: 0.2 },
    { name: 'Kentang', emoji: '🥔', value: 100, chance: 0.12 },
    { name: 'Stroberi', emoji: '🍓', value: 200, chance: 0.08 },
    { name: 'Semangka', emoji: '🍉', value: 500, chance: 0.04 },
    { name: 'Golden Apple', emoji: '🍎', value: 2000, chance: 0.01 }
];

module.exports = {
    name: 'farm',
    description: 'Farming/gardening',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastFarm: null, inventory: []
        };

        const cooldown = config.cooldowns?.farm || 1800000;
        const now = Date.now();

        if (userData.lastFarm && now - userData.lastFarm < cooldown) {
            const remaining = cooldown - (now - userData.lastFarm);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Tunggu ${minutes} menit lagi untuk farming.`);
        }

        let crop = null;
        const rand = Math.random();
        let cumulative = 0;

        for (const c of crops) {
            cumulative += c.chance;
            if (rand <= cumulative) {
                crop = c;
                break;
            }
        }

        if (!crop) {
            crop = crops[0];
        }

        userData.wallet += crop.value;
        userData.lastFarm = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🌾 Farming')
            .setDescription(`Kamu memanen **${crop.emoji} ${crop.name}**!`)
            .addFields(
                { name: '🌿 Hasil', value: `${crop.emoji} ${crop.name}`, inline: true },
                { name: '💰 Nilai', value: `${crop.value.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x228B22)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
