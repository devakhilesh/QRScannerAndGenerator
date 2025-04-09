
 
require("dotenv/config");
const mongoose = require("mongoose");
const cluster = require("cluster");
const os = require("os");
const app = require("./app");

// Check if the current process is a master process
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  console.log(`Master process is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  mongoose
    .connect(process.env.MONGODB_URL_LOCAL)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error(err.message); 
    });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Worker ${process.pid} is running on port ${port}`);
  });
}
  