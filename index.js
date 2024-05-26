const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config()

const { Client, Partials, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember
    ],

    intents: [
		GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
	]
});

const eventFiles = fs.readdirSync("./events")
    .filter((file) => file.endsWith(".js"));

eventFiles.forEach(file => {
    const event = require(`./events/${file}`);

    console.log(`Loading events: ${event.name}...`);
	if (event.isOnce) {
		client.once(event.name, 
            (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, 
            async (...args) => await event.execute(...args, client));
	}
})

client.commands = new Collection();

const commandFolders = fs.readdirSync("./commands")

commandFolders.forEach(folder => {
    const commandFiles = fs.readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

    commandFiles.forEach(file => {
        const command = require(`./commands/${folder}/${file}`);

        client.commands.set(command.name, command);
        console.log(`Loading commands: ${command.name}...`);
    });
});

client.login(process.env.API_TOKEN).catch(error => {
    console.error("Err: API_TOKEN Tidak boleh kosong atau terdapat kesalahan pada TOKEN?");
    console.error("Error code: " + error.code);
});