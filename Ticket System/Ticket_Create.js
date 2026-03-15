const { EmbedBuilder, PermissionOverwrites, ChannelType } = require('discord.js');

module.exports = {
    name: 'ticketcreate',
    description: 'Logic untuk membuat ticket baru',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.ticketConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Ticket system belum diaktifkan.');
        }

        const user = message.mentions.users.first() || message.author;
        const category = args.slice(1).join(' ') || 'General';

        if (!global.tickets) global.tickets = new Map();
        
        const userTickets = [...global.tickets.values()].filter(
            t => t.guildId === message.guild.id && t.userId === user.id && t.status === 'open'
        );

        const limit = config.ticketLimit || 1;
        if (userTickets.length >= limit) {
            return message.reply(`❌ User sudah memiliki ${userTickets.length} ticket terbuka. Maximum: ${limit}`);
        }

        if (!global.ticketCount) global.ticketCount = new Map();
        const count = global.ticketCount.get(message.guild.id) || 0;
        const newCount = count + 1;
        global.ticketCount.set(message.guild.id, newCount);

        const channelName = `ticket-${newCount.toString().padStart(4, '0')}`;
        
        const categoryId = config.categoryId;
        const categoryChannel = categoryId ? message.guild.channels.cache.get(categoryId) : null;

        const ticketChannel = await message.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: categoryChannel || null,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['ViewChannel']
                },
                {
                    id: user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
                },
                {
                    id: client.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages']
                }
            ]
        });

        if (config.supportRoleId) {
            await ticketChannel.permissionOverwrites.edit(config.supportRoleId, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                ManageMessages: true
            });
        }

        const ticketData = {
            id: ticketChannel.id,
            guildId: message.guild.id,
            userId: user.id,
            userName: user.tag,
            categoryId: category,
            number: newCount,
            status: 'open',
            priority: 'normal',
            createdAt: Date.now(),
            claimedBy: null,
            claimedAt: null,
            closedAt: null,
            closedBy: null,
            messages: []
        };

        global.tickets.set(ticketChannel.id, ticketData);

        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket #${newCount.toString().padStart(4, '0')}`)
            .setDescription(`Selamat datang <@${user.id}>!\n\nStaff akan segera merespons ticket Anda.\n\n**Kategori:** ${category}\n**Priority:** Normal`)
            .addFields(
                { name: '👤 Ticket Creator', value: `${user.tag}\n<@${user.id}>`, inline: true },
                { name: '📅 Dibuat', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: '📋 Status', value: '🟢 Open', inline: true }
            )
            .setColor(0x00FF00)
            .setFooter({ text: 'Gunakan command untuk mengelola ticket' })
            .setTimestamp();

        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Tutup Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📝')
            );

        await ticketChannel.send({ 
            content: config.supportRoleId ? `<@&${config.supportRoleId}>` : '',
            embeds: [ticketEmbed], 
            components: [row] 
        });

        message.reply(`✅ Ticket berhasil dibuat: ${ticketChannel}`);
    }
};
