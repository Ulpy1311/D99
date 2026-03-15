const { PermissionsBitField } = require('discord.js');

const actionLog = new Map();

module.exports = {
    name: 'anti-nuke',
    description: 'Toggle sistem anti nuke (mass delete/ban)',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiNuke = !global.antiNuke;
        return message.reply(`Sistem Anti Nuke sekarang: **${global.antiNuke ? 'ON' : 'OFF'}**`);
    },
    async checkAction(executorId, type) {
        if (!global.antiNuke) return;

        const limit = 3; // 3 actions per 10s
        const timeframe = 10000;
        const now = Date.now();

        if (!actionLog.has(executorId)) {
            actionLog.set(executorId, []);
        }

        const actions = actionLog.get(executorId);
        actions.push({ type, timestamp: now });

        const recent = actions.filter(a => now - a.timestamp < timeframe);
        actionLog.set(executorId, recent);

        if (recent.length > limit) {
            console.log(`Alert: User ${executorId} performing mass ${type}!`);
            // Logic: Remove roles or ban executor
        }
    }
};
