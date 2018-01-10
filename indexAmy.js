// TO ASK UNCLE DAVID:

// Why use encrypted:false instead of encrypted:ENCRYPTION_OFF?
// Any circumstances where we'd need add or buildHeader to return one of their own parameters? 
	// The calling code just passed that parameter in, so should already have a way to access it.
	// It's an element, not a primitive, so it's effectively passed by reference (no need to worry about it being out-of-date). 
	// When would the calling code not be able to just access that element on its own, without using the return value?
// Given that keys are properties, and buildRet is going through a list of keys, under what circumstances would "obj.hasOwnProperty(key)" be false?
// If that ever were false, what would "console.log(key + " -> " + p[key]);" do exactly? Specifically, what is "p" in this context? 
	// It looks like an array, but there's no such array defined, and when I tried accessing it, I got "undefined" errors.
// Why define an empty function for onCompleted, but no function for onError, in the anonymous object passed to subscribe()?

// connect to neo4j
var authToken = neo4j.v1.auth.basic("neo4j", "neo4j");			// According to the manual, the strings are a username and password,  "neo4j" is the default for both.
console.log(authToken);											// This should just record the value of authToken, I think.
var driver = neo4j.v1.driver("bolt://localhost", authToken, {	// Creates a driver to interact with neo4j. "bolt" means a direct connection. "localhost" means on THIS computer.
	encrypted:false												// It's clear what's meant by this line, but the documentation says it should be ENCRYPTION_OFF.
																// Ask Uncle David whether this is a different version, an alternate syntax or a mistake.
});

var session = driver.session();									//Create a session, using that driver, which will run the transactions.

function add(element,elementString,value){ // used to add cells to table. So far, element has always been a table row and elementString has always been "td".
  var elChild = document.createElement(elementString); 	// Create a new element of the type defined by elementString (for a table, "td")
  elChild.appendChild(document.createTextNode(value));	// Create text using the value that was passed in (for a table, the text to go in the cell), and adds it as a child of the new element
	element.appendChild(elChild);						// Add the new element as a child of the one that was passed in
  return(element);										// Return the original element. None of the existing code uses this, but I suppose later code could need it.
}

function buildHeader(tr){ // build table header given the row where the headers should go
	var obj = JSON.parse(document.getElementById("return").value);	// Parse the return string as a JSON object with key: value pairs.
																	// Keys are the database's names for attributes; 
																	// values are the names the user wants to see in the table.
  add(tr,"th","#");				// Add a number sign to the given table row as the first header - the first column just counts the records.
	for (var key in obj) {		// Then go through all the key: value pairs...
	  add(tr,"th",obj[key])		// and add the VALUE (the name the USER wants to use) to the give table row.
	}
	return(tr); // Return the original row. Again, not used by existing code, but might be needed later.
}


function buildRet(str){ // build return part of CypherQuery. The argument is the text from the "Return" text box in index.html.
	// AMY'S NOTES: Called by build(), does not call any function.
	var obj = JSON.parse(str), ret=""; 	// Parse the text into a JSON object. The text was formatted as "{"attribute1": "name1", "attribute2": "name2"...}.
										// So it will be parsed as an object with key:value pairs - 
										// the key is the attribute, and the value is the name the user wants to give that attribute.

	for (var key in obj) {
	  if (obj.hasOwnProperty(key)) {	// This should nearly always be true, because the keys are considered properties of the object. 
										// Ask Uncle David under what circumstances it would be false, and what the purpose of the other branch is.
	    ret += key+", " ;				// Concatenate the keys into a list separated by commas and ending in ", "
	} else{
			console.log(key + " -> " + p[key]); //NOTE: I understand most of this one, but not what p is. It doesn't seem to be defined - ask Uncle David.

		}
	}
	return(ret.slice(0,ret.length-2));	// Remove the final ", " from the list of keys and return the rest.
}


function build(){ // build CypherQuery and save in HTML
	// AMY'S NOTES: Called when anything but the CypherQuery text box in indexAmy.html is deselected. Calls buildRet().
	// AMY: I changed the logic here to leave out the entire WHERE clause if the user didn't enter anything, since that clause is optional.
	document.getElementById("statement").value =
	   " match " + document.getElementById("match").value
		+ ((document.getElementById("where").value == "")? "" : " where " + document.getElementById("where").value)
		+" return "+ buildRet(document.getElementById("return").value);
}

function run() {  // run CypherQuery
	// AMY'S NOTES: Called when the CypherQuery text box in indexAmy.html is deselected. Calls buildHeader() and add().
	var statement = document.getElementById("statement").value; 

	// delete previous results
	var results = document.getElementById("results"); 	// Get the existing list of results...
	while(results.childElementCount > 0) {				// and as long as there are still items on the list...
		results.removeChild(results.children[0]);		// remove the first one.
	}

	// build table with results from query
	var table = document.createElement("table");	// Create the table...

	// build headers
	var tr = document.createElement("tr");			// Create a new row for the table...
	table.appendChild( buildHeader(tr) );			// call buildHeader() on that row to write the headers, and add them to the table.

	// put data from query into table
	var recordCount = 0;							// Count the records as they're listed.
	session.run(statement, {}).subscribe({			// The session.run(statement, {}) part actually does the transaction. The {} is an empty list of parameters.
													// Normally, you'd put placeholders in statement, then use the parameter list to fill them in.
													// Session.run() returns a Result, which then runs its subscribe() function. That takes an object as a variable.
													// This one uses an anonymous object, with its onNext and onCompleted functions defined.
	
		onNext: function(record) {					// The onNext function describes what to do with each record -- in this case, add all its data to the table.
			// On receipt of RECORD
			tr = document.createElement("tr");		// Create a new row...
			add(tr,"td",++recordCount); // ...add record count to first column of table (but first increment it)...
			record.forEach( function( value ) {
				add(tr,"td",value);  // ...add remaining data for record
			});
			table.appendChild(tr);	// When the row is done, add it to the table.
		},
		onCompleted: function(metadata) { 	// The onCompleted function describes what to do when all records have been processed. 
											// NOTE: Ask Uncle David why he included an empty function for this, but didn't define onError at all.

		}
	});

	results.appendChild(table);  // add results to html
}
