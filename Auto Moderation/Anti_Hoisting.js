const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-hoisting',
    description: 'Toggle sistem anti-hoisting (simbol di awal nama)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiHoisting = !global.antiHoisting;
        return message.reply(`Sistem Anti Hoisting sekarang: **${global.antiHoisting ? 'ON' : 'OFF'}**`);
    },
    async checkHoisting(member) {
        if (!global.antiHoisting) return;
        if (!member.manageable) return;

        const hoistingRegex = /^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
        if (hoistingRegex.test(member.displayName)) {
            await member.setNickname(`Cleaned Name ${Math.floor(Math.random() * 1000)}`).catch(() => {});
        }
    }
};
