const { EmbedBuilder } = require('discord.js');

const animals = [
    { name: 'Kelinci', emoji: '🐰', value: 60, chance: 0.35 },
    { name: 'Rusa', emoji: '🦌', value: 100, chance: 0.25 },
    { name: 'Babi Hutan', emoji: '🐗', value: 150, chance: 0.15 },
    { name: 'Beruang', emoji: '🐻', value: 300, chance: 0.1 },
    { name: 'Singa', emoji: '🦁', value: 500, chance: 0.08 },
    { name: 'Naga', emoji: '🐉', value: 1500, chance: 0.05 },
    { name: 'Phoenix', emoji: '🔥', value: 3000, chance: 0.02 }
];

module.exports = {
    name: 'hunt',
    description: 'Berburu untuk item/uang',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastHunt: null, inventory: []
        };

        const cooldown = config.cooldowns?.hunt || 600000;
        const now = Date.now();

        if (userData.lastHunt && now - userData.lastHunt < cooldown) {
            const remaining = cooldown - (now - userData.lastHunt);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Tunggu ${minutes} menit lagi untuk berburu.`);
        }

        let caught = null;
        const rand = Math.random();
        let cumulative = 0;

        for (const animal of animals) {
            cumulative += animal.chance;
            if (rand <= cumulative) {
                caught = animal;
                break;
            }
        }

        if (!caught) {
            caught = animals[0];
        }

        userData.wallet += caught.value;
        userData.lastHunt = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🏹 Hunting')
            .setDescription(`Kamu berhasil berburu **${caught.emoji} ${caught.name}**!`)
            .addFields(
                { name: '🎯 Hasil', value: `${caught.emoji} ${caught.name}`, inline: true },
                { name: '💰 Nilai', value: `${caught.value.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x8B4513)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
