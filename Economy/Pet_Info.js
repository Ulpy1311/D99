const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'petinfo',
    description: 'Lihat info pet kamu',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { pet: null };

        if (!userData.pet) {
            return message.reply('❌ Kamu tidak punya pet. Beli di `g!petshop`');
        }

        const pet = userData.pet;
        const daysOwned = Math.floor((Date.now() - (pet.boughtAt || Date.now())) / 86400000);

        let mood = '😊 Happy';
        if (pet.happiness < 30) mood = '😢 Sad';
        else if (pet.happiness < 60) mood = '😐 Okay';

        const embed = new EmbedBuilder()
            .setTitle(`${pet.emoji} ${pet.name}`)
            .setDescription(`Info pet milik ${message.author.username}`)
            .addFields(
                { name: '🐾 Name', value: pet.name, inline: true },
                { name: '😊 Happiness', value: `${pet.happiness || 100}%`, inline: true },
                { name: '📅 Mood', value: mood, inline: true },
                { name: '📆 Days Owned', value: `${daysOwned}`, inline: true }
            )
            .setColor(0xFF69B4)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
