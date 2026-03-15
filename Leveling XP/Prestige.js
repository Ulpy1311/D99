const { EmbedBuilder } = require('discord.js');

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

function getXPForLevel(level) {
    return Math.pow(level / 0.1, 2);
}

module.exports = {
    name: 'prestige',
    description: 'Reset level untuk prestige perks',
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
                .setTitle('⭐ Prestige System')
                .setDescription('Sistem prestige untuk player level tinggi.')
                .addFields(
                    { name: 'Status', value: config.prestigeEnabled ? '🟢 Aktif' : '🔴 Nonaktif', inline: true },
                    { name: 'Min Level', value: `${config.prestigeMinLevel || 50}`, inline: true },
                    { name: 'Usage', value: 
                        '• `g!prestige on` - Aktifkan prestige\n' +
                        '• `g!prestige off` - Nonaktifkan prestige\n' +
                        '• `g!prestige minlevel <level>` - Set minimum level\n' +
                        '• `g!prestige check <user>` - Cek prestige user'
                    },
                    { name: 'Benefits', value: 
                        '• Exclusive role rewards\n' +
                        '• Prestige badge\n' +
                        '• Bonus XP multiplier'
                    }
                )
                .setColor(0x9B59B6)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.prestigeEnabled = true;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Prestige system diaktifkan.');
        }

        if (subCommand === 'off') {
            config.prestigeEnabled = false;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply('✅ Prestige system dinonaktifkan.');
        }

        if (subCommand === 'minlevel') {
            const level = parseInt(args[1]);

            if (!level || level < 10 || level > 100) {
                return message.reply('❌ Minimum level harus antara 10-100.');
            }

            config.prestigeMinLevel = level;
            global.levelingConfig.set(message.guild.id, config);

            return message.reply(`✅ Prestige minimum level diatur ke ${level}.`);
        }

        if (subCommand === 'check') {
            const target = message.mentions.users.first() || message.guild.members.cache.get(args[1])?.user || message.author;

            if (!global.userXP) global.userXP = new Map();
            const userData = global.userXP.get(`${message.guild.id}-${target.id}`) || {
                xp: 0, level: 1, prestige: 0
            };

            const level = getLevel(userData.xp);
            const canPrestige = config.prestigeEnabled && level >= (config.prestigeMinLevel || 50);

            const embed = new EmbedBuilder()
                .setTitle(`⭐ Prestige Info - ${target.username}`)
                .addFields(
                    { name: 'Current Prestige', value: `${userData.prestige || 0}`, inline: true },
                    { name: 'Current Level', value: `${level}`, inline: true },
                    { name: 'Can Prestige', value: canPrestige ? '✅ Yes' : '❌ No', inline: true }
                )
                .setColor(0x9B59B6)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'reset') {
            const target = message.mentions.users.first();
            if (!target) return message.reply('❌ Silakan mention user.');

            if (!global.userXP) global.userXP = new Map();
            const key = `${message.guild.id}-${target.id}`;
            const userData = global.userXP.get(key);

            if (!userData) return message.reply('❌ User tidak memiliki data.');

            const level = getLevel(userData.xp);
            if (level < (config.prestigeMinLevel || 50)) {
                return message.reply(`❌ User harus minimal level ${config.prestigeMinLevel || 50} untuk prestige.`);
            }

            userData.prestige = (userData.prestige || 0) + 1;
            userData.xp = 0;
            userData.level = 1;
            global.userXP.set(key, userData);

            return message.reply(`✅ ${target} telah prestige! Prestige level: ${userData.prestige}`);
        }

        message.reply('❌ Sub-command tidak valid.');
    }
};
