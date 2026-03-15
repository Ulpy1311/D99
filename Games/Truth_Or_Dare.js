const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const todGames = new Map();

const truths = [
    "What is your biggest fear?",
    "What is the most embarrassing thing you've ever done?",
    "What is your biggest secret?",
    "What is the worst lie you've ever told?",
    "What is your biggest regret?",
    "What is the strangest dream you've ever had?",
    "What is your guilty pleasure?",
    "Who do you have a crush on?",
    "What is the most childish thing you still do?",
    "What is the worst gift you've ever received?",
    "What is the most trouble you've ever been in?",
    "What is the most embarrassing thing your parents have caught you doing?",
    "What is the biggest misconception people have about you?",
    "What is something you've never told anyone?",
    "What is your most irrational fear?",
    "What is the worst thing you've ever eaten?",
    "What is the most embarrassing thing in your browser history?",
    "What is the meanest thing you've ever said to someone?",
    "What is the most useless talent you have?",
    "What is something you pretend to hate but secretly love?"
];

const dares = [
    "Do 10 jumping jacks",
    "Sing the chorus of your favorite song",
    "Speak in an accent for the next 5 minutes",
    "Do your best celebrity impression",
    "Say the alphabet backwards",
    "Do a silly dance",
    "Make an animal noise",
    "Send the last emoji you used to the first person in your DMs",
    "Do your best evil laugh",
    "Say 'I am a beautiful butterfly' in a serious tone",
    "Act like a chicken for 30 seconds",
    "Talk without closing your mouth",
    "Do 5 push-ups",
    "Make a funny face and hold it for 30 seconds",
    "Speak in rhymes for 2 minutes",
    "Pretend to be a robot",
    "Do your best impression of a famous person",
    "Say everything backwards for 1 minute",
    "Act like a zombie for 30 seconds",
    "Do your best air guitar solo"
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
        return data.choices?.[0]?.message?.content || '🎭 Truth or Dare!';
    } catch (err) {
        return '🎭 Truth or Dare!';
    }
}

module.exports = {
    name: 'truthordare',
    description: 'Play Truth or Dare game',
    async execute(message, args, client) {
        const type = args[0]?.toLowerCase();

        if (type !== 'truth' && type !== 'dare' && type !== 'random') {
            return message.reply('❌ Usage: `g!truthordare <truth|dare|random>`');
        }

        if (todGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a Truth or Dare game running in this channel.');
        }

        const gameState = {
            currentPlayer: message.author.id,
            type: type,
            completed: [],
            startedAt: Date.now()
        };

        todGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        await sendTODQuestion(message, gameState);
    }
};

async function sendTODQuestion(message, gameState) {
    let question;
    let typeLabel;
    let color;

    if (gameState.type === 'truth') {
        const available = truths.filter((_, idx) => !gameState.completed.includes(`t_${idx}`));
        if (available.length === 0) {
            gameState.completed = [];
        }
        const idx = Math.floor(Math.random() * truths.length);
        question = truths[idx];
        typeLabel = '🤔 Truth';
        color = 0x3498DB;
        gameState.completed.push(`t_${idx}`);
    } else if (gameState.type === 'dare') {
        const available = dares.filter((_, idx) => !gameState.completed.includes(`d_${idx}`));
        if (available.length === 0) {
            gameState.completed = [];
        }
        const idx = Math.floor(Math.random() * dares.length);
        question = dares[idx];
        typeLabel = '🔥 Dare';
        color = 0xE74C3C;
        gameState.completed.push(`d_${idx}`);
    } else {
        const isTruth = Math.random() > 0.5;
        if (isTruth) {
            const idx = Math.floor(Math.random() * truths.length);
            question = truths[idx];
            typeLabel = '🤔 Truth';
            color = 0x3498DB;
            gameState.completed.push(`t_${idx}`);
        } else {
            const idx = Math.floor(Math.random() * dares.length);
            question = dares[idx];
            typeLabel = '🔥 Dare';
            color = 0xE74C3C;
            gameState.completed.push(`d_${idx}`);
        }
    }

    const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for a Truth or Dare game. The question/dare is: "${question}". Be encouraging and playful.`);

    const questionEmbed = new EmbedBuilder()
        .setTitle(`${typeLabel}`)
        .setDescription(`${aiComment}\n\n**Your ${gameState.type === 'random' ? 'challenge' : gameState.type}:**\n\n${question}`)
        .setColor(color)
        .setFooter({ text: `Requested by <@${gameState.currentPlayer}>` })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tod_done')
                .setLabel('Done!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('tod_skip')
                .setLabel('Skip')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⏭️'),
            new ButtonBuilder()
                .setCustomId('tod_new')
                .setLabel('New Question')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄')
        );

    const msg = await message.channel.send({ embeds: [questionEmbed], components: [row] });

    const timeout = setTimeout(() => {
        todGames.delete(`${message.guild.id}-${message.channel.id}`);
        msg.edit({ components: [] }).catch(() => {});
    }, 120000);

    gameState.messageId = msg.id;
    gameState.timeout = timeout;
}

module.exports.todGames = todGames;
module.exports.sendTODQuestion = sendTODQuestion;
module.exports.truths = truths;
module.exports.dares = dares;
module.exports.getAIComment = getAIComment;
