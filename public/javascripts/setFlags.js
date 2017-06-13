/**
 * Handles the Front end for 'highlighting' fields
 */

//global glyph values
var star = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';
var empty_star = '<span class="glyphicon glyphicon-star-empty" aria-hidden="true"></span>'


$(document).ready(init);

function init() {

    setupHlFlags();

    $('.container').on('click', '.highlight', toggleHL);
}

/**
 * find all fields that can be highlighted and initialize the pretty pictures
 * //search by class name 'highlight' and replace innerText one of the global glyph variables
 */
function setupHlFlags() {
    $(".highlight").each(function (index, obj) {
        if(obj.innerText == "true"){
            obj.innerHTML = star;
        }
        else
        {
            obj.innerHTML = empty_star;
        }
    });
}

//Checks the html for the span tag passed in and returns opposite glyph
function toggleHlGlyph(span) {
    if(span == star){
        span = empty_star;
    }
    else{
        span = star;
    }
    return span;
}

/**
 * Handles the click event for the highlight function
 */
function toggleHL() {
    //get the HTML object with the star/empty-star as well as the field name from the API
    var flag = $(this);
    var field = $(this).attr('id');
    console.log("Value to update: " + field);
    console.log("Highlight Package ID: " + $("#hl_Id").val());

    //sending only the field name to the API
    var payload = {};
    payload.name = field;

    //POST the data to the database
    var posting = $.ajax({
        type : 'POST',
        url: "/catalyst/edit/highlight/" + $("#hl_Id").val(),        //need to append the HighlightPackage ID to the URL
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(payload)
    });
    posting.done(function (xhr) {
        if(xhr.status == 200) {
            //on success, toggle the glyph icon
            flag[0].firstChild.outerHTML = toggleHlGlyph(flag[0].firstChild.outerHTML);
        }
        else{
            console.log("API failed to update. returned status: " + xhr.status);
        }
        // If code is not 200 forward below to .fail()
    });

    posting.fail(function (data)
    {
        console.log("Ajax call failed");
    });
}