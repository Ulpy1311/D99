const { EmbedBuilder } = require('discord.js');

const begMessages = [
    'Seseorang memberimu {reward} dengan kasihan...',
    'Kamu mengemis di jalanan dan dapat {reward}.',
    'Seorang yang baik hati memberi {reward}!',
    'Sial! Kamu hanya dapat {reward}.',
    'Cukup beruntung! Dapat {reward} dari orang lewat.'
];

module.exports = {
    name: 'beg',
    description: 'Mengemis untuk mendapat uang',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            lastDaily: null, lastHourly: null, lastWeekly: null, lastWork: null, lastBeg: null,
            inventory: [], achievements: [], prestige: 0
        };

        const cooldown = config.cooldowns?.beg || 300000;
        const now = Date.now();

        if (userData.lastBeg && now - userData.lastBeg < cooldown) {
            const remaining = cooldown - (now - userData.lastBeg);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            return message.reply(`❌ Malu kali! Tunggu ${minutes}m ${seconds}s lagi.`);
        }

        const minReward = config.begReward?.min || 1;
        const maxReward = config.begReward?.max || 100;
        const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;

        const begMsg = begMessages[Math.floor(Math.random() * begMessages.length)]
            .replace('{reward}', `${reward.toLocaleString()} ${config.currencyName}`);

        userData.wallet += reward;
        userData.lastBeg = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🥺 Beg')
            .setDescription(begMsg)
            .addFields({ name: '💰 Dapat', value: `${reward.toLocaleString()} ${config.currencyName}`, inline: true })
            .setColor(0xFFA500)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
