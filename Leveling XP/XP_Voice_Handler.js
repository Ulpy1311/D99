const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
}

function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

module.exports = {
    name: 'xpvoicehandler',
    description: 'Handler untuk XP dari voice chat',
    startTracking(client) {
        setInterval(async () => {
            client.guilds.cache.forEach(guild => {
                const config = global.levelingConfig?.get(guild.id);
                if (!config?.enabled) return;

                guild.channels.cache
                    .filter(ch => ch.isVoiceBased && ch.isVoiceBased())
                    .forEach(channel => {
                        channel.members?.forEach?.(member => {
                            if (member.user.bot) return;
                            if (member.voice.selfDeaf || member.voice.selfMute) return;

                            if (!global.voiceXPTracking) global.voiceXPTracking = new Map();
                            const key = `${guild.id}-${member.id}`;
                            const tracking = global.voiceXPTracking.get(key);

                            if (tracking) {
                                const timeDiff = Date.now() - tracking.start;
                                const minutes = timeDiff / 60000;

                                if (minutes >= 1) {
                                    let xpGain = (config.voiceXP?.perMinute || 2) * minutes;

                                    if (config.doubleXP) {
                                        xpGain *= config.doubleXPMultiplier || 2;
                                    }

                                    let multiplier = 1;
                                    if (config.multipliers?.channels?.[channel.id]) {
                                        multiplier = config.multipliers.channels[channel.id];
                                    }
                                    for (const [roleId, multi] of Object.entries(config.multipliers?.roles || {})) {
                                        if (member.roles.cache.has(roleId)) {
                                            multiplier = Math.max(multiplier, multi);
                                        }
                                    }

                                    xpGain = Math.floor(xpGain * multiplier);

                                    if (!global.userXP) global.userXP = new Map();
                                    const userKey = `${guild.id}-${member.id}`;
                                    const userData = global.userXP.get(userKey) || {
                                        xp: 0, level: 1, messages: 0, voiceTime: 0, prestige: 0, streak: 0
                                    };

                                    userData.xp += xpGain;
                                    userData.voiceTime += minutes;
                                    global.userXP.set(userKey, userData);

                                    const weekKey = `${guild.id}-${getWeekNumber()}`;
                                    if (!global.weeklyXP) global.weeklyXP = new Map();
                                    const weekData = global.weeklyXP.get(weekKey) || {};
                                    weekData[member.id] = (weekData[member.id] || 0) + xpGain;
                                    global.weeklyXP.set(weekKey, weekData);

                                    const monthKey = `${guild.id}-${getMonthKey()}`;
                                    if (!global.monthlyXP) global.monthlyXP = new Map();
                                    const monthData = global.monthlyXP.get(monthKey) || {};
                                    monthData[member.id] = (monthData[member.id] || 0) + xpGain;
                                    global.monthlyXP.set(monthKey, monthData);

                                    tracking.start = Date.now();
                                }
                            } else {
                                global.voiceXPTracking.set(key, { start: Date.now() });
                            }
                        });
                    });
            });

            if (global.voiceXPTracking) {
                global.voiceXPTracking.forEach((tracking, key) => {
                    const [guildId, userId] = key.split('-');
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) return;

                    const member = guild.members.cache.get(userId);
                    if (!member || !member.voice?.channel) {
                        global.voiceXPTracking.delete(key);
                    }
                });
            }
        }, 60000);
    }
};
