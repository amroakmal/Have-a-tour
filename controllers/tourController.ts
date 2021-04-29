import { NextFunction, Request, Response } from "express";

const TourModel = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppErrorTour = require('../utils/appError');

interface Req extends Request {
    requestTime: number
}

exports.aliasTopTours = (req: {query: {limit: number, sort:string, fields: string}}, res: object, next: Function) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,summary,ratingsAverage,difficulty';
    next();
}

exports.getTour = catchAsync(async(req: Req, res: Response, next: NextFunction) => {
    const tour = await TourModel.findById(req.params.id);
    
    if(!tour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        data: {
            tour
        }
    });    
});

exports.createTour = catchAsync(async (req: {requestTime: number, body: object}, res: {status: Function}, next: Function) => {
    const newTour = await TourModel.create(req.body);
    res.status(201).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 1,
        data: {
            newTour
        }
    });
});

exports.getAllTours = catchAsync(async (req: {requestTime: number, query: string}, res: {status: Function}, next: Function) => {
    //await the "query" variable to get executes, i.e. execute the query variable by making the required
    //query and return the results to the tours variable
    const features = new APIFeatures(TourModel.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query;
    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        requestTime: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
})

exports.updateTour = catchAsync(async (req: {requestTime: number, body: object, params: {id: number}}, res: {status: Function}, next: Function) => {
    const updatedTour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!updatedTour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 1,
        data: {
            updatedTour
        }
    });
});

exports.deleteTour = catchAsync(async (req: {requestTime: number, params: {id: number}}, res: {status: Function}, next: Function) => {
    const tour = await TourModel.findByIdAndDelete(req.params.id);

    if(!tour) {
        return next(new AppErrorTour(`No tour found with the given ID: ${req.params.id}`, 404));
    }

    res.status(204).json({
        status: 'success',
        responseTime: Date.now() - req.requestTime,
        results: 0,
        data: null
    });
});

exports.getTourStats = catchAsync(async(req: object, res: {status: Function}, next: Function) => {
    const stats = await TourModel.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: { 
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async(req: {params: {year: number}}, res: {status: Function}, next: Function) => {
    const year = req.params.year * 1;
    const plan = await TourModel.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStart: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { 
                _id: 0
            }
        },
        {
            $sort: { numToursStart: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

export {};