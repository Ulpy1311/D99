const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpmultiplier',
    description: 'Set XP multiplier per role/channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.multipliers) config.multipliers = { channels: {}, roles: {} };

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const channelMultis = Object.entries(config.multipliers.channels || {})
                .map(([id, multi]) => `<#${id}>: ${multi}x`).join('\n') || 'None';
            const roleMultis = Object.entries(config.multipliers.roles || {})
                .map(([id, multi]) => `<@&${id}>: ${multi}x`).join('\n') || 'None';

            const embed = new EmbedBuilder()
                .setTitle('✨ XP Multipliers')
                .setDescription('Multiplier XP untuk channel dan role.')
                .addFields(
                    { name: '📺 Channel Multipliers', value: channelMultis, inline: false },
                    { name: '🎭 Role Multipliers', value: roleMultis, inline: false },
                    { name: '📝 Usage', value: 
                        '• `g!xpmultiplier channel <channel> <multiplier>`\n' +
                        '• `g!xpmultiplier role <role> <multiplier>`\n' +
                        '• `g!xpmultiplier remove channel <channel>`\n' +
                        '• `g!xpmultiplier remove role <role>`'
                    }
                )
                .setColor(0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            const multiplier = parseFloat(args[2]);

            if (!channel) return message.reply('❌ Silakan mention channel.');
            if (!multiplier || multiplier < 0.1 || multiplier > 10) {
                return message.reply('❌ Multiplier harus antara 0.1-10.');
            }

            config.multipliers.channels[channel.id] = multiplier;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Channel Multiplier Set')
                .setDescription(`Multiplier untuk ${channel} telah diatur ke ${multiplier}x`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'role') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            const multiplier = parseFloat(args[2]);

            if (!role) return message.reply('❌ Silakan mention role.');
            if (!multiplier || multiplier < 0.1 || multiplier > 10) {
                return message.reply('❌ Multiplier harus antara 0.1-10.');
            }

            config.multipliers.roles[role.id] = multiplier;
            global.levelingConfig.set(message.guild.id, config);

            const embed = new EmbedBuilder()
                .setTitle('✅ Role Multiplier Set')
                .setDescription(`Multiplier untuk ${role.name} telah diatur ke ${multiplier}x`)
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'remove') {
            const type = args[1]?.toLowerCase();
            const target = args[2];

            if (type === 'channel') {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(target);
                if (!channel) return message.reply('❌ Channel tidak ditemukan.');

                delete config.multipliers.channels[channel.id];
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ Multiplier untuk ${channel} telah dihapus.`);
            }

            if (type === 'role') {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(target);
                if (!role) return message.reply('❌ Role tidak ditemukan.');

                delete config.multipliers.roles[role.id];
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ Multiplier untuk ${role.name} telah dihapus.`);
            }
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
