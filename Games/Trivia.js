const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const triviaGames = new Map();

const triviaQuestions = [
    { question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], answer: 0, category: "Geography" },
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: 1, category: "Math" },
    { question: "What is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: 2, category: "Science" },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2, category: "Art" },
    { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, category: "History" },
    { question: "What is the chemical symbol for water?", options: ["WA", "H2O", "CO2", "O2"], answer: 1, category: "Science" },
    { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, category: "Geography" },
    { question: "Who wrote Romeo and Juliet?", options: ["Dickens", "Shakespeare", "Austen", "Twain"], answer: 1, category: "Literature" },
    { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], answer: 0, category: "Science" },
    { question: "What country has the most population?", options: ["India", "USA", "China", "Indonesia"], answer: 2, category: "Geography" },
    { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: 2, category: "Math" },
    { question: "Who discovered gravity?", options: ["Einstein", "Newton", "Galileo", "Copernicus"], answer: 1, category: "Science" },
    { question: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], answer: 2, category: "Geography" },
    { question: "Who wrote '1984'?", options: ["Huxley", "Orwell", "Bradbury", "Asimov"], answer: 1, category: "Literature" },
    { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2, category: "Science" }
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
        return data.choices?.[0]?.message?.content || '🧠 Test your knowledge!';
    } catch (err) {
        return '🧠 Test your knowledge!';
    }
}

module.exports = {
    name: 'trivia',
    description: 'Play trivia quiz game',
    async execute(message, args, client) {
        const difficulty = args[0]?.toLowerCase() || 'normal';
        const rounds = parseInt(args[1]) || 5;
        const maxRounds = Math.min(Math.max(rounds, 1), 10);

        if (triviaGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a trivia game running in this channel.');
        }

        const gameState = {
            players: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentQuestion: null,
            answered: false,
            timeout: null,
            startedAt: Date.now()
        };

        triviaGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a trivia game with ${maxRounds} rounds. Be encouraging.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('🧠 Trivia Game Started!')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n**Category:** Random\n\nClick the buttons to answer!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendQuestion(message, gameState);
    }
};

async function sendQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endGame(message, gameState);
    }

    const questionData = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    gameState.currentQuestion = questionData;
    gameState.answered = false;
    gameState.currentRound++;

    const questionEmbed = new EmbedBuilder()
        .setTitle(`❓ Question ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`**Category:** ${questionData.category}\n\n**${questionData.question}**`)
        .setColor(0xFFD700)
        .setFooter({ text: 'You have 30 seconds to answer!' });

    const row = new ActionRowBuilder();
    const letters = ['A', 'B', 'C', 'D'];
    questionData.options.forEach((opt, idx) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`trivia_${idx}`)
                .setLabel(`${letters[idx]}. ${opt}`)
                .setStyle(ButtonStyle.Primary)
        );
    });

    const msg = await message.channel.send({ embeds: [questionEmbed], components: [row] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const answerEmbed = new EmbedBuilder()
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The correct answer was: **${letters[questionData.answer]}. ${questionData.options[questionData.answer]}**`)
                .setColor(0xFF0000);
            msg.edit({ embeds: [answerEmbed], components: [] }).catch(() => {});
            setTimeout(() => sendQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endGame(message, gameState) {
    triviaGames.delete(`${message.guild.id}-${message.channel.id}`);

    const sortedPlayers = [...gameState.players.entries()].sort((a, b) => b[1] - a[1]);
    const resultsEmbed = new EmbedBuilder()
        .setTitle('🏆 Trivia Game Results!')
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

module.exports.triviaGames = triviaGames;
module.exports.sendQuestion = sendQuestion;
module.exports.endGame = endGame;
module.exports.getAIComment = getAIComment;
