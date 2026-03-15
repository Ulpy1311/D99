const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'petfeed',
    description: 'Kasih makan pet',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || { wallet: config.startingBalance || 0, pet: null };

        if (!userData.pet) {
            return message.reply('❌ Kamu tidak punya pet. Beli di `g!petshop`');
        }

        const foodPrice = 50;

        if (userData.wallet < foodPrice) {
            return message.reply(`❌ Kamu tidak punya cukup uang untuk beli makanan! Butuh: ${foodPrice} ${config.currencyName}`);
        }

        userData.wallet -= foodPrice;
        userData.pet.happiness = Math.min(100, (userData.pet.happiness || 50) + 20);
        userData.pet.lastFed = Date.now();
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('🍖 Pet Fed!')
            .setDescription(`**${userData.pet.emoji} ${userData.pet.name}** sudah diberi makan!`)
            .addFields(
                { name: '😊 Happiness', value: `${userData.pet.happiness}%`, inline: true },
                { name: '💰 Cost', value: `${foodPrice} ${config.currencyName}`, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
