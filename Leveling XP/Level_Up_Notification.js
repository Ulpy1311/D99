const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levelupnotification',
    description: 'Set channel untuk level up notification',
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
                .setTitle('📢 Level Up Notification')
                .setDescription('Pengaturan notifikasi level up.')
                .addFields(
                    { name: 'Status', value: config.notificationEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: 'Channel', value: config.notificationChannel ? `<#${config.notificationChannel}>` : 'Same channel', inline: true },
                    { name: 'Usage', value: 
                        '• `g!levelupnotification on` - Aktifkan notifikasi\n' +
                        '• `g!levelupnotification off` - Nonaktifkan notifikasi\n' +
                        '• `g!levelupnotification channel <channel>` - Set channel'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.notificationEnabled = true;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Level up notification telah diaktifkan.');
        }

        if (subCommand === 'off') {
            config.notificationEnabled = false;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Level up notification telah dinonaktifkan.');
        }

        if (subCommand === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

            if (!channel) {
                config.notificationChannel = null;
                global.levelingConfig.set(message.guild.id, config);
                return message.reply('✅ Notification channel direset ke channel dimana user naik level.');
            }

            config.notificationChannel = channel.id;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Notification Channel Set')
                .setDescription(`Level up notification akan dikirim ke ${channel}`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
