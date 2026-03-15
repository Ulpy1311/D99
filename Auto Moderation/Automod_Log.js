const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'automod-log',
    description: 'Set channel log untuk Auto Moderation',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const channel = message.mentions.channels.first();
        if (!channel) {
            if (global.automodLogChannel) {
                global.automodLogChannel = null;
                return message.reply('Logging Auto Moderation telah dinonaktifkan.');
            }
            return message.reply('Sebutkan channel untuk log Auto Moderation.');
        }

        global.automodLogChannel = channel.id;
        return message.reply(`Channel log Auto Moderation berhasil diatur ke: ${channel}`);
    }
};
