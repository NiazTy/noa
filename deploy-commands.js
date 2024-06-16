import fs from "fs";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

let commands = [];
const commandFolders = fs.readdirSync("./commands");

async function loadCommands() {
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = await import(`./commands/${folder}/${file}`);
            
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command.default && 'execute' in command.default) {
                commands.push(command.default.data);
            } else {
                console.log(`[WARNING] The command at ${folder}/${file} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

(async () => {
    try {
        // Wait for all commands to be loaded before proceeding
        await loadCommands();
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const rest = new REST().setToken(process.env.TOKEN_API);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // Make sure to catch and log any errors!
        console.error("Error during command deployment:", error);
    }
})();