import * as Discord from 'discord.js';                         // This is required--the discord API.
import * as config from "../deps/c9bot_deps/dev-config.json";  // Configuration options for the bot -- Witheld from the repository for privacy.
//import * as config from "../deps/c9bot_deps/live-config.json"; // Configuration options for the bot -- Witheld from the repository for privacy.
import * as fs from 'fs';                                      // Filesystem control.
import { Time, Day, updateTime } from "./deps/timeContext";    // Local Time
import { MagicBilliard } from "./deps/8ball";                  // Magic 8-ball
import { User } from "./deps/serverContext";                   // Server Helpers

const Terminal = require('node-cmd'); // Interface with the Server Terminal

// Create bot instance and log in.
const bot = new Discord.Client();
bot.login(config.token);

// User Data
let userPath: string = "../deps/c9bot_deps/profileCache.json";
let userData: any = fs.readFileSync(userPath);
let profileCache: any = JSON.parse(userData);

// Command Data
let cmdData: any = fs.readFileSync("../deps/c9bot_deps/commandCache.json");
let commandCache: any = JSON.parse(cmdData);

// Role Data
let roleData: any = fs.readFileSync("../deps/c9bot_deps/roleCache.json");
let roleCache: any = JSON.parse(roleData);

// Time
let localTime: Time = new Time();
let classEnded: boolean = false;
updateTime(localTime, 1000, executeTimedEvents);

// Timed Events
function executeTimedEvents(Today: Day) {

    let channelGeneral: any = bot.channels.fetch(config.channel_general_id);

    // It is Saturday or Sunday
    if (Today.IsWeekend === true) {
        // Saturday, 10:00 AM
        if (Today.Name === "Saturday") {
            if (Today.Clock.Time === "10:00:00") {
                channelGeneral.then((c: any) => {
                    c.send(
                        "I don't know who needed to hear this today, but you matter and you're loved. :heart:\n" +
                        "We may not have class today, but make sure to complete any assignments you may have and check in with your accountability partner.\n" +
                        "Let's all do our best to get to where we're going together one step at a time. :slight_smile:"
                    );
                });
            }
        }

        // Sunday, 10:00 AM
        if (Today.Name === "Sunday") {
            if (Today.Clock.Time === "10:00:00") {
                channelGeneral.then((c: any) => {
                    c.send(
                        `It's ${Today.Name}, so even I get a day off, too, right? :sleeping: That'd be nice... but I'm here to serve ~♫\n` +
                        "Since we have class tomorrow, I hope everyone is prepared. I'm looking forward to sending a reminder!"
                    );
                });
            }
        }
    }
    else {
        // 8:00 AM
        if (Today.Clock.Time === "08:00:00") {
            classEnded = false;
        }

        // 1:45 PM
        if (Today.Clock.Time === "13:45:00") {
            channelGeneral.then((c: any) => {
                sendClassReminder(c, Today.Name);
            });
        }

        // 6:00 PM
        if (Today.Clock.Time === "18:00:00") {
            classEnded = true;
        }
    }
}

// Send an automatic class reminder.
function sendClassReminder(channel: any, dayName: string) {
    let pdDay: boolean = (localTime.Today.Name === "Thursday");
    let zoomLinks: Array<String> = [config.zoom_tech, config.zoom_pd];
    let studyTopic: Array<String> = ["studying technical instruction", "professionally developing ourselves"];

    let reminderEmbed: any = new Discord.MessageEmbed()
    .setColor(38399)
    .setTitle("Class Reminder")
    .setDescription(`It's almost time for class, everyone! Today is ${localTime.Today.Name}, so you know what that means--today we're ${studyTopic[pdDay ? 1 : 0]}!`)
    .addFields(
        { name: "📝 Class Resources", value: `Click [here](${config.moodle}) to access resources on Moodle.\n`},
        { name: "🕑 Don't forget to clock in!", value: `Click [here](${config.timeclock}) to clock in with OpenTimeClock.\n`},
        { name: "🎦 Zoom Meeting", value: `Click [here](${zoomLinks[pdDay ? 1 : 0]}) to directly join class for the day.\n`},
        { name: "📅 Homework Calendar", value: `Click [here](${config.team_calendar}) to see today's homework as summarized by Nick.\n`}
    )
    .setTimestamp()
    .setFooter(`${config.footer}`);

    channel.send(reminderEmbed);
}

// Send a staff contact card.
function sendContactCard(message: any, mode: string) {
    let contactCard: any = new Discord.MessageEmbed()
    .setColor(13946170)
    contactCard.setTimestamp()
    contactCard.setFooter(`${config.footer}`);

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
    else {
        message.reply(`${mode} isn't a currently recognized argument. Did you mean to register an email with \`userconfig email\` instead?"`);
        return;
    }

    message.channel.send(contactCard);
}

// Send a user profile.
function sendUserProfile(message: any) {
    let userID: any = profileCache[message.member.id];
    let userAvatar: string = "";

    let profileEmbed: any = new Discord.MessageEmbed()
    .setTitle(`${userID.first_name} ${userID.last_name}`)
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
    .setFooter(`${config.footer}`);

    if (message.author.avatarURL("png", true, 256) != null) {
        userAvatar = message.author.avatarURL("png", true, 256);
        profileEmbed.setThumbnail(`${userAvatar}`);
    }

    message.channel.send(profileEmbed);
}

// Send command list.
function sendCommandList(channel: any) {
    let commandEmbed: any = new Discord.MessageEmbed()
    .setTitle("Command List")
    .setColor("#CCCCCC")
    .setDescription("This is what I'm capable of:")
    .setTimestamp()
    .setFooter(`${config.footer}`);

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
function serverProcess(channel: any, op: string) {
    if (op.toLowerCase() === "status") {
        channel.send(`The process has been alive for ${bot.uptime}ms.`);
    }
    else if (op.toLowerCase() === "time") {
        channel.send(`${localTime.Today.Name}, ${localTime.Month.Name} ${localTime.Date}, ` +
        `${localTime.Year}\n${localTime.Today.Clock.Time}`);
    }
    else if (op.toLowerCase() === "restart") { 
        channel.send("Restarting...");
        Terminal.get(
            `pm2 restart ${process}`, function (err: any, data: string, stderr: any) {
                try { channel.send(data.split("\n")[1]); } 
                catch(err) {}
            });
        channel.send("I'm back, baby! :sunglasses:");
    }
    else if (op.toLowerCase() === "shutdown") {
        channel.send("I'm feeling sleepy. Goodnight! :sleeping:")
        .then((msg: any) => bot.destroy());
        Terminal.get(`pm2 stop ${process}`);
    }
    else if (op.toLowerCase() === "update") {
        channel.send("Pulling from GitHub...");
        Terminal.get("cd ~/discord/c9bot && git pull");
        channel.send("Transpiling from TypeScript...");
        Terminal.get(`tsc ${process}.ts --resolveJsonModule`);
        serverProcess(channel, "restart");
        channel.send("Update complete.");
    }
}

//bot.on('ready', () => {
//
//});

bot.on('message', (m: any) => {

    let channelGeneral: any = bot.channels.fetch(config.channel_general_id);
    let cmdString: string = "";
    let msgUser = new User(m.member);
    
    // Server Manipulation
    if (m.content.startsWith(cmdString = `${config.prefix}server`)) {
        if (msgUser.VerifyID(config.dev_id)) {
            let mode: string = m.content.replace(cmdString, "").trim();
            serverProcess(m.channel, mode);
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }

    // Feature Debugging
    if (m.content.startsWith(cmdString = `${config.prefix}debug`)) {
        if (msgUser.VerifyRole(config.mod_role) || msgUser.VerifyID(config.dev_id)) {
            let mode: string = m.content.replace(cmdString, "").trim();
            if (mode.toLowerCase() === "remind" || mode.toLowerCase() === "reminder") {
                sendClassReminder(m.channel, localTime.Today.Name);
            }
            if (mode.toLowerCase() === "me") {
                m.channel.send(`Tag: ${m.member.user.tag}\nID: ${m.member.id}\nNickname: ${m.member.nickname}`);
            }
            if (mode.includes("#")) {
                let userPromise: any = m.guild.members.fetch({query: mode.split('#')[0], limit: 1});
                userPromise.then((member: any) => {
                    let dbgUser: string = `${member.values().next().value}`;
                    m.channel.send(`Tag: ${mode}\nID: ${member.values().next().value.id}\nNickname: ${member.values().next().value.nickname}`);
                });
            }
        }
        else {
            m.reply("you aren't authorized to use this command.");
        }
    }

    // User Configuration
    if (m.content.startsWith(cmdString = `${config.prefix}userconfig`)) {
        let mode: string = m.content.replace(cmdString, "").trim();
        let configMode: string = mode.trim().split(' ')[0].toLowerCase();
        let emailString: string = mode.trim().split(' ')[1];
        if (configMode === "email") {
            if (emailString !== "" && emailString !== undefined) {
                //console.log(emailString);
                if (!profileCache[m.member.id]) {
                    //console.log("Member ID does not already exist. Adding them...");
                    // If user does not exist in cache, add them.
                    profileCache[m.member.id] = {
                        username: m.member.nickname,
                        first_name: "",
                        last_name: "",
                        role: "None",
                        job: "",
                        email: `${emailString}`,
                        likes: "",
                        dislikes: "",
                        quote: {body: "", author: ""},
                        color: ""
                    };
                    fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                    m.reply(`your email has been registered as \`${emailString}\``);
                    return;
                }
                else if (profileCache[m.member.id])
                {
                    //console.log("Member ID already exists. Overwriting email...");
                    profileCache[m.member.id] = {
                        username: profileCache[m.member.id].username,
                        first_name: profileCache[m.member.id].first_name,
                        last_name: profileCache[m.member.id].last_name,
                        role: profileCache[m.member.id].role,
                        job: profileCache[m.member.id].job,
                        email: `${emailString}`,
                        likes: profileCache[m.member.id].likes,
                        dislikes: profileCache[m.member.id].dislikes,
                        quote: {body: profileCache[m.member.id].quote.body, author: profileCache[m.member.id].quote.author},
                        color: profileCache[m.member.id].color
                    };
                    fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                    m.reply(`your email has been registered as \`${emailString}\``);
                    return;
                }
            }
            else {
                m.reply("please enter an e-mail to register.")
            }
        }
        else if (configMode === "profile")
        {
            m.reply(`to set up your server profile, please answer a few short questions on this form here: ${config.pfform}.`);
        }
    }

    // User Profile
    if (m.content.startsWith(cmdString = `${config.prefix}profile`)) {
        if (!profileCache[m.member.id] || profileCache[m.member.id].first_name === "") {
            // If user doesn't exist, or profile isn't created
            m.reply("you don't currently have a profile set up. You can configure your profile with the `userconfig profile` command.");
            return;
        }
        else {
            sendUserProfile(m);
        }
    }

    // Profile Form Webhook
    if (m.webhookID) {
        let formSubmission: any = m.content;
        console.log("Webhook recieved! Deleting.");
        m.delete();
        console.log("Message deleted.");
        let userPromise: any = m.guild.members.fetch({query: formSubmission.split(';')[0].split('#')[0], limit: 1});
        userPromise.then((member: any) => {
            let formUserID: string = `${member.values().next().value.user.id}`;
            if (!profileCache[formUserID]) {
                profileCache[formUserID] = {
                    username: `${member.values().next().value.nickname}`,
                    first_name: formSubmission.split(';')[1],
                    last_name: formSubmission.split(';')[2],
                    role: "None",
                    job: formSubmission.split(';')[4],
                    email: formSubmission.split(';')[5],
                    likes: formSubmission.split(';')[6],
                    dislikes: formSubmission.split(';')[7],
                    quote: {body: formSubmission.split(';')[8], author: formSubmission.split(';')[9]},
                    color: formSubmission.split(';')[3]
                };
                fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                channelGeneral.then((c: any) => {
                    c.send(`<@${formUserID}>, your server profile has been created!`);
                });
            }
        });
    }

    // Contact Card Embeds
    if (m.content.startsWith(cmdString = `${config.prefix}contact`) || m.content.startsWith(cmdString = `${config.prefix}email`)) {
        let mode: string = m.content.replace(cmdString, "").trim();
        sendContactCard(m, mode);
    }

    // Source Code
    if (m.content.startsWith(cmdString = `${config.prefix}source`)) {
        m.channel.send(`W-what do you mean you want to see what I'm like on the inside? That's so embarassing... :flushed:\nMy source can be found here: ${config.git_repo}`);
    }

    // Homework Link
    if (m.content.startsWith(cmdString = `${config.prefix}homework`) || m.content.startsWith(cmdString = `${config.prefix}hw`)) {
        m.reply(`you're doing your homework? How studious of you. In case you forgot, you can find that here: ${config.team_calendar}`);
    }

    // Class Link
    if (m.content.startsWith(cmdString = `${config.prefix}class`)) {
        let classLink: string = "";
        // Determine Class Link
        if (localTime.Today.IsWeekend === false)
        {
            if (localTime.Today.Name === "Thursday") {
                classLink = config.zoom_pd;
            }
            else {
                classLink = config.zoom_tech;
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
    if (m.content.startsWith(cmdString = `${config.prefix}8ball`) || m.content.startsWith(cmdString = `${config.prefix}8b`)) {
        let Magic = new MagicBilliard();
        let ballAsk: string = m.content.replace(cmdString, "").trim();
        if (ballAsk !== "")
            m.channel.send(Magic.getResponse());
        else
            m.reply("please ask a question before relying on my cosmic powers. :sparkles:");
    }

    // Coin Flip
    if (m.content.startsWith(cmdString = `${config.prefix}coinflip`)) {
        let sides: Array<string> = ["heads", "tails"];
        m.channel.send(`The coin landed on **${sides[Math.round(Math.random())]}**. :coin:`)
    }

    // Send Command List
    if (m.content.startsWith(cmdString = `${config.prefix}commands`) || m.content.startsWith(cmdString = `${config.prefix}?`)) {
        sendCommandList(m.channel);
    }

});