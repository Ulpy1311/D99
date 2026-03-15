const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomeautorole',
    description: 'Set auto role untuk member baru',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.reply('Bot tidak memiliki permission Manage Roles.');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};

        if (args[0]?.toLowerCase() === 'off' || args[0]?.toLowerCase() === 'disable') {
            currentConfig.autoRole = null;
            global.welcomeConfig.set(message.guild.id, currentConfig);

            const embed = new EmbedBuilder()
                .setTitle('🔧 Auto Role Dinonaktifkan')
                .setDescription('Auto role untuk member baru telah dinonaktifkan.')
                .setColor(0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            return message.reply('Silakan mention role atau berikan role ID yang valid.\n**Gunakan `off` atau `disable` untuk menonaktifkan.**');
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('Bot tidak bisa memberikan role yang lebih tinggi atau sama dengan posisi bot.');
        }

        currentConfig.autoRole = role.id;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const embed = new EmbedBuilder()
            .setTitle('🎭 Auto Role Diatur')
            .setDescription('Auto role untuk member baru telah berhasil diatur.')
            .addFields(
                { name: 'Role', value: `${role.name} (${role.id})`, inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(role.color || 0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
