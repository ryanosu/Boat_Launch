import arrowTracker from "./background";

async function checkout(){
    if (arrowTracker == "undefined"){
        return;
    }
    // first, change the value in the database
    try {
        const url = `https://paprockr-project.uc.r.appspot.com/${arrowTracker}`
        var response = await fetch(url, {
            headers: {
                'Access-Control-Allow-Origin':'*',
    }
        }); //put request to database

        var changed_response = await response.json();
		console.log(changed_response);

    } catch (error) {
        console.error('Error posting data:', error);
    }

    // second, reload the values
    try {
        const url = "https://paprockr-project.uc.r.appspot.com/store"
		//const url = "http://localhost:8080/tests"
    	var response = await fetch(`${url}`, {
			headers: {
    		'Access-Control-Allow-Origin':'*',
  	}
		}); //get request to database

		var changed_response = await response.json();
		console.log(changed_response);

      	// enter the data
		document.getElementById('tube-total').innerHTML = changed_response[0]["tubes"];
		document.getElementById('kayak-total').innerHTML = changed_response[0]["kayaks"];
		document.getElementById('canoe-total').innerHTML = changed_response[0]["canoes"];

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
document.getElementById("bottom-button-checkout").addEventListener("click", checkout);