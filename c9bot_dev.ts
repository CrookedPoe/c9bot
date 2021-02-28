const Discord = require('discord.js'); // This is required--the discord API.
const Config = require('../deps/c9bot_deps/dev-config.json'); // Configuration options for the bot -- Witheld from the repository for privacy.
const fs = require('fs'); // Filesystem control.
const Time = require('./deps/localtime.js'); // Local Time
const Terminal = require('node-cmd'); // Interface with the Server Terminal
const Magic = require('./8ball.js'); // Magic 8-ball
//const Math = require('mathjs'); // Math functions.

// Create bot instance and log in.
const bot = new Discord.Client();
bot.login(Config.token);

// User data handling
let userData: any = fs.readFileSync("../deps/c9bot_deps/profileCache.json");
let profileCache: JSON = JSON.parse(userData);

// Command data
let cmdData: any = fs.readFileSync("../deps/c9bot_deps/commandCache.json");
let commandCache: JSON = JSON.parse(cmdData);

// Role data
let roleData: any = fs.readFileSync("../deps/c9bot_deps/roleCache.json");
let roleCache: JSON = JSON.parse(roleData);

// Local booleans
let classEnded: boolean = false;
let isWeekend: boolean = false;

// Update local time
// Every 1000 milliseconds, or 1 second update
// local Hours, Minutes, and Seconds, and defined whether today is a week day or not.
function updateTime() {
    setInterval(() => {
        let internalDate: Date = new Date();
        Time.nowHours = internalDate.getHours();
        Time.nowMinutes = internalDate.getMinutes();
        Time.nowSeconds = internalDate.getSeconds();

        if (Time.today.name === "Saturday" || Time.today.name === "Sunday")
            isWeekend = true;
        else
            isWeekend = false;

        executeTimedEvents(isWeekend, Time.nowHours, Time.nowMinutes, Time.nowSeconds);

    }, 1000);
}
updateTime();

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check Role Permissions
function checkPermission(message, test: string) {
    if (message.member.roles.cache.some(role => role.name === test)) {
        return true;
    }
    return false;
}

// Timed Events
function executeTimedEvents(weekend: boolean, hours: number, minutes: number, seconds: number) {

    let channelGeneral: any = bot.channels.fetch(Config.channel_general_id);

    // It is Saturday or Sunday
    if (weekend === true) {
        // Saturday, 10:00 AM
        if (Time.today.name === "Saturday") {
            if (hours === 10 && minutes === 0 && seconds === 0)
            {
                channelGeneral.then((c) => {
                    c.send(
                        "I don't know who needed to hear this today, but you matter and you're loved. :heart:\n" +
                        "We may not have class today, but make sure to complete any assignments you may have and check in with your accountability partner.\n" +
                        "Let's all do our best to get to where we're going together one step at a time. :slight_smile:"
                    );
                });
            }
            return;
        }

        // Sunday, 10:00 AM
        if (Time.today.name === "Sunday") {
            if (hours === 10 && minutes === 0 && seconds === 0)
            {
                channelGeneral.then((c) => {
                    c.send(
                        `It's ${Time.today.name}, so even I get a day off, too, right? :sleeping: That'd be nice... but I'm here to serve ~♫\n` +
                        "Since we have class tomorrow, I hope everyone is prepared. I'm looking forward to sending a reminder!"
                    );
                });
            }
            return;
        }
    }
    else {
        // 8:00 AM
        if (hours === 8 && minutes === 0 && seconds === 0)
        {
            classEnded = false;
        }

        // 1:45 PM
        if (hours === 13 && minutes === 45 && seconds === 0)
        {
            channelGeneral.then((c) => {
                sendClassReminder(c, Time.today.name);
            });
        }

        // 6:00 PM
        if (hours === 18 && minutes === 0 && seconds === 0)
        {
            classEnded = true;
        }
    }
}

// Send an automatic class reminder.
function sendClassReminder(channel, dayName: string) {
    let pdDay: boolean = (Time.today.name === "Thursday");
    let zoomLinks: Array<String> = [Config.zoom_tech, Config.zoom_pd];
    let studyTopic: Array<String> = ["studying technical instruction", "professionally developing ourselves"];

    let reminderEmbed: any = new Discord.MessageEmbed()
    .setColor(38399)
    .setTitle("Class Reminder")
    .setDescription(`It's almost time for class, everyone! Today is ${Time.today.name}, so you know what that means--today we're ${studyTopic[pdDay ? 1 : 0]}!`)
    .addFields(
        { name: "📝 Class Resources", value: `Click [here](${Config.moodle}) to access resources on Moodle.\n`},
        { name: "🕑 Don't forget to clock in!", value: `Click [here](${Config.timeclock}) to clock in with OpenTimeClock.\n`},
        { name: "🎦 Zoom Meeting", value: `Click [here](${zoomLinks[pdDay ? 1 : 0]}) to directly join class for the day.\n`},
        { name: "📅 Homework Calendar", value: `Click [here](${Config.team_calendar}) to see today's homework as summarized by Nick.\n`}
    )
    .setTimestamp()
    .setFooter(`${Config.footer}`);

    channel.send(reminderEmbed);
}

// Send a staff contact card.
function sendContactCard(message, mode: string) {
    let contactCard: any = new Discord.MessageEmbed()
    .setColor(13946170)
    contactCard.setTimestamp()
    contactCard.setFooter(`${Config.footer}`);

    if (mode === "") {
        if (!profileCache[message.member.id] || profileCache[message.member.id].email === "") {
            // If user doesn't exist, or email isn't defined
            message.reply("you don't currently have a registered e-mail. You can configure your profile with the `userconfig` command.");
            return;
        }
        else {
            contactCard.setTitle("Contact Card");
            contactCard.addField(
                `:envelope: ${profileCache[message.member.id].username}`,
                `${profileCache[message.member.id].email}`
            );
        }
    }
    else if (mode.toLowerCase() === "staff") {

        contactCard.setTitle("Staff Contact Card");
        contactCard.setDescription("Our _lovely_ staff members include the following:");
    
        let profileKeys = Object.keys(profileCache);
        for (let i: number = 0; i < profileKeys.length; i++) {
            if (profileCache[profileKeys[i]].role === "Staff") {
                contactCard.addField(
                    `:envelope: ${profileCache[profileKeys[i]].first_name} ${profileCache[profileKeys[i]].last_name}`,
                    `${profileCache[profileKeys[i]].email}`
                );
            }
        }
    }
    else if (mode.toLowerCase() === "support") {

        contactCard.setTitle("Support Contact Card");
        contactCard.setDescription("Our amazing social support managers and help with attendance:");
    
        let profileKeys = Object.keys(profileCache);
        for (let i: number = 0; i < profileKeys.length; i++) {
            if (profileCache[profileKeys[i]].job.includes("Support")) {
                contactCard.addField(
                    `:envelope: ${profileCache[profileKeys[i]].first_name} ${profileCache[profileKeys[i]].last_name}`,
                    `${profileCache[profileKeys[i]].email}`
                );
            }
        }
    }

    message.channel.send(contactCard);
}

// Send a user profile.
function sendUserProfile(message) {
    let userID: any = profileCache[message.member.id];
    let userAvatar: string = message.author.avatarURL("png", true, 256);

    let profileEmbed: any = new Discord.MessageEmbed()
    .setTitle(`${userID.first_name} ${userID.last_name}`)
    .setThumbnail(`${userAvatar}`)
    .setAuthor("Server Profile", "https://cdn.discordapp.com/app-icons/814220039045382235/e9a9e01e8b0c0f4eb420487a56547207.png")
    .setColor(`${userID.color}`)
    .addFields(
        {name: "Role", value: `${roleCache[userID.role].alias}`, inline: true},
        {name: "Occupation", value: `${userID.job}`, inline: true},
        {name: "Contact", value: `${userID.email}`, inline: true},
        {name: "Likes", value: `${userID.likes}`, inline: true},
        {name: "Dislikes", value: `${userID.dislikes}`, inline: true},
        {name: "Favorite Quote", value: `“${userID.quote.body}” – ${userID.quote.author}`, inline: false}
    )
    .setTimestamp()
    .setFooter(`${Config.footer}`);

    message.channel.send(profileEmbed);
}

// Send command list.
function sendCommandList(channel) {
    let commandEmbed: any = new Discord.MessageEmbed()
    .setTitle("Command List")
    .setColor("#CCCCCC")
    .setDescription("This is what I'm capable of:")
    .setTimestamp()
    .setFooter(`${Config.footer}`);

    let cmdKeys = Object.keys(commandCache);
    for (let i: number = 0; i < cmdKeys.length; i++) {
        if (commandCache[cmdKeys[i]].access === "Everyone") {
            if (commandCache[cmdKeys[i]].args !== "") {
                let argString: string = `${commandCache[cmdKeys[i]].desc}`;
                for (var key in commandCache[cmdKeys[i]].args) {
                    argString += `\n   **• ${key}**: ${commandCache[cmdKeys[i]].args[key]}`;
                }
                commandEmbed.addField(
                    `${cmdKeys[i]}`,
                    argString
                );
            }
            else {
                commandEmbed.addField(
                    `${cmdKeys[i]}`,
                    `${commandCache[cmdKeys[i]].desc}`
                );
            }
        }
    }

    channel.send(commandEmbed);
}

// Manipulate PM2 Process
function serverProcess(channel, op: string) {
    if (op.toLowerCase() === "status") {
        channel.send(`The process has been alive for ${bot.uptime}ms.`);
    }
    else if (op.toLowerCase() === "time") {
        channel.send(`${Time.today.name}, ${Time.nowDate.month_name} ${Time.nowDate.date},` +
        `${Time.nowDate.year}\n${Time.nowHours}:${Time.nowMinutes}:${Time.nowSeconds}`);
    }
    else if (op.toLowerCase() === "restart") {
        channel.send("Restarting...");
        Terminal.get(`pm2 restart ${process}`);
        channel.send("I'm back, baby! :sunglasses:");
    }
    else if (op.toLowerCase() === "shutdown") {
        channel.send("I'm feeling sleepy. Goodnight! :sleeping:")
        .then(msg => bot.destroy());
        Terminal.get(`pm2 stop ${process}`);
    }
    else if (op.toLowerCase() === "update") {
        channel.send("Pulling from GitHub...");
        Terminal.get("cd ~/discord/c9bot && git pull");
        channel.send("Transpiling from TypeScript...");
        Terminal.get(`tsc ${process}.ts`);
        //delay(2000);
        channel.send("Restarting...");
        Terminal.get(`pm2 restart ${process}`);
        channel.send("Update complete.");
    }
}

//bot.on('ready', () => {
//
//});

bot.on('message', (m) => {

    let cmdString: string = "";
    
    // Server Manipulation
    if (m.content.startsWith(cmdString = `${Config.prefix}server`)) {
        if (m.member.id === "167853162181427201") {
            let mode: string = m.content.replace(cmdString, "").trim();
            serverProcess(m.channel, mode);
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }

    // Feature Debugging
    if (m.content.startsWith(cmdString = `${Config.prefix}debug`)) {
        if (checkPermission(m, Config.mod_role)) {
            let mode: string = m.content.replace(cmdString, "").trim();
            if (mode.toLowerCase() === "remind" || mode.toLowerCase() === "reminder") {
                sendClassReminder(m.channel, Time.today.name);
            }
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }

    // User Configuration
    if (m.content.startsWith(cmdString = `${Config.prefix}userconfig`)) {
        let mode: string = m.content.replace(cmdString, "").trim();
        if (mode.toLowerCase() === "email") {
            let args: Array<string> = mode.split(" ");
            if (args[1] !== "") {
                if (!profileCache[m.member.id]) {
                    // If user does not exist in cache, add them.
                    profileCache[m.member.id] = {
                        username: m.member.user.username,
                        first_name: "",
                        last_name: "",
                        role: "None",
                        job: "",
                        email: args[1]
                    };
                    fs.writeFileSync(userData, JSON.stringify(profileCache, null, 4));
                    m.reply(`your email has been registered as \`${args[1]}\``);
                }
            }
            else {
                m.reply("please enter an e-mail to register.")
            }
        }
        else if (mode.toLowerCase() === "profile")
        {
            m.channel.send("Erm, plans are to set up a google survey for this sort of thing. It's not ready yet.");
        }
    }

    // User Profile
    if (m.content.startsWith(cmdString = `${Config.prefix}profile`)) {
        if (!profileCache[m.member.id] || profileCache[m.member.id].first_name === "") {
            // If user doesn't exist, or profile isn't created
            m.reply("you don't currently have a profile set up. You can configure your profile with the `userconfig` command.");
            return;
        }
        else {
            sendUserProfile(m);
        }
    }

    // Contact Card Embeds
    if (m.content.startsWith(cmdString = `${Config.prefix}contact`) || m.content.startsWith(cmdString = `${Config.prefix}email`)) {
        let mode: string = m.content.replace(cmdString, "").trim();
        sendContactCard(m, mode);
    }

    // Source Code
    if (m.content.startsWith(cmdString = `${Config.prefix}source`)) {
        m.channel.send(`W-what do you mean you want to see what I'm like on the inside? That's so embarassing... :flushed:\nMy source can be found here: ${Config.git_repo}`);
    }

    // Homework Link
    if (m.content.startsWith(cmdString = `${Config.prefix}homework`) || m.content.startsWith(cmdString = `${Config.prefix}hw`)) {
        m.reply(`you're doing your homework? How studious of you. In case you forgot, you can find that here: ${Config.team_calendar}`);
    }

    // Class Link
    if (m.content.startsWith(cmdString = `${Config.prefix}class`)) {
        let classLink: string = "";
        // Determine Class Link
        if (isWeekend === false)
        {
            if (Time.today.name === "Thursday") {
                classLink = Config.zoom_pd;
            }
            else {
                classLink = Config.zoom_tech;
            }

            if (classEnded === false)
                m.reply(`hurry up! You _don't_ want to be late. Join here: ${classLink}`);
            else
                m.reply(`I'm glad that you want to join class, but that session ended already. The link was this today, though: ${classLink}`);
        }
        else {
            m.reply("hurry up! You _don't_ want to be la--wait, it's the weekend. We don't have class today, silly.");
        }
    }

    // Magic 8-ball
    if (m.content.startsWith(cmdString = `${Config.prefix}8ball`) || m.content.startsWith(cmdString = `${Config.prefix}8b`)) {
        let ballAsk: string = m.content.replace(cmdString, "").trim();
        if (ballAsk !== "")
            m.channel.send(Magic.randomResponse());
        else
            m.reply("please ask a question before relying on my cosmic powers. :sparkles:");
    }

    // Coin Flip
    if (m.content.startsWith(cmdString = `${Config.prefix}coinflip`)) {
        let sides: Array<string> = ["heads", "tails"];
        m.channel.send(`The coin landed on **${sides[Math.round(Math.random())]}**. :coin:`)
    }

    // Send Command List
    if (m.content.startsWith(cmdString = `${Config.prefix}commands`) || m.content.startsWith(cmdString = `${Config.prefix}?`)) {
        sendCommandList(m.channel);
    }

});