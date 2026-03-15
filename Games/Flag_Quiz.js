const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const flagQuizGames = new Map();

const flags = [
    { country: 'United States', code: 'US', hint: 'Stars and stripes' },
    { country: 'United Kingdom', code: 'GB', hint: 'Union Jack' },
    { country: 'France', code: 'FR', hint: 'Blue, white, red vertical stripes' },
    { country: 'Germany', code: 'DE', hint: 'Black, red, gold horizontal stripes' },
    { country: 'Japan', code: 'JP', hint: 'Red circle on white' },
    { country: 'Canada', code: 'CA', hint: 'Red maple leaf' },
    { country: 'Brazil', code: 'BR', hint: 'Green, yellow, blue globe' },
    { country: 'Australia', code: 'AU', hint: 'Southern cross stars' },
    { country: 'China', code: 'CN', hint: 'Red with yellow stars' },
    { country: 'Italy', code: 'IT', hint: 'Green, white, red vertical stripes' },
    { country: 'Spain', code: 'ES', hint: 'Red and yellow with coat of arms' },
    { country: 'Mexico', code: 'MX', hint: 'Green, white, red with eagle' },
    { country: 'South Korea', code: 'KR', hint: 'White with red and blue circle' },
    { country: 'India', code: 'IN', hint: 'Orange, white, green with wheel' },
    { country: 'Russia', code: 'RU', hint: 'White, blue, red horizontal stripes' },
    { country: 'South Africa', code: 'ZA', hint: 'Rainbow nation' },
    { country: 'Argentina', code: 'AR', hint: 'Light blue and white with sun' },
    { country: 'Sweden', code: 'SE', hint: 'Yellow cross on blue' },
    { country: 'Switzerland', code: 'CH', hint: 'Red with white cross' },
    { country: 'Greece', code: 'GR', hint: 'Blue and white stripes' }
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
        return data.choices?.[0]?.message?.content || '🏳️ Flag Quiz!';
    } catch (err) {
        return '🏳️ Flag Quiz!';
    }
}

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

module.exports = {
    name: 'flagquiz',
    description: 'Guess the country from its flag',
    async execute(message, args, client) {
        const rounds = parseInt(args[0]) || 10;
        const maxRounds = Math.min(Math.max(rounds, 1), 20);

        if (flagQuizGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a flag quiz running in this channel.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentFlag: null,
            answered: false,
            timeout: null,
            usedFlags: [],
            startedAt: Date.now()
        };

        flagQuizGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a flag quiz with ${maxRounds} rounds. Be educational.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('🏳️ Flag Quiz!')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n\nType the country name to answer!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendFlagQuestion(message, gameState);
    }
};

async function sendFlagQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endFlagGame(message, gameState);
    }

    const availableFlags = flags.filter((_, idx) => !gameState.usedFlags.includes(idx));
    if (availableFlags.length === 0) {
        gameState.usedFlags = [];
    }

    const flagIndex = flags.findIndex((f, idx) => !gameState.usedFlags.includes(idx));
    gameState.usedFlags.push(flagIndex);
    const flag = flags[flagIndex];
    gameState.currentFlag = flag;
    gameState.answered = false;
    gameState.currentRound++;

    const flagEmoji = getFlagEmoji(flag.code);

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for a flag quiz. Country hint: "${flag.hint}". Be encouraging.`);

    const questionEmbed = new EmbedBuilder()
        .setTitle(`🏳️ Round ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`${aiComment}\n\n**What country does this flag belong to?**\n\n${flagEmoji}\n\n💡 Hint: ${flag.hint}`)
        .setColor(0x5865F2)
        .setFooter({ text: 'You have 30 seconds to guess!' });

    const msg = await message.channel.send({ embeds: [questionEmbed] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The flag was: **${flag.country}** ${getFlagEmoji(flag.code)}`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed] }).catch(() => {});
            setTimeout(() => sendFlagQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endFlagGame(message, gameState) {
    flagQuizGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 Flag Quiz Results!')
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

module.exports.flagQuizGames = flagQuizGames;
module.exports.sendFlagQuestion = sendFlagQuestion;
module.exports.endFlagGame = endFlagGame;
module.exports.getAIComment = getAIComment;
module.exports.flags = flags;
module.exports.getFlagEmoji = getFlagEmoji;
