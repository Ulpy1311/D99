const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'economyadmin',
    description: 'Admin economy controls',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator.');
        }

        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setTitle('⚙️ Economy Admin Commands')
                .setDescription('Pengaturan admin untuk economy.')
                .addFields(
                    { name: '📝 Commands', value: 
                        '• `g!economyadmin give <user> <amount>` - Beri uang\n' +
                        '• `g!economyadmin take <user> <amount>` - Ambil uang\n' +
                        '• `g!economyadmin set <user> <amount>` - Set uang\n' +
                        '• `g!economyadmin reset <user>` - Reset user\n' +
                        '• `g!economyadmin resetall` - Reset semua\n' +
                        '• `g!economyadmin config` - Lihat config'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);

        if (['give', 'take', 'set'].includes(subCommand)) {
            if (!target) return message.reply('❌ Mention user.');
            if (!amount && subCommand !== 'set') return message.reply('❌ Masukkan jumlah.');

            if (!global.economyData) global.economyData = new Map();
            const key = `${message.guild.id}-${target.id}`;
            const userData = global.economyData.get(key) || { wallet: 0, bank: 0 };

            if (subCommand === 'give') {
                userData.wallet += amount;
            } else if (subCommand === 'take') {
                userData.wallet = Math.max(0, userData.wallet - amount);
            } else if (subCommand === 'set') {
                userData.wallet = amount || 0;
            }

            global.economyData.set(key, userData);

            return message.reply(`✅ ${subCommand}: ${target.username} - Wallet: ${userData.wallet.toLocaleString()} ${config.currencyName}`);
        }

        if (subCommand === 'reset' && target) {
            if (!global.economyData) global.economyData = new Map();
            global.economyData.delete(`${message.guild.id}-${target.id}`);
            return message.reply(`✅ Economy ${target.username} direset.`);
        }

        if (subCommand === 'resetall') {
            if (!global.economyData) global.economyData = new Map();
            let count = 0;
            for (const [k] of global.economyData.entries()) {
                if (k.startsWith(message.guild.id)) {
                    global.economyData.delete(k);
                    count++;
                }
            }
            return message.reply(`✅ Semua economy direset. ${count} users affected.`);
        }

        if (subCommand === 'config') {
            const embed = new EmbedBuilder()
                .setTitle('⚙️ Economy Config')
                .addFields(
                    { name: '💵 Currency', value: `${config.currencySymbol} ${config.currencyName}`, inline: true },
                    { name: '🎁 Daily', value: `${config.dailyReward}`, inline: true },
                    { name: '🎁 Weekly', value: `${config.weeklyReward}`, inline: true },
                    { name: '💼 Work', value: `${config.workReward?.min}-${config.workReward?.max}`, inline: true },
                    { name: '🏦 Interest', value: `${(config.bankInterest * 100).toFixed(1)}%`, inline: true },
                    { name: '💰 Starting', value: `${config.startingBalance}`, inline: true }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
