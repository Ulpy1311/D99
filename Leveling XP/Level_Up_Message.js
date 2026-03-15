const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'levelupmessage',
    description: 'Set custom level up message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        const msg = args.join(' ');

        if (!msg) {
            const embed = new EmbedBuilder()
                .setTitle('💬 Level Up Message')
                .setDescription('Pesan custom untuk level up notification.')
                .addFields(
                    { name: 'Current Message', value: config.levelUpMessage || '🎉 Selamat {user}! Kamu naik ke level {level}!' },
                    { name: 'Variables', value: 
                        '• `{user}` - Mention user\n' +
                        '• `{level}` - Level baru\n' +
                        '• `{server}` - Nama server\n' +
                        '• `{xp}` - Total XP'
                    },
                    { name: 'Usage', value: '`g!levelupmessage <message>`\n`g!levelupmessage reset`' }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (msg.toLowerCase() === 'reset') {
            config.levelUpMessage = '🎉 Selamat {user}! Kamu naik ke level {level}!';
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Level up message direset ke default.');
        }

        config.levelUpMessage = msg;
        global.levelingConfig.set(message.guild.id, config);

        const preview = msg
            .replace(/{user}/gi, `<@${message.author.id}>`)
            .replace(/{level}/gi, '99')
            .replace(/{server}/gi, message.guild.name)
            .replace(/{xp}/gi, '10,000');

        const embed = new EmbedBuilder()
            .setTitle('✅ Level Up Message Updated')
            .setDescription('Pesan level up telah diatur.')
            .addFields(
                { name: 'Message', value: `\`\`\`${msg}\`\`\`` },
                { name: 'Preview', value: preview }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
