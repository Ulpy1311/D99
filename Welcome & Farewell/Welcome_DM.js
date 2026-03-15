const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomedm',
    description: 'Set welcome DM untuk member baru',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};

        if (args.length === 0) {
            currentConfig.dmEnabled = !currentConfig.dmEnabled;
        } else {
            const msg = args.join(' ');
            currentConfig.dmMessage = msg;
            currentConfig.dmEnabled = true;
        }

        global.welcomeConfig.set(message.guild.id, currentConfig);

        const preview = currentConfig.dmMessage
            ? currentConfig.dmMessage
                .replace(/{user}/gi, `<@${message.author.id}>`)
                .replace(/{user\.tag}/gi, message.author.tag)
                .replace(/{user\.id}/gi, message.author.id)
                .replace(/{server}/gi, message.guild.name)
                .replace(/{membercount}/gi, message.guild.memberCount.toString())
            : 'Default welcome message';

        const embed = new EmbedBuilder()
            .setTitle('📬 Welcome DM')
            .setDescription(`Welcome DM telah **${currentConfig.dmEnabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
            .addFields(
                { name: 'Status', value: currentConfig.dmEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            );

        if (currentConfig.dmMessage) {
            embed.addFields(
                { name: 'Pesan DM', value: `\`\`\`${currentConfig.dmMessage}\`\`\``, inline: false },
                { name: 'Preview', value: preview, inline: false }
            );
        }

        embed.setColor(currentConfig.dmEnabled ? 0x00FF00 : 0xFF0000).setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
