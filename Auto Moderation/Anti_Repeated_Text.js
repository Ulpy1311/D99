const { PermissionsBitField } = require('discord.js');

const lastMessages = new Map();

module.exports = {
    name: 'anti-repeated',
    description: 'Toggle sistem anti repeated text',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiRepeated = !global.antiRepeated;
        return message.reply(`Sistem Anti Repeated sekarang: **${global.antiRepeated ? 'ON' : 'OFF'}**`);
    },
    async checkRepeat(message) {
        if (!global.antiRepeated) return;

        const authorId = message.author.id;
        const content = message.content.toLowerCase();

        if (lastMessages.has(authorId)) {
            const lastContent = lastMessages.get(authorId);
            if (content === lastContent && content.length > 5) {
                await message.delete().catch(() => {});
                return message.channel.send(`${message.author}, jangan mengirim pesan yang sama berulang kali!`);
            }
        }
        lastMessages.set(authorId, content);
    }
};
