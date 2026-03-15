const { EmbedBuilder } = require('discord.js');

const whoSaidItGames = new Map();

const quotes = [
    { quote: "To be or not to be, that is the question.", author: "William Shakespeare", hint: "Famous playwright" },
    { quote: "I have a dream.", author: "Martin Luther King Jr.", hint: "Civil rights leader" },
    { quote: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt", hint: "US President" },
    { quote: "In the beginning the Universe was created. This has made a lot of people very angry.", author: "Douglas Adams", hint: "Sci-fi author" },
    { quote: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", hint: "Indian leader" },
    { quote: "Imagination is more important than knowledge.", author: "Albert Einstein", hint: "Scientist" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", hint: "Tech visionary" },
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon", hint: "Musician" },
    { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", hint: "Ancient philosopher" },
    { quote: "Whatever you are, be a good one.", author: "Abraham Lincoln", hint: "US President" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", hint: "Ancient wisdom" },
    { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", hint: "Greek philosopher" },
    { quote: "Success is not final, failure is not fatal.", author: "Winston Churchill", hint: "British PM" },
    { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", hint: "Hockey legend" },
    { quote: "The mind is everything. What you think you become.", author: "Buddha", hint: "Spiritual leader" },
    { quote: "Stay hungry, stay foolish.", author: "Steve Jobs", hint: "Tech visionary" },
    { quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", hint: "Anti-apartheid leader" },
    { quote: "Two things are infinite: the universe and human stupidity.", author: "Albert Einstein", hint: "Scientist" },
    { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", hint: "Irish writer" },
    { quote: "So many books, so little time.", author: "Frank Zappa", hint: "Musician" }
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
        return data.choices?.[0]?.message?.content || '💬 Who said it?';
    } catch (err) {
        return '💬 Who said it?';
    }
}

module.exports = {
    name: 'whosaidit',
    description: 'Guess who said the famous quote',
    async execute(message, args, client) {
        const rounds = parseInt(args[0]) || 10;
        const maxRounds = Math.min(Math.max(rounds, 1), 20);

        if (whoSaidItGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a "Who Said It" game running in this channel.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentQuote: null,
            answered: false,
            timeout: null,
            usedQuotes: [],
            startedAt: Date.now()
        };

        whoSaidItGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a "Who Said It" quote guessing game with ${maxRounds} rounds. Be thoughtful.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('💬 Who Said It?')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n\nType the author's name to guess!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendQuoteQuestion(message, gameState);
    }
};

async function sendQuoteQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endWhoSaidItGame(message, gameState);
    }

    const availableQuotes = quotes.filter((_, idx) => !gameState.usedQuotes.includes(idx));
    if (availableQuotes.length === 0) {
        gameState.usedQuotes = [];
    }

    const quoteIndex = quotes.findIndex((q, idx) => !gameState.usedQuotes.includes(idx));
    gameState.usedQuotes.push(quoteIndex);
    const quote = quotes[quoteIndex];
    gameState.currentQuote = quote;
    gameState.answered = false;
    gameState.currentRound++;

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for a quote guessing game. The quote is: "${quote.quote.substring(0, 50)}...". Be mysterious.`);

    const questionEmbed = new EmbedBuilder()
        .setTitle(`💬 Round ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`${aiComment}\n\n**" ${quote.quote} "**\n\n💡 Hint: ${quote.hint}`)
        .setColor(0x9B59B6)
        .setFooter({ text: 'You have 30 seconds to guess!' });

    const msg = await message.channel.send({ embeds: [questionEmbed] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The quote was said by: **${quote.author}**\n\n*"${quote.quote}"*`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed] }).catch(() => {});
            setTimeout(() => sendQuoteQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endWhoSaidItGame(message, gameState) {
    whoSaidItGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 Who Said It Results!')
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

module.exports.whoSaidItGames = whoSaidItGames;
module.exports.sendQuoteQuestion = sendQuoteQuestion;
module.exports.endWhoSaidItGame = endWhoSaidItGame;
module.exports.getAIComment = getAIComment;
module.exports.quotes = quotes;
