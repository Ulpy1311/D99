const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-mention',
    description: 'Toggle sistem anti mass mention',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiMention = !global.antiMention;
        return message.reply(`Sistem Anti Mention sekarang: **${global.antiMention ? 'ON' : 'OFF'}**`);
    },
    async checkMention(message) {
        if (!global.antiMention) return;
        
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount > 5) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, dilarang melakukan mass mention!`);
        }
    }
};
