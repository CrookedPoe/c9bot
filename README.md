# c9bot
---
This is my first discord bot written using node and the package `discord.js`. The name from comes `cohort 9`, the afternoon class hosted under the organization [NPower](https://npower.org/).

## Command list
---
By default, the prefix is `c9>` and this is how you communicate with `c9bot`. Currently the available commands are as follows:

### commands or ?
Show this command list.

### userconfig
Configure user properties in the server. 
**• email**: Configure the contact email explicitly linked to your user ID
**• profile**: Configure your server profile via a google survey.

### contact or email
Send a contact card. By default, it will send your own. 
**• staff**: Send a contact card containing all staff members' emails.
**• support**: Send a contact card containing the emails of your social support managers and attendence reports.

### homework or hw
Send a link to the group calender compiled by Nick summarizing due homework.

### class
Send an express link to today's zoom class.

### source
Send a link to this bot's source code.

### 8ball or 8b
The obligatory magic 8-ball functionality that every good robot has.

### coinflip
Flip a coin to get either heads or tails.

## Additional commands
---
Additionally there are a few moderator or developer-only commands that assist me in managing or debugging the process. They are as follows

### debug
Debug various bot features. 
**• remind/er**: Send a class meeting reminder.
**• me**: Send some user information of the sender of this command.
**• User#0000**: Send some user information of this user Tag.

### server
Manipulate server at a terminal level. 
**• status**: Check the bot's uptime in milliseconds.
**• time**: Check the server's local time.
**• restart**: Restart the bot process.
**• shutdown**: Shutdown and stop the bot process.
**• update**: Pull updates from the GitHub repo and restart the bot process.