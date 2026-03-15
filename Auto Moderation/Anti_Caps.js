const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-caps',
    description: 'Toggle sistem anti-caps lock',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiCaps = !global.antiCaps;
        return message.reply(`Sistem Anti Caps sekarang: **${global.antiCaps ? 'ON' : 'OFF'}**`);
    },
    async checkCaps(message) {
        if (!global.antiCaps) return;
        if (message.content.length < 10) return;

        const capsCount = message.content.replace(/[^A-Z]/g, "").length;
        const totalCount = message.content.length;
        const ratio = capsCount / totalCount;

        if (ratio > 0.7) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, kurangi penggunaan CAPS LOCK!`);
        }
    }
};
