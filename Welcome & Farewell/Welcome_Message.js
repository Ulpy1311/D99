const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcomemessage',
    description: 'Set custom welcome message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const msg = args.join(' ');
        if (!msg) {
            return message.reply('Silakan berikan pesan welcome.\n**Variables:** `{user}`, `{user.tag}`, `{user.id}`, `{server}`, `{membercount}`');
        }

        if (!global.welcomeConfig) global.welcomeConfig = new Map();

        const currentConfig = global.welcomeConfig.get(message.guild.id) || {};
        currentConfig.message = msg;
        global.welcomeConfig.set(message.guild.id, currentConfig);

        const preview = msg
            .replace(/{user}/gi, `<@${message.author.id}>`)
            .replace(/{user\.tag}/gi, message.author.tag)
            .replace(/{user\.id}/gi, message.author.id)
            .replace(/{server}/gi, message.guild.name)
            .replace(/{membercount}/gi, message.guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setTitle('💬 Welcome Message Diatur')
            .setDescription('Pesan welcome telah berhasil diatur.')
            .addFields(
                { name: 'Pesan', value: `\`\`\`${msg}\`\`\``, inline: false },
                { name: 'Preview', value: preview, inline: false },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
