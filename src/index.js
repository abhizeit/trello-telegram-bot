require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const baseUrl = process.env.BASE_URL;
const apiKey = process.env.API_KEY;
const apiToken = process.env.API_TOKEN;
const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  let chatId = msg.chat.id;
  let arr = msg.text
    .trim()
    .split(" ")
    .map((m) => m.toLocaleLowerCase());
  if (arr[0] === "hello" || arr[0] === "hi") {
    bot.sendMessage(
      msg.chat.id,
      `Welcome !!
       I can help you to manage your Trello Dashboard with ease
       Some commands for interacting with Trello Dasbord
       show my boards - get all you boards with their ids
       create board {name} - to create a new board
       delete board {boardId} - to delete a board
       show lists {boardId} - to get all the lists and their Ids of a board
       create list {name} in {boardId} - to create a list in a board
       show list cards {listId} - get cards and their Ids in a list of a board
       create card {name} in {listId} - add cards to the list of board
       delete card {cardId}- to delete a list card
    `
    );
  }

  //get boards
  else if (msg.text.includes("show my boards")) {
    try {
      const { data } = await axios.get(
        `${baseUrl}/members/me/boards?fields=name,url&key=${apiKey}&token=${apiToken}`
      );
      console.log(data);
      let msg_str = "";
      for (let m of data) {
        msg_str += m.name + " " + m.id + " " + m.url + "\n";
      }
      bot.sendMessage(chatId, msg_str);
    } catch (e) {
      console.log(e.message);
      bot.sendMessage(
        chatId,
        `I had difficulty getting your boards. I'm working on it.`
      );
    }
  }

  //create a board
  else if (msg.text.includes("create board")) {
    try {
      await axios.post(
        `${baseUrl}/boards/?name=${arr[2]}&key=${apiKey}&token=${apiToken}`
      );
      bot.sendMessage(
        msg.chat.id,
        "I have created a new board for you.Type 'show my boards' to check"
      );
    } catch (e) {
      console.log(e);
      bot.sendMessage(
        msg.chat.id,
        `I had difficulty creating your board. I'm working on it.`
      );
    }
  }

  //delete a board
  else if (msg.text.includes("delete board")) {
    try {
      axios.delete(
        `${baseUrl}/boards/${arr[2]}?key=${apiKey}&token=${apiToken}`
      );
      bot.sendMessage(msg.chat.id, "Your board has been deleted");
    } catch (error) {
      console.log(error);
      bot.sendMessage(
        msg.chat.id,
        "I coundn't delete the board. This will get fixed soon."
      );
    }
  }

  //get lists on a board
  else if (msg.text.includes("show lists")) {
    try {
      const { data } = await axios.get(
        `${baseUrl}/boards/${arr[2]}/lists?key=${apiKey}&token=${apiToken}`
      );
      let msg_str = "";
      for (let m of data) {
        msg_str += m.name + " " + m.id + "\n";
      }
      bot.sendMessage(
        msg.chat.id,
        msg_str || "You have not created any list for this board."
      );
    } catch (error) {}
  }

  //create a list in a board
  else if (msg.text.includes("create list")) {
    try {
      await axios.post(
        `${baseUrl}/lists?name=${arr[2]}&idBoard=${arr[4]}&key=${apiKey}&token=${apiToken}`
      );
      bot.sendMessage(chatId, `${arr[2]} is created.`);
    } catch (e) {
      console.log(e.message);
      bot.sendMessage(chatId, "I couldn't create the list");
    }
  }

  //get cards in a list of a board
  else if (msg.text.includes("show list cards")) {
    try {
      console.log(arr);
      const { data } = await axios.get(
        `${baseUrl}/lists/${arr[3]}/cards?key=${apiKey}&token=${apiToken}`
      );
      let msg_str = "";
      for (let m of data) {
        msg_str += m.name + " " + m.id + "\n";
      }
      bot.sendMessage(
        msg.chat.id,
        msg_str || "currently you have nothing in this list"
      );
    } catch (e) {
      console.log(e.message);
      bot.sendMessage(msg.chat.id, "I couldn't get the cards");
    }
  }

  //add cards to the list of board
  else if (msg.text.includes("create card")) {
    try {
      await axios.post(
        `${baseUrl}/cards?name=${arr[2]}&idList=${arr[4]}&&key=${apiKey}&token=${apiToken}`
      );
      bot.sendMessage(
        chatId,
        "I have created the card. Type `show list cards {listId}` to check"
      );
    } catch (e) {
      console.log(e.message);
      bot.sendMessage(chatId, `I couldnt add the card to the list. Try again.`);
    }
  }
  //delete a card in the list
  else if (msg.text.includes("delete card")) {
    try {
      await axios.delete(
        `${baseUrl}/cards/${arr[2]}?key=${apiKey}&token=${apiToken}`
      );
      bot.sendMessage(chatId, "I crushed the card😶");
    } catch (e) {
      bot.sendMessage(chatId, "I coundn't delete the card. Please try again.");
    }
  }
});
