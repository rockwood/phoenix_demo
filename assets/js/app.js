// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

document.querySelectorAll(".comment-box").forEach((commentBox) => {
  let channel = socket.channel(`comment:post_${commentBox.dataset.id}`, {})
  let commentList = commentBox.querySelector(".comment-list")
  let commentInput = commentBox.querySelector(".comment-input")

  commentInput.addEventListener("keypress", event => {
    if(event.keyCode === 13) {
      channel.push("shout", {body: commentInput.value})
      commentInput.value = ""
    }
  })

  channel.on("shout", (payload) => {
    let commentItem = document.createElement("div");
    commentItem.className = "well"
    commentItem.innerText = payload.body
    commentList.appendChild(commentItem)
  })

  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
})
