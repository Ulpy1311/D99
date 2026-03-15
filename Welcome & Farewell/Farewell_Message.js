const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewellmessage',
    description: 'Set custom farewell message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const msg = args.join(' ');
        if (!msg) {
            return message.reply('Silakan berikan pesan farewell.\n**Variables:** `{user}`, `{user.tag}`, `{user.id}`, `{server}`, `{membercount}`');
        }

        if (!global.farewellConfig) global.farewellConfig = new Map();

        const currentConfig = global.farewellConfig.get(message.guild.id) || {};
        currentConfig.message = msg;
        global.farewellConfig.set(message.guild.id, currentConfig);

        const preview = msg
            .replace(/{user}/gi, `<@${message.author.id}>`)
            .replace(/{user\.tag}/gi, message.author.tag)
            .replace(/{user\.id}/gi, message.author.id)
            .replace(/{server}/gi, message.guild.name)
            .replace(/{membercount}/gi, message.guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setTitle('💬 Farewell Message Diatur')
            .setDescription('Pesan farewell telah berhasil diatur.')
            .addFields(
                { name: 'Pesan', value: `\`\`\`${msg}\`\`\``, inline: false },
                { name: 'Preview', value: preview, inline: false },
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Diatur oleh', value: message.author.tag, inline: true }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
