const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TourModel = require('../../models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => console.log("Successfully connected to the DB"));

let tours = (fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
console.log("Type Before: ", typeof(tours));
tours = JSON.parse(tours);
console.log("Type After: ", typeof(tours));

//DELETE ALL DATA IN THE DB
const deleteData = async() => {
    try {
        console.log('RUN DELETE DATA FUNCTION');
        await TourModel.deleteMany();
        console.log('Successfully deleted all the documents/data from the DB')
    } catch(err) {
        console.log('Unable to delete documents from the DB');
        console.log(err);
    }
    process.exit();
}

//IMPORT DATA TO THE DB
const importData = async() => {
    try {
        console.log('RUN IMPORT DATA FUNCTION');
        await TourModel.create(tours);
        console.log('Successfully imported data and wrote them to the DB')
    } catch(err) {
        console.log('Failed to import new documents to the DB');
        console.log(err);
    }
    process.exit();
}

console.log("Process Argv: \n");
console.log(process.argv);

if(process.argv[2] === '--import') {
    console.log("IMPORT OPERATION\n");
    importData();
}

if(process.argv[2] === '--delete') {
    console.log("DELETE OPERATION\n");
    deleteData();
}