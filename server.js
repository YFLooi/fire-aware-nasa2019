var express = require('express');
var app = express();
var path = require('path');

//__dirname returns the directory that the currently executing script is in
//Thus, the resulting path is: ./SpaceApps_vanillaHTML/dist/index.html
//Ref: https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
app.use(express.static(__dirname+'/dist'));

app.get('/', function(req,res){
	console.log('Main page loading...');
	res.render('./dist/index.html');
});

/** 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './dist','index.html'));
});
*/

app.listen(process.env.PORT || 4000, function () {
    console.log('App running on port 8080 or 4000');
});