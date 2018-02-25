var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var childProcess = require("child_process");
var Excel = require('exceljs');
var path = require("path");
var fs = require('fs');

const port = 3000;
var taskList = [];
/*
var example = {
	token: "dafsdfdf2342df234sdf2",
	startTime: "234234234234234",
	moduleName: "example",
	version: "1.0.3.2",
	spec: "3.18",
	result2: [
		{
			action: "getInfo",
			status: "fail",
			comment: "not support",
		}
	],
	result3: [],
	log2: "adfadfdfadf.txt",
	log3: "adfadfajdfkj.txt"
}
*/

try {
	fs.accessSync(path.join(__dirname, "tmp"));
}
catch(err) {
	fs.mkdirSync("./tmp");
}

var app = express();

app.use(express.static('public'));
app.use("/api/*", bodyParser.json());

app.get("/api/getModules", function(req, res, next) {
	fs.readFile("./auto_module", function(err, data) {
		try {
			if(err)
				throw new Error()
			let obj = JSON.parse(data);
			return sendJson(res, 0, "", {"data": obj.data});
		}
		catch(err2) {
			return sendJson(res, 0, "", {"data": []})
		}
	})
})

app.get("/api/getSpecs", function(req, res, next) {
	fs.readFile("./auto_spec", function(err, data) {
		try {
			if(err)
				throw new Error()
			let obj = JSON.parse(data);
			return sendJson(res, 0, "", {"data": obj.data});
		}
		catch(err2) {
			return sendJson(res, 0, "", {"data": []})
		}
	})
})

app.get("/api/referModules", function(req, res, next) {
	fs.readdir("./not_support_api", function(err, files) {
		if(err)
			return sendJson(res, 1);
		sendJson(res, 0, "", {"data": files});
	})
})

app.post("/api/basicInfo", function(req, res, next) {
	var {moduleName, version, spec} = req.body;
	if(notUndefined(moduleName, version, spec) === false)
		return sendJson(res, 1);
	if(version.slice(0, 1) === "V" || version.slice(0, 1) === "v")
		version = version.slice(1);

	let token = createToken(40);
	taskList.push({
		"moduleName": moduleName,
		"version": version,
		"spec": spec,
		"token": token,
		"startTime": (new Date()).getTime()
	})
	sendJson(res, 0, "", {"token": token});
})

app.post("/api/getTaskInfo", function(req, res, next) {
	let {token, refer} = req.body;
	let index = checkToken(token);
	if(index === -1) {
		return sendJson(res, 1, "Can't find token");
	}
	let {moduleName, spec, version, log2, log3} = taskList[index];
	fs.readFile(`./not_support_api/${moduleName}`, function(err, data) {
		try {
			if(err && refer !== undefined && refer !== "") {
				data = fs.readFileSync(`./not_support_api/${refer}`);
			}
			else if(err) {
				data = "[]";
			}
			let notSupObj = JSON.parse(data);
			let [result, result2, result3] = [[], taskList[index].result2, taskList[index].result3];
			for(let i=0; i<result2.length; i++) {
				result2[i].belongTo = "2.0";
				result.push(result2[i]);
			}
			for(let i=0; i<result3.length; i++) {
				result3[i].belongTo = "3.0";
				result.push(result3[i]);
			}
			for(let i=0; i<result.length; i++) {
				if(result[i].status === "FAIL") {
					for(let j=0; j<notSupObj.length; j++) {
						if(notSupObj[j].action === result[i].action) {
							result[i].status = "N/A";
							result[i].comment = notSupObj[j].comment;
						}
					}
				}
				else if(result[i].status === "PASS" || (result[i].status !== "N/A" && result[i].status !== "FAIL")) {
					result.splice(i, 1);
					i --;
				}
			}
			sendJson(res, 0, "", {
				"moduleName": moduleName,
				"spec": spec,
				"version": version,
				"log2": log2,
				"log3": log3,
				"result": result
			});
		}
		catch(err2) {
			return sendJson(res, 1);
		}
	})
})

app.post("/api/generateReport", function(req, res, next) {
	let token = req.body.token;
	let index = checkToken(token);
	if(index === -1) {
		return sendJson(res, 1, "Can't find token");
	}
	let task = taskList[index];
	let excel = new Excel.Workbook();
	let [sheet, result] = [];
	for(let k=0; k<2; k++) {
		if(k === 0) {
			sheet = excel.addWorksheet("SOAP 2.0");
			result = task.result2;
		}
		else {
			sheet = excel.addWorksheet("SOAP 3.0");
			result = task.result3;
		}
		sheet.getCell("A1").value = `Firmware Version: ${task.moduleName}-V${task.version}`;
		sheet.getCell("A2").value = "SOAP Tool Meet Spec Version: " + task.spec;
		sheet.getCell("A3").value = "Test Results: (PASS/FAIL N/A:Not support)";
		sheet.getCell("A4").value = "SOAP Actions";
		sheet.getCell("B4").value = "Results";
		sheet.getCell("C4").value = "Comments";
		sheet.mergeCells("A1:C1");
		sheet.mergeCells("A2:C2");
		sheet.mergeCells("A3:C3");
		sheet.getColumn(1).width = 80;
		sheet.getColumn(2).width = 25;
		sheet.getColumn(3).width = 50;

		for(let i=0; i<result.length; i++) {
			let obj = result[i];
			sheet.addRow([obj.action, obj.status, obj.comment]);
		}

		sheet.eachRow(function(Row, rowNum) {
			Row.eachCell(function(Cell, cellNum) {
				if (rowNum < 5) {
					Cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
					Cell.font = { size: 14, bold: true };
				} else if (cellNum > 1) {
					if (Row.getCell(2).value === "FAIL") {
						Row.getCell(1).font = { color: { argb: 'FFFF4500' } };
						Row.getCell(2).font = { color: { argb: 'FFFF4500' } };
						Row.getCell(3).font = { color: { argb: 'FFFF4500' } };
					}
					else if(Row.getCell(2).value === "N/A") {
						Row.getCell(1).font = { color: { argb: 'FF1E90FF' } };
						Row.getCell(2).font = { color: { argb: 'FF1E90FF' } };
						Row.getCell(3).font = { color: { argb: 'FF1E90FF' } };
					}
					Cell.alignment = { vertical: 'middle', horizontal: 'center' };
				}
			})
		})
	}

	let fileName = "Excel_" + createToken(40) + ".xlsx";
	let excelPath = path.join("./tmp/" + fileName);
	excel.xlsx.writeFile(excelPath).then(function() {
		task.excel = fileName;
		sendJson(res, 0, "", {"path": fileName});
	}).catch(function() {
		sendJson(res, 1);
	})
})

app.post("/api/saveFailTable", function(req, res, next) {
	let data = req.body.data;
	let token = req.body.token;
	let index = checkToken(token);
	if(index === -1) {
		return sendJson(res, 1, "Can't find token");
	}
	let task = taskList[index];
	try {
		for(let i=0; i<data.length; i++) {
			let obj = data[i];
			let target;

			if(obj.status !== "N/A" && obj.status !== "FAIL")
				return sendJson(res, 1);

			if(obj.belongTo === "2.0")
				target = task.result2;
			else if(obj.belongTo === "3.0")
				target = task.result3;
			else
				return sendJson(res, 1);

			for(let j=0; j<target.length; j++) {
				if(target[j].action === obj.action) {
					target[j].status = obj.status;
					target[j].comment = obj.comment;
				}
			}
		}
		sendJson(res, 0);
		saveNotSupportApi(index);
	}
	catch(err) {
		return sendJson(res, 1);
	} 
})

app.post("/uploads", function(req, res, next) {
	let upFile = req.query.file;
	let token = req.query.token;
	let index = checkToken(token);
	let validFile = ["result2", "result3", "log2", "log3"].indexOf(upFile);
	if(index === -1 || validFile === -1) {
		return res.status(500).end();
	}
	var form = new formidable.IncomingForm();
	
	form.uploadDir = './tmp';
	form.encoding='utf-8';
	form.multiples = false;
    form.parse(req, function(err, fields, files) {
        if (err) {
            return console.log('formidable, form.parse err');
        }

        var item;
        var length = 0;
        for (item in files) {
            length++;
        }
        if (length === 0)
            return console.log('files no data');

        for (item in files) {
            var file = files[item];
            var tempfilepath = file.path;

			if(upFile === "log2" || upFile === "log3") {
				taskList[index][upFile] = path.basename(tempfilepath);
				return sendJson(res, 0, "", {"uploaded": upFile});
			}
			else if(upFile === "result2" || upFile === "result3") {
				let parseRes = getDataFromResult(tempfilepath, index, upFile);
				if(parseRes === false)
					return res.status(500).end();
				else {
					sendJson(res, 0, "", {"uploaded": upFile});
					taskList[index][upFile + "Path"] = path.basename(tempfilepath);
				}
			}
			else {
				return res.status(500).end();
			}
        }
    })
})

app.get("/downloadLog/*", function(req, res) {
	let path = req.path;
	path = path.replace(/\/downloadLog\/(\w+)/, "$1");
	let saveName = path + ".txt";
	for(let i=0; i<taskList.length; i++) {
		let task = taskList[i];
		if(task.log2 === path || task.log3 === path) {
			saveName = `${task.moduleName}-V${task.version}-SOAP-${task.spec}-Log${task.log2 === path? "2": "3"}.txt`;
		}
	}
	res.type("application/binary");
	res.download("./tmp/" + path, saveName);
})

app.get("/downloadExcel/*", function(req, res) {
	let path = req.path;
	path = path.replace(/\/downloadExcel\/(.+\.xlsx)/, "$1");
	let saveName = path;
	let index = -1;
	for(let i=0; i<taskList.length; i++) {
		let task = taskList[i];
		if(task.excel === path) {
			saveName = `${task.moduleName}-V${task.version}-SOAP-${task.spec}-Report.xlsx`;
			index = i;
			break;
		}
	}
	if(index === -1) {
		return res.status(404).end();
	}

	console.log(`[${req.ip}]: ${saveName}`);
	res.type("application/binary");
	res.download("./tmp/" + path, saveName);

	let task = taskList[index];
	saveModuleOrSpec("./auto_module", task.moduleName);
	saveModuleOrSpec("./auto_spec", task.spec);
})

function saveModuleOrSpec(file, newData) {
	fs.readFile(file, function(err, data) {
		try {
			if(err)
				throw new Error();
			let obj = JSON.parse(data);
			if(obj.data === undefined)
				throw new Error();
			if(obj.data.indexOf(newData) !== -1)
				return;
			obj.data.push(newData);
			fs.writeFile(file, JSON.stringify(obj), function(err) {console.log(err)
				console.log("write data to auto file failed");
			});
		}
		catch(err2) {
			console.log("read or parse auto data failed");
		}
	})
}

function saveNotSupportApi(index) {
	let task = taskList[index];
	let apis = [];
	for(let i=0; i<2; i++) {
		let result;
		if(i === 0)
			result = task.result2;
		else
			result = task.result3;
		let len = result.length;
		for(let j=0; j<len; j++) {
			if(result[j].status === "N/A") {
				apis.push({"action": result[j].action, "comment": result[j].comment});
			}
		}
	}
	fs.writeFile(`./not_support_api/${task.moduleName}`, JSON.stringify(apis), function(err) {
		if(err) {
			console.log(`write not_support_api for ${task.moduleName} failed`);
		}
	})
}

var server = app.listen(port, function() {
    console.log('SOAP-Report-Online web site start at ' + (new Date).toLocaleString());
});

function getDataFromResult(path, index, key) {
	try {
		var data = fs.readFileSync(path, "utf-8");
	}
	catch(err) {
		return false;
	}
	let line = data.split("\n");
	let len = line.length;
	let list = taskList[index][key] = [];
	let insert = false;
	for (let i=0; i<len; i++) {
        line[i] = line[i].replace(/\[[^\[\]]*\]/g, "");
        line[i] = line[i].replace(/ResponseTime=.*$/g, "");
        line[i] = line[i].replace(/\s:\s/g, "");
        line[i] = line[i].trim();
        if (line[i] == "")
            continue;
        var each = line[i].split(/\s+/);
        each[0] = (each[0] == undefined ? "" : each[0]);
        each[1] = (each[0] == undefined ? "" : each[1]);
		if(each[0] === "" || each[1] === "" || (each[1] !== "FAIL" && each[1] !== "PASS"))
			continue;
		list.push({
			"action": each[0],
			"status": each[1],
			"comment": ""
		});
		insert = true;
	}
	return insert;
}

setInterval(clearTask, 1*60*60*1000);

function clearTask() {
	let cur = (new Date()).getTime();
	for(let i=0; i<taskList.length; i++) {
		if((cur - taskList[i].startTime) > 24*60*60*1000) {
			if(taskList[i].log2 !== undefined)
				fs.unlink("./tmp/"+taskList[i].log2, (err) => {if(err) console.log(err)});
			if(taskList[i].log3 !== undefined)
				fs.unlink("./tmp/"+taskList[i].log3, (err) => {if(err) console.log(err)});
			if(taskList[i].excel !== undefined)
				fs.unlink("./tmp/"+taskList[i].excel, (err) => {if(err) console.log(err)});
			if(taskList[i].result2Path !== undefined)
				fs.unlink("./tmp/"+taskList[i].result2Path, (err) => {if(err) console.log(err)});
			if(taskList[i].result3Path !== undefined)
				fs.unlink("./tmp/"+taskList[i].result3Path, (err) => {if(err) console.log(err)});

			taskList.splice(i, 1);
			i --;
		}
	}
}

function sendJson(res, status, message, payload) {
	if(message === "" || message === undefined) {
		message = (status === 0? "success": "fail");
	}
    res.json({
        "status": status,
        "message": message,
        "payload": (payload === undefined) ? {} : payload
	});
    return (status === 0);
}

function getRandom() {
	do {
		var num = 48 + Math.round(Math.random() * (122 - 47));
	}
	while (!((num > 47 && num < 58) || (num > 64 && num < 91) || (num > 96 && num < 123)))

	return num;
}

function createToken(len) {
	var token = "";
	do {
		token += String.fromCharCode(getRandom());
	}
	while (token.length < len)

	return token;
}

function notUndefined(...params) {
	return (params.indexOf(undefined) === -1);
}

function checkToken(token) {
	let len = taskList.length;
	let found = -1;
	for(let i=0; i<len; i++) {
		if(token === taskList[i].token) {
			found = i;
			break;
		}
	}
	return found;
}
