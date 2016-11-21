var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../mongoose/connection');
var DocumentPackage = require('../models/documentPackage');
var api = require('../controllers/api');


var Promise = require('bluebird'); // Import promise engine
mongoose.Promise = require('bluebird'); // Tell mongoose we are using the Bluebird promise library
Promise.promisifyAll(mongoose); // Convert mongoose API to always return promises using Bluebird's promisifyAll

// Helper query functions

//Need ObjectID to search by ObjectID
var ObjectId = require('mongodb').ObjectID;

/* Route to specific application by Object ID */
router.get('/:id', function(req, res) {
    //Checking what's in params
    console.log("Vetting Worksheet for " + ObjectId(req.params.id));

    /* search by _id. */
    Promise.props({
        application: DocumentPackage.find({_id: ObjectId(req.params.id)}).lean().execAsync()
    })
        .then(function(result) {
            //format birth date for display
            if(result.application[0].application.dob.date != null) {
                var dobYear = result.application[0].application.dob.date.getFullYear();
                //get month and day with padding since they are 0 indexed
                var dobDay = ( "00" + result.application[0].application.dob.date.getDate()).slice(-2);
                var dobMon = ("00" + (result.application[0].application.dob.date.getMonth()+1)).slice(-2);

                result.application[0].application.dob.date = dobYear + "-" + dobMon + "-" + dobDay;
            }
            res.locals.layout = 'b3-layout';         
            res.render('b3-worksheet-view', result.application[0]);
        })
        .catch(function(err) {
            console.error(err);
        });

});

function formatElement(element) {
    formatStatus(element);
    formatDate(element);
    return element;
}

/**
 * Takes the VERY long date in the DB and makes it into a nicer format
 * @param element
 * @returns {The element with formatted date}
 */
function formatDate(element)
{
    var Year = element.updated.getFullYear();
    //get month and day with padding since they are 0 indexed
    var Day = ( "00" + element.updated.getDate()).slice(-2);
    var Mon = ("00" + (element.updated.getMonth()+1)).slice(-2);
    element.updated = Mon + "/" + Day + "/" + Year;
    return element;
}

/**
 * Takes the status string from the DB and makes it more detailed for the front end
 * @param element
 * @returns {The element with wordier status}
 */
function formatStatus(element) {
    var status;

    switch (element.status){
        case 'new':
            status = 'NEW';
            break;
        case 'phone':
            status = 'Phone Call Needed';
            break;
        case 'handle':
            status = 'Handle-It';
            break;
        case 'documents':
            status = 'Awaiting Documents';
            break;
        case 'discuss':
            status = 'On Hold - Pending Discussion';
            break;
        case 'visit':
            status = 'Site Assessment';
            break;
        case 'approval':
            status = 'Approval Process';
            break;
        case 'declined':
            status = 'Declined';
            break;
        case 'withdrawn':
            status = 'Withdrawn';
            break;
        case 'project':
            status ='Approved Project';
            break;
        default:
            status = element.status;
    }

    element.status = status;
    return element;
}

module.exports = router;
