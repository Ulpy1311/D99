const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-zalgo',
    description: 'Toggle sistem anti zalgo text',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiZalgo = !global.antiZalgo;
        return message.reply(`Sistem Anti Zalgo sekarang: **${global.antiZalgo ? 'ON' : 'OFF'}**`);
    },
    async checkZalgo(message) {
        if (!global.antiZalgo) return;

        const zalgoRegex = /[\u0300-\u036f\u0483-\u0489\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g;
        if (zalgoRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, teks zalgo/corrupted tidak diperbolehkan!`);
        }
    }
};
