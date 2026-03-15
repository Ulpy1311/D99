const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'welcometest',
    description: 'Test welcome message',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.welcomeConfig?.get(message.guild.id);
        if (!config || !config.enabled) {
            return message.reply('❌ Welcome system belum diaktifkan. Gunakan `g!welcomesetup` terlebih dahulu.');
        }

        if (!config.channelId) {
            return message.reply('❌ Welcome channel belum diatur. Gunakan `g!welcomechannel` terlebih dahulu.');
        }

        const channel = message.guild.channels.cache.get(config.channelId);
        if (!channel) {
            return message.reply('❌ Channel welcome tidak ditemukan.');
        }

        const welcomeMessage = (config.message || 'Selamat datang di {server}, {user}!')
            .replace(/{user}/gi, `<@${message.author.id}>`)
            .replace(/{user\.tag}/gi, message.author.tag)
            .replace(/{user\.id}/gi, message.author.id)
            .replace(/{server}/gi, message.guild.name)
            .replace(/{membercount}/gi, message.guild.memberCount.toString());

        if (config.embedEnabled) {
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`👋 Welcome to ${message.guild.name}!`)
                .setDescription(welcomeMessage)
                .setColor(parseInt(config.embedColor?.replace('#', '0x') || '0x00FF00'))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '👤 User', value: `${message.author.tag}`, inline: true },
                    { name: '📊 Member Count', value: `${message.guild.memberCount}`, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(message.author.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${message.author.id}` });

            const content = config.pingEnabled ? `<@${message.author.id}>` : '';
            channel.send({ content, embeds: [welcomeEmbed] });
        } else {
            const content = config.pingEnabled ? `<@${message.author.id}> ${welcomeMessage}` : welcomeMessage;
            channel.send(content);
        }

        if (config.dmEnabled && config.dmMessage) {
            const dmMessage = config.dmMessage
                .replace(/{user}/gi, `<@${message.author.id}>`)
                .replace(/{user\.tag}/gi, message.author.tag)
                .replace(/{user\.id}/gi, message.author.id)
                .replace(/{server}/gi, message.guild.name)
                .replace(/{membercount}/gi, message.guild.memberCount.toString());

            try {
                await message.author.send(dmMessage);
            } catch (err) {
                console.log('Could not send DM to user');
            }
        }

        message.reply('✅ Test welcome message telah dikirim ke <#' + config.channelId + '>');
    }
};
