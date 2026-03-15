const { PermissionsBitField } = require('discord.js');

const spamMap = new Map();

module.exports = {
    name: 'anti-spam',
    description: 'Toggle sistem deteksi spam',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        global.antiSpam = !global.antiSpam;
        return message.reply(`Sistem Anti Spam sekarang: **${global.antiSpam ? 'ON' : 'OFF'}**`);
    },
    async detectSpam(message) {
        if (!global.antiSpam) return;
        const cooldown = 5000; // 5 detik
        const limit = 5; // 5 pesan

        const authorId = message.author.id;
        const now = Date.now();

        if (spamMap.has(authorId)) {
            const data = spamMap.get(authorId);
            if (now - data.lastTimestamp < cooldown) {
                data.count++;
                if (data.count > limit) {
                    await message.delete().catch(() => {});
                    if (data.count === limit + 1) {
                        return message.channel.send(`${message.author}, jangan spam!`);
                    }
                }
            } else {
                data.count = 1;
            }
            data.lastTimestamp = now;
        } else {
            spamMap.set(authorId, { count: 1, lastTimestamp: now });
        }
    }
};
