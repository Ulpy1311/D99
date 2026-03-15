const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getXPForLevel(level) {
    return Math.pow(level / 0.1, 2);
}

async function checkLevelUp(userId, guild, client) {
    if (!global.userXP) return null;

    const userData = global.userXP.get(`${guild.id}-${userId}`);
    if (!userData) return null;

    const newLevel = getLevel(userData.xp);
    if (newLevel > userData.level) {
        userData.level = newLevel;
        global.userXP.set(`${guild.id}-${userId}`, userData);

        const config = global.levelingConfig?.get(guild.id);
        if (config?.roleRewards) {
            const member = guild.members.cache.get(userId);
            if (member) {
                for (const reward of config.roleRewards) {
                    if (newLevel >= reward.level && !member.roles.cache.has(reward.roleId)) {
                        try {
                            await member.roles.add(reward.roleId);
                        } catch (err) {
                            console.error('Error adding role reward:', err);
                        }
                    }
                }
            }
        }

        return { level: newLevel, userId };
    }
    return null;
}

module.exports = {
    name: 'xpmessagehandler',
    description: 'Handler untuk XP dari pesan',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config?.enabled) return;

        if (config.blacklistedChannels?.includes(message.channel.id)) return;
        if (config.blacklistedRoles?.some(rId => message.member.roles.cache.has(rId))) return;

        if (config.whitelistedChannels?.length > 0 && !config.whitelistedChannels.includes(message.channel.id)) return;
        if (config.whitelistedRoles?.length > 0 && !config.whitelistedRoles.some(rId => message.member.roles.cache.has(rId))) return;

        if (!global.xpCooldown) global.xpCooldown = new Map();
        const cooldownKey = `${message.guild.id}-${message.author.id}`;
        const lastXP = global.xpCooldown.get(cooldownKey);
        const cooldown = config.cooldown || 60000;

        if (lastXP && Date.now() - lastXP < cooldown) return;

        let minXP = config.messageXP?.min || 5;
        let maxXP = config.messageXP?.max || 15;

        if (config.doubleXP) {
            minXP *= config.doubleXPMultiplier || 2;
            maxXP *= config.doubleXPMultiplier || 2;
        }

        let multiplier = 1;
        if (config.multipliers?.channels?.[message.channel.id]) {
            multiplier = config.multipliers.channels[message.channel.id];
        }
        for (const [roleId, multi] of Object.entries(config.multipliers?.roles || {})) {
            if (message.member.roles.cache.has(roleId)) {
                multiplier = Math.max(multiplier, multi);
            }
        }

        const xpGain = Math.floor((Math.random() * (maxXP - minXP + 1) + minXP) * multiplier);

        if (!global.userXP) global.userXP = new Map();
        const userKey = `${message.guild.id}-${message.author.id}`;
        const userData = global.userXP.get(userKey) || {
            xp: 0, level: 1, messages: 0, voiceTime: 0, prestige: 0, streak: 0, lastActive: null
        };

        userData.xp += xpGain;
        userData.messages++;
        userData.lastActive = Date.now();
        global.userXP.set(userKey, userData);

        global.xpCooldown.set(cooldownKey, Date.now());

        const weekKey = `${message.guild.id}-${getWeekNumber()}`;
        if (!global.weeklyXP) global.weeklyXP = new Map();
        const weekData = global.weeklyXP.get(weekKey) || {};
        weekData[message.author.id] = (weekData[message.author.id] || 0) + xpGain;
        global.weeklyXP.set(weekKey, weekData);

        const monthKey = `${message.guild.id}-${getMonthKey()}`;
        if (!global.monthlyXP) global.monthlyXP = new Map();
        const monthData = global.monthlyXP.get(monthKey) || {};
        monthData[message.author.id] = (monthData[message.author.id] || 0) + xpGain;
        global.monthlyXP.set(monthKey, monthData);

        const levelUp = await checkLevelUp(message.author.id, message.guild, client);
        if (levelUp && config.notificationEnabled) {
            const levelUpMessage = (config.levelUpMessage || '🎉 Selamat {user}! Kamu naik ke level {level}!')
                .replace(/{user}/gi, `<@${message.author.id}>`)
                .replace(/{level}/gi, levelUp.level)
                .replace(/{server}/gi, message.guild.name);

            if (config.notificationChannel) {
                const channel = message.guild.channels.cache.get(config.notificationChannel);
                if (channel) {
                    channel.send(levelUpMessage);
                }
            } else {
                message.channel.send(levelUpMessage);
            }
        }
    }
};

function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
}

function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

module.exports.getWeekNumber = getWeekNumber;
module.exports.getMonthKey = getMonthKey;
module.exports.checkLevelUp = checkLevelUp;
