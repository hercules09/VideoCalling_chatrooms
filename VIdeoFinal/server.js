//Create our express and socket.io servers
const express = require("express");
const app = express();

const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");  // Tell Express we are using EJS
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));    // Tell express to pull the client script from the public folder

app.get("/", (req, res) => {          // If they join the base link, generate a random UUID and send them to a new room with said UUID
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {     // If they join a specific room, then render that room
  res.render("room", { roomId: req.params.room });
});
let count = 0;
let activeCount = 0;
let users = [];

io.on("connection", socket => {
  
  socket.on("raise-hand", function() {
    count = count + 1;
    console.log("Raise Hands " + count);
  });
  socket.on("hand-raised", function() {
    count = count - 1;
    console.log("Raise Hands " + count);
  });
});

// When someone connects to the server
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {      // When someone attempts to join the room
    socket.join(roomId);                                      // Join the room
    socket.to(roomId).broadcast.emit("user-connected", userId);  // Tell everyone else in the room that we joined
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});


server.listen(process.env.PORT || 3030);
