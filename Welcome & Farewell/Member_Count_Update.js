const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'membercountupdate',
    description: 'Update member count channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!message.guild.members.me.permissions.has('ManageChannels')) {
            return message.reply('Bot tidak memiliki permission Manage Channels.');
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        
        if (!channel) {
            if (!global.memberCountConfig) global.memberCountConfig = new Map();
            
            const currentConfig = global.memberCountConfig.get(message.guild.id) || {};
            currentConfig.enabled = !currentConfig.enabled;
            global.memberCountConfig.set(message.guild.id, currentConfig);

            const embed = new EmbedBuilder()
                .setTitle('📊 Member Count System')
                .setDescription(`Member count auto-update telah **${currentConfig.enabled ? 'DI-AKTIFKAN' : 'DI-NONAKTIFKAN'}**`)
                .addFields(
                    { name: 'Status', value: currentConfig.enabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: 'Channel', value: currentConfig.channelId ? `<#${currentConfig.channelId}>` : 'Belum diatur', inline: true }
                )
                .setColor(currentConfig.enabled ? 0x00FF00 : 0xFF0000)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (!global.memberCountConfig) global.memberCountConfig = new Map();
        
        const currentConfig = global.memberCountConfig.get(message.guild.id) || {};
        currentConfig.channelId = channel.id;
        currentConfig.enabled = true;
        global.memberCountConfig.set(message.guild.id, currentConfig);

        const newName = `Members: ${message.guild.memberCount}`;
        try {
            await channel.setName(newName);
        } catch (err) {
            console.error('Error updating channel name:', err);
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Member Count Channel Diatur')
            .setDescription('Channel member count telah berhasil diatur dan akan auto-update.')
            .addFields(
                { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
                { name: 'Member Count', value: `${message.guild.memberCount}`, inline: true },
                { name: 'Server', value: message.guild.name, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
