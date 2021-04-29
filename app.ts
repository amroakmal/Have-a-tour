import express from "express";
const app = express();

// const AppError = require('./utils/appError');
// import AppError from './utils/appError';
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

console.log("Enviroment:", process.env.NODE_ENV);
console.log("Port:", process.env.PORT);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req: any , res: object, next: Function) => {
    req.requestTime = new Date();
    const delay = Math.floor(Math.random() * 10) * 1000;
    next();
    // console.log(delay);
    // setTimeout(() => next(), delay);
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// app.use((req, res) => {
//     return res.status(404).json({
//         status: 'failed',
//         message: 'Page not found'
//     })
// });

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find the ${req.originalUrl} on the server`);
    // err.statusCode = 404;
    // err.status = 'fail';
    // next(err);
    
    next(new AppError(`Can't find the ${req.originalUrl} on the server`, 404));
});

//Create Global error handling middleware
app.use(globalErrorHandler)

module.exports = app;
