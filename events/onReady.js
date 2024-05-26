const settings = require("../resources/settings.json")

module.exports = {
    name: "ready",

    execute(client) {
        setInterval(() => {
            let i = Math.floor(Math.random() * settings.Presences.length);

            client.user.setPresence({ 
                activities: [
                    { 
                        name: settings.Presences[i].name,
                        type: settings.Presences[i].type
                    }
                ],
                status: settings.Status
            });

        }, settings.Interval * 1000);

        console.log("I successfully logged in with the username: " + client.user.username);
        console.log(client.user.username + ": Hi dev my name is " + client.user.username + ", Nice to meet you!");
    }
}