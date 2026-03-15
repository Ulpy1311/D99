const { EmbedBuilder } = require('discord.js');

const fishTypes = [
    { name: 'Ikan Mas', emoji: '🐟', value: 50, chance: 0.4 },
    { name: 'Ikan Nila', emoji: '🐠', value: 80, chance: 0.25 },
    { name: 'Lele', emoji: '🐡', value: 100, chance: 0.15 },
    { name: 'Kakap', emoji: '🦈', value: 200, chance: 0.1 },
    { name: 'Hiu', emoji: '🦈', value: 500, chance: 0.05 },
    { name: 'Paus', emoji: '🐋', value: 1000, chance: 0.03 },
    { name: 'Ikan Emas', emoji: '✨', value: 2000, chance: 0.02 }
];

module.exports = {
    name: 'fish',
    description: 'Mancing untuk item/uang',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastFish: null, inventory: []
        };

        const cooldown = config.cooldowns?.fish || 600000;
        const now = Date.now();

        if (userData.lastFish && now - userData.lastFish < cooldown) {
            const remaining = cooldown - (now - userData.lastFish);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Tunggu ${minutes} menit lagi untuk mancing.`);
        }

        let caught = null;
        const rand = Math.random();
        let cumulative = 0;

        for (const fish of fishTypes) {
            cumulative += fish.chance;
            if (rand <= cumulative) {
                caught = fish;
                break;
            }
        }

        if (!caught) {
            caught = fishTypes[0];
        }

        userData.wallet += caught.value;
        userData.lastFish = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🎣 Fishing')
            .setDescription(`Kamu mendapatkan **${caught.emoji} ${caught.name}**!`)
            .addFields(
                { name: '🐟 Ikan', value: `${caught.emoji} ${caught.name}`, inline: true },
                { name: '💰 Nilai', value: `${caught.value.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00BCD4)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
