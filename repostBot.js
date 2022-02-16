'use strict';
const snoowrap = require('snoowrap');
const Discordie = require('discordie');
const Events = Discordie.Events;

/* A bot that'd take things from reddit and repost them in discord. 17 year old me was strange. */

const discord = new Discordie()
const reddit = new snoowrap({
    userAgent: 'RepostbotDiscord 20/8/17a',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '' //plz no steal
});

const DISCORD_TOKEN = ''

var curriedpost = function(channel, messages, txtallowed) {
	return function(submissions) {
		var message = "I couldnt find anything"
		for (let i = 0; i < submissions.length; i++) {
			let valid = true
			for (let m = 0; m < messages.length; m++) {
				if (messages[m].content.includes(submissions[i].url) || messages[m].content.includes(submissions[i].permalink)) {
					valid = false
					break;
				}
			}
			console.log(valid)
			console.log(submissions[i])
			if(valid && !(submissions[i].over_18) && !(submissions[i].stickied) && (!(submissions[i].url.includes(submissions[i].permalink)) || txtallowed)) {
				if (submissions[i].url.includes(submissions[i].permalink)) { 
					var message = submissions[i].url
				}
				else {
					var message = submissions[i].url + "\nhttps://reddit.com" + submissions[i].permalink
				}
				break
			}
		}
		channel.sendMessage(message)
	}
}
var curriederror = function(channel) {
	return function(submissions) {
		console.log(submissions)
		channel.sendMessage("Something went wrong")
	}
}
var curriedsubchk = function(post, channel) {
	return function(submissions) {
		if (submissions.length == submissions.filter(s => s.over_18).length) {
			channel.sendMessage("Nice try")
		}
		else {
			channel.sendMessage("Searching for a sufficiently dank post...")
			post(submissions)
		}
	}
}

discord.connect({token: 'DISCORD_TOKEN' });
discord.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	let channel = e.message.channel
	let messages = channel.messages
	var error = curriederror(channel)
	if (e.message.content == '/help' ) { //posts a list of the bots functions
		sendMessage("/findmeme	Finds a meme from a dank subreddit");
	}
	else if (e.message.content == "/findmeme") {
		var post = curriedpost(channel, messages, false)
		channel.sendMessage("Searching for a sufficiently dank meme...")
		reddit.getSubreddit("dankmemes").getHot().then(post, error)
	}
	else if (e.message.content == "/getfrom botsrights") {
		channel.sendMessage("I'm not allowed to go there")
	}
	else if (e.message.content.includes("/getfrom")) {
		let name = e.message.content.substr(9)
		var post = curriedpost(channel, messages, true)
		var subchk = curriedsubchk(post, channel)
		channel.sendMessage("Finding subreddit...")
		reddit.getSubreddit(name).getHot().then(subchk, error)
	}
});
