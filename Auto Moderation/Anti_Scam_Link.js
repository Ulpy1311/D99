const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-scam',
    description: 'Toggle sistem anti-scam links',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiScam = !global.antiScam;
        return message.reply(`Sistem Anti Scam sekarang: **${global.antiScam ? 'ON' : 'OFF'}**`);
    },
    async checkScam(message) {
        if (!global.antiScam) return;

        const scamRegex = /free-nitro|discord-nitro|gift-discord|steampowered-gift|discorcl|nitro-drop/gi;
        if (scamRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(`${message.author}, dilarang mengirim link scam/phishing!`);
        }
    }
};
