const { EmbedBuilder } = require('discord.js');

const minerals = [
    { name: 'Batu', emoji: '🪨', value: 30, chance: 0.4 },
    { name: 'Batu Bara', emoji: '�ite', value: 50, chance: 0.25 },
    { name: 'Besi', emoji: '🔩', value: 100, chance: 0.15 },
    { name: 'Emas', emoji: '🥇', value: 300, chance: 0.1 },
    { name: 'Diamond', emoji: '💎', value: 800, chance: 0.07 },
    { name: 'Ruby', emoji: '❤️', value: 1500, chance: 0.025 },
    { name: 'Mythril', emoji: '✨', value: 3000, chance: 0.005 }
];

module.exports = {
    name: 'mine',
    description: 'Mining resources',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastMine: null, inventory: []
        };

        const cooldown = config.cooldowns?.mine || 600000;
        const now = Date.now();

        if (userData.lastMine && now - userData.lastMine < cooldown) {
            const remaining = cooldown - (now - userData.lastMine);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Tunggu ${minutes} menit lagi untuk mining.`);
        }

        let found = null;
        const rand = Math.random();
        let cumulative = 0;

        for (const mineral of minerals) {
            cumulative += mineral.chance;
            if (rand <= cumulative) {
                found = mineral;
                break;
            }
        }

        if (!found) {
            found = minerals[0];
        }

        userData.wallet += found.value;
        userData.lastMine = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('⛏️ Mining')
            .setDescription(`Kamu menemukan **${found.emoji} ${found.name}**!`)
            .addFields(
                { name: '💎 Hasil', value: `${found.emoji} ${found.name}`, inline: true },
                { name: '💰 Nilai', value: `${found.value.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x556B2F)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
