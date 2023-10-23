const fs = require('fs');
var added = 0;

function	test(entry) {
	var data = fs.readFileSync("nox.json", 'utf-8');
	obj = JSON.parse(data);
	console.log(data);
	for (var i = 0; i < obj.length; i++)
		if (obj[i].name == entry.name)
			return;
	added++;
	obj.push(entry);
	var json = JSON.stringify(obj, null, 4);
	fs.writeFileSync('nox.json', json, 'utf-8');
}

function main() {
	const files = fs.readdirSync('./photos');
	var exists = false;
	if (fs.existsSync('./nox.json'))
		exists = true
	for (var i = 0; i < files.length; i++)
	{
		var data = {
			name: files[i],
			sent: false,
			id: i
		};
		if (exists)
			test(data);
	}
	if (!exists)
		fs.writeFileSync('nox.json', JSON.stringify(data, null, 4), 'utf-8');
	console.log("total files : " + i);
	console.log("file(s) added: " + added);
	return (0);
}

main();