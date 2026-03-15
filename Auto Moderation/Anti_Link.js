const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-link',
    description: 'Toggle sistem anti-link external',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiLink = !global.antiLink;
        return message.reply(`Sistem Anti Link sekarang: **${global.antiLink ? 'ON' : 'OFF'}**`);
    },
    async checkLink(message) {
        if (!global.antiLink) return;
        if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        const linkRegex = /https?:\/\/[^\s]+/g;
        if (linkRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, dilarang mengirim link external!`);
        }
    }
};
