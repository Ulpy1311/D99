const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-emoji',
    description: 'Toggle sistem anti emoji spam',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiEmoji = !global.antiEmoji;
        return message.reply(`Sistem Anti Emoji sekarang: **${global.antiEmoji ? 'ON' : 'OFF'}**`);
    },
    async checkEmoji(message) {
        if (!global.antiEmoji) return;
        
        const emojiRegex = /<a?:.+?:\d+>|[\u{1f300}-\u{1f5ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{1f700}-\u{1f77f}\u{1f780}-\u{1f7ff}\u{1f800}-\u{1f8ff}\u{1f900}-\u{1f9ff}\u{1fa00}-\u{1fa6f}\u{1fa70}-\u{1faff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu;
        const emojis = message.content.match(emojiRegex);

        if (emojis && emojis.length > 10) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, terlalu banyak emoji!`);
        }
    }
};
