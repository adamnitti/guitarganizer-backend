const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const historySchema = new Schema({
    date: {
        type: Date,
        required: false
    },
    item: {
        type: String,
        required: true
    },
    cost: {
        type: Currency,
        required: false,
        min: 0
    }
}, {
    timestamps: true
});

const guitarSchema = new Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    sn: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    favorite: {
        type: Boolean,
        default: false
    },
    history: [historySchema]
}, {
    timestamps: true
});

const Guitar = mongoose.model('Guitar', guitarSchema);

module.exports = Guitar;