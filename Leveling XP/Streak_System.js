const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'streaksystem',
    description: 'Daily activity streak system',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        const subCommand = args[0]?.toLowerCase();

        if (!subCommand) {
            const embed = new EmbedBuilder()
                .setTitle('🔥 Streak System')
                .setDescription('Sistem streak untuk aktivitas harian.')
                .addFields(
                    { name: 'Status', value: config.streakEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: 'Bonus', value: config.streakBonus ? `${config.streakBonus}x multiplier` : 'None', inline: true },
                    { name: 'Usage', value: 
                        '• `g!streaksystem on` - Aktifkan streak\n' +
                        '• `g!streaksystem off` - Nonaktifkan streak\n' +
                        '• `g!streaksystem bonus <multiplier>` - Set bonus multiplier'
                    },
                    { name: 'Info', value: 
                        '• Streak = aktivitas minimal 1x per hari\n' +
                        '• Streak hilang jika tidak aktif >24 jam\n' +
                        '• Bonus multiplier untuk streak tinggi'
                    }
                )
                .setColor(0xFF5722)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.streakEnabled = true;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Streak system diaktifkan.');
        }

        if (subCommand === 'off') {
            config.streakEnabled = false;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Streak system dinonaktifkan.');
        }

        if (subCommand === 'bonus') {
            const bonus = parseFloat(args[1]);

            if (!bonus || bonus < 1 || bonus > 5) {
                return message.reply('❌ Bonus multiplier harus antara 1-5.');
            }

            config.streakBonus = bonus;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ Streak bonus multiplier diatur ke ${bonus}x.`);
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};

function checkStreak(userId, guild) {
    if (!global.userXP) return 0;

    const userData = global.userXP.get(`${guild.id}-${userId}`);
    if (!userData) return 0;

    const lastActive = userData.lastActive;
    if (!lastActive) return 0;

    const hoursSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60);

    if (hoursSinceActive > 48) {
        userData.streak = 0;
    }

    return userData.streak || 0;
}

function updateStreak(userId, guild) {
    if (!global.userXP) global.userXP = new Map();

    const key = `${guild.id}-${userId}`;
    const userData = global.userXP.get(key) || {
        xp: 0, level: 1, messages: 0, voiceTime: 0, prestige: 0, streak: 0, lastActive: null
    };

    const lastActive = userData.lastActive;
    const now = Date.now();

    if (lastActive) {
        const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60);

        if (hoursSinceActive > 24 && hoursSinceActive <= 48) {
            userData.streak = (userData.streak || 0) + 1;
        } else if (hoursSinceActive > 48) {
            userData.streak = 1;
        }
    } else {
        userData.streak = 1;
    }

    userData.lastActive = now;
    global.userXP.set(key, userData);

    return userData.streak;
}

module.exports.checkStreak = checkStreak;
module.exports.updateStreak = updateStreak;
