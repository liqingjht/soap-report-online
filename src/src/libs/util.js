function ajaxDownloadFile(url) {
    $("#ajaxDownloadFileIframe").remove();
    var iframeStr = "<iframe id='ajaxDownloadFileIframe' style='display:none' src='";
    iframeStr += url;
    iframeStr += "'><iframe>";
    $(iframeStr).appendTo("body");
}

function commonApiFunc(type, url, settings, data, callback) {
    var options = {};
	var output_obj = {};

	options.contentType = "application/json";
    options.dataType = "html";
    options.type = type;
    options.url = url;
	options.async = true;
	try {
		options.data = !!data ? JSON.stringify(data) : "";
	}
	catch(err) {
		if(typeof callback === "function") {
			callback(err, {"msg": "Occur Error before send api"});
		}
		return {};
	}

	for (var key in settings) {
        options[key] = settings[key];
    }

    //options.beforeSend = function(request) {}

    options.success = function(data, status, request) {
        try {
            output_obj = (jQuery.parseJSON(data));
        } catch (err) {
            output_obj = {};
		}
		if (typeof callback === "function") {
			if(Object.keys(output_obj).length === 0)
				callback(true, {"msg": "Unknown Error"});
			else if(output_obj.status !== 0)
				callback(output_obj.status, {"msg": output_obj.message});
			else
				callback(false, output_obj.payload);
		}
    }

    options.error = () => {
        if (typeof callback === "function") {
            callback(true, {"msg": "HTTP Error"});
        }
    }

    $.ajax(options);

    return output_obj;
}

let util = {};

util.getApi = (url) => {
    return commonApiFunc("GET", url, { async: false });
}

util.getApiAsync = (url, callback) => {
    commonApiFunc("GET", url, {}, undefined, callback);
}

util.postApi = (url, data) => {
    return commonApiFunc("POST", url, { async: false }, data);
}

util.postApiAsync = (url, data, callback) => {
    commonApiFunc("POST", url, {}, data, callback);
}

util.putApi = (url, data) => {
    return commonApiFunc("PUT", url, { async: false }, data);
}

util.putApiAsync = (url, data, callback) => {
    commonApiFunc("PUT", url, {}, data, callback);
}

util.deleteApi = (url, data) => {
    return commonApiFunc("DELETE", url, { async: false }, data);
}

util.deleteApiAsync = (url, data, callback) => {
    commonApiFunc("DELETE", url, {}, data, callback);
}

util.ajaxDownloadFile = ajaxDownloadFile;

export default util;