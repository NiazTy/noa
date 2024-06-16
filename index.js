import fs from "fs";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection()

const commandFolders = fs.readdirSync("./commands");

commandFolders.forEach(folder => {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

    commandFiles.forEach(async file => {
		const command = await import(`./commands/${folder}/${file}`);
		
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command.default && 'execute' in command.default) {
			client.commands.set(command.default.data.name, command.default);
		} else {
			console.log(`[WARNING] The command at ${command.default.data.name} is missing a required "data" or "execute" property.`);
		}
    })
})

const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));

eventFiles.forEach(async file => {
    const event = await import(`./events/${file}`);

	console.log(event.default)

	if (event.default.isOnce) {
		client.once(event.default.name, 
            (...args) => event.default.execute(...args, client));
	} else {
		client.on(event.default.name, 
            async (...args) => await event.default.execute(...args, client));
	}
});

client.login(process.env.TOKEN_API);