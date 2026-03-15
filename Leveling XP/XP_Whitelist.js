const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpwhitelist',
    description: 'Whitelist channel/role untuk XP gain',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.whitelistedChannels) config.whitelistedChannels = [];
        if (!config.whitelistedRoles) config.whitelistedRoles = [];

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const channels = config.whitelistedChannels.length > 0 
                ? config.whitelistedChannels.map(id => `<#${id}>`).join('\n') 
                : 'All channels (no whitelist)';
            const roles = config.whitelistedRoles.length > 0 
                ? config.whitelistedRoles.map(id => `<@&${id}>`).join('\n') 
                : 'All roles (no whitelist)';

            const embed = new EmbedBuilder()
                .setTitle('✅ XP Whitelist')
                .setDescription('Jika diatur, hanya channel/role dalam whitelist yang mendapat XP.')
                .addFields(
                    { name: '📺 Channels', value: channels, inline: true },
                    { name: '🎭 Roles', value: roles, inline: true },
                    { name: 'Usage', value: 
                        '• `g!xpwhitelist channel <channel>`\n' +
                        '• `g!xpwhitelist role <role>`\n' +
                        '• `g!xpwhitelist remove channel <channel>`\n' +
                        '• `g!xpwhitelist remove role <role>`\n' +
                        '• `g!xpwhitelist clear channels/roles/all`'
                    }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply('❌ Channel tidak ditemukan.');

            if (config.whitelistedChannels.includes(channel.id)) {
                return message.reply('❌ Channel sudah di-whitelist.');
            }

            config.whitelistedChannels.push(channel.id);
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ ${channel} telah di-whitelist untuk XP gain.`);
        }

        if (subCommand === 'role') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) return message.reply('❌ Role tidak ditemukan.');

            if (config.whitelistedRoles.includes(role.id)) {
                return message.reply('❌ Role sudah di-whitelist.');
            }

            config.whitelistedRoles.push(role.id);
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ ${role.name} telah di-whitelist untuk XP gain.`);
        }

        if (subCommand === 'remove') {
            const type = args[1]?.toLowerCase();
            const target = args[2];

            if (type === 'channel') {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(target);
                if (!channel) return message.reply('❌ Channel tidak ditemukan.');

                config.whitelistedChannels = config.whitelistedChannels.filter(id => id !== channel.id);
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ ${channel} telah dihapus dari whitelist.`);
            }

            if (type === 'role') {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(target);
                if (!role) return message.reply('❌ Role tidak ditemukan.');

                config.whitelistedRoles = config.whitelistedRoles.filter(id => id !== role.id);
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ ${role.name} telah dihapus dari whitelist.`);
            }
        }

        if (subCommand === 'clear') {
            const type = args[1]?.toLowerCase();

            if (type === 'channels') {
                config.whitelistedChannels = [];
                global.levelingConfig.set(message.guild.id, config);
                return message.reply('✅ Semua channel whitelist telah dihapus.');
            }
            if (type === 'roles') {
                config.whitelistedRoles = [];
                global.levelingConfig.set(message.guild.id, config);
                return message.reply('✅ Semua role whitelist telah dihapus.');
            }
            if (type === 'all') {
                config.whitelistedChannels = [];
                config.whitelistedRoles = [];
                global.levelingConfig.set(message.guild.id, config);
                return message.reply('✅ Semua whitelist telah dihapus.');
            }
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
