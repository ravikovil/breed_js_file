// store conversation
function insertMsg(data) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: data,
    redirect: "follow",
  };

  fetch("https://api.pawpal.ai/api/v1/chat", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log())
    .catch((error) => console.error(error));
}
// get login details
function getCookie(name) {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieValue ? cookieValue.pop() : "";
}

// get breed id
function breedId() {
  const url = window.location.href;
  const parts = url.split("/");
  const breed = parts[parts.length - 1].split(".")[0];
  return breed;
}

var firstUserId = getCookie("userId");
var secondUserId = breedId();

// get chat conversation
function msg(sender, message, timestamp) {
  // Get all chat-bubble1 elements
  const chatBubbles = document.querySelectorAll(".chat-bubble1");

  // Initialize variables to store the last text and time for both user and bot
  let lastUserText = null;
  let lastUserTime = null;
  let lastBotText = null;
  let lastBotTime = null;

  // Iterate over each chat bubble
  chatBubbles.forEach((chatBubble) => {
    // Get the text content from the chat bubble
    const textContent = chatBubble?.textContent.trim();

    // Get the timestamp content from the chat bubble
    const timestamp = chatBubble
      .querySelector(".timestamp")
      ?.textContent?.trim();

    // Determine if it's from user or bot
    if (chatBubble?.classList?.contains("user")) {
      // Update last user text and time
      lastUserText = textContent;
      lastUserTime = timestamp;
    } else if (chatBubble?.classList?.contains("bot")) {
      // Update last bot text and time
      lastBotText = textContent;
      lastBotTime = timestamp;
    }
  });

  let conversation = [
    {
      from: firstUserId,
      to: secondUserId,
      time: lastUserTime,
      message: lastUserText,
    },
    {
      from: secondUserId,
      to: firstUserId,
      time: timestamp,
      message: message,
    },
  ];
  // Output the last text and time for both user and bot
  const data = JSON.stringify({
    firstUserId: firstUserId,
    secondUserId: secondUserId,
    date: new Date(),
    chat: [...conversation],
  });

  insertMsg(data);
}

// Function to scroll to the bottom of the chat container
function scrollToLatestMessage(delay = 0) {
  const chatContainer = document.querySelector(".chat-container");
  // Delay scrolling slightly to account for the height change
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
    chatContainer.scrollIntoView({ block: "end" });
  }, delay);
}

// Function to generate random ID
function getRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Generate on page load
const userId = getRandomId();

// Function to post user's message to API
async function postMessageToAPI(message) {
  const data = {
    "in-0": message,
    "in-1": `0 - User name Introduction
      1 -  what else can you do
      2 - CREATE ME AN IMAGE
      3 - Listening
      4 - PROS & CONS
      5 - Firefighter
      6 -  Decision Maker Coin Flip
      7 - Casual Conversation`,
    user_id: userId,
    "text2audio-1": `<TEXT>`,
    "audio2text-0": `<VOICE>`,
  };

  // For adding bubble when thinking bot by made ravi
  // started
  const chatContainer = document.querySelector(".chat-container");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble1");
  bubble.classList.add("bot");
  bubble.classList.add("bubble");
  const image = document.createElement("img");
  image.src = "/images/bubble.svg";
  image.style.marginBottom = "2px";
  image.style.width = "30px";
  image.style.bottom = "unset";
  image.style.left = "unset";
  chatContainer.style.marginBottom = "5px";

  bubble.appendChild(image);
  chatContainer.appendChild(bubble);
  scrollToLatestMessage();
  // end

  const result = await query(data);

  if (result["out-2"]) {
    // remove bubble when get the result
    // start
    bubble.remove();
    // end
    displayChatBubble("bot", result["out-2"]);
  }
  scrollToLatestMessage();
}

async function query(data) {
  const response = await fetch(
    "https://www.stack-inference.com/run_deployed_flow?flow_id=65b754621a7425ac9f9f0806&org=161f3dc5-7deb-41f0-85e3-fc72609b3876",
    {
      headers: {
        Authorization: "Bearer 15568649-1cb0-4a53-9f27-1a8f8d4fa5bd",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return await response.json();
}

// get data from db of user
function getOldData(callback) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    firstUserId: firstUserId,
    secondUserId: secondUserId,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://api.pawpal.ai/api/v1/chat/list", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      if (callback)
        callback(
          JSON.parse(result).result.length > 0
            ? JSON.parse(result).result[0].chat
            : []
        );
    })
    .catch((error) => console.error(error));
}
// create html conversation
async function conversationFromDb(callback) {
  getOldData(async (chatData) => {
    console.log(chatData);
    const chatContainer = document.querySelector(".chat-container");
    // Loop through the chat data
    chatData.forEach((chat) => {
      if (chat.from === firstUserId && chat.message) {
        const chatBubble = document.createElement("div");
        chatBubble.classList.add("chat-bubble1", "user");
        chatBubble.style.display = "flex";
        (chatBubble.style.flexDirection = "column"),
          (chatBubble.style.gap = "5px");
        const newMsg = chat.message.replace(chat.time, "").trim();
        const textSpan = document.createElement("span");
        textSpan.textContent = newMsg;
        chatBubble.appendChild(textSpan);

        const timestamp = document.createElement("span");
        timestamp.style.display = "flex";
        timestamp.style.justifyContent = "end";
        timestamp.textContent = chat.time;
        chatBubble.appendChild(timestamp);

        chatContainer.appendChild(chatBubble);
      } else if (chat.from === secondUserId && chat.message) {
        const chatBubble = document.createElement("div");
        chatBubble.classList.add("chat-bubble1", "bot");
        chatBubble.style.display = "flex";
        (chatBubble.style.flexDirection = "column"),
          (chatBubble.style.gap = "5px");

        const newMsg = chat.message.replace(chat.time, "").trim();
        const textSpan = document.createElement("span");
        textSpan.textContent = newMsg;
        chatBubble.appendChild(textSpan);

        const timestamp = document.createElement("span");
        timestamp.style.display = "flex";
        timestamp.style.justifyContent = "end";
        timestamp.textContent = chat.time;
        chatBubble.appendChild(timestamp);
        chatContainer.appendChild(chatBubble);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (callback) callback(chatData);
  });
}
// Function to display chat bubbles with live typing effect

async function displayChatBubble(sender, message) {
  const chatContainer = document.querySelector(".chat-container");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble1");
  const { timestamp, timeString } = createTimestamp(); // Create a timestamp for all messages

  if (sender === "user") {
    bubble.classList.add("user");
    bubble.innerHTML = message; // Display the message as is
    bubble.appendChild(timestamp); // Append the timestamp for user messages
    chatContainer.appendChild(bubble);
  } else if (sender === "bot") {
    if (firstUserId) {
      msg(sender, message, timeString);
    }
    bubble.classList.add("bot");
    chatContainer.appendChild(bubble);
    // Check if the message contains a link and replace it with an anchor tag
    // started
    const linkPattern = /\[(.*?)\]\s?\((.*?)\)/;
    if (linkPattern.test(message)) {
      const [fullMatch, linkText, linkUrl] = message.match(linkPattern);
      const linkElement = document.createElement("a");
      linkElement.href = linkUrl;
      linkElement.textContent = linkText;
      linkElement.target = "_blank"; // Open link in new tab
      message = message.replace(fullMatch, linkElement.outerHTML);
      liveTypeMessageWithLInk(bubble, message, timestamp);
    } else {
      liveTypeMessage(bubble, message, timestamp); // Pass the timestamp to the typing effect function
    }
    // end
  }
  scrollToLatestMessage();
}

// when bot return some link in result
// started
function liveTypeMessageWithLInk(element, message, timestamp) {
  let i = 0;
  const typingSpeed = 50; // milliseconds

  function typeChar() {
    scrollToLatestMessage();
    if (i < message.length) {
      if (message.charAt(i) === "<") {
        // Check if the current character is part of an HTML tag
        let endIndex = message.indexOf(">", i); // Find the closing bracket of the tag
        if (endIndex !== -1) {
          element.innerHTML += message.substring(i, endIndex + 1);
          i = endIndex + 1; // Move the index to after the closing bracket
        } else {
          // If closing bracket not found, treat it as a regular character
          element.innerHTML += message.charAt(i);
          i++;
        }
      } else {
        element.innerHTML += message.charAt(i);
        i++;
      }
      scrollToLatestMessage();

      setTimeout(typeChar, typingSpeed);
    } else {
      var containers = document.getElementsByClassName("chat-bubble1");
      // Loop through each element
      for (let i = 0; i < containers.length; i++) {
        var text = containers[i].textContent;

        // Regular expression to match URLs
        var urlRegex = /(https?:\/\/[^\s.]+\.[^\s]+)/g;

        // Replace URLs with anchor tags
        var replacedText = text.replace(urlRegex, function (url) {
          // If URL ends with a period, remove it
          if (url.endsWith(".")) {
            url = url.slice(0, -1);
          }
          return '<a href="' + url + '" target="_blank">' + url + "</a>";
        });

        // Update the HTML of the element with the replaced text
        containers[i].innerHTML = replacedText;
      }
      element.appendChild(timestamp); // Append the timestamp after the message is typed
      scrollToLatestMessage();
    }
  }

  typeChar();
}
// ended

// Function to simulate live typing
function liveTypeMessage(element, message, timestamp) {
  let i = 0;
  const typingSpeed = 50; // milliseconds

  function typeChar() {
    if (i < message.length) {
      element.textContent += message.charAt(i);
      i++;
      scrollToLatestMessage();
      setTimeout(typeChar, typingSpeed);
    } else {
      element.appendChild(timestamp); // Append the timestamp after the message is typed
      scrollToLatestMessage();
    }
  }

  typeChar();
}

// Function to create a timestamp span
function createTimestamp() {
  const timestamp = document.createElement("span");
  const now = new Date();
  const timeString =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  timestamp.textContent = timeString;
  timestamp.classList.add("timestamp");
  return { timestamp, timeString };
}

// Function to clear the user input field
function clearUserInput() {
  document.querySelector(".userinput").value = "";
}

// Event listener for the submit button
document
  .querySelector(".sendbutton")
  .addEventListener("click", function (e) {
    e.preventDefault();
    const inputElement = document.querySelector(".sendbutton")?.blur();
    const userMessage = document.querySelector(".userinput").value.trim(); // Trim the input
    if (userMessage.length >= 2) {
      // Check if the message has at least 2 characters
      displayChatBubble("user", userMessage);
      postMessageToAPI(userMessage);
      clearUserInput();
      scrollToLatestMessage();
    }
  });

// Event listener for Enter key press in the chat input field
document
  .querySelector(".userinput")
  .addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      const inputElement = document.querySelector(".sendbutton")?.blur();
      scrollToLatestMessage();
      const userMessage = event.target.value.trim(); // Trim the input
      if (userMessage.length >= 2) {
        // Check if the message has at least 2 characters
        displayChatBubble("user", userMessage);
        postMessageToAPI(userMessage);
        clearUserInput();
      }
    }
  });

// Displaying the welcome message when the chat window loads
window.onload = async function () {
  if (firstUserId) {
    // started
    const chatContainer = document.querySelector(".chat-container");
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble1");
    bubble.classList.add("bot");
    bubble.classList.add("bubble");
    bubble.style.width = "100%";
    bubble.style.justifyContent = "center";
    bubble.style.alignItems = "center";
    bubble.style.display = "flex";
    const image = document.createElement("img");
    image.src = "/images/bubble.svg";
    image.style.marginBottom = "2px";
    image.style.width = "30px";
    image.style.bottom = "unset";
    image.style.left = "unset";
    chatContainer.style.marginBottom = "5px";
    bubble.textContent += "Loading";

    bubble.appendChild(image);
    chatContainer.appendChild(bubble);
    await conversationFromDb((data) => {
      if (data?.length === 0) {
        displayChatBubble(
          "bot",
          "Hi, I'm PawPal, the virtual companion dog. What's your name?"
        );
      } 
        bubble.remove();
        scrollToLatestMessage();
    });
  } else {
    displayChatBubble(
      "bot",
      "Hi, I'm PawPal, the virtual companion dog. What's your name?"
    );
  }
};
