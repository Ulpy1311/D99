const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levelingsetup',
    description: 'Setup leveling system untuk server',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.levelingConfig) global.levelingConfig = new Map();

        const currentConfig = global.levelingConfig.get(message.guild.id) || {
            enabled: false,
            messageXP: { min: 5, max: 15 },
            voiceXP: { perMinute: 2 },
            cooldown: 60000,
            doubleXP: false,
            doubleXPMultiplier: 2,
            notificationChannel: null,
            notificationEnabled: true,
            levelUpMessage: '🎉 Selamat {user}! Kamu naik ke level {level}!',
            roleRewards: [],
            blacklistedChannels: [],
            blacklistedRoles: [],
            whitelistedChannels: [],
            whitelistedRoles: [],
            multipliers: { channels: {}, roles: {} },
            maxLevel: 100,
            prestigeEnabled: false,
            streakEnabled: true
        };

        currentConfig.enabled = !currentConfig.enabled;
        global.levelingConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('📊 Leveling System Setup')
            .setDescription(`Leveling system telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true },
                { name: '⚙️ Default Settings', value: 
                    `• Message XP: ${currentConfig.messageXP.min}-${currentConfig.messageXP.max} XP\n` +
                    `• Voice XP: ${currentConfig.voiceXP.perMinute} XP/menit\n` +
                    `• Cooldown: ${currentConfig.cooldown / 1000} detik\n` +
                    `• Max Level: ${currentConfig.maxLevel}`, inline: false }
            )
            .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
            .setTimestamp()
            .setFooter({ text: 'Gunakan g!help leveling untuk melihat semua command leveling' });

        message.reply({ embeds: [embed] });
    }
};
