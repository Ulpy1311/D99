const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const triviaAPIGames = new Map();

const categories = {
    'general': 9,
    'books': 10,
    'film': 11,
    'music': 12,
    'musicals': 13,
    'television': 14,
    'videogames': 15,
    'boardgames': 16,
    'science': 17,
    'computers': 18,
    'mathematics': 19,
    'mythology': 20,
    'sports': 21,
    'geography': 22,
    'history': 23,
    'politics': 24,
    'art': 25,
    'celebrities': 26,
    'animals': 27,
    'vehicles': 28
};

const difficulties = ['easy', 'medium', 'hard'];

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
        return data.choices?.[0]?.message?.content || '🌐 API Trivia Challenge!';
    } catch (err) {
        return '🌐 API Trivia Challenge!';
    }
}

async function fetchTriviaQuestions(amount, category, difficulty) {
    let url = `https://opentdb.com/api.php?amount=${amount}`;
    if (category && categories[category]) {
        url += `&category=${categories[category]}`;
    }
    if (difficulty && difficulties.includes(difficulty)) {
        url += `&difficulty=${difficulty}`;
    }
    url += '&type=multiple';

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    } catch (err) {
        return [];
    }
}

function decodeHtmlEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&ldquo;': '"',
        '&rdquo;': '"',
        '&nbsp;': ' ',
        '&eacute;': 'é',
        '&egrave;': 'è',
        '&uuml;': 'ü',
        '&ouml;': 'ö'
    };
    return text.replace(/&[^;]+;/g, match => entities[match] || match);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = {
    name: 'triviaapi',
    description: 'Play trivia using Open Trivia DB API',
    async execute(message, args, client) {
        const category = args[0]?.toLowerCase() || null;
        const difficulty = args[1]?.toLowerCase() || 'medium';
        const rounds = parseInt(args[2]) || 5;
        const maxRounds = Math.min(Math.max(rounds, 1), 10);

        if (category && !categories[category] && category !== 'random') {
            return message.reply(`❌ Invalid category. Available: ${Object.keys(categories).join(', ')}, random`);
        }

        if (triviaAPIGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a trivia game running in this channel.');
        }

        const questions = await fetchTriviaQuestions(maxRounds, category, difficulty);
        if (questions.length === 0) {
            return message.reply('❌ Failed to fetch trivia questions. Try again later.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: questions.length,
            questions: questions,
            currentQuestion: null,
            answered: false,
            timeout: null,
            startedAt: Date.now()
        };

        triviaAPIGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting an API trivia game with ${questions.length} questions from ${category || 'random'} category. Be enthusiastic.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('🌐 API Trivia Challenge!')
            .setDescription(`${aiComment}\n\n**Rounds:** ${questions.length}\n**Category:** ${category || 'Random'}\n**Difficulty:** ${difficulty}\n\nClick the buttons to answer!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendAPIQuestion(message, gameState);
    }
};

async function sendAPIQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.questions.length) {
        return endAPIGame(message, gameState);
    }

    const questionData = gameState.questions[gameState.currentRound];
    const decodedQuestion = decodeHtmlEntities(questionData.question);
    const decodedCorrect = decodeHtmlEntities(questionData.correct_answer);
    const decodedIncorrect = questionData.incorrect_answers.map(a => decodeHtmlEntities(a));

    const allOptions = shuffleArray([decodedCorrect, ...decodedIncorrect]);
    const correctIndex = allOptions.indexOf(decodedCorrect);

    gameState.currentQuestion = {
        question: decodedQuestion,
        options: allOptions,
        answer: correctIndex,
        category: questionData.category,
        difficulty: questionData.difficulty
    };
    gameState.answered = false;
    gameState.currentRound++;

    const questionEmbed = new EmbedBuilder()
        .setTitle(`❓ Question ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`**Category:** ${decodeHtmlEntities(questionData.category)}\n**Difficulty:** ${questionData.difficulty}\n\n**${decodedQuestion}**`)
        .setColor(questionData.difficulty === 'easy' ? 0x00FF00 : questionData.difficulty === 'medium' ? 0xFFD700 : 0xFF0000)
        .setFooter({ text: 'You have 30 seconds to answer!' });

    const row = new ActionRowBuilder();
    const letters = ['A', 'B', 'C', 'D'];
    gameState.currentQuestion.options.forEach((opt, idx) => {
        const label = opt.length > 80 ? opt.substring(0, 77) + '...' : opt;
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`triviaapi_${idx}`)
                .setLabel(`${letters[idx]}. ${label}`)
                .setStyle(ButtonStyle.Primary)
        );
    });

    const msg = await message.channel.send({ embeds: [questionEmbed], components: [row] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The correct answer was: **${letters[correctIndex]}. ${decodedCorrect}**`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed], components: [] }).catch(() => {});
            setTimeout(() => sendAPIQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endAPIGame(message, gameState) {
    triviaAPIGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 API Trivia Results!')
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

module.exports.triviaAPIGames = triviaAPIGames;
module.exports.sendAPIQuestion = sendAPIQuestion;
module.exports.endAPIGame = endAPIGame;
module.exports.getAIComment = getAIComment;
module.exports.categories = categories;
