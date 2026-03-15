const { PermissionsBitField } = require('discord.js');

const joinHistory = [];

module.exports = {
    name: 'anti-raid',
    description: 'Toggle sistem anti raid (mass join)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiRaid = !global.antiRaid;
        return message.reply(`Sistem Anti Raid sekarang: **${global.antiRaid ? 'ON' : 'OFF'}**`);
    },
    async onJoin(member) {
        if (!global.antiRaid) return;

        const now = Date.now();
        const limit = 5; // member
        const timeFrame = 10000; // 10 detik

        joinHistory.push(now);

        const recentJoins = joinHistory.filter(timestamp => now - timestamp < timeFrame);

        if (recentJoins.length > limit) {
            // Logic: Kick or warn admins
            console.log(`Mass join detected! Total joins in 10s: ${recentJoins.length}`);
            // member.kick('Raid Protection');
        }
    }
};
