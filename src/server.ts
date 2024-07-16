const app = require("./app");

const port = process.env.PORT || 3000;

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED REJECTION! 🧨 Shutting down");
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERMEM RECIVED. Shutting down gracefully");

  server.close(() => {
    console.log("Process terminated");
  });
});
