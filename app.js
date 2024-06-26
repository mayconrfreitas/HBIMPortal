// function getToken(callback) {
//     var url="https://360.autodesk.com/Viewer/GetAccessToken"
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//             var token = JSON.parse(xmlhttp.responseText);
//             callback(token['access_token'],token['expires_in']);
//         }
// 		else {
// 			console.log('[-] Error getting token')
// 		}
//     };
//     xmlhttp.open("GET", url, true);
//     xmlhttp.send();
// }

window.clientId = 'eY0IbyxgyNIY87lhVviady5yOLmD8gI0p08gTfVigExZ9unF';
window.clientSecret = 'JcmUTgZ4MdNBa02y6V9kBNR65KqeIMcSbHyEzUkHs9vT3I59fAdbmffG9Mr0NrFg';

function getToken(callback) {
    var url = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
    var xmlhttp = new XMLHttpRequest();
    var clientId = window.clientId;
    var clientSecret = window.clientSecret;
    var params = 'client_id=' + clientId + '&client_secret=' + clientSecret + '&grant_type=client_credentials&scope=data:read data:write';

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                var token = JSON.parse(xmlhttp.responseText);
				//console.log('[+] Token received', token['access_token'], token['expires_in']);
                callback(token['access_token'], token['expires_in']);
            } else {
                console.error('[-] Error getting token:', xmlhttp.responseText);
            }
        }
    };

    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);
}


function onDocumentLoadFailure(viewerErrorCode) {
	console.error('[-] onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}
function onDocumentLoadSuccess(doc) {
	//doc.getRootItem()
	// When using a ViewingApplication, we have access to the **bubble** attribute,
	// which references the root node of a graph that wraps each object from the Manifest JSON.
	
	var viewables = viewerApp.bubble.search({'type':'geometry'});
	if (viewables.length === 0) {
		console.error('[-] Document contains no viewables.');
		return;
	}
	// Choose any of the available viewables
	viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}
function onItemLoadFail(errorCode) {
	console.error('[-] onItemLoadFail() - errorCode:' + errorCode);
}

// ------------- HERE IS WHERE IT STARTS ---------------------  //
// ------------- This function is overwritten in appstart() -- //
function runApp(){};

function onItemLoadSuccess(viewerObj, item) {
	console.log('[+] Item loaded');
	// Congratulations! The viewer is now ready to be used.
	viewer = viewerApp.getCurrentViewer();
	// Now start doing stuff
	runApp();
	//load extensions
	//load sensor data
	//stuff
}

function appStart(docId, container, callback) {
	var options = {
	env: 'AutodeskProduction',
	//extensions: ['MyAwesomeExtension'],
	getAccessToken: getToken
	};
	
	runApp = callback;
	
	if (docId.indexOf('urn:')==-1)
		docId = 'urn:' + docId;
	
	Autodesk.Viewing.Initializer(options, function onInitialized() {
		viewerApp = new Autodesk.Viewing.ViewingApplication(container);
		viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
		viewerApp.loadDocument(docId, onDocumentLoadSuccess, onDocumentLoadFailure);
		//both callbacks take a doc object as an argument
	});
}