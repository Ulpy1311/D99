const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-alt',
    description: 'Toggle sistem anti-alt account (<7 hari)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiAlt = !global.antiAlt;
        return message.reply(`Sistem Anti Alt Account sekarang: **${global.antiAlt ? 'ON' : 'OFF'}**`);
    },
    async checkAlt(member) {
        if (!global.antiAlt) return;

        const minAge = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam ms
        const accountAge = Date.now() - member.user.createdTimestamp;

        if (accountAge < minAge) {
            console.log(`New account detected: ${member.user.tag}`);
            // Logic: Kick or warn
            // await member.send('Akun Anda terlalu baru untuk bergabung di server ini.').catch(() => {});
            // await member.kick('New Account Protection');
        }
    }
};
