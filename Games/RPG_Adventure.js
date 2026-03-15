const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const rpgAdventures = new Map();

const CLASSES = {
    warrior: { name: 'Warrior', hp: 120, attack: 25, defense: 15, emoji: '⚔️', skills: ['Slash', 'Shield Bash', 'Rage'] },
    mage: { name: 'Mage', hp: 80, attack: 35, defense: 8, emoji: '🔮', skills: ['Fireball', 'Ice Spike', 'Lightning'] },
    rogue: { name: 'Rogue', hp: 90, attack: 30, defense: 10, emoji: '🗡️', skills: ['Backstab', 'Poison', 'Stealth'] },
    healer: { name: 'Healer', hp: 100, attack: 15, defense: 12, emoji: '💚', skills: ['Heal', 'Holy Light', 'Blessing'] }
};

const MONSTERS = [
    { name: 'Slime', hp: 30, attack: 8, gold: 10, exp: 15, emoji: '🟢' },
    { name: 'Goblin', hp: 50, attack: 15, gold: 25, exp: 30, emoji: '👺' },
    { name: 'Wolf', hp: 45, attack: 18, gold: 20, exp: 25, emoji: '🐺' },
    { name: 'Skeleton', hp: 60, attack: 20, gold: 35, exp: 40, emoji: '💀' },
    { name: 'Orc', hp: 80, attack: 25, gold: 50, exp: 60, emoji: '👹' },
    { name: 'Dark Knight', hp: 100, attack: 30, gold: 75, exp: 80, emoji: '🗡️' },
    { name: 'Dragon', hp: 150, attack: 40, gold: 150, exp: 150, emoji: '🐉' },
    { name: 'Demon Lord', hp: 200, attack: 50, gold: 300, exp: 200, emoji: '👿' }
];

const ITEMS = {
    potion: { name: 'Health Potion', effect: 'heal', value: 50, price: 30, emoji: '🧪' },
    super_potion: { name: 'Super Potion', effect: 'heal', value: 100, price: 80, emoji: '💊' },
    strength_ring: { name: 'Strength Ring', effect: 'attack', value: 5, price: 100, emoji: '💍' },
    shield_amulet: { name: 'Shield Amulet', effect: 'defense', value: 5, price: 100, emoji: '🛡️' }
};

async function getAIResponse(prompt) {
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
                max_tokens: 200
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'You embark on an adventure!';
    } catch (err) {
        return 'You embark on an adventure!';
    }
}

module.exports = {
    name: 'rpgadventure',
    description: 'Start an AI-enhanced RPG adventure',
    async execute(message, args, client) {
        const userId = message.author.id;

        if (rpgAdventures.has(userId)) {
            return message.reply('❌ You already have an active adventure! Use `g!rpgstatus` to check your progress.');
        }

        const classEmbed = new EmbedBuilder()
            .setTitle('⚔️ Choose Your Class')
            .setDescription('Select a class to begin your adventure!\n\nEach class has unique stats and abilities.')
            .setColor(0x5865F2)
            .addFields(
                Object.entries(CLASSES).map(([key, cls]) => ({
                    name: `${cls.emoji} ${cls.name}`,
                    value: `HP: ${cls.hp} | ATK: ${cls.attack} | DEF: ${cls.defense}\nSkills: ${cls.skills.join(', ')}`,
                    inline: true
                }))
            )
            .setFooter({ text: 'Click the button to select your class' });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('rpg_class')
                    .setPlaceholder('Choose your class')
                    .addOptions(
                        Object.entries(CLASSES).map(([key, cls]) => ({
                            label: cls.name,
                            description: `HP: ${cls.hp} | ATK: ${cls.attack} | DEF: ${cls.defense}`,
                            value: key,
                            emoji: cls.emoji
                        }))
                    )
            );

        await message.reply({ embeds: [classEmbed], components: [row] });
    }
};

async function createCharacter(userId, classType, username) {
    const cls = CLASSES[classType];
    const character = {
        userId: userId,
        name: username,
        class: classType,
        className: cls.name,
        emoji: cls.emoji,
        level: 1,
        exp: 0,
        expNeeded: 100,
        hp: cls.hp,
        maxHp: cls.hp,
        attack: cls.attack,
        defense: cls.defense,
        gold: 50,
        inventory: ['potion'],
        equipment: {},
        quests: 0,
        monsters: 0,
        skills: cls.skills,
        startedAt: Date.now()
    };
    rpgAdventures.set(userId, character);
    return character;
}

async function battle(message, character, monsterIndex) {
    const monster = MONSTERS[Math.min(monsterIndex, MONSTERS.length - 1)];
    const monsterHp = monster.hp;

    const aiPrompt = `Generate a short (2-3 sentences) exciting battle narration for an RPG game. Player (${character.className} ${character.name}) fights a ${monster.name}. Include attack descriptions but keep it brief.`;

    const battleNarration = await getAIResponse(aiPrompt);

    const battleEmbed = new EmbedBuilder()
        .setTitle(`${monster.emoji} Battle: ${monster.name}`)
        .setDescription(battleNarration)
        .setColor(0xE74C3C)
        .addFields(
            { name: `${character.emoji} ${character.name}`, value: `❤️ HP: ${character.hp}/${character.maxHp}`, inline: true },
            { name: `${monster.emoji} ${monster.name}`, value: `❤️ HP: ${monster.hp}`, inline: true }
        );

    await message.channel.send({ embeds: [battleEmbed] });

    let playerHp = character.hp;
    let currentMonsterHp = monster.hp;

    while (playerHp > 0 && currentMonsterHp > 0) {
        const playerDamage = Math.max(1, character.attack - Math.floor(monster.attack / 3) + Math.floor(Math.random() * 10));
        currentMonsterHp -= playerDamage;

        if (currentMonsterHp <= 0) break;

        const monsterDamage = Math.max(1, monster.attack - Math.floor(character.defense / 2) + Math.floor(Math.random() * 8));
        playerHp -= monsterDamage;
    }

    if (playerHp <= 0) {
        character.hp = 1;
        const defeatEmbed = new EmbedBuilder()
            .setTitle('💀 Defeat!')
            .setDescription(`You were defeated by the ${monster.name}!\n\nYou barely escaped with your life.`)
            .setColor(0xFF0000);
        return { embeds: [defeatEmbed] };
    }

    character.hp = playerHp;
    character.gold += monster.gold;
    character.exp += monster.exp;
    character.monsters++;

    const victoryEmbed = new EmbedBuilder()
        .setTitle('🎉 Victory!')
        .setDescription(`You defeated the ${monster.name}!\n\n**Rewards:**\n💰 ${monster.gold} Gold\n✨ ${monster.exp} EXP`)
        .setColor(0x00FF00);

    if (character.exp >= character.expNeeded) {
        character.level++;
        character.exp -= character.expNeeded;
        character.expNeeded = Math.floor(character.expNeeded * 1.5);
        character.maxHp += 10;
        character.hp = character.maxHp;
        character.attack += 3;
        character.defense += 2;

        victoryEmbed.addFields({ name: '🎊 Level Up!', value: `You are now level ${character.level}!` });
    }

    return { embeds: [victoryEmbed] };
}

function getCharacter(userId) {
    return rpgAdventures.get(userId);
}

function useItem(character, itemName) {
    const item = ITEMS[itemName];
    if (!item || !character.inventory.includes(itemName)) {
        return { success: false, message: 'Item not found in inventory!' };
    }

    if (item.effect === 'heal') {
        character.hp = Math.min(character.maxHp, character.hp + item.value);
        character.inventory = character.inventory.filter(i => i !== itemName);
        return { success: true, message: `Used ${item.name}! Healed ${item.value} HP.` };
    }

    return { success: false, message: 'Cannot use this item!' };
}

function shopEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('🏪 Item Shop')
        .setDescription('Buy items to help on your adventure!')
        .setColor(0x5865F2);

    Object.entries(ITEMS).forEach(([key, item]) => {
        embed.addFields({ name: `${item.emoji} ${item.name}`, value: `💰 ${item.gold} Gold\nEffect: ${item.effect} +${item.value}`, inline: true });
    });

    return embed;
}

module.exports.rpgAdventures = rpgAdventures;
module.exports.CLASSES = CLASSES;
module.exports.MONSTERS = MONSTERS;
module.exports.ITEMS = ITEMS;
module.exports.getAIResponse = getAIResponse;
module.exports.createCharacter = createCharacter;
module.exports.battle = battle;
module.exports.getCharacter = getCharacter;
module.exports.useItem = useItem;
module.exports.shopEmbed = shopEmbed;
