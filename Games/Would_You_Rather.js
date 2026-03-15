const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const wyrGames = new Map();

const wyrQuestions = [
    { option1: "Have the ability to fly", option2: "Be invisible at will", difficulty: "Easy" },
    { option1: "Always be 10 minutes late", option2: "Always be 20 minutes early", difficulty: "Easy" },
    { option1: "Have unlimited money", option2: "Have unlimited time", difficulty: "Medium" },
    { option1: "Know all languages", option2: "Play all instruments", difficulty: "Medium" },
    { option1: "Live without music", option2: "Live without movies", difficulty: "Easy" },
    { option1: "Be able to talk to animals", option2: "Be able to read minds", difficulty: "Medium" },
    { option1: "Have a pause button for life", option2: "Have a rewind button for life", difficulty: "Hard" },
    { option1: "Always have to say everything on your mind", option2: "Never be able to speak again", difficulty: "Hard" },
    { option1: "Be famous but unhappy", option2: "Be unknown but happy", difficulty: "Easy" },
    { option1: "Have no internet", option2: "Have no friends", difficulty: "Hard" },
    { option1: "Fight 100 duck-sized horses", option2: "Fight 1 horse-sized duck", difficulty: "Medium" },
    { option1: "Have the power to heal", option2: "Have the power to destroy", difficulty: "Medium" },
    { option1: "Live in the past", option2: "Live in the future", difficulty: "Medium" },
    { option1: "Be always cold", option2: "Be always hot", difficulty: "Easy" },
    { option1: "Never sleep again", option2: "Never eat again", difficulty: "Hard" },
    { option1: "Have telepathy", option2: "Have telekinesis", difficulty: "Medium" },
    { option1: "Be the smartest person", option2: "Be the funniest person", difficulty: "Medium" },
    { option1: "Lose all your memories", option2: "Lose all your money", difficulty: "Hard" },
    { option1: "Be feared by everyone", option2: "Be loved by everyone", difficulty: "Easy" },
    { option1: "Travel anywhere instantly", option2: "Time travel once", difficulty: "Hard" }
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
        return data.choices?.[0]?.message?.content || '🤔 Make your choice!';
    } catch (err) {
        return '🤔 Make your choice!';
    }
}

module.exports = {
    name: 'wouldyourather',
    description: 'Play Would You Rather game',
    async execute(message, args, client) {
        const rounds = parseInt(args[0]) || 5;
        const maxRounds = Math.min(Math.max(rounds, 1), 20);

        if (wyrGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a Would You Rather game running in this channel.');
        }

        const gameState = {
            votes: { option1: 0, option2: 0 },
            voters: new Map(),
            currentRound: 0,
            maxRounds: maxRounds,
            currentQuestion: null,
            answered: false,
            timeout: null,
            startedAt: Date.now()
        };

        wyrGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a Would You Rather game with ${maxRounds} rounds. Be playful and curious.`);

        const startEmbed = new EmbedBuilder()
            .setTitle('🤔 Would You Rather')
            .setDescription(`${aiComment}\n\n**Rounds:** ${maxRounds}\n\nVote for your choice!`)
            .setColor(0x5865F2)
            .setTimestamp();

        await message.reply({ embeds: [startEmbed] });

        await sendWYRQuestion(message, gameState);
    }
};

async function sendWYRQuestion(message, gameState) {
    if (gameState.currentRound >= gameState.maxRounds) {
        return endWYRGame(message, gameState);
    }

    const questionData = wyrQuestions[Math.floor(Math.random() * wyrQuestions.length)];
    gameState.currentQuestion = questionData;
    gameState.answered = false;
    gameState.currentRound++;
    gameState.votes = { option1: 0, option2: 0 };
    gameState.voters = new Map();

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) about this Would You Rather choice: "${questionData.option1}" vs "${questionData.option2}". Be curious and engaging.`);

    const questionEmbed = new EmbedBuilder()
        .setTitle(`🤔 Round ${gameState.currentRound}/${gameState.maxRounds}`)
        .setDescription(`${aiComment}\n\n**Would you rather...**`)
        .addFields(
            { name: '🔵 Option 1', value: questionData.option1, inline: true },
            { name: '🔴 Option 2', value: questionData.option2, inline: true }
        )
        .setColor(0xFFD700)
        .setFooter({ text: `Difficulty: ${questionData.difficulty} | You have 30 seconds!` });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('wyr_option1')
                .setLabel('Option 1')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔵'),
            new ButtonBuilder()
                .setCustomId('wyr_option2')
                .setLabel('Option 2')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴')
        );

    const msg = await message.channel.send({ embeds: [questionEmbed], components: [row] });

    gameState.timeout = setTimeout(() => {
        if (!gameState.answered) {
            gameState.answered = true;
            const resultEmbed = new EmbedBuilder()
                .setTitle('📊 Results!')
                .setDescription(`**${questionData.option1}**\n🔵 ${gameState.votes.option1} votes (${Math.round(gameState.votes.option1 / Math.max(1, gameState.votes.option1 + gameState.votes.option2) * 100)}%)\n\n**${questionData.option2}**\n🔴 ${gameState.votes.option2} votes (${Math.round(gameState.votes.option2 / Math.max(1, gameState.votes.option1 + gameState.votes.option2) * 100)}%)`)
                .setColor(0x5865F2);
            msg.edit({ embeds: [resultEmbed], components: [] }).catch(() => {});
            setTimeout(() => sendWYRQuestion(message, gameState), 3000);
        }
    }, 30000);
}

function endWYRGame(message, gameState) {
    wyrGames.delete(`${message.guild.id}-${message.channel.id}`);

    const endEmbed = new EmbedBuilder()
        .setTitle('🎉 Would You Rather Complete!')
        .setDescription('Thanks for playing!')
        .setColor(0x5865F2);

    message.channel.send({ embeds: [endEmbed] });
}

module.exports.wyrGames = wyrGames;
module.exports.sendWYRQuestion = sendWYRQuestion;
module.exports.endWYRGame = endWYRGame;
module.exports.getAIComment = getAIComment;
