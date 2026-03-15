const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'achievement',
    description: 'Lihat achievements kamu',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { achievements: [], wallet: 0 };

        const allAchievements = [
            { id: 'first_daily', name: '🌅 First Daily', desc: 'Claim daily pertama kali', condition: true },
            { id: 'rich', name: '💰 Getting Rich', desc: 'Mencapai 10,000 coins', condition: (userData.wallet + (userData.bank || 0)) >= 10000 },
            { id: 'millionaire', name: '💎 Millionaire', desc: 'Mencapai 1,000,000 coins', condition: (userData.wallet + (userData.bank || 0)) >= 1000000 },
            { id: 'first_work', name: '💼 First Work', desc: 'Kerja pertama kali', condition: true },
            { id: 'first_crime', name: '🦹 Criminal', desc: 'Lakukan crime pertama kali', condition: true },
            { id: 'gambler', name: '🎰 Gambler', desc: 'Gamble 10 kali', condition: true },
            { id: 'collector', name: '📦 Collector', desc: 'Punya 50 items', condition: (userData.inventory?.length || 0) >= 50 },
            { id: 'pet_owner', name: '🐾 Pet Owner', desc: 'Beli pet pertama kali', condition: !!userData.pet }
        ];

        if (!userData.achievements) userData.achievements = [];

        let unlocked = 0;
        let achievementsList = '';
        
        allAchievements.forEach(ach => {
            const hasAchieved = userData.achievements.includes(ach.id);
            if (hasAchieved) unlocked++;
            achievementsList += `${hasAchieved ? '✅' : '⬜'} ${ach.name}\n   ${ach.desc}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle('🏆 Achievements')
            .setDescription(achievementsList.substring(0, 4000))
            .addFields({ name: '📊 Progress', value: `${unlocked}/${allAchievements.length} unlocked`, inline: true })
            .setColor(0xFFD700)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
