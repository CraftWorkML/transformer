
let appHost = "https://demoapp.com/api"//process.env.REACT_APP_BACKEND_HOST;
let appPort = ""//process.env.REACT_APP_BACKEND_PORT;
console.log("host and 2 port",appHost, appPort);

function getCookie(name) {
	let cookie = {};
	document.cookie.split(';').forEach(function(el) {
	  let split = el.split('=');
	  cookie[split[0].trim()] = split.slice(1).join("=");
	})
	if (name in cookie) {
		return cookie[name];
	}
	return "";
	
  }

export const Login = async () => {
	try {	
		// +1 день от текущей даты
		let date = new Date(Date.now() + 86400e3);
		date = date.toUTCString();
		const callback="https://demoapp.com/auth";
		let cookie = `callback=${callback}; expires=` + date;
		console.log("cookie=",cookie);
		if (getCookie("callback") === "")
		{
			document.cookie = cookie;
		}
    	const resp = await fetch(`${appHost}${appPort}/login`);
    	if (resp.ok) {
        	const payload = await resp.json();
			console.log(payload);
			window.location.replace(payload.ref);
			return {"status": true}
        //return { response: payload, err: null };
    } else {
		return { response: null, err:"documents can not be retrieved"};
	}
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
}

export const GetAccount = async () => {
	try {	
		const resp = await fetch(`${appHost}${appPort}/account`, {
			method: 'GET',
			credentials: 'include'});
    	if (resp.ok) {
        	const result = await resp.json();
			return { response: result.payload, err:"documents can not be retrieved"};	
		}
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
}

export const GetLogout = async () => {
	try {	
		const resp = await fetch(`${appHost}${appPort}/logout`, {
			method: 'GET'});
    	if (resp.ok) {
        	const result = await resp.json();
			return { response: "ok", err:null};	
		}
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
}

const prepareBytesToFile = (buffer) => {
	const temporaryFileReader = new FileReader();
	return new Promise((resolve, reject) => {
	  temporaryFileReader.onerror = () => {
		console.log("error happenned");
		temporaryFileReader.abort();
		reject(new DOMException("Problem parsing input file."));
	  };
  
	  temporaryFileReader.onload = () => {
		resolve(temporaryFileReader);
	  };
	  temporaryFileReader.readAsArrayBuffer(buffer);
	});
  };

export const postFile = async (payload) => {
	try {
    	var data = new FormData();
		var response={response: null, err:null};
		console.log("hi")
		let resultImage = new File([payload.file], payload.name);//await prepareBytesToFile(payload.file);
		console.log("result image is ", resultImage);
		//console.log(URL.createObjectURL(payload.file));
    	data.append("image", resultImage);
		data.append("user", payload.user);
		data.append("name", payload.name);
    	await fetch(
			`${appHost}${appPort}/image`, 
			{
            	method: 'POST',
				
            	body: data
            }).then(response => response.text()) // <--- 
            .then(data => 
			{
				console.log("data os", data);
				response.response=data;
            	//var obj = JSON.parse(data)["code"];
            	return { response: data, err:null};
			}
            );
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}

export const getFiles = async (payload) => {
	try {
		var response={response: null, err:null};
		console.log("hi");
    	await fetch(
			`${appHost}${appPort}/images?user=${payload.user}`, 
			{
            	method: 'GET'
            }).then(response => response.json()) // <--- 
            .then(data => 
			{
				console.log("data os", data["payload"]);
				response.response=data["payload"];
            	//var obj = JSON.parse(data)["code"];
            	return { response: data, err:null};
			}
            );
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}

export const getTracks = async (payload) => {
	try {
		var response={response: null, err:null};
		console.log("hi");
    	await fetch(
			`${appHost}${appPort}/tracks?user=${payload.user}`, 
			{
            	method: 'GET'
            }).then(response => response.json()) // <--- 
            .then(data => 
			{
				console.log("data os", data["payload"]);
				response.response=data["payload"];
            	//var obj = JSON.parse(data)["code"];
            	return { response: data, err:null};
			}
            );
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}


export const deleteFile = async (payload) => {
	try {
		var response={response: null, err:null};
		let body={user:payload.user, name:payload.name}
		console.log("BODDYIS", body);
		console.log("hi");
    	await fetch(
			`${appHost}${appPort}/images`, 
			{
            	method: 'DELETE',
				body: JSON.stringify(body),
            }).then(response => response.text()) // <--- 
            .then(data => 
			{
				console.log("data os", data);
				response.response=data;
            	//var obj = JSON.parse(data)["code"];
            	return { response: data, err:null};
			}
            );
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}

const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();
	console.log("input file", inputFile);
  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsDataURL(inputFile);
  });
};

export const craftTS = async (payload) => {
	try {
		var response={response: null, err:null};
		console.log("BODDYIS", payload);
		console.log("hi");
		var data = new FormData();
		data.append("ts", payload.file);
		data.append("predictor", payload.predictor);
		data.append("target", payload.target);
		var response={response: null, err:null, blob: null};
		
		var row;
    	await fetch(
			`${appHost}${appPort}/ml/ts`, 
			{
            	method: 'POST',
				body: data,
            }).then(response => response.json()) // <--- 
            .then(data => 
			{
				console.log("data os", data);
				response.response=data["arrays"];
            	//var obj = JSON.parse(data)["code"];
            	return { response: data, err:null};
			}
            );
	} catch(error) {
		return { response: null, err:"can not predict ts future"};
	}
	return response;
}

export const craftTrack = async (payload) => {
	try {
		var response={response: null, err:null, blob: null};
		let body={message:payload.message}
		console.log("BODDYIS", body);
		console.log("hi");
		var row;
    	await fetch(
			`${appHost}${appPort}/ml/track`, 
			{
            	method: 'POST',
				body: JSON.stringify(body),
            }).then(response => response.blob()) // <--- 
            .then(data => 
			{
				row = data
				return row
			}
            );
		response.blob = row;
		response.response = await readUploadedFileAsText(row);
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}


export const craftMessage = async (payload) => {
	try {
		var response={response: null, err:null, blob: null};
		let body={message:payload.message}
		console.log("BODDYIS", body);
		console.log("hi");
		var row;
    	await fetch(
			`${appHost}${appPort}/ml/message`, 
			{
            	method: 'POST',
				body: JSON.stringify(body),
            }).then(response => response.blob()) // <--- 
            .then(data => 
			{
				row = data
				return row
			}
            );
		response.blob = row;
		response.response = await readUploadedFileAsText(row);
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}

export const craftImage = async (payload) => {
	try {
		var data = new FormData();
		data.append("image", payload.file);
		data.append("message", payload.message);
		var response={response: null, err:null, blob: null};
		
		var row;
    	await fetch(
			`${appHost}${appPort}/ml/image`, 
			{
            	method: 'POST',
				body: data,
            }).then(response => response.blob()) // <--- 
            .then(blob => 
			{
				row = blob
				return row
			}
            );
		response.blob = row;
		response.response = await readUploadedFileAsText(row);
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}

export const craftMelody = async (payload) => {
	try {
		var data = new FormData();
		data.append("audio", payload.file);
		data.append("message", payload.message);
		var response={response: null, err:null, blob: null};
		
		var row;
    	await fetch(
			`${appHost}${appPort}/ml/melody`, 
			{
            	method: 'POST',
				body: data,
            }).then(response => response.blob()) // <--- 
            .then(blob => 
			{
				row = blob
				return row
			}
            );
		response.blob = row;
		response.response = await readUploadedFileAsText(row);
	} catch(error) {
		return { response: null, err:"documents can not be retrieved"};
	}
	return response;
}


/*
const addDocument = async (payload,{rejectWithValue }) => {
	try {
		const resp = await fetch(`${appHost}${appPort}/api/documents`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ path: payload.path, source: "file"}),
		});

		if (resp.ok) {
			const res = await resp.json();
			//return { todo };
			return {res}
		} else {
			return rejectWithValue("documents can not be added");
		}
	} catch(error) {
		return rejectWithValue("can not implement request with",
							   `${appHost}${appPort}/api/documents`,
							    " with error ", error);
	}
}
*/