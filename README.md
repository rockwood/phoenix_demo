# Demo

### 1. Install Phoenix 1.3

    mix archive.install https://github.com/phoenixframework/archives/raw/master/phx_new.ez

### 2. Create a new Phoenix project

    mix phx.new demo

### 3. Create the database

    cd demo
    mix ecto.create

Heads Up! If you get an error, run `psql postgres -c "CREATE ROLE postgres LOGIN CREATEDB;"`

### 4. Start the server

    mix phx.server
    open http://localhost:4000

### 5. Render posts list

lib/demo/web/router.ex

```elixir
resources "/posts", PostController
```

/lib/web/controllers/post_controller.ex

```elixir
defmodule Demo.Web.PostController do
  use Demo.Web, :controller

  def index(conn, _params) do
    posts = [
      %{id: 1, title: "My first post"},
      %{id: 2, title: "My second second"},
    ]
    render(conn, "index.html", posts: posts)
  end
end
```

/lib/demo/web/views/post_view.ex

```elixir
defmodule Demo.Web.PostView do
  use Demo.Web, :view
end
```

/lib/demo/web/templates/post/index.html

```html
<table>
  <%= for post <- @posts do %>
    <tr>
      <td><%= post.title %></td>
      <td><a class="btn btn-default" href="<%= post_path(@conn, :show, post.id) %>">Show</a></td>
    </tr>
  <% end %>
</table>
```

### 6. Generate the rest (Answer Y to override existing files)

    mix phx.gen.html Blog Post posts title:string body:text

# Deploying to Heroku

### 1. Install the Heroku CLI

https://devcenter.heroku.com/articles/heroku-cli#download-and-install

### 2. Create an app

    heroku apps:create seoul-phoenix-demo
    heroku git:remote -a seoul-phoenix-demo

### 3. Install buildpacks

    heroku buildpacks:add https://github.com/HashNuke/heroku-buildpack-elixir.git
    heroku buildpacks:add https://github.com/gjaldon/heroku-buildpack-phoenix-static.git

### 4. Setup postgres

    heroku addons:create heroku-postgresql:hobby-dev

### 5. edit config/prod.exs

Under `config :your_app, YourApp.Web.Endpoint,` Update:

    url: [scheme: "https", host: "YOUR_APP.herokuapp.com", port: 443],
    force_ssl: [rewrite_on: [:x_forwarded_proto]]

Under `config :your_app, YourApp.Repo,` Update:

    url: System.get_env("DATABASE_URL"),
    ssl: true

### 6. Push

    git add .
    git commit -m "Initial commit"
    git push heroku master

### 7. Migrate the heroku database

    heroku run mix ecto.migrate

# Using Channels

### 1. Add Comments

lib/demo/web/templates/post/show.html

```html
<div class="comment-box" data-id="<%= @post.id %>">
  <h4>Realtime Comments</h4>

  <div class="comment-list"></div>

  <div class="form-group">
    <input class="comment-input form-control"/>
  </div>
</div>
```

/assets/js/app.js

```js
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

```

### 9. Generate the channel

    mix phx.gen.channel comment

lib/demo/web/channels/user_socket.ex

```elixir
channel "comment:*", PreDemo.Web.CommentChannel
```

lib/demo/web/channels/comment_channel.ex

```elixir
def join("comment:post_" <> post_id, ...
```
