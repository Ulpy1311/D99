const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const games = new Map();

async function getAIComment(prompt) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '🎮 Game on!';
    } catch (err) {
        return '🎮 Game on!';
    }
}

module.exports = {
    name: 'tictactoe',
    description: 'Tic Tac Toe game (X vs O)',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();
        
        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention user yang valid untuk bermain.');
        }

        if (games.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ Ada game yang sedang berlangsung di channel ini.');
        }

        const gameState = {
            players: [message.author.id, opponent.id],
            board: Array(9).fill(null),
            turn: 0,
            startedAt: Date.now()
        };

        games.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const symbols = ['❌', '⭕'];
        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a Tic Tac Toe game between two players. Be enthusiastic.`);

        const embed = new EmbedBuilder()
            .setTitle('🎮 Tic Tac Toe')
            .setDescription(`${aiComment}\n\n**${message.author}** (❌) vs **${opponent}** (⭕)`)
            .addFields({ name: 'Turn', value: `<@${gameState.players[gameState.turn]}> (${symbols[gameState.turn]})` })
            .setColor(0x5865F2)
            .setTimestamp();

        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const idx = i * 3 + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ttt_${idx}`)
                        .setLabel(gameState.board[idx] || '⠀')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            rows.push(row);
        }

        const msg = await message.reply({ embeds: [embed], components: rows });
        gameState.messageId = msg.id;
    }
};

module.exports.games = games;
module.exports.getAIComment = getAIComment;
