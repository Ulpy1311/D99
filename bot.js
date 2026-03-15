require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField, ActivityType, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();
const prefix = process.env.PREFIX || 'g!';
const devRoleId = process.env.DEVELOPER_ROLE_ID;
const ownerId = process.env.OWNER_ID;

global.logChannels = new Map();
global.logConfig = new Map();
global.welcomeConfig = new Map();
global.farewellConfig = new Map();
global.memberCountConfig = new Map();
global.rejoinConfig = new Map();
global.memberHistory = new Map();
global.ticketConfig = new Map();
global.tickets = new Map();
global.ticketCount = new Map();
global.ticketBlacklist = new Map();
global.ticketFeedback = new Map();
global.ticketSnippets = new Map();
global.levelingConfig = new Map();
global.userXP = new Map();
global.xpCooldown = new Map();
global.voiceXPTracking = new Map();
global.weeklyXP = new Map();
global.monthlyXP = new Map();
global.rankCardConfig = new Map();
global.economyConfig = new Map();
global.economyData = new Map();
global.auctions = new Map();
global.lottery = new Map();
global.trades = new Map();
global.clientInstance = client;

const folders = ['./Moderation', './Logging', './Welcome & Farewell', './Ticket System', './Leveling XP', './Economy', './Games', './Fun & Entertainment'];
folders.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                const command = require(path.join(process.cwd(), dir, file));
                client.commands.set(command.name, command);
            } catch (err) {
                console.error(`Error loading ${file}:`, err.message);
            }
        }
    }
});

async function sendLog(guild, logType, embed) {
    const config = global.logConfig.get(guild.id);
    if (!config || !config[logType]) return;

    const logChannelData = global.logChannels.get(guild.id);
    if (!logChannelData) return;

    const logChannel = guild.channels.cache.get(logChannelData.general);
    if (!logChannel) return;

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error(`Error sending log: ${err.message}`);
    }
}

async function sendWelcome(member) {
    const config = global.welcomeConfig?.get(member.guild.id);
    if (!config || !config.enabled) return;

    if (!config.channelId) return;
    const channel = member.guild.channels.cache.get(config.channelId);
    if (!channel) return;

    const welcomeMessage = (config.message || 'Selamat datang di {server}, {user}!')
        .replace(/{user}/gi, `<@${member.id}>`)
        .replace(/{user\.tag}/gi, member.user.tag)
        .replace(/{user\.id}/gi, member.id)
        .replace(/{server}/gi, member.guild.name)
        .replace(/{membercount}/gi, member.guild.memberCount.toString());

    if (config.embedEnabled) {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`👋 Welcome to ${member.guild.name}!`)
            .setDescription(welcomeMessage)
            .setColor(parseInt(config.embedColor?.replace('#', '0x') || '0x00FF00'))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 User', value: `${member.user.tag}`, inline: true },
                { name: '📊 Member Count', value: `${member.guild.memberCount}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${member.id}` });

        const content = config.pingEnabled ? `<@${member.id}>` : '';
        channel.send({ content, embeds: [welcomeEmbed] });
    } else {
        const content = config.pingEnabled ? `<@${member.id}> ${welcomeMessage}` : welcomeMessage;
        channel.send(content);
    }

    if (config.dmEnabled && config.dmMessage) {
        const dmMessage = config.dmMessage
            .replace(/{user}/gi, `<@${member.id}>`)
            .replace(/{user\.tag}/gi, member.user.tag)
            .replace(/{user\.id}/gi, member.id)
            .replace(/{server}/gi, member.guild.name)
            .replace(/{membercount}/gi, member.guild.memberCount.toString());

        try {
            await member.send(dmMessage);
        } catch (err) {
            console.log(`Could not send DM to ${member.user.tag}`);
        }
    }

    if (config.autoRole) {
        const role = member.guild.roles.cache.get(config.autoRole);
        if (role && member.guild.members.me.permissions.has('ManageRoles')) {
            try {
                await member.roles.add(role);
            } catch (err) {
                console.error(`Could not add auto role: ${err.message}`);
            }
        }
    }
}

async function sendFarewell(member) {
    const config = global.farewellConfig?.get(member.guild.id);
    if (!config || !config.enabled) return;

    if (!config.channelId) return;
    const channel = member.guild.channels.cache.get(config.channelId);
    if (!channel) return;

    const farewellMessage = (config.message || 'Selamat tinggal {user.tag}! Semoga jumpa lagi.')
        .replace(/{user}/gi, `<@${member.id}>`)
        .replace(/{user\.tag}/gi, member.user?.tag || 'Unknown#0000')
        .replace(/{user\.id}/gi, member.id)
        .replace(/{server}/gi, member.guild.name)
        .replace(/{membercount}/gi, (member.guild.memberCount).toString());

    if (config.embedEnabled) {
        const farewellEmbed = new EmbedBuilder()
            .setTitle(`👋 Goodbye from ${member.guild.name}`)
            .setDescription(farewellMessage)
            .setColor(parseInt(config.embedColor?.replace('#', '0x') || '0xFF0000'))
            .setThumbnail(member.user?.displayAvatarURL({ dynamic: true, size: 256 }) || null)
            .addFields(
                { name: '👤 User', value: member.user?.tag || 'Unknown#0000', inline: true },
                { name: '📊 Member Count', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${member.id}` });

        channel.send({ embeds: [farewellEmbed] });
    } else {
        channel.send(farewellMessage);
    }
}

async function updateMemberCount(guild) {
    const config = global.memberCountConfig?.get(guild.id);
    if (!config || !config.enabled || !config.channelId) return;

    const channel = guild.channels.cache.get(config.channelId);
    if (!channel) return;

    const newName = `Members: ${guild.memberCount}`;
    try {
        await channel.setName(newName);
    } catch (err) {
        console.error(`Error updating member count: ${err.message}`);
    }
}

client.once('clientReady', () => {
    console.log(`\x1b[32m%s\x1b[0m`, `✅ ${client.user.tag} Is Running!`);
    console.log(`\x1b[36m%s\x1b[0m`, `📋 Prefix: ${prefix}`);
    console.log(`\x1b[36m%s\x1b[0m`, `👤 Owner ID: ${ownerId}`);
    console.log(`\x1b[36m%s\x1b[0m`, `🔧 Developer Role ID: ${devRoleId}`);
    console.log(`\x1b[36m%s\x1b[0m`, `📊 Loaded ${client.commands.size} commands`);
    console.log(`\x1b[36m%s\x1b[0m`, `📁 Folders: Moderation, Logging, Welcome & Farewell, Ticket System, Leveling XP, Economy, Games, Fun & Entertainment`);

    const xpVoiceHandler = require('./Leveling XP/XP_Voice_Handler.js');
    if (xpVoiceHandler.startTracking) {
        xpVoiceHandler.startTracking(client);
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    const rejoinConfig = global.rejoinConfig?.get(member.guild.id);
    if (rejoinConfig?.enabled) {
        const history = global.memberHistory?.get(`${member.guild.id}-${member.id}`);
        if (history) {
            const logChannel = member.guild.channels.cache.get(rejoinConfig.notifyChannel || global.logChannels?.get(member.guild.id)?.general);
            if (logChannel) {
                const rejoinEmbed = new EmbedBuilder()
                    .setTitle('🔄 Member Rejoined')
                    .setDescription(`Member ini pernah join sebelumnya!`)
                    .setColor(0xFFA500)
                    .addFields(
                        { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                        { name: 'Previous Join', value: `<t:${Math.floor(history.joinedAt / 1000)}:F>`, inline: true },
                        { name: 'Previous Leave', value: history.leftAt ? `<t:${Math.floor(history.leftAt / 1000)}:F>` : 'Unknown', inline: true }
                    )
                    .setTimestamp();

                logChannel.send({ embeds: [rejoinEmbed] });
            }
        }
    }

    if (global.memberHistory) {
        global.memberHistory.set(`${member.guild.id}-${member.id}`, {
            joinedAt: Date.now(),
            leftAt: null
        });
    }

    await sendWelcome(member);
    await updateMemberCount(member.guild);

    const embed = new EmbedBuilder()
        .setTitle('👋 Member Joined')
        .setColor(0x00FF00)
        .setTimestamp()
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
        );

    sendLog(member.guild, 'memberJoin', embed);
});

client.on(Events.GuildMemberRemove, async (member) => {
    if (global.memberHistory) {
        const history = global.memberHistory.get(`${member.guild.id}-${member.id}`);
        if (history) {
            history.leftAt = Date.now();
            global.memberHistory.set(`${member.guild.id}-${member.id}`, history);
        }
    }

    await sendFarewell(member);
    await updateMemberCount(member.guild);

    const embed = new EmbedBuilder()
        .setTitle('👋 Member Left')
        .setColor(0xFF0000)
        .setTimestamp()
        .setThumbnail(member.user?.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'User', value: `${member.user?.tag || 'Unknown'} (${member.id})`, inline: true },
            { name: 'Joined At', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
            { name: 'Roles', value: member.roles?.cache?.size > 0 ? member.roles.cache.map(r => r.name).join(', ') : 'None', inline: false }
        );

    sendLog(member.guild, 'memberLeave', embed);
});

client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || message.author?.bot) return;

    const embed = new EmbedBuilder()
        .setTitle('🗑️ Message Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Author', value: `${message.author?.tag || 'Unknown'} (${message.author?.id || 'Unknown'})`, inline: true },
            { name: 'Channel', value: `${message.channel.name} (${message.channel.id})`, inline: true },
            { name: 'Content', value: message.content ? `\`\`\`${message.content.substring(0, 1000)}\`\`\`` : '*No content or embed*', inline: false }
        );

    if (message.attachments?.size > 0) {
        embed.addFields({ name: 'Attachments', value: `${message.attachments.size} file(s)`, inline: true });
    }

    sendLog(message.guild, 'messageDelete', embed);
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
        .setTitle('✏️ Message Edited')
        .setColor(0xFFA500)
        .setTimestamp()
        .addFields(
            { name: 'Author', value: `${oldMessage.author?.tag || 'Unknown'} (${oldMessage.author?.id || 'Unknown'})`, inline: true },
            { name: 'Channel', value: `${oldMessage.channel.name} (${oldMessage.channel.id})`, inline: true },
            { name: 'Before', value: oldMessage.content ? `\`\`\`${oldMessage.content.substring(0, 500)}\`\`\`` : '*No content*', inline: false },
            { name: 'After', value: newMessage.content ? `\`\`\`${newMessage.content.substring(0, 500)}\`\`\`` : '*No content*', inline: false }
        )
        .addFields({ name: 'Jump to Message', value: `[Click Here](${newMessage.url})`, inline: true });

    sendLog(oldMessage.guild, 'messageEdit', embed);
});

client.on(Events.GuildBanAdd, async (ban) => {
    const embed = new EmbedBuilder()
        .setTitle('🔨 Member Banned')
        .setColor(0xFF0000)
        .setTimestamp()
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
            { name: 'Reason', value: ban.reason || 'No reason provided', inline: false }
        );

    sendLog(ban.guild, 'memberBan', embed);
});

client.on(Events.GuildBanRemove, async (ban) => {
    const embed = new EmbedBuilder()
        .setTitle('🔓 Member Unbanned')
        .setColor(0x00FF00)
        .setTimestamp()
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true }
        );

    sendLog(ban.guild, 'memberUnban', embed);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const embed = new EmbedBuilder()
            .setTitle('⏰ Member Timeout Updated')
            .setColor(0xFFA500)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
                { name: 'Timeout Until', value: newMember.communicationDisabledUntil ? `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` : 'Removed', inline: true }
            );

        sendLog(newMember.guild, 'memberTimeout', embed);
    }

    if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
            .setTitle('📝 Nickname Changed')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: true },
                { name: 'Before', value: oldMember.nickname || '*No nickname*', inline: true },
                { name: 'After', value: newMember.nickname || '*No nickname*', inline: true }
            );

        sendLog(newMember.guild, 'nicknameChange', embed);
    }

    if (oldMember.avatar !== newMember.avatar) {
        const embed = new EmbedBuilder()
            .setTitle('🖼️ Server Avatar Changed')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: true }
            );

        if (newMember.avatarURL()) {
            embed.setThumbnail(newMember.avatarURL({ dynamic: true }));
        }

        sendLog(newMember.guild, 'avatarChange', embed);
    }

    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (addedRoles.size > 0 || removedRoles.size > 0) {
        const embed = new EmbedBuilder()
            .setTitle('🎭 Member Roles Updated')
            .setColor(0x9B59B6)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newMember.user.tag} (${newMember.id})`, inline: true }
            );

        if (addedRoles.size > 0) {
            embed.addFields({ name: 'Added Roles', value: addedRoles.map(r => `<@&${r.id}>`).join(', ') || 'None', inline: false });
        }
        if (removedRoles.size > 0) {
            embed.addFields({ name: 'Removed Roles', value: removedRoles.map(r => `<@&${r.id}>`).join(', ') || 'None', inline: false });
        }

        sendLog(newMember.guild, 'memberRoleUpdate', embed);
    }
});

client.on(Events.GuildRoleCreate, async (role) => {
    const embed = new EmbedBuilder()
        .setTitle('✅ Role Created')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Role', value: `${role.name} (${role.id})`, inline: true },
            { name: 'Color', value: role.hexColor, inline: true },
            { name: 'Position', value: `${role.position}`, inline: true }
        );

    sendLog(role.guild, 'roleCreate', embed);
});

client.on(Events.GuildRoleDelete, async (role) => {
    const embed = new EmbedBuilder()
        .setTitle('❌ Role Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Role Name', value: role.name, inline: true },
            { name: 'Role ID', value: role.id, inline: true },
            { name: 'Color', value: role.hexColor, inline: true }
        );

    sendLog(role.guild, 'roleDelete', embed);
});

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
    const changes = [];
    if (oldRole.name !== newRole.name) changes.push(`Name: \`${oldRole.name}\` → \`${newRole.name}\``);
    if (oldRole.color !== newRole.color) changes.push(`Color: \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``);
    if (oldRole.hoist !== newRole.hoist) changes.push(`Hoisted: \`${oldRole.hoist}\` → \`${newRole.hoist}\``);
    if (oldRole.mentionable !== newRole.mentionable) changes.push(`Mentionable: \`${oldRole.mentionable}\` → \`${newRole.mentionable}\``);

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setTitle('📝 Role Updated')
        .setColor(0xFFA500)
        .setTimestamp()
        .addFields(
            { name: 'Role', value: `${newRole.name} (${newRole.id})`, inline: true },
            { name: 'Changes', value: changes.join('\n'), inline: false }
        );

    sendLog(newRole.guild, 'roleUpdate', embed);
});

client.on(Events.ChannelCreate, async (channel) => {
    if (!channel.guild) return;

    const embed = new EmbedBuilder()
        .setTitle('✅ Channel Created')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
            { name: 'Type', value: channel.type.toString(), inline: true }
        );

    sendLog(channel.guild, 'channelCreate', embed);
});

client.on(Events.ChannelDelete, async (channel) => {
    if (!channel.guild) return;

    const embed = new EmbedBuilder()
        .setTitle('❌ Channel Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Channel Name', value: channel.name, inline: true },
            { name: 'Channel ID', value: channel.id, inline: true },
            { name: 'Type', value: channel.type.toString(), inline: true }
        );

    sendLog(channel.guild, 'channelDelete', embed);
});

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;

    const changes = [];
    if (oldChannel.name !== newChannel.name) changes.push(`Name: \`${oldChannel.name}\` → \`${newChannel.name}\``);
    if (oldChannel.topic !== newChannel.topic) changes.push(`Topic: \`${oldChannel.topic || 'None'}\` → \`${newChannel.topic || 'None'}\``);
    if (oldChannel.nsfw !== newChannel.nsfw) changes.push(`NSFW: \`${oldChannel.nsfw}\` → \`${newChannel.nsfw}\``);
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) changes.push(`Slowmode: \`${oldChannel.rateLimitPerUser}s\` → \`${newChannel.rateLimitPerUser}s\``);

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setTitle('📝 Channel Updated')
        .setColor(0xFFA500)
        .setTimestamp()
        .addFields(
            { name: 'Channel', value: `${newChannel.name} (${newChannel.id})`, inline: true },
            { name: 'Changes', value: changes.join('\n'), inline: false }
        );

    sendLog(newChannel.guild, 'channelUpdate', embed);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (!oldState.guild) return;

    if (!oldState.channelId && newState.channelId) {
        const embed = new EmbedBuilder()
            .setTitle('🎤 Voice Channel Joined')
            .setColor(0x00FF00)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newState.member.user.tag} (${newState.member.id})`, inline: true },
                { name: 'Channel', value: `${newState.channel.name} (${newState.channelId})`, inline: true }
            );

        sendLog(newState.guild, 'voiceJoin', embed);
    }
    else if (oldState.channelId && !newState.channelId) {
        const embed = new EmbedBuilder()
            .setTitle('🚪 Voice Channel Left')
            .setColor(0xFF0000)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${oldState.member.user.tag} (${oldState.member.id})`, inline: true },
                { name: 'Channel', value: `${oldState.channel.name} (${oldState.channelId})`, inline: true }
            );

        sendLog(oldState.guild, 'voiceLeave', embed);
    }
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
            .setTitle('🔄 Voice Channel Moved')
            .setColor(0xFFA500)
            .setTimestamp()
            .addFields(
                { name: 'User', value: `${newState.member.user.tag} (${newState.member.id})`, inline: true },
                { name: 'From', value: `${oldState.channel.name} (${oldState.channelId})`, inline: true },
                { name: 'To', value: `${newState.channel.name} (${newState.channelId})`, inline: true }
            );

        sendLog(newState.guild, 'voiceMove', embed);
    }
});

client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
    const changes = [];
    if (oldGuild.name !== newGuild.name) changes.push(`Name: \`${oldGuild.name}\` → \`${newGuild.name}\``);
    if (oldGuild.description !== newGuild.description) changes.push(`Description changed`);
    if (oldGuild.icon !== newGuild.icon) changes.push(`Icon changed`);
    if (oldGuild.banner !== newGuild.banner) changes.push(`Banner changed`);
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`Verification Level: \`${oldGuild.verificationLevel}\` → \`${newGuild.verificationLevel}\``);

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setTitle('⚙️ Server Updated')
        .setColor(0xFFA500)
        .setTimestamp()
        .addFields(
            { name: 'Server', value: newGuild.name, inline: true },
            { name: 'Changes', value: changes.join('\n'), inline: false }
        );

    sendLog(newGuild, 'serverUpdate', embed);
});

client.on(Events.GuildEmojiCreate, async (emoji) => {
    const embed = new EmbedBuilder()
        .setTitle('😀 Emoji Added')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Emoji', value: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`, inline: true },
            { name: 'Name', value: emoji.name, inline: true },
            { name: 'ID', value: emoji.id, inline: true }
        );

    sendLog(emoji.guild, 'emojiUpdate', embed);
});

client.on(Events.GuildEmojiDelete, async (emoji) => {
    const embed = new EmbedBuilder()
        .setTitle('🗑️ Emoji Removed')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Emoji Name', value: emoji.name, inline: true },
            { name: 'ID', value: emoji.id, inline: true }
        );

    sendLog(emoji.guild, 'emojiUpdate', embed);
});

client.on(Events.GuildStickerCreate, async (sticker) => {
    const embed = new EmbedBuilder()
        .setTitle('🏷️ Sticker Added')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Sticker', value: sticker.name, inline: true },
            { name: 'ID', value: sticker.id, inline: true },
            { name: 'Format', value: sticker.format?.toString() || 'Unknown', inline: true }
        );

    sendLog(sticker.guild, 'stickerUpdate', embed);
});

client.on(Events.GuildStickerDelete, async (sticker) => {
    const embed = new EmbedBuilder()
        .setTitle('🗑️ Sticker Removed')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Sticker Name', value: sticker.name, inline: true },
            { name: 'ID', value: sticker.id, inline: true }
        );

    sendLog(sticker.guild, 'stickerUpdate', embed);
});

client.on(Events.ThreadCreate, async (thread) => {
    const embed = new EmbedBuilder()
        .setTitle('🧵 Thread Created')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Thread', value: `${thread.name} (${thread.id})`, inline: true },
            { name: 'Parent Channel', value: thread.parent ? `${thread.parent.name} (${thread.parentId})` : 'Unknown', inline: true }
        );

    sendLog(thread.guild, 'threadCreate', embed);
});

client.on(Events.ThreadDelete, async (thread) => {
    const embed = new EmbedBuilder()
        .setTitle('🗑️ Thread Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Thread Name', value: thread.name || 'Unknown', inline: true },
            { name: 'Thread ID', value: thread.id, inline: true },
            { name: 'Parent Channel', value: thread.parentId ? `<#${thread.parentId}>` : 'Unknown', inline: true }
        );

    sendLog(thread.guild, 'threadDelete', embed);
});

client.on(Events.InviteCreate, async (invite) => {
    const embed = new EmbedBuilder()
        .setTitle('📨 Invite Created')
        .setColor(0x00FF00)
        .setTimestamp()
        .addFields(
            { name: 'Code', value: invite.code, inline: true },
            { name: 'Channel', value: invite.channel ? `${invite.channel.name} (${invite.channelId})` : 'Unknown', inline: true },
            { name: 'Max Uses', value: invite.maxUses?.toString() || 'Unlimited', inline: true },
            { name: 'Expires At', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:F>` : 'Never', inline: true }
        );

    if (invite.inviter) {
        embed.addFields({ name: 'Created By', value: `${invite.inviter.tag} (${invite.inviter.id})`, inline: true });
    }

    sendLog(invite.guild, 'inviteCreate', embed);
});

client.on(Events.InviteDelete, async (invite) => {
    const embed = new EmbedBuilder()
        .setTitle('🗑️ Invite Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Code', value: invite.code, inline: true },
            { name: 'Channel', value: invite.channel ? `${invite.channel.name} (${invite.channelId})` : 'Unknown', inline: true }
        );

    sendLog(invite.guild, 'inviteDelete', embed);
});

client.on(Events.GuildMemberBoost, async (member) => {
    const embed = new EmbedBuilder()
        .setTitle('💎 Server Boosted')
        .setColor(0xF47FFF)
        .setTimestamp()
        .addFields(
            { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: 'Boost Count', value: `${member.guild.premiumSubscriptionCount || 0}`, inline: true },
            { name: 'Boost Level', value: `${member.guild.premiumTier}`, inline: true }
        );

    sendLog(member.guild, 'boost', embed);
});

client.on(Events.MessageBulkDelete, async (messages) => {
    if (messages.size === 0) return;

    const embed = new EmbedBuilder()
        .setTitle('🗑️ Bulk Messages Deleted')
        .setColor(0xFF0000)
        .setTimestamp()
        .addFields(
            { name: 'Messages Deleted', value: `${messages.size}`, inline: true },
            { name: 'Channel', value: messages.first()?.channel ? `${messages.first().channel.name} (${messages.first().channelId})` : 'Unknown', inline: true }
        );

    sendLog(messages.first().guild, 'bulkDelete', embed);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    if (interaction.customId.startsWith('ticket_create')) {
        const category = interaction.customId.split('_')[2] || 'General';
        
        const config = global.ticketConfig?.get(interaction.guild.id);
        if (!config?.enabled) {
            return interaction.reply({ content: '❌ Ticket system tidak aktif.', ephemeral: true });
        }

        const blacklist = global.ticketBlacklist?.get(interaction.guild.id) || [];
        if (blacklist.find(b => b.userId === interaction.user.id)) {
            return interaction.reply({ content: '❌ Anda di-blacklist dari membuat ticket.', ephemeral: true });
        }

        const userTickets = [...(global.tickets?.values() || [])].filter(
            t => t.guildId === interaction.guild.id && t.userId === interaction.user.id && t.status === 'open'
        );

        const limit = config.ticketLimit || 1;
        if (userTickets.length >= limit) {
            return interaction.reply({ content: `❌ Anda sudah memiliki ${userTickets.length} ticket terbuka.`, ephemeral: true });
        }

        const count = global.ticketCount?.get(interaction.guild.id) || 0;
        const newCount = count + 1;
        global.ticketCount.set(interaction.guild.id, newCount);

        const channelName = `ticket-${newCount.toString().padStart(4, '0')}`;
        
        const categoryId = config.categoryId;
        const categoryChannel = categoryId ? interaction.guild.channels.cache.get(categoryId) : null;

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: 0,
            parent: categoryChannel || null,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ['ViewChannel'] },
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'] },
                { id: client.user.id, allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages'] }
            ]
        });

        if (config.supportRoleId) {
            await ticketChannel.permissionOverwrites.edit(config.supportRoleId, {
                ViewChannel: true, SendMessages: true, ReadMessageHistory: true, ManageMessages: true
            });
        }

        const ticketData = {
            id: ticketChannel.id, guildId: interaction.guild.id, userId: interaction.user.id,
            userName: interaction.user.tag, categoryId: category, number: newCount,
            status: 'open', priority: 'normal', createdAt: Date.now(),
            claimedBy: null, claimedAt: null, closedAt: null, closedBy: null
        };

        if (!global.tickets) global.tickets = new Map();
        global.tickets.set(ticketChannel.id, ticketData);

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket #${newCount.toString().padStart(4, '0')}`)
            .setDescription(`Selamat datang <@${interaction.user.id}>!\n\n**Kategori:** ${category}\n**Priority:** Normal`)
            .addFields(
                { name: '👤 Creator', value: `${interaction.user.tag}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true }
            )
            .setColor(0x00FF00).setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Tutup').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('✋'),
                new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Secondary).setEmoji('📝')
            );

        await ticketChannel.send({ 
            content: config.supportRoleId ? `<@&${config.supportRoleId}>` : '',
            embeds: [ticketEmbed], components: [row] 
        });

        return interaction.reply({ content: `✅ Ticket berhasil dibuat: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId.startsWith('feedback_')) {
        const rating = parseInt(interaction.customId.split('_')[1]);
        const ticket = global.tickets?.get(interaction.channel.id);

        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket tidak ditemukan.', ephemeral: true });
        }

        if (!global.ticketFeedback) global.ticketFeedback = new Map();

        global.ticketFeedback.set(interaction.channel.id, {
            ticketId: interaction.channel.id, ticketNumber: ticket.number,
            staffId: ticket.claimedBy, userId: interaction.user.id,
            rating: rating, timestamp: Date.now()
        });

        const stars = '⭐'.repeat(rating);
        const feedbackEmbed = new EmbedBuilder()
            .setTitle('✅ Feedback Received')
            .setDescription('Terima kasih atas feedback Anda!')
            .addFields(
                { name: 'Rating', value: `${stars} (${rating}/5)`, inline: true },
                { name: 'Staff', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'N/A', inline: true }
            )
            .setColor(0x00FF00).setTimestamp();

        return interaction.update({ embeds: [feedbackEmbed], components: [] });
    }

    if (interaction.customId === 'ticket_close') {
        const ticket = global.tickets?.get(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: '❌ Ticket tidak ditemukan.', ephemeral: true });

        ticket.status = 'closed';
        ticket.closedAt = Date.now();
        ticket.closedBy = interaction.user.id;
        global.tickets.set(interaction.channel.id, ticket);

        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`Ticket ditutup oleh <@${interaction.user.id}>`)
            .setColor(0xFF0000).setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Buka Kembali').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                new ButtonBuilder().setCustomId('ticket_delete').setLabel('Hapus').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
                new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setStyle(ButtonStyle.Secondary).setEmoji('📝')
            );

        await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false, SendMessages: false });
        return interaction.reply({ embeds: [closeEmbed], components: [row] });
    }

    if (interaction.customId === 'ticket_reopen') {
        const ticket = global.tickets?.get(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: '❌ Ticket tidak ditemukan.', ephemeral: true });

        ticket.status = 'open';
        global.tickets.set(interaction.channel.id, ticket);

        await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: true, SendMessages: true });
        
        const reopenEmbed = new EmbedBuilder()
            .setTitle('🔓 Ticket Reopened')
            .setDescription(`Ticket dibuka kembali oleh <@${interaction.user.id}>`)
            .setColor(0x00FF00).setTimestamp();

        return interaction.reply({ embeds: [reopenEmbed] });
    }

    if (interaction.customId === 'ticket_delete') {
        await interaction.reply('🗑️ Ticket akan dihapus dalam 5 detik...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
    }

    if (interaction.customId === 'ticket_claim') {
        const ticket = global.tickets?.get(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: '❌ Ticket tidak ditemukan.', ephemeral: true });

        if (ticket.claimedBy) {
            return interaction.reply({ content: `❌ Ticket sudah di-claim oleh <@${ticket.claimedBy}>.`, ephemeral: true });
        }

        ticket.claimedBy = interaction.user.id;
        ticket.claimedAt = Date.now();
        global.tickets.set(interaction.channel.id, ticket);

        const claimEmbed = new EmbedBuilder()
            .setTitle('✋ Ticket Claimed')
            .setDescription(`Ticket di-claim oleh <@${interaction.user.id}>`)
            .setColor(0xFFA500).setTimestamp();

        return interaction.reply({ embeds: [claimEmbed] });
    }

    if (interaction.customId === 'ticket_transcript') {
        return interaction.reply({ content: 'Gunakan `g!tickettranscript` untuk generate transcript.', ephemeral: true });
    }

if (interaction.customId === 'snippet_select') {
        const snippets = global.ticketSnippets?.get(interaction.guild.id) || [];
        const snippet = snippets.find(s => s.name === interaction.values[0]);

        if (!snippet) {
            return interaction.reply({ content: '❌ Snippet tidak ditemukan.', ephemeral: true });
        }

        const ticket = global.tickets?.get(interaction.channel.id);
        const user = ticket ? `<@${ticket.userId}>` : '';
        const response = snippet.response
            .replace(/{user}/gi, user)
            .replace(/{server}/gi, interaction.guild.name)
            .replace(/{staff}/gi, `<@${interaction.user.id}>`);

        return interaction.reply(response);
    }

    // ==================== GAMES INTERACTIONS ====================

    // Tic Tac Toe
    if (interaction.customId.startsWith('ttt_')) {
        const tttModule = client.commands.get('tictactoe');
        const games = tttModule?.games;
        if (!games) return interaction.reply({ content: '❌ No game found.', ephemeral: true });

        const gameState = games.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players[gameState.turn] !== interaction.user.id) {
            return interaction.reply({ content: '❌ Not your turn!', ephemeral: true });
        }

        const idx = parseInt(interaction.customId.split('_')[1]);
        if (gameState.board[idx]) {
            return interaction.reply({ content: '❌ Cell already taken!', ephemeral: true });
        }

        const symbols = ['❌', '⭕'];
        gameState.board[idx] = symbols[gameState.turn];

        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        let winner = null;
        for (const pattern of winPatterns) {
            if (gameState.board[pattern[0]] && 
                gameState.board[pattern[0]] === gameState.board[pattern[1]] && 
                gameState.board[pattern[1]] === gameState.board[pattern[2]]) {
                winner = gameState.players[gameState.turn];
                break;
            }
        }

        if (winner) {
            games.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            const winEmbed = new EmbedBuilder()
                .setTitle('🎉 Tic Tac Toe - Game Over!')
                .setDescription(`🏆 <@${winner}> wins!`)
                .setColor(0x00FF00);
            return interaction.update({ embeds: [winEmbed], components: [] });
        }

        if (!gameState.board.includes(null)) {
            games.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            const drawEmbed = new EmbedBuilder()
                .setTitle('🤝 Tic Tac Toe - Draw!')
                .setDescription('The game ended in a draw!')
                .setColor(0xFFFF00);
            return interaction.update({ embeds: [drawEmbed], components: [] });
        }

        gameState.turn = 1 - gameState.turn;

        const embed = new EmbedBuilder()
            .setTitle('🎮 Tic Tac Toe')
            .setDescription(`**<@${gameState.players[0]}>** (❌) vs **<@${gameState.players[1]}>** (⭕)`)
            .addFields({ name: 'Turn', value: `<@${gameState.players[gameState.turn]}> (${symbols[gameState.turn]})` })
            .setColor(0x5865F2);

        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const cellIdx = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ttt_${cellIdx}`)
                        .setLabel(gameState.board[cellIdx] || '⠀')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            rows.push(row);
        }

        return interaction.update({ embeds: [embed], components: rows });
    }

    // Connect Four
    if (interaction.customId.startsWith('cf_')) {
        const cfModule = client.commands.get('connectfour');
        const games = cfModule?.games;
        if (!games) return interaction.reply({ content: '❌ No game found.', ephemeral: true });

        const gameState = games.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players[gameState.turn] !== interaction.user.id) {
            return interaction.reply({ content: '❌ Not your turn!', ephemeral: true });
        }

        const col = parseInt(interaction.customId.split('_')[1]);

        for (let row = 5; row >= 0; row--) {
            if (!gameState.board[row][col]) {
                gameState.board[row][col] = gameState.turn;
                break;
            }
        }

        const win = cfModule.checkWin(gameState.board, gameState.turn);
        if (win) {
            games.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            const winEmbed = new EmbedBuilder()
                .setTitle('🎉 Connect Four - Game Over!')
                .setDescription(`🏆 <@${gameState.players[gameState.turn]}> wins!`)
                .setColor(0x00FF00);
            return interaction.update({ embeds: [winEmbed], components: [] });
        }

        gameState.turn = 1 - gameState.turn;
        return interaction.update(cfModule.buildBoard(gameState));
    }

    // Trivia
    if (interaction.customId.startsWith('trivia_')) {
        const triviaModule = client.commands.get('trivia');
        const triviaGames = triviaModule?.triviaGames;
        if (!triviaGames) return;

        const gameState = triviaGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        const answerIdx = parseInt(interaction.customId.split('_')[1]);
        const letters = ['A', 'B', 'C', 'D'];

        if (answerIdx === gameState.currentQuestion.answer) {
            const currentScore = gameState.players.get(interaction.user.id) || 0;
            gameState.players.set(interaction.user.id, currentScore + 10);

            const correctEmbed = new EmbedBuilder()
                .setTitle('✅ Correct!')
                .setDescription(`+10 points! You selected: ${letters[answerIdx]}. ${gameState.currentQuestion.options[answerIdx]}`)
                .setColor(0x00FF00);

            await interaction.reply({ embeds: [correctEmbed], ephemeral: true });
        } else {
            const wrongEmbed = new EmbedBuilder()
                .setTitle('❌ Wrong!')
                .setDescription(`The correct answer was: ${letters[gameState.currentQuestion.answer]}. ${gameState.currentQuestion.options[gameState.currentQuestion.answer]}`)
                .setColor(0xFF0000);

            await interaction.reply({ embeds: [wrongEmbed], ephemeral: true });
        }

        gameState.answered = true;
        if (gameState.timeout) clearTimeout(gameState.timeout);
        await interaction.message.edit({ components: [] });
        setTimeout(() => triviaModule.sendQuestion(interaction.message, gameState), 2000);
    }

    // Would You Rather
    if (interaction.customId.startsWith('wyr_')) {
        const wyrModule = client.commands.get('wouldyourather');
        const wyrGames = wyrModule?.wyrGames;
        if (!wyrGames) return;

        const gameState = wyrGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        const option = interaction.customId.split('_')[1];
        if (option === 'option1') {
            gameState.votes.option1++;
        } else if (option === 'option2') {
            gameState.votes.option2++;
        }

        await interaction.reply({ content: `✅ Vote recorded!`, ephemeral: true });
    }

    // Truth or Dare
    if (interaction.customId.startsWith('tod_')) {
        const todModule = client.commands.get('truthordare');
        const todGames = todModule?.todGames;
        if (!todGames) return;

        const gameState = todGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        const action = interaction.customId.split('_')[1];

        if (action === 'done') {
            await interaction.reply({ content: '✅ Challenge completed!', ephemeral: false });
        } else if (action === 'skip') {
            await interaction.reply({ content: '⏭️ Challenge skipped!', ephemeral: false });
        } else if (action === 'new') {
            todGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            await todModule.execute(interaction.message, ['random'], client);
            return;
        }

        todGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);
        await interaction.message.edit({ components: [] });
    }

    // Duel
    if (interaction.customId === 'duel_accept') {
        const duelModule = client.commands.get('duel');
        const duelGames = duelModule?.duelGames;
        if (!duelGames) return;

        const gameState = duelGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (interaction.user.id !== gameState.players[1].id) {
            return interaction.reply({ content: '❌ Only the challenged player can accept!', ephemeral: true });
        }

        if (gameState.timeout) clearTimeout(gameState.timeout);
        gameState.started = true;
        await duelModule.startDuel(interaction, gameState);
        return;
    }

    if (interaction.customId === 'duel_decline') {
        const duelModule = client.commands.get('duel');
        const duelGames = duelModule?.duelGames;
        if (duelGames) duelGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);

        await interaction.update({ content: '🚫 Duel declined.', embeds: [], components: [] });
        return;
    }

    if (interaction.customId.startsWith('duel_') && !['duel_accept', 'duel_decline'].includes(interaction.customId)) {
        const duelModule = client.commands.get('duel');
        const duelGames = duelModule?.duelGames;
        if (!duelGames) return;

        const gameState = duelGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players[gameState.currentTurn].id !== interaction.user.id) {
            return interaction.reply({ content: '❌ Not your turn!', ephemeral: true });
        }

        const attackKey = interaction.customId.replace('duel_', '');
        const result = duelModule.executeAttack(gameState, attackKey);

        const winner = duelModule.checkWinner(gameState);
        if (winner) {
            duelGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            const winEmbed = new EmbedBuilder()
                .setTitle('⚔️ Duel Over!')
                .setDescription(`🏆 <@${winner.id}> wins the duel!\n\n${result.message}`)
                .setColor(0x00FF00);
            return interaction.update({ embeds: [winEmbed], components: [] });
        }

        duelModule.nextTurn(gameState);

        const turnEmbed = new EmbedBuilder()
            .setTitle('⚔️ Duel')
            .setDescription(`**Round ${gameState.round}**\n\n${result.message}`)
            .addFields(
                { name: `👤 ${gameState.players[0].name}`, value: `❤️ ${gameState.players[0].hp}/${gameState.players[0].maxHp}`, inline: true },
                { name: `👤 ${gameState.players[1].name}`, value: `❤️ ${gameState.players[1].hp}/${gameState.players[1].maxHp}`, inline: true }
            )
            .setFooter({ text: `${gameState.players[gameState.currentTurn].name}'s turn` })
            .setColor(0xE74C3C);

        const row = new ActionRowBuilder();
        Object.entries(duelModule.ATTACKS).forEach(([key, attack]) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`duel_${key}`)
                    .setLabel(`${attack.emoji} ${attack.name}`)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        return interaction.update({ embeds: [turnEmbed], components: [row] });
    }

    // Russian Roulette
    if (interaction.customId === 'rr_join') {
        const rrModule = client.commands.get('russianroulette');
        const rouletteGames = rrModule?.rouletteGames;
        if (!rouletteGames) return;

        const gameState = rouletteGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.find(p => p.id === interaction.user.id)) {
            return interaction.reply({ content: '❌ You already joined!', ephemeral: true });
        }

        gameState.players.push({ id: interaction.user.id, name: interaction.user.username });

        const playersList = gameState.players.map(p => `<@${p.id}>`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('🔫 Russian Roulette')
            .setDescription(`**Chamber Size:** ${gameState.maxRounds} rounds\n**Current Players:** ${gameState.players.length}\n\nClick Join to participate!`)
            .setColor(0x2C2C2C)
            .addFields({ name: '💀 Players', value: playersList });

        return interaction.update({ embeds: [embed] });
    }

    if (interaction.customId === 'rr_start') {
        const rrModule = client.commands.get('russianroulette');
        const rouletteGames = rrModule?.rouletteGames;
        if (!rouletteGames) return;

        const gameState = rouletteGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.length < 2) {
            return interaction.reply({ content: '❌ Need at least 2 players!', ephemeral: true });
        }

        gameState.status = 'playing';
        gameState.chamber = Math.floor(Math.random() * gameState.maxRounds) + 1;

        const startEmbed = new EmbedBuilder()
            .setTitle('🔫 Russian Roulette Started!')
            .setDescription(`**Players:** ${gameState.players.length}\n**Rounds:** ${gameState.maxRounds}\n\nStarting with <@${gameState.players[0].id}>...`)
            .setColor(0xFF0000);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rr_pull')
                    .setLabel('Pull Trigger')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔫')
            );

        return interaction.update({ embeds: [startEmbed], components: [row] });
    }

    if (interaction.customId === 'rr_pull') {
        const rrModule = client.commands.get('russianroulette');
        await rrModule.pullTrigger(interaction, rrModule.rouletteGames.get(`${interaction.guild.id}-${interaction.channel.id}`));
    }

    // Akinator
    if (interaction.customId.startsWith('akinator_')) {
        const akinatorModule = client.commands.get('akinator');
        const akinatorGames = akinatorModule?.akinatorGames;
        if (!akinatorGames) return;

        const gameState = akinatorGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        const answer = interaction.customId.replace('akinator_', '');

        if (answer === 'correct') {
            akinatorGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);
            const winEmbed = new EmbedBuilder()
                .setTitle('🧞 I Win!')
                .setDescription('I knew I could guess it! Thanks for playing!')
                .setColor(0x00FF00);
            return interaction.update({ embeds: [winEmbed], components: [] });
        }

        if (answer === 'wrong') {
            gameState.possibleCharacters.shift();
            if (gameState.possibleCharacters.length === 0) {
                akinatorGames.delete(`${interaction.guild.id}-${interaction.channel.id}`);
                const failEmbed = new EmbedBuilder()
                    .setTitle('🧞 I Give Up!')
                    .setDescription('I couldn\'t guess your character. You win!')
                    .setColor(0xFF0000);
                return interaction.update({ embeds: [failEmbed], components: [] });
            }
            return akinatorModule.makeGuess(interaction, gameState);
        }

        akinatorModule.processAnswer(gameState, answer);

        if (gameState.questionIndex < akinatorModule.QUESTIONS.length) {
            await akinatorModule.askQuestion(interaction, gameState);
        } else {
            await akinatorModule.makeGuess(interaction, gameState);
        }
    }

    // Mafia
    if (interaction.customId === 'mafia_join') {
        const mafiaModule = client.commands.get('mafia');
        const mafiaGames = mafiaModule?.mafiaGames;
        if (!mafiaGames) return;

        const gameState = mafiaGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.find(p => p.id === interaction.user.id)) {
            return interaction.reply({ content: '❌ You already joined!', ephemeral: true });
        }

        gameState.players.push({ id: interaction.user.id, name: interaction.user.username });

        const playersList = gameState.players.map(p => `<@${p.id}>`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('🔪 Mafia Game')
            .setDescription(`**Players:** ${gameState.players.length}\n\nClick Join to participate!`)
            .setColor(0x2C2C2C)
            .addFields({ name: 'Players', value: playersList || 'None' });

        return interaction.update({ embeds: [embed] });
    }

    if (interaction.customId === 'mafia_start') {
        const mafiaModule = client.commands.get('mafia');
        const mafiaGames = mafiaModule?.mafiaGames;
        if (!mafiaGames) return;

        const gameState = mafiaGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.length < 5) {
            return interaction.reply({ content: '❌ Need at least 5 players!', ephemeral: true });
        }

        mafiaModule.assignRoles(gameState.players);
        await mafiaModule.sendNightPhase(interaction, gameState);
    }

    if (interaction.customId.startsWith('mafia_action_')) {
        const mafiaModule = client.commands.get('mafia');
        const mafiaGames = mafiaModule?.mafiaGames;
        if (!mafiaGames) return;

        const gameState = mafiaGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        const targetId = interaction.customId.replace('mafia_action_', '');
        const player = gameState.players.find(p => p.id === interaction.user.id);

        if (!player || !player.alive) return;

        if (player.role === 'mafia') {
            gameState.mafiaTarget = targetId;
        } else if (player.role === 'doctor') {
            gameState.doctorTarget = targetId;
        } else if (player.role === 'detective') {
            const target = gameState.players.find(p => p.id === targetId);
            if (target) {
                const isMafia = target.role === 'mafia';
                await interaction.reply({ content: `🔍 Investigation Result: ${target.name} is ${isMafia ? '**Mafia**' : '**Not Mafia**'}`, ephemeral: true });
            }
        }

        await interaction.reply({ content: '✅ Action recorded!', ephemeral: true });
    }

    // UNO
    if (interaction.customId.startsWith('uno_join_')) {
        const unoModule = client.commands.get('uno');
        const unoGames = unoModule?.unoGames;
        if (!unoGames) return;

        const gameState = unoGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.find(p => p.id === interaction.user.id)) {
            return interaction.reply({ content: '❌ You already joined!', ephemeral: true });
        }

        const maxPlayers = parseInt(interaction.customId.split('_')[2]) || 4;
        if (gameState.players.length >= maxPlayers) {
            return interaction.reply({ content: '❌ Game is full!', ephemeral: true });
        }

        gameState.players.push({ id: interaction.user.id, name: interaction.user.username });

        const playersList = gameState.players.map(p => `<@${p.id}>`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('🃏 UNO Game')
            .setDescription(`**Players:** ${gameState.players.length}/${maxPlayers}\n\nClick Join to participate!`)
            .setColor(0x5865F2)
            .addFields({ name: 'Players', value: playersList });

        return interaction.update({ embeds: [embed] });
    }

    if (interaction.customId === 'uno_start') {
        const unoModule = client.commands.get('uno');
        const unoGames = unoModule?.unoGames;
        if (!unoGames) return;

        const gameState = unoGames.get(`${interaction.guild.id}-${interaction.channel.id}`);
        if (!gameState) return interaction.reply({ content: '❌ Game not found.', ephemeral: true });

        if (gameState.players.length < 2) {
            return interaction.reply({ content: '❌ Need at least 2 players!', ephemeral: true });
        }

        await unoModule.startGame(interaction, gameState);
    }

    if (interaction.customId === 'uno_draw') {
        await interaction.reply({ content: '🎴 Drawing a card...', ephemeral: true });
    }

    if (interaction.customId === 'uno_hand') {
        await interaction.reply({ content: '🃏 Check your DMs for your hand!', ephemeral: true });
    }

    // RPG Adventure
    if (interaction.customId === 'rpg_class') {
        const rpgModule = client.commands.get('rpgadventure');
        if (!rpgModule) return;

        const classType = interaction.values[0];
        const character = await rpgModule.createCharacter(interaction.user.id, classType, interaction.user.username);

        const classData = rpgModule.CLASSES[classType];
        const embed = new EmbedBuilder()
            .setTitle(`${classData.emoji} ${classData.name} Created!`)
            .setDescription(`Welcome, ${character.name}!\n\n**Stats:**\n❤️ HP: ${character.hp}/${character.maxHp}\n⚔️ Attack: ${character.attack}\n🛡️ Defense: ${character.defense}\n💰 Gold: ${character.gold}\n\nUse \`g!rpgbattle\` to start fighting!`)
            .setColor(0x5865F2);

        return interaction.reply({ embeds: [embed] });
    }
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const GLOBAL_COLOR = 0x8bb6cf;
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isDev = message.member.roles.cache.has(devRoleId);
    const isOwner = message.author.id === ownerId;

    if (commandName === 'help') {
        const mainEmbed = new EmbedBuilder()
            .setTitle('📚 Help Center')
            .setDescription(`Welcome to **${client.user.username}** Help Center!\n\nPrefix: \`${prefix}\`\nTotal Commands: **${client.commands.size}**\n\nSelect a category below to view commands.\n\n**Legend:**\n🟢 Public - All users\n🟡 Admin - Administrator only\n🔴 Owner - Bot owner only`)
            .setColor(GLOBAL_COLOR)
            .setFooter({ text: `Use ${prefix}help <command> for details` })
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('help_economy').setLabel('💰 Economy').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('help_fun').setLabel('🎉 Fun').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('help_games').setLabel('🎮 Games').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('help_leveling').setLabel('📊 Leveling').setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('help_ticket').setLabel('🎫 Ticket').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('help_welcome').setLabel('👋 Welcome').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('help_moderation').setLabel('🛡️ Moderation').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('help_logging').setLabel('📝 Logging').setStyle(ButtonStyle.Secondary)
            );

        return message.reply({ embeds: [mainEmbed], components: [row1, row2] });
    }

    const command = client.commands.get(commandName);
    if (!command) {
        if (global.levelingConfig?.get(message.guild.id)?.enabled) {
            const xpMessageHandler = require('./Leveling XP/XP_Message_Handler.js');
            await xpMessageHandler.execute(message, client);
        }
        return;
    }

    // Check permissions based on command type
    const modCommands = ['ban', 'kick', 'timeout', 'warn', 'mute', 'unmute', 'unban', 'purge', 'slowmode', 'lock', 'unlock', 'clear', 'nuke', 'role', 'unrole', 'setnick', 'deafen', 'undeafen', 'move', 'disconnect'];
    const adminCommands = ['setwelcome', 'setfarewell', 'setlogchannel', 'ticketsetup', 'ticketpanel', 'ticketclose', 'ticketclaim', 'setleveling', 'seteconomy', 'addrole', 'removerole', 'createrole', 'deleterole', 'setautorole'];
    const ownerCommands = ['eval', 'reload', 'shutdown', 'setstatus', 'setname', 'setavatar'];

    const isModCommand = modCommands.some(cmd => commandName.includes(cmd));
    const isAdminCommand = adminCommands.some(cmd => commandName.includes(cmd)) || commandName.includes('setup') || commandName.includes('config') || commandName.includes('set');
    const isOwnerCommand = ownerCommands.includes(commandName) || commandName.includes('owner');

    if (isOwnerCommand && !isOwner) {
        return message.reply('🔴 **Owner Only** - This command can only be used by the bot owner.');
    }

    if ((isModCommand || isAdminCommand) && !isAdmin && !isDev && !isOwner) {
        return message.reply('🟡 **Admin Required** - This command requires Administrator permission or Developer role.');
    }

    try {
        await command.execute(message, args, client);
    } catch (err) {
        console.error(`Command Error (${commandName}):`, err);
        message.reply('❌ Gagal mengeksekusi perintah. Silakan hubungi pengembang.');
    }

    const config = global.levelingConfig?.get(message.guild.id);
    if (config?.enabled && commandName !== 'help') {
        const xpMessageHandler = require('./Leveling XP/XP_Message_Handler.js');
        await xpMessageHandler.execute(message, client);
    }
});

// Help button interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('help_')) return;

    const GLOBAL_COLOR = 0x8bb6cf;
    const prefix = process.env.PREFIX || 'd!';
    const category = interaction.customId.replace('help_', '');

    const categories = {
        economy: {
            name: '💰 Economy',
            color: 0xF1C40F,
            access: '🟢 Public',
            commands: [
                '`balance`, `bal` - Check your balance',
                '`daily` - Claim daily reward',
                '`hourly` - Claim hourly reward',
                '`weekly` - Claim weekly reward',
                '`work` - Work for money',
                '`beg` - Beg for money',
                '`crime` - Commit crime (risky)',
                '`rob @user` - Rob another user',
                '`deposit <amount>` - Deposit to bank',
                '`withdraw <amount>` - Withdraw from bank',
                '`transfer @user <amount>` - Transfer money',
                '`shop` - View the shop',
                '`buy <item>` - Buy an item',
                '`sell <item>` - Sell an item',
                '`inventory` - View your inventory',
                '`useitem <item>` - Use an item',
                '`leaderboard`, `rich` - View richest users',
                '`auction` - Auction system',
                '`lottery` - Lottery system',
                '`slots` - Slot machine',
                '`blackjack` - Blackjack game',
                '`coinflip` - Flip a coin for money',
                '`roulette` - Roulette game',
                '`fish` - Go fishing',
                '`hunt` - Go hunting',
                '`mine` - Go mining',
                '`farm` - Farm system',
                '`pet` - Pet system',
                '`achievement` - View achievements',
                '`trade @user` - Trade with user',
                '`profile` - View your economy profile'
            ]
        },
        fun: {
            name: '🎉 Fun & Entertainment',
            color: 0xE91E63,
            access: '🟢 Public',
            commands: [
                '`8ball <question>` - Magic 8 Ball',
                '`joke` - Random joke',
                '`dadjoke` - Dad joke',
                '`randomfact` - Random fun fact',
                '`randomquote` - Random quote',
                '`fortunecookie` - Fortune cookie',
                '`horoscope <sign>` - Daily horoscope',
                '`ship @user1 @user2` - Ship calculator',
                '`rate <thing>` - Rate anything',
                '`roast [@user]` - Random roast',
                '`compliment [@user]` - Random compliment',
                '`pickupline [@user]` - Pickup line',
                '`dare` - Random dare',
                '`choose <opt1|opt2>` - Choose between options',
                '`randomnumber <min> <max>` - Random number',
                '`reversetext <text>` - Reverse text',
                '`mocktext <text>` - SpOnGeBoB text',
                '`claptext <text>` - Clap 👏 text',
                '`vaporwavetext <text>` - Aesthetic text',
                '`owoify <text>` - OwO text',
                '`hug @user` - Hug someone',
                '`kiss @user` - Kiss someone',
                '`slap @user` - Slap someone',
                '`pat @user` - Pat someone',
                '`poke @user` - Poke someone',
                '`cuddle @user` - Cuddle someone',
                '`cry` - Cry GIF',
                '`dance` - Dance GIF',
                '`wink [@user]` - Wink',
                '`ppsize [@user]` - PP size joke',
                '`iqtest [@user]` - IQ test joke',
                '`howgay [@user]` - How gay %',
                '`howsus [@user]` - How sus %',
                '`randommeme` - Random meme',
                '`dogfact` - Dog fact',
                '`catfact` - Cat fact',
                '`randomdog` - Random dog image',
                '`randomcat` - Random cat image',
                '`randomfox` - Random fox image'
            ]
        },
        games: {
            name: '🎮 Games',
            color: 0x9B59B6,
            access: '🟢 Public',
            commands: [
                '`tictactoe @user` - Tic Tac Toe',
                '`connectfour @user` - Connect Four',
                '`rockpaperscissors @user` - RPS game',
                '`hangman` - Hangman game',
                '`wordle` - Wordle game',
                '`minesweeper` - Minesweeper',
                '`snake` - Snake game',
                '`2048` - 2048 game',
                '`memorymatch` - Memory game',
                '`numberguess` - Number guessing',
                '`wordscramble` - Word scramble',
                '`mathchallenge` - Math challenge',
                '`speedtype` - Speed typing',
                '`trivia` - Trivia game',
                '`triviaapi` - API trivia',
                '`wouldyourather` - Would you rather',
                '`truthordare` - Truth or dare',
                '`uno` - UNO card game',
                '`chess @user` - Chess game',
                '`checkers @user` - Checkers',
                '`diceroll <dice>` - Roll dice',
                '`coinflip [heads/tails]` - Flip coin',
                '`emojiguess` - Emoji guessing',
                '`flagquiz` - Flag quiz',
                '`countryquiz` - Country quiz',
                '`whosaidit` - Quote guessing',
                '`counting` - Counting game',
                '`duel @user` - Duel battle',
                '`russianroulette` - Russian roulette',
                '`rpgadventure` - RPG adventure',
                '`akinator` - Akinator',
                '`mafia` - Mafia game'
            ]
        },
        leveling: {
            name: '📊 Leveling XP',
            color: 0x3498DB,
            access: '🟢 Public',
            commands: [
                '`rank [@user]` - Check rank',
                '`level [@user]` - Check level',
                '`xp [@user]` - Check XP',
                '`leaderboard` - Server leaderboard',
                '`weeklylb` - Weekly leaderboard',
                '`monthlylb` - Monthly leaderboard',
                '`prestige` - Prestige system',
                '`streak` - Check streak',
                '`rewards` - XP role rewards',
                '`setleveling` 🟡 - Setup leveling',
                '`setxpmultiplier` 🟡 - Set XP multiplier',
                '`addrolereward` 🟡 - Add role reward',
                '`removerolereward` 🟡 - Remove role reward',
                '`setvoicexp` 🟡 - Set voice XP',
                '`toggleleveling` 🟡 - Toggle system'
            ]
        },
        ticket: {
            name: '🎫 Ticket System',
            color: 0x00FF00,
            access: '🟡 Admin Setup / 🟢 Public Use',
            commands: [
                '`ticketsetup` 🟡 - Setup ticket system',
                '`ticketpanel` 🟡 - Create ticket panel',
                '`ticketclose` - Close ticket',
                '`ticketclaim` - Claim ticket',
                '`ticketreopen` - Reopen ticket',
                '`tickettranscript` - Get transcript',
                '`ticketblacklist @user` 🟡 - Blacklist user',
                '`ticketunblacklist @user` 🟡 - Unblacklist',
                '`ticketsnippet` 🟡 - Manage snippets',
                '`ticketfeedback` - Request feedback',
                '`ticketsettings` 🟡 - Ticket settings'
            ]
        },
        welcome: {
            name: '👋 Welcome & Farewell',
            color: 0x2ECC71,
            access: '🟡 Admin Only',
            commands: [
                '`setwelcome` - Setup welcome message',
                '`setfarewell` - Setup farewell message',
                '`testwelcome` - Test welcome message',
                '`testfarewell` - Test farewell message',
                '`setwelcomemessage` - Set welcome text',
                '`setfarewellmessage` - Set farewell text',
                '`setautorole` - Set auto role',
                '`membercount` - Setup member count',
                '`rejoinconfig` - Setup rejoin logging',
                '`welcomeembed` - Toggle embed',
                '`togglewelcome` - Toggle welcome',
                '`togglefarewell` - Toggle farewell'
            ]
        },
        moderation: {
            name: '🛡️ Moderation',
            color: 0xE74C3C,
            access: '🟡 Admin & Developer',
            commands: [
                '`ban @user [reason]` - Ban user',
                '`unban <userid>` - Unban user',
                '`kick @user [reason]` - Kick user',
                '`timeout @user <time>` - Timeout user',
                '`untimeout @user` - Remove timeout',
                '`mute @user [reason]` - Mute user',
                '`unmute @user` - Unmute user',
                '`warn @user [reason]` - Warn user',
                '`warnings @user` - Check warnings',
                '`clearwarnings @user` - Clear warnings',
                '`purge <amount>` - Delete messages',
                '`clear <amount>` - Clear messages',
                '`nuke` - Nuke channel',
                '`slowmode <seconds>` - Set slowmode',
                '`lock` - Lock channel',
                '`unlock` - Unlock channel',
                '`role @user <role>` - Add role',
                '`unrole @user <role>` - Remove role',
                '`setnick @user <nick>` - Set nickname',
                '`deafen @user` - Deafen user',
                '`undeafen @user` - Undeafen user',
                '`move @user <channel>` - Move user',
                '`disconnect @user` - Disconnect from voice'
            ]
        },
        logging: {
            name: '📝 Logging',
            color: 0x95A5A6,
            access: '🟡 Admin Setup',
            commands: [
                '`setlogchannel` - Setup log channel',
                '`togglelog <type>` - Toggle log type',
                '`logconfig` - View log config',
                '`logtest` - Test logging',
                '`messagelog` - Toggle message logs',
                '`memberlog` - Toggle member logs',
                '`rolelog` - Toggle role logs',
                '`channellog` - Toggle channel logs',
                '`voicelog` - Toggle voice logs',
                '`banlog` - Toggle ban logs'
            ]
        }
    };

    const cat = categories[category];
    if (!cat) return;

    const embed = new EmbedBuilder()
        .setTitle(cat.name)
        .setDescription(`**Access:** ${cat.access}\n**Prefix:** \`${prefix}\`\n\n**Commands:**`)
        .setColor(cat.color)
        .addFields({
            name: 'Commands List',
            value: cat.commands.join('\n').substring(0, 1024)
        })
        .setFooter({ text: `${client.commands.size} total commands | Use ${prefix}help for main menu` })
        .setTimestamp();

    const backRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('help_back').setLabel('🔙 Back').setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ embeds: [embed], components: [backRow], ephemeral: true });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'help_back') return;

    const GLOBAL_COLOR = 0x8bb6cf;
    const prefix = process.env.PREFIX || 'd!';

    const mainEmbed = new EmbedBuilder()
        .setTitle('📚 Help Center')
        .setDescription(`Welcome to **${client.user.username}** Help Center!\n\nPrefix: \`${prefix}\`\nTotal Commands: **${client.commands.size}**\n\nSelect a category below to view commands.\n\n**Legend:**\n🟢 Public - All users\n🟡 Admin - Administrator only\n🔴 Owner - Bot owner only`)
        .setColor(GLOBAL_COLOR)
        .setFooter({ text: `Use ${prefix}help <command> for details` })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('help_economy').setLabel('💰 Economy').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('help_fun').setLabel('🎉 Fun').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('help_games').setLabel('🎮 Games').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('help_leveling').setLabel('📊 Leveling').setStyle(ButtonStyle.Primary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('help_ticket').setLabel('🎫 Ticket').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('help_welcome').setLabel('👋 Welcome').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('help_moderation').setLabel('🛡️ Moderation').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('help_logging').setLabel('📝 Logging').setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({ embeds: [mainEmbed], components: [row1, row2], ephemeral: true });
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

client.login(process.env.TOKEN);
