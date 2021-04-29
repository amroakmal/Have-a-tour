const AppErrorErr = require('../utils/appError');

const handleCastErrorDB = (err: {path: string, value: string}) => {
    return new AppErrorErr(`Invalid input. ${err.path}: ${err.value}`, 400);
}

const handleDuplicateFieldsDB = (err: {keyValue: {name: string}}) => {
    return new AppErrorErr(`Duplicate field value. Value '${err.keyValue.name}' already exists`, 400);
}

const handleValidationErrorDB = (err: {errors: object}) => {
    const errors = Object.values(err.errors).map((el) => el['message']);
    return new AppErrorErr(`Invalid inputs. Errors: ${errors.join('. ')}`, 400);
}

const sendErrorDev = (err: {statusCode: string, status: string, message: string, stack: string}, res: {status: Function}) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err, 
        stack: err.stack
    });
}

const sendErrorProd = (err: any, res: {status: Function}) => {
    if(err.isOperational || 1) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.log("Non operational");
        //Log the error for us, the developers
        // console.error('ERROR!\n', err);

        //Send generic message for the client
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong!'
        })
    }
}

const handleJWTError = (err: object) => new AppErrorErr('Invalid token. Please login again', 401);

const handleJWTExpiredError = (err: object) => new AppErrorErr('Your token has expired. Please login again', 401);

module.exports = (err: any, req: object, res: any, next: Function) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = Object.create(err)
        if(error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if(error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if(error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if(error.name === 'JsonWebTokenError') {
            error = handleJWTError(error);
        }
        if(error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(error);
        }
        sendErrorProd(error, res);
    }
};

export{};