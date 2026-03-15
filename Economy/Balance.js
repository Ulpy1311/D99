const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Cek saldo wallet dan bank kamu',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const target = message.mentions.users.first() || message.author;

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${target.id}`;
        const userData = global.economyData.get(key) || {
            wallet: config.startingBalance || 0,
            bank: 0,
            lastDaily: null,
            lastHourly: null,
            lastWeekly: null,
            lastWork: null,
            inventory: [],
            achievements: [],
            prestige: 0
        };

        const total = userData.wallet + userData.bank;

        const embed = new EmbedBuilder()
            .setTitle(`${config.currencySymbol} Balance - ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👛 Wallet', value: `${userData.wallet.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '🏦 Bank', value: `${userData.bank.toLocaleString()} ${config.currencyName}`, inline: true },
                { name: '💰 Total', value: `${total.toLocaleString()} ${config.currencyName}`, inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        if (target.id !== message.author.id) {
            embed.setFooter({ text: `Requested by ${message.author.tag}` });
        }

        message.reply({ embeds: [embed] });
    }
};
