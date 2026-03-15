const { EmbedBuilder } = require('discord.js');

const jobs = [
    'Programmer', 'Driver', 'Chef', 'Guru', 'Dokter', 'Polisi',
    'Designer', 'Waiter', 'Security', 'Farmer', 'Builder', 'Artist'
];

const workMessages = [
    'Kamu bekerja sebagai {job} dan mendapatkan {reward}!',
    '{job} yang baik! Kamu dibayar {reward}.',
    'Kerja kerasmu sebagai {job} menghasilkan {reward}!',
    'Hasil kerjamu sebagai {job}: {reward}!',
    'Shift sebagai {job} selesai! Gaji: {reward}'
];

module.exports = {
    name: 'work',
    description: 'Bekerja untuk mendapat uang',
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

        const cooldown = config.cooldowns?.work || 3600000;
        const now = Date.now();

        if (userData.lastWork && now - userData.lastWork < cooldown) {
            const remaining = cooldown - (now - userData.lastWork);
            const minutes = Math.floor(remaining / 60000);
            return message.reply(`❌ Kamu lelah! Istirahat ${minutes} menit lagi.`);
        }

        const minReward = config.workReward?.min || 50;
        const maxReward = config.workReward?.max || 500;
        let reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
        
        const prestigeBonus = Math.floor(reward * 0.1 * (userData.prestige || 0));
        reward += prestigeBonus;

        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const workMsg = workMessages[Math.floor(Math.random() * workMessages.length)]
            .replace('{job}', job)
            .replace('{reward}', `${reward.toLocaleString()} ${config.currencyName}`);

        userData.wallet += reward;
        userData.lastWork = now;
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('💼 Work')
            .setDescription(workMsg)
            .addFields(
                { name: '👔 Pekerjaan', value: job, inline: true },
                { name: '💰 Gaji', value: `${reward.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x4CAF50)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
