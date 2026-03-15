const { EmbedBuilder } = require('discord.js');

const pets = [
    { name: 'Kucing', emoji: '🐱', price: 500, happiness: 100 },
    { name: 'Anjing', emoji: '🐕', price: 600, happiness: 100 },
    { name: 'Kelinci', emoji: '🐰', price: 400, happiness: 100 },
    { name: 'Hamster', emoji: '🐹', price: 300, happiness: 100 },
    { name: 'Burung', emoji: '🐦', price: 350, happiness: 100 },
    { name: 'Ikan', emoji: '🐟', price: 200, happiness: 100 },
    { name: 'Kuda', emoji: '🐴', price: 2000, happiness: 100 },
    { name: 'Naga', emoji: '🐉', price: 10000, happiness: 100 }
];

module.exports = {
    name: 'petshop',
    description: 'Beli pet',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        let petsList = '🐾 **Pet Shop**\n\n';
        pets.forEach((pet, i) => {
            petsList += `**${i + 1}.** ${pet.emoji} ${pet.name} - ${pet.price.toLocaleString()} ${config.currencyName}\n`;
        });
        petsList += `\nGunakan \`g!petshop buy <nomor>\` untuk membeli`;

        const embed = new EmbedBuilder()
            .setTitle('🏪 Pet Shop')
            .setDescription(petsList)
            .setColor(0xFF69B4)
            .setTimestamp();

        if (args[0]?.toLowerCase() === 'buy') {
            const index = parseInt(args[1]) - 1;
            if (isNaN(index) || index < 0 || index >= pets.length) {
                return message.reply('❌ Nomor pet tidak valid.');
            }

            const pet = pets[index];
            
            if (!global.economyData) global.economyData = new Map();
            const key = `${message.guild.id}-${message.author.id}`;
            const userData = global.economyData.get(key) || { wallet: config.startingBalance || 0, bank: 0 };

            if (userData.wallet < pet.price) {
                return message.reply(`❌ Kamu tidak punya cukup uang! Wallet: ${userData.wallet.toLocaleString()}`);
            }

            if (userData.pet) {
                return message.reply('❌ Kamu sudah punya pet. Feed dulu sebelum ganti.');
            }

            userData.wallet -= pet.price;
            userData.pet = { ...pet, boughtAt: Date.now() };
            global.economyData.set(key, userData);

            const buyEmbed = new EmbedBuilder()
                .setTitle('🎉 Pet Purchased!')
                .setDescription(`Kamu membeli **${pet.emoji} ${pet.name}**!`)
                .addFields(
                    { name: '🐾 Pet', value: `${pet.emoji} ${pet.name}`, inline: true },
                    { name: '💰 Harga', value: `${pet.price.toLocaleString()} ${config.currencyName}`, inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [buyEmbed] });
        }

        message.reply({ embeds: [embed] });
    }
};
