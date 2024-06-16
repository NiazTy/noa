import fs from "fs";
import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
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

let commands = []
const commandFolders = fs.readdirSync("./commands");

commandFolders.forEach(folder => {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

    commandFiles.forEach(async file => {
		const command = await import(`./commands/${folder}/${file}`)
		
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command.default && 'execute' in command.default) {
			// client.commands.set(command.data.name, command);
			console.log("true");
			console.log(command.default.data)
            commands.push(command.default.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${command.default.data.name} is missing a required "data" or "execute" property.`);
		}
    })
})

console.log(commands)

const rest = new REST().setToken(process.env.TOKEN_API);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		// console.log("Hellow Eor")

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


client.login(process.env.TOKEN_API);