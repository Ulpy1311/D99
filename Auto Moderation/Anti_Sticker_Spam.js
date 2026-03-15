const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-sticker',
    description: 'Toggle sistem anti sticker spam',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiSticker = !global.antiSticker;
        return message.reply(`Sistem Anti Sticker sekarang: **${global.antiSticker ? 'ON' : 'OFF'}**`);
    },
    async checkSticker(message) {
        if (!global.antiSticker) return;

        if (message.stickers.size > 0) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, dilarang menggunakan sticker berlebihan!`);
        }
    }
};
