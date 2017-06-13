/**
 * This script handles adding and removing of vetting notes
 * It works in both the application view and the phone call script
**/

$(document).ready(init);

function init() {

    $('#addNote').on('click', addNote);
    //since delete/update buttons are dynamically added, we use the table body ID to apply click listeners
    //the second parameter is the class name the click listener is applied to
    $('#notes-body').on('click', '.delete-button', deleteNote);
    $('#notes-body').on('click', '.update-button', setUpForm);
    $('#notes-body').on('click', '.submit-update-button', updateNote);
    $('#notes-body').on('click', '.cancel-button', cancelUpdate);

}

/**
 * When the add button is clicked, the following function is called
 *
 */
function addNote(e) {
    e.preventDefault(); //prevent page refresh/POST to this page

    //don't bother doing anything if text field was empty
    if($('#note').val() != "") {

        //otherwise, prepare payload with the application ID and the note contents
        var payload = {};
        payload.description = $('#note').val();
        payload.applicationId = $('#appId').val();

        //POST the data to the database
        var posting = $.ajax({
            type : 'POST',
            url: "/catalyst/view/addNote",
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(payload)
        });
        posting.done(function (xhr) {
            if(xhr.status == 200) {
                //check if the 'empty notes' row exists and delete if so
                var emptyNotes = $('#empty-notes');
                if(emptyNotes != null)
                {
                    emptyNotes.closest('tr').remove();
                }

                //build the new row
                //the date column to display
                var date = '<td>' + getDate() + '</td>';
                //new column for the new note
                var newNote = '<td>' + $('#note').val() + '</td>';
                //need to get the new note ID so it is available for immediate update/deletion
                var hiddenNoteId = '<input type="hidden" value="' + xhr.noteId + '" name="noteId" />';
                //build delete button
                var deleteButton = '<button type="submit" class="delete-button btn btn-danger">Delete Note</button>';
                //assemble all parts to build the new note row
                var newRow = '<tr class="success">' + date + newNote + '<td><form>' + hiddenNoteId + deleteButton + '</form></td></tr>';
                //add new row before the very last row in the table (input form row)
                $('#notes-body tr:last').before(newRow);
                //clear text area to prepare for new note
                $('#note').val("");
            }
            else{
                console.log("API submission for new note failed");
            }
            // If code is not 200 forward below to .fail()
        });

        posting.fail(function (data)
        {
            console.log("ajax failed to POST data");
        });

    }
}

/**
 * When the delete button is clicked, the following function is called
 *
 */
function deleteNote(e) {
    e.preventDefault(); //prevent page refresh/POST
    //get the note ID from the nearest hidden input field
    var noteId = $(this).closest("form").find("input[name='noteId']").val();
    //save note row object in variable
    var noteSelected = $(this);

    //payload needs the note id so it can be found and removed
    var payload = {};
    payload.noteId = noteId;

    var posting = $.ajax({
        type : 'POST',
        url: "/catalyst/view/delNote",
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(payload)
    });
    posting.done(function (xhr) {
        if(xhr.status == 200) {
            //remove row on successful document deletion
            noteSelected.closest('tr').remove();
        }
        else{
            console.log("API did not return 200 status for deleting note");
        }
    });
    posting.fail(function (data)
    {
        console.log("Ajax POST failed");
    });

}

/**
 * Sets up the html for editing
 * When the Update Note button is clicked, the form needs to transform to include new buttons and functions
 */
function setUpForm(e) {
    e.preventDefault();
    //the note we want will be the first child of the following search since it finds the closest <tr> to the button clicked
    var note = $(this).closest("tr").find(".note-descrip");
    //transform the text into a text area for editing
    note.html('<textarea id="note" class="form-control note-textarea" placeholder="Update Note Here...">' + note[0].innerText + '</textarea>');

    //change update note button to submit change button that will handle update submission
    $(this).val("Submit Update");
    $(this).attr("class", "submit-update-button btn btn-warning");
    //change delete button to cancel button to handle cancellation of updates
    var cancelButton = $(this).closest("td").find(".delete-button")
    cancelButton.val("Cancel");
    cancelButton.attr("class", "cancel-button btn btn-danger");
}

function updateNote(e) {
    e.preventDefault();
    //save items for after POST
    var note = $(this).closest("tr").find(".note-descrip");                     //the note row html object
    var updateButton = $(this);                                                 //associated update button
    var cancelButton = $(this).closest("td").find(".cancel-button");            //associated cancel button
    var noteId = $(this).closest("form").find("input[name='noteId']").val();    //associated note ID
    //using .value since innerHTML and others don't get updated when textarea is edited
    var notedDescrip = $(this).closest("tr").find(".note-textarea")[0].value;

    //build payload with the note idea and new note description
    var payload = {};
    payload.description = notedDescrip;
    payload.id = noteId;

    //POST the data to the database
    var posting = $.ajax({
        type : 'POST',
        url: "/catalyst/view/updateNote",
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(payload)
    });
    posting.done(function (xhr) {
        if(xhr.status == 200) {
            //revert form into just text after success
            note[0].innerHTML = notedDescrip;
            //revert buttons by changing button value and class
            updateButton.val("Update Note");
            updateButton.attr("class", "update-button btn btn-info");
            cancelButton.val("Delete Note");
            cancelButton.attr("class", "delete-button btn btn-danger");
        }
        else{
            console.log("API did not return 200 status for updating note");
        }
        // If code is not 200 forward below to .fail()
    });

    posting.fail(function (data)
    {
        console.log("Ajax POST failed");
    });
}

/**
 * If cancel button is clicked, undo the changes made by setup form and revert buttons and their class names
 *
 */
function cancelUpdate(e){
    e.preventDefault();
    var note = $(this).closest("tr").find(".note-descrip");
    var notedDescrip = $(this).closest("tr").find(".note-textarea")[0].innerHTML;
    var cancelButton = $(this);
    var updateButton = $(this).closest("td").find(".submit-update-button");

    //revert form into just text
    note[0].innerHTML = notedDescrip;
    //revert buttons
    updateButton.val("Update Note");
    updateButton.attr("class", "update-button btn btn-info");
    cancelButton.val("Delete Note");
    cancelButton.attr("class", "delete-button btn btn-danger");
}

//helper function to get date in a nice format
function getDate() {
    var date = new Date();
    var Year = date.getFullYear();
    var Day = ( "00" + date.getDate()).slice(-2);
    var Mon = ("00" + (date.getMonth()+1)).slice(-2);
    return Mon + "/" + Day + "/" + Year;
}