const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'prestigeeconomy',
    description: 'Prestige untuk bonus economy',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const userData = global.economyData.get(key) || {
            wallet: 0, bank: 0, prestige: 0
        };

        const minBalance = 1000000;

        const total = userData.wallet + (userData.bank || 0);

        if (total < minBalance) {
            return message.reply(`❌ Kamu butuh minimum ${minBalance.toLocaleString()} ${config.currencyName} untuk prestige.\n💰 Total: ${total.toLocaleString()} ${config.currencyName}`);
        }

        const currentPrestige = userData.prestige || 0;
        const maxPrestige = 10;

        if (currentPrestige >= maxPrestige) {
            return message.reply(`🏆 Kamu sudah mencapai max prestige (${maxPrestige})!`);
        }

        const bonus = currentPrestige + 1;

        userData.wallet = config.startingBalance || 500;
        userData.bank = 0;
        userData.prestige = currentPrestige + 1;
        userData.inventory = [];
        
        global.economyData.set(key, userData);

        const embed = new EmbedBuilder()
            .setTitle('⭐ PRESTIGE!')
            .setDescription(`**${message.author.username}** telah naik ke **Prestige ${userData.prestige}**!`)
            .addFields(
                { name: '📊 Prestige Level', value: `${currentPrestige} → ${userData.prestige}`, inline: true },
                { name: '🎁 Bonus', value: `+${bonus * 10}% rewards`, inline: true },
                { name: '💰 Restart Balance', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
