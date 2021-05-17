const express = require('express');
const Guitar = require('../models/guitar');
const authenticate = require('../authenticate');
const cors = require('./cors');

const guitarRouter = express.Router();

guitarRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Guitar.find()
    .then(guitars => {
        console.log(guitars);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(guitars);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.create(req.body)
    .then(guitar => {
        console.log('Guitar Created ', guitar);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(guitar);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /guitars');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

guitarRouter.route('/:guitarId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(guitar);
        } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`${req.params.guitarId} does not match any guitars in database`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /guitars/${req.params.guitarId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findByIdAndUpdate(req.params.guitarId, {$set: req.body}, { new: true })
    .then(guitar => {
        if (guitar) {
            console.log(guitar);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(guitar);
        } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`${req.params.guitarId} does not match any guitars in database`); 
        }
    })  
    .catch(error => next(error));
}) 
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findByIdAndDelete(req.params.guitarId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

guitarRouter.route('/:guitarId/history')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    //.populate('history')
    .then(guitar => {
        if (guitar) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(guitar.history);
        } else {
            err = new Error(`Guitar ${req.params.guitarId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar) {
            guitar.history.push(req.body);
            guitar.save()
            .then(guitar => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(guitar);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /guitars/history`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar) {
            for (let i = (guitar.history.length-1); i >= 0; i--) {
                guitar.history.id(guitar.history[i]._id).remove();
            }
            guitar.save()
            .then(guitar => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(guitar);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Guitar ${req.params.guitarId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

guitarRouter.route('/:guitarId/history/:historyId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar && guitar.history.id(req.params.historyId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(guitar.history.id(req.params.historyId));
        } else {
            err = new Error(`History item ${req.params.historyId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /guitars/${req.params.guitarId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar) {
            const history = guitar.history;
            const item = history.filter(arr => arr.id == req.params.historyId);
            if (req.body.date) {
                item.id(req.params.historyId).date = req.body.date;
                console.log(req.body.date);
            }
            if (req.body.item) {
                item.id(req.params.historyId).item = req.body.item;
                console.log(req.body.item);
            }
            if (req.body.cost) {
                item.id(req.params.historyId).cost = req.body.cost;
                console.log(req.body.cost);
            }
            console.log(item);
            guitar.save()
            .then(guitar => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(guitar.history);
            })
            
        } else {
            err = new Error(`Guitar ${req.params.guitarId} not found in collection`);
            err.status = 404;
            return next(err);
        }   
    })  
    .catch(err => next(err)); 
}) 
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Guitar.findById(req.params.guitarId)
    .then(guitar => {
        if (guitar && guitar.history.id(req.params.historyId)) {
            const item = guitar.history.filter(arr => arr.id !== req.params.historyId);           
            guitar.history = item;
            console.log(guitar.history);
            guitar.save()
            .then(guitar => {               
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(guitar);
            })
            .catch(err => next(err)); 
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        } 
    })
    .catch(err => next(err));
});


module.exports = guitarRouter;