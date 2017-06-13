//This is the FORM HANDLER for the application form called appForm in the applicationform.hbs view.
//This form, upon submit, creates jsonToSend by calling getApplicationFormJSON,
//which is a function that appends (extends) a JSON object by calling
//the get*****Data() functions below...

$(document).ready(init)

function init() {
	$('#appForm').submit(function (event) {
		event.preventDefault();
		var jsonToSend = getApplicationFormJSON();  //stringified in that function
		console.log(jsonToSend);
		
		//POST the data to the database
		var posting = $.ajax({
			type : 'POST',
			url: "/catalyst/application/add",
			dataType: 'json',
			contentType: 'application/json; charset=UTF-8',
			data: jsonToSend
		}); 
		
		//upon return, check for 200, then redirect so success page
		posting.done(function (xhr) {
			if(xhr.status == 200) {
				window.location.replace("/catalyst/application/success");
			}
			else{
				console.log("Whoops, something went wrong");
			}
			// If code is not 200 forward below to .fail()
		});
		
		posting.fail(function (data) 
		{
			console.log("Whoops, something went wrong");
			// The save failed, just do nothing and leave the form without losing their typed data
		}); 
	});

	//THIS is the function that calls all the other functions that piece together (extend)
	//all of the JSON in proper API format.
	function getApplicationFormJSON() {
		var data = {};
		
		$.extend(data, getAdvocateData());   //these should be self-explanetory
		$.extend(data, getApplicationData());
		$.extend(data, getFinanceData());
		$.extend(data, getPropertyData());
		$.extend(data, getRecruitmentData());
		
		return JSON.stringify(data);
	}

/// FIRST, we need to make some Helper Functions in order to
/// grab some specific items and turn them into 
/// data variables we can use in the above function calls.

	//this function figures out and returns the Language
	function getLanguage() {
		var data;
		if (getVal('input[name="language"]:checked') == "English") {
			data = "English";
		}
		else if (getVal('input[name="language"]:checked') == "Other") {
			data = getVal('input[name="language_other"]');
		}
		return data;
	}

	//this function figures out and returns the Home Type {} object
	function getHomeType() {
		var data = {};
		if (getVal('input[name="propertyType"]:checked') == "Other") {
			data = getVal('input[name="propertyType_other"]');
		}
		else {
			data = getVal('input[name="propertyType"]:checked');
		}
		return data;
	}

///Okay, so NOW we can call the rest of the functions listed in getApplicationFormJSON().
	
	//This function handles the data that goes into "advocate:"
	//section of the documentPackage.js
	function getAdvocateData() {
		var data = {};
		
		//start by setting variables to false
		var ind_bool = false;
		var npo_bool = false;
		var gov_bool = false;
		var advocate_bool = false;
		
		//check for different advocate types, set proper variables to true
		if (getVal('input[name="advocate"]:checked') == "adv_npo") {
			npo_bool = true;
			advocate_bool = true;
		}
			
		if (getVal('input[name="advocate"]:checked') == "adv_gov") {
			gov_bool = true;
			advocate_bool = true;
		}
		if (getVal('input[name="advocate"]:checked') == "adv_individual") {
			ind_bool = true;
			advocate_bool = true;
		}
		
		// create the JSON data object
		data.advocate = {
			is_advocate: advocate_bool,
			individual: ind_bool,
			npo: npo_bool,
			gov: gov_bool,
			name: getVal('input[name="advocate_name"]'),
			phone: getVal('input[name="advocate_phone"]'),
			relationship: getVal('input[name="advocate_individual_relationship"]'),
			organization_name: getVal('input[name="advocate_npo_organization"]')
		};
		return data;
	}

	
	//This function handles MOST of the data that goes into "application:"
	//section of the documentPackage.js (as well as status, which will 
	//send "new" from a hidden field)
	
	function getApplicationData() {
		var data = {};

		data.status = getVal('input[name="status"]');
		//data.created is created on the back end
		//data.updated is created on the back end

		data.application = {
			owns_home: getVal('input[name="owns_home"]:checked'),
			marital: {
				status: getVal('input[name="mStatus"]:checked'),
				spouse: getVal('input[name="spouse"]')
			},
			email: getVal('input[name="emailaddy"]'),
			veteran: getVal('input[name="military"]:checked'),
			language: getLanguage(),  //from helper function above
			heard_about: jQuery("textarea#hearAboutCatalyst").val(),
			name: {
				first: getVal('input[name="firstName"]'),
				middle: getVal('input[name="middleName"]'),
				last: getVal('input[name="lastName"]'),
				preferred: getVal('input[name="preferredName"]')
			},
			phone: {
				preferred: getVal('input[name="pPhone"]'),
				other: getVal('input[name="oPhone"]')
			},
			address: {
				line_1: getVal('input[name="add1"]'),
				line_2: getVal('input[name="add2"]'),
				city: getVal('input[name="city"]'),
				state: getVal('input[name="state"]'),
				zip: getVal('input[name="zip"]')
			},
			emergency_contact: {
				name: getVal('input[name="eContactName"]'),
				relationship: getVal('input[name="ecRelationship"]'),
				phone: getVal('input[name="ecPhone"]')
			},
			dob: {
				date: getVal('input[name="dob"]')
			},
			other_residents: {
				name: [
						getVal('input[name="additional_1"]'),
						getVal('input[name="additional_2"]'),
						getVal('input[name="additional_3"]'),
						getVal('input[name="additional_4"]'),
						getVal('input[name="additional_5"]'),
						getVal('input[name="additional_6"]'),
						getVal('input[name="additional_7"]'),
						getVal('input[name="additional_8"]')
					],
				age: [
						getVal('input[name="a1age"]'),
						getVal('input[name="a2age"]'),
						getVal('input[name="a3age"]'),
						getVal('input[name="a4age"]'),
						getVal('input[name="a5age"]'),
						getVal('input[name="a6age"]'),
						getVal('input[name="a7age"]'),
						getVal('input[name="a8age"]')
					],
				relationship: [
						getVal('input[name="a1relationship"]'),
						getVal('input[name="a2relationship"]'),
						getVal('input[name="a3relationship"]'),
						getVal('input[name="a4relationship"]'),
						getVal('input[name="a5relationship"]'),
						getVal('input[name="a6relationship"]'),
						getVal('input[name="a7relationship"]'),
						getVal('input[name="a8relationship"]')
					]
			},
			driver_license: {
				number: getVal('input[name="driversLicense"]')
			},
			special_circumstances: {
				note: jQuery("textarea#otherCircumstances").val()
			}
		};
		return data;
	}


	//This function handles the data that goes into "finance:"
	//section of the documentPackage.js
	function getFinanceData() {
		var data = {};
		data.finance = {
			mortgage: {
				payment: getVal('input[name="monthlyMortgage"]'),
				up_to_date: getVal('input[name="mortgage_up_to_date"]:checked')
			},
			income: {
				amount: getVal('input[name="annualIncome"]')
			},
			assets: {
				name: [
					getVal('input[name="assets1"]'),
					getVal('input[name="assets2"]'),
					getVal('input[name="assets3"]'),
					getVal('input[name="assets4"]'),
					getVal('input[name="assets5"]')
				],
				value: [
					getVal('input[name="assets1_value"]'),
					getVal('input[name="assets2_value"]'),
					getVal('input[name="assets3_value"]'),
					getVal('input[name="assets4_value"]'),
					getVal('input[name="assets5_value"]')
				]
			},
			client_can_contribute: {
				value: getVal('input[name="contribute"]:checked'),
				amount: getVal('input[name="contribute_amount"]')
			},
			associates_can_contribute: {
				value: getVal('input[name="relativeContribute"]:checked'),
				description: jQuery("textarea#relativeContribute_provide").val()
			},
			requested_other_help: {
				value: getVal('input[name="otherHelp"]:checked'),
				description: jQuery("textarea#otherHelp_provide").val()
			}
		}
		return data;
	}


	//This function handles the data that goes into "property:"
	//section of the documentPackage.js
	function getPropertyData() {
		var data = {};

		data.property = {
			home_type: getHomeType(),   //from helper function above
			ownership_length: getVal('input[name="timePropertyOwned"]'),
			year_constructed: getVal('input[name="yearPropertyBuilt"]'),
			requested_repairs: jQuery("textarea#repairsNeeded").val(),
			client_can_contribute: {
				value: getVal('input[name="laborHelp"]:checked'),
				description: jQuery("textarea#laborHelp_personal").val()
			},
			associates_can_contribute: {
				value: getVal('input[name="othersLaborHelp"]:checked'),
				description: jQuery("textarea#others_laborHelp").val()
			}
		};
		return data;
	}


	//This function handles the data that goes into "recruitment:"
	//section of the documentPackage.js
	function getRecruitmentData() {
		var data = {};

		data.recruitment = {
			fbo_help: getVal('input[name="fbo_help"]:checked'),
			fbo_name: getVal('input[name="fbo_name"]')
		};
		return data;
	}

	
	//This is a helper function so you can getVal on an input from the form
	function getVal(selector) {
		return $(selector).val();
	}
}




//DATA EXTRACTION WORK PARTS	
// for most inputs... (change name to id when necessary)
//: getVal('input[name=""]'),

//for text areas
//jQuery("textarea#otherCircumstances").val()

