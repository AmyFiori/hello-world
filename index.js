// connect to new4j
var authToken = neo4j.v1.auth.basic("neo4j", "neo4j");
console.log(authToken);
var driver = neo4j.v1.driver("bolt://localhost", authToken, {
	encrypted:false
});

var session = driver.session();

function add(element,elementString,value){ // used to add cells to table
  var elChild = document.createElement(elementString);
  elChild.appendChild(document.createTextNode(value));
	element.appendChild(elChild);
  return(element);
}

function buildHeader(tr){ // build table header
	var obj = JSON.parse(document.getElementById("return").value);
  add(tr,"th","#");
	for (var key in obj) {
	  add(tr,"th",obj[key])
	}
	return(tr);
}


function buildRet(str){ // build retun part of CuypherQuery
	var obj = JSON.parse(str), ret="";

	for (var key in obj) {
	  if (obj.hasOwnProperty(key)) {
	    ret += key+", " ;
	  } else{
			console.log(key + " -> " + p[key]);
		}
	}
	return(ret.slice(0,ret.length-2));
}


function build(){ // CypherQuery and save in html
	document.getElementById("statement").value =
	   " match " + document.getElementById("match").value
		+" where " + document.getElementById("where").value
		+" return "+ buildRet(document.getElementById("return").value);
}

function run() {  // run CypherQuery
	var statement = document.getElementById("statement").value;

	// delete prevouse results
	var results = document.getElementById("results");
	while(results.childElementCount > 0) {
		results.removeChild(results.children[0]);
	}

	// build table with resuts from query
	var table = document.createElement("table");

	// build headers
	var tr = document.createElement("tr");
	table.appendChild( buildHeader(tr) );

	// put data from query into table
	var recordCount = 0;
	session.run(statement, {}).subscribe({
		onNext: function(record) {
			// On receipt of RECORD
			tr = document.createElement("tr");
			add(tr,"td",++recordCount); // add record count to first colum of table
			record.forEach( function( value ) {
				add(tr,"td",value);  // add remaining data for record
			});
			table.appendChild(tr);
		},
		onCompleted: function(metadata) {

		}
	});

	results.appendChild(table);  // add results to html
}
