const mongoose = require('mongoose');

process.on('uncaughtException', (err: { name: string, message: string }) => {
    console.log("SHUTTING DOWN! --- Uncaught Exception\n");
    console.log(`Error name: ${err.name}`, "\n", `Error message: ${err.message}`);
    process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const DB = process.env.DATABASE!.replace('<password>', process.env.DATABASE_PASSWORD!);
mongoose.connect(DB, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => console.log("Successfully connected to the DB"));

const appp = require('./app.js');

const PORT = process.env.PORT || 3000;

const server = appp.listen(PORT, () => {
    console.log('App is running...');
})

process.on('unhandledRejection', (err: { name: string, message: string }) => {
    console.log("SHUTTING DOWN! --- Unhandled Rejection\n");
    console.log(`Error name: ${err.name}`, "\n", `Error message: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});