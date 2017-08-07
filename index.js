var fs = require('fs');
var path = require('path');
var express = require('express');
var _ = require('underscore');
var morgan = require('morgan');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;

var restApi_1_0 = require('./api/1.0/index');

var api = new ParseServer({
	appName			: 'Curatum',
	databaseURI		: process.env.MONGODB_URI,
	cloud			: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
	appId			: process.env.APP_ID,
	javascriptKey	: process.env.JAVASCRIPT_KEY,
	masterKey		: process.env.MASTER_KEY,
	serverURL		: process.env.SERVER_URL,
	publicServerURL	: process.env.SERVER_URL,
	filesAdapter	: new S3Adapter(
		process.env.S3_ACCESS_KEY,
		process.env.S3_SECRET_KEY,
		process.env.S3_BUCKET,
		{directAccess: true}
	),
	emailAdapter	: {
		module: 'parse-server-simple-mailgun-adapter',
		options: {
			fromAddress	: process.env.MAIL_FROM_ADDRESS,
			domain		: process.env.MAILGUN_DOMAIN,
			apiKey		: process.env.MAILGUN_API_KEY
		}
	},
	customPages	: {
		invalidLink: process.env.PUBLIC_URL + '/user_management/invalid_link.html',
		verifyEmailSuccess: process.env.PUBLIC_URL + '/user_management/email_verification.html',
		choosePassword: process.env.PUBLIC_URL + '/user_management/choose_password.html',
		passwordResetSuccess: process.env.PUBLIC_URL + '/user_management/password_updated.html'
	}
});

var httpPort = process.env.PORT || 80;
var httpsPort = 443;

var app = express();

app.use(morgan('combined'));

app.use('/public', express.static(path.join(__dirname, '/public')));

if  (process.env.NODE_ENV !== 'production')
	app.use('/src', express.static(path.join(__dirname, '/src')));
	
app.use(process.env.PARSE_MOUNT || '/parse', api);

app.use('/api/v1.0', restApi_1_0);

var httpServer = require('http').createServer(app);

httpServer.listen(httpPort, function() {
	console.log('Express server listening on port ' + httpPort);
});

if  (process.env.NODE_ENV !== 'production') {
	
	var httpsServer = require('https').createServer(
		{
			key: fs.readFileSync('./ssl/nodejs.dev.key'),
		    cert: fs.readFileSync('./ssl/nodejs.dev.crt'),
		    requestCert: false,
		    rejectUnauthorized: false
		},
		app
	);
	
	httpsServer.listen(httpsPort, function() {
		console.log('Secure Express server listening on port ' + httpsPort);
	});

}