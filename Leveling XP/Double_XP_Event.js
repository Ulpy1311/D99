const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'doublexp',
    description: 'Enable/disable double XP event',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setTitle('✨ Double XP Event')
                .setDescription('Pengaturan event double XP.')
                .addFields(
                    { name: 'Status', value: config.doubleXP ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: 'Multiplier', value: `${config.doubleXPMultiplier || 2}x`, inline: true },
                    { name: 'Usage', value: 
                        '• `g!doublexp on` - Aktifkan double XP\n' +
                        '• `g!doublexp off` - Nonaktifkan double XP\n' +
                        '• `g!doublexp multiplier <number>` - Set multiplier (2-5x)'
                    }
                )
                .setColor(config.doubleXP ? 0xFFD700 : 0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.doubleXP = true;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('🎉 Double XP Enabled!')
                .setDescription(`Semua XP gain sekarang dikalikan ${config.doubleXPMultiplier || 2}x!`)
                .setColor(0xFFD700)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'off') {
            config.doubleXP = false;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Double XP Disabled')
                .setDescription('Double XP event telah dinonaktifkan.')
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'multiplier' || subCommand === 'multi') {
            const multiplier = parseInt(args[1]);

            if (!multiplier || multiplier < 2 || multiplier > 5) {
                return message.reply('❌ Multiplier harus antara 2-5.');
            }

            config.doubleXPMultiplier = multiplier;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Multiplier Updated')
                .setDescription(`Double XP multiplier diatur ke ${multiplier}x`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
