const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'xpblacklist',
    description: 'Blacklist channel/role dari XP gain',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!config.blacklistedChannels) config.blacklistedChannels = [];
        if (!config.blacklistedRoles) config.blacklistedRoles = [];

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const channels = config.blacklistedChannels.map(id => `<#${id}>`).join('\n') || 'None';
            const roles = config.blacklistedRoles.map(id => `<@&${id}>`).join('\n') || 'None';

            const embed = new EmbedBuilder()
                .setTitle('🚫 XP Blacklist')
                .setDescription('Channel dan role yang tidak mendapat XP.')
                .addFields(
                    { name: '📺 Channels', value: channels, inline: true },
                    { name: '🎭 Roles', value: roles, inline: true },
                    { name: 'Usage', value: 
                        '• `g!xpblacklist channel <channel>`\n' +
                        '• `g!xpblacklist role <role>`\n' +
                        '• `g!xpblacklist remove channel <channel>`\n' +
                        '• `g!xpblacklist remove role <role>`'
                    }
                )
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply('❌ Channel tidak ditemukan.');

            if (config.blacklistedChannels.includes(channel.id)) {
                return message.reply('❌ Channel sudah di-blacklist.');
            }

            config.blacklistedChannels.push(channel.id);
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ ${channel} telah di-blacklist dari XP gain.`);
        }

        if (subCommand === 'role') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) return message.reply('❌ Role tidak ditemukan.');

            if (config.blacklistedRoles.includes(role.id)) {
                return message.reply('❌ Role sudah di-blacklist.');
            }

            config.blacklistedRoles.push(role.id);
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ ${role.name} telah di-blacklist dari XP gain.`);
        }

        if (subCommand === 'remove') {
            const type = args[1]?.toLowerCase();
            const target = args[2];

            if (type === 'channel') {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(target);
                if (!channel) return message.reply('❌ Channel tidak ditemukan.');

                config.blacklistedChannels = config.blacklistedChannels.filter(id => id !== channel.id);
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ ${channel} telah dihapus dari blacklist.`);
            }

            if (type === 'role') {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(target);
                if (!role) return message.reply('❌ Role tidak ditemukan.');

                config.blacklistedRoles = config.blacklistedRoles.filter(id => id !== role.id);
                global.levelingConfig.set(message.guild.id, config);

                return message.reply(`✅ ${role.name} telah dihapus dari blacklist.`);
            }
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
