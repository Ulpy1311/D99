const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const hangmanGames = new Map();

const words = [
    'JAVASCRIPT', 'DISCORD', 'PYTHON', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM',
    'DATABASE', 'NETWORK', 'SECURITY', 'DEVELOPER', 'INTERFACE', 'FUNCTION',
    'VARIABLE', 'CONSTANT', 'ARRAY', 'OBJECT', 'MODULE', 'PACKAGE'
];

async function getAIHint(word, guessed) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ 
                    role: 'user', 
                    content: `Give a cryptic but helpful hint for the word "${word}" in hangman game. Max 15 words. Don't reveal the word.` 
                }],
                max_tokens: 50
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '💡 Think programming!';
    } catch (err) {
        return '💡 Think programming!';
    }
}

module.exports = {
    name: 'hangman',
    description: 'Hangman game - tebak kata',
    async execute(message, args, client) {
        const word = words[Math.floor(Math.random() * words.length)];
        
        const gameState = {
            word: word,
            guessed: new Set(),
            wrongGuesses: 0,
            maxWrong: 6,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        const key = `${message.guild.id}-${message.author.id}`;
        hangmanGames.set(key, gameState);

        const display = word.split('').map(l => gameState.guessed.has(l) ? l : '⬜').join(' ');
        const aiHint = await getAIHint(word, gameState.guessed);

        const embed = new EmbedBuilder()
            .setTitle('🎯 Hangman')
            .setDescription(`${display}\n\n${aiHint}`)
            .addFields(
                { name: '❌ Wrong', value: `${gameState.wrongGuesses}/${gameState.maxWrong}`, inline: true },
                { name: '📝 Guessed', value: gameState.guessed.size > 0 ? [...gameState.guessed].join(', ') : 'None', inline: true }
            )
            .setColor(0x5865F2)
            .setFooter({ text: 'Ketik huruf untuk menebak!' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.hangmanGames = hangmanGames;
module.exports.words = words;
