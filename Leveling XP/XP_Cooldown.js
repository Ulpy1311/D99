const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpcooldown',
    description: 'Set cooldown antar XP gain',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('⏱️ XP Cooldown Settings')
                .setDescription('Pengaturan cooldown XP.')
                .addFields(
                    { name: 'Current Cooldown', value: `${(config.cooldown || 60000) / 1000} detik`, inline: true },
                    { name: 'Usage', value: '`g!xpcooldown <seconds>`\nRange: 5-300 detik' }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 5 || seconds > 300) {
            return message.reply('❌ Cooldown harus antara 5-300 detik.');
        }

        config.cooldown = seconds * 1000;
        global.levelingConfig.set(message.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle('✅ Cooldown Updated')
            .setDescription(`Cooldown XP telah diatur ke ${seconds} detik.`)
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
