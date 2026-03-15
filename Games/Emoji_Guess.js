const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const emojiGuessGames = new Map();

const emojiRiddles = [
    { emoji: '🌙👨‍🚀', answer: 'Interstellar', hint: 'Space movie' },
    { emoji: '🧙‍♂️💍', answer: 'Lord of the Rings', hint: 'Fantasy trilogy' },
    { emoji: '🦁👑', answer: 'Lion King', hint: 'Disney classic' },
    { emoji: '🚢❄️💔', answer: 'Titanic', hint: 'Ship disaster' },
    { emoji: '🕷️👨', answer: 'Spider-Man', hint: 'Superhero' },
    { emoji: '🧛‍♂️💗', answer: 'Twilight', hint: 'Vampire romance' },
    { emoji: '🧟‍♂️🔫', answer: 'Walking Dead', hint: 'Zombie series' },
    { emoji: '🏰👸🏻🤴🏻', answer: 'Cinderella', hint: 'Fairy tale' },
    { emoji: '🦖🦕', answer: 'Jurassic Park', hint: 'Dinosaurs' },
    { emoji: '👻🔫', answer: 'Ghostbusters', hint: 'Paranormal comedy' },
    { emoji: '🤖❤️🌱', answer: 'Wall-E', hint: 'Robot love story' },
    { emoji: '🧊🚢', answer: 'Frozen', hint: 'Disney movie' },
    { emoji: '🦇🃏', answer: 'Batman', hint: 'Dark knight' },
    { emoji: '⚡🔨', answer: 'Thor', hint: 'Norse god' },
    { emoji: '🍎💤', answer: 'Snow White', hint: 'Princess story' },
    { emoji: '🌊🧜‍♀️', answer: 'Little Mermaid', hint: 'Under the sea' },
    { emoji: '🌍🐒', answer: 'Planet of the Apes', hint: 'Apes rule' },
    { emoji: '🎭🗺️', answer: 'Mission Impossible', hint: 'Spy action' },
    { emoji: '🧙‍♀️👠', answer: 'Wizard of Oz', hint: 'Yellow brick road' },
    { emoji: '🧛‍♂️🧛‍♀️', answer: 'Dracula', hint: 'Classic vampire' }
];

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
        return data.choices?.[0]?.message?.content || '🎭 Guess the emoji!';
    } catch (err) {
        return '🎭 Guess the emoji!';
    }
}

module.exports = {
    name: 'emojiguess',
    description: 'Guess what the emoji represents',
    async execute(message, args, client) {
        const rounds = parseInt(args[0]) || 5;
        const maxRounds = Math.min(Math.max(rounds, 1), 10);

        if (emojiGuessGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already an emoji guess game running in this channel.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentRiddle: null,
            answered: false,
            timeout: null,
            usedRiddles: [],
            startedAt: Date.now()
        };

        emojiGuessGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting an emoji guessing game with ${maxRounds} rounds. Be encouraging.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('🎭 Emoji Guessing Game!')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n\nType your answer to guess!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendEmojiRiddle(message, gameState);
    }
};

async function sendEmojiRiddle(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endEmojiGame(message, gameState);
    }

    const availableRiddles = emojiRiddles.filter((_, idx) => !gameState.usedRiddles.includes(idx));
    if (availableRiddles.length === 0) {
        gameState.usedRiddles = [];
    }

    const riddleIndex = emojiRiddles.findIndex((r, idx) => !gameState.usedRiddles.includes(idx));
    gameState.usedRiddles.push(riddleIndex);
    const riddle = emojiRiddles[riddleIndex];
    gameState.currentRiddle = riddle;
    gameState.answered = false;
    gameState.currentRound++;

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for an emoji riddle: "${riddle.emoji}". Be mysterious and playful.`);

    const riddleEmbed = new EmbedBuilder()
        .setTitle(`🎭 Round ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`${aiComment}\n\n**What does this represent?**\n\n${riddle.emoji}\n\n💡 Hint: ${riddle.hint}`)
        .setColor(0xFFD700)
        .setFooter({ text: 'You have 30 seconds to guess!' });

    const msg = await message.channel.send({ embeds: [riddleEmbed] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The answer was: **${riddle.answer}**\n\n${riddle.emoji}`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed] }).catch(() => {});
            setTimeout(() => sendEmojiRiddle(message, gameState), 3000);
        }
    }, 30000);
}

function endEmojiGame(message, gameState) {
    emojiGuessGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 Emoji Guess Results!')
        .setColor(0x5865F2);

    if (sortedPlayers.length === 0) {
        resultsEmbed.setDescription('No one participated!');
    } else {
        let desc = '';
        sortedPlayers.forEach(([userId, score], idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅';
            desc += `${medal} <@${userId}> - ${score} points\n`;
        });
        resultsEmbed.setDescription(desc);
    }

    message.channel.send({ embeds: [resultsEmbed] });
}

module.exports.emojiGuessGames = emojiGuessGames;
module.exports.sendEmojiRiddle = sendEmojiRiddle;
module.exports.endEmojiGame = endEmojiGame;
module.exports.getAIComment = getAIComment;
module.exports.emojiRiddles = emojiRiddles;
