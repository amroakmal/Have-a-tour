import mongoose from "mongoose";
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Too long name'],
        minlength: [4, 'Too short name'],
        // validate: [validator.isAlpha, 'Name should contain letters only']
    },
    slug: String,
    price: {
        type: Number,
        required: [true, 'A Tour must have a price']
    },
    duration: {
        type: Number,
        required: [true, 'A duration must be specified']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A group size for the tour must be given']
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty must be specified'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Unsupported difficulty'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, `Rating can't be more than 5`],
        min: [1, `Rating can't be less than 1`]
    },
    ratingsQuantity: {
        type: Number, 
        default: 0
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(this: {price: number}, val: number) {
                return val < this.price;
            },
            message: 'Discount Price which is ({VALUE}) greater than main price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    }, 
    description: {
        type: String,
        trim: true
    }, 
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }, 
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.pre('save', function(this: any, next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', function(next) {
//     console.log('Saving the new document');
//     next();
// });

// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// })

tourSchema.pre(/^find/, function(this: any, next: Function) {
    this.find({ secretTour: { $ne:  true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(this: any, doc, next: Function) {
    this.end = Date.now() - this.start;
    next();
});

tourSchema.pre('aggregate', function(this: any, next: Function) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

tourSchema.virtual('durationWeeks').get(function(this: any) {
    return this.duration / 7;
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;