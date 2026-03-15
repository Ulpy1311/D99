const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'useitem',
    description: 'Gunakan item dari inventory',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0, bank: 0,
            inventory: []
        };

        if (!userData.inventory || userData.inventory.length === 0) {
            return message.reply('🎒 Inventory kosong.');
        }

        const itemIndex = parseInt(args[0]) - 1;

        if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= userData.inventory.length) {
            return message.reply(`❌ Nomor item tidak valid. Gunakan \`g!inventory\` untuk melihat.`);
        }

        const item = userData.inventory[itemIndex];

        const effects = {
            'money': Math.floor(Math.random() * 500) + 100,
            'xp': Math.floor(Math.random() * 100) + 50,
            'luck': Math.random() * 0.2,
            'none': 0
        };

        const effect = Object.keys(effects)[Math.floor(Math.random() * Object.keys(effects).length)];
        let resultText = '';
        
        if (effect === 'money') {
            const gain = effects.money;
            userData.wallet += gain;
            resultText = `Kamu mendapatkan **${gain.toLocaleString()} ${config.currencyName}**!`;
        } else if (effect === 'xp') {
            resultText = `Kamu mendapatkan **${effects.xp} bonus XP**! (Coming soon)`;
        } else if (effect === 'luck') {
            resultText = `Kamu merasa beruntung! (+${(effects.luck * 100).toFixed(0)}% luck untuk 1 jam)`;
        } else {
            resultText = 'Tidak terjadi apa-apa...';
        }

        userData.inventory.splice(itemIndex, 1);
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle(`🎁 Used: ${item.name}`)
            .setDescription(resultText)
            .addFields({ name: '📦 Sisa', value: `${userData.inventory.length} items`, inline: true })
            .setColor(0x9B59B6)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
