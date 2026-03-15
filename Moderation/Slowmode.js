const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Set slowmode di channel',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('Anda tidak memiliki izin.');
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds)) return message.reply('Mohon berikan angka dalam detik.');

        await message.channel.setRateLimitPerUser(seconds);
        message.reply(`Slowmode diatur ke ${seconds} detik.`);
    }
};
