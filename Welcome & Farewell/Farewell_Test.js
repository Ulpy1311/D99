const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'farewelltest',
    description: 'Test farewell message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.farewellConfig?.get(message.guild.id);
        if (!config || !config.enabled) {
            return message.reply('❌ Farewell system belum diaktifkan. Gunakan `g!farewellsetup` terlebih dahulu.');
        }

        if (!config.channelId) {
            return message.reply('❌ Farewell channel belum diatur. Gunakan `g!farewellchannel` terlebih dahulu.');
        }

        const channel = message.guild.channels.cache.get(config.channelId);
        if (!channel) {
            return message.reply('❌ Channel farewell tidak ditemukan.');
        }

        const farewellMessage = (config.message || 'Selamat tinggal {user.tag}! Semoga jumpa lagi.')
            .replace(/{user}/gi, `<@${message.author.id}>`)
            .replace(/{user\.tag}/gi, message.author.tag)
            .replace(/{user\.id}/gi, message.author.id)
            .replace(/{server}/gi, message.guild.name)
            .replace(/{membercount}/gi, (message.guild.memberCount - 1).toString());

        if (config.embedEnabled) {
            const farewellEmbed = new EmbedBuilder()
                .setTitle(`👋 Goodbye from ${message.guild.name}`)
                .setDescription(farewellMessage)
                .setColor(parseInt(config.embedColor?.replace('#', '0x') || '0xFF0000'))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '👤 User', value: `${message.author.tag}`, inline: true },
                    { name: '📊 Member Count', value: `${message.guild.memberCount - 1}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${message.author.id}` });

            channel.send({ embeds: [farewellEmbed] });
        } else {
            channel.send(farewellMessage);
        }

        message.reply('✅ Test farewell message telah dikirim ke <#' + config.channelId + '>');
    }
};
