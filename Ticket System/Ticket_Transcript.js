const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tickettranscript',
    description: 'Generate transcript ticket (HTML)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const messages = await message.channel.messages.fetch({ limit: 100 });
        const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Transcript - #${ticket.number.toString().padStart(4, '0')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item { }
        .info-item span { opacity: 0.7; font-size: 12px; }
        .info-item strong { display: block; font-size: 16px; margin-top: 5px; }
        .message {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .message-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .message-avatar { width: 40px; height: 40px; border-radius: 50%; }
        .message-author { font-weight: bold; }
        .message-timestamp { opacity: 0.6; font-size: 12px; }
        .message-content { word-wrap: break-word; }
        .message-attachment { margin-top: 10px; }
        .message-attachment img { max-width: 100%; border-radius: 10px; }
        .footer { text-align: center; margin-top: 30px; opacity: 0.6; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Ticket Transcript</h1>
            <p>Ticket #${ticket.number.toString().padStart(4, '0')}</p>
        </div>
        <div class="info">
            <div class="info-item">
                <span>Ticket Creator</span>
                <strong>${ticket.userName}</strong>
            </div>
            <div class="info-item">
                <span>User ID</span>
                <strong>${ticket.userId}</strong>
            </div>
            <div class="info-item">
                <span>Created At</span>
                <strong>${new Date(ticket.createdAt).toLocaleString('id-ID')}</strong>
            </div>
            <div class="info-item">
                <span>Status</span>
                <strong>${ticket.status.toUpperCase()}</strong>
            </div>
            ${ticket.claimedBy ? `
            <div class="info-item">
                <span>Claimed By</span>
                <strong>${client.users.cache.get(ticket.claimedBy)?.tag || 'Unknown'}</strong>
            </div>
            ` : ''}
        </div>
        <div class="messages">
`;

        sortedMessages.forEach(msg => {
            const avatar = msg.author.displayAvatarURL({ extension: 'png', size: 64 }) || '';
            htmlContent += `
            <div class="message">
                <div class="message-header">
                    <img class="message-avatar" src="${avatar}" alt="Avatar">
                    <div>
                        <div class="message-author">${msg.author.tag}</div>
                        <div class="message-timestamp">${msg.createdAt.toLocaleString('id-ID')}</div>
                    </div>
                </div>
                <div class="message-content">${msg.content ? msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') : '<em>No content</em>'}</div>
                ${msg.attachments.size > 0 ? `
                <div class="message-attachment">
                    ${msg.attachments.map(a => `<a href="${a.url}" target="_blank">${a.name}</a>`).join('<br>')}
                </div>
                ` : ''}
            </div>
`;
        });

        htmlContent += `
        </div>
        <div class="footer">
            Generated by ${client.user.tag} | ${new Date().toLocaleString('id-ID')}
        </div>
    </div>
</body>
</html>`;

        const fs = require('fs');
        const path = require('path');
        const transcriptPath = path.join(__dirname, '..', `transcript-${ticket.number}.html`);
        
        fs.writeFileSync(transcriptPath, htmlContent);

        const transcriptEmbed = new EmbedBuilder()
            .setTitle('📝 Transcript Generated')
            .setDescription('Transcript telah berhasil dibuat.')
            .addFields(
                { name: 'Ticket #', value: ticket.number.toString(), inline: true },
                { name: 'Messages', value: sortedMessages.size.toString(), inline: true },
                { name: 'Format', value: 'HTML', inline: true }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({
            embeds: [transcriptEmbed],
            files: [{
                attachment: transcriptPath,
                name: `transcript-ticket-${ticket.number}.html`
            }]
        });

        setTimeout(() => {
            try {
                fs.unlinkSync(transcriptPath);
            } catch (err) {
                console.error('Error deleting transcript file:', err);
            }
        }, 30000);
    }
};
