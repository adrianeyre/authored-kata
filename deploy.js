const fs = require('fs');
const FtpClient = require('ftp');
const glob = require('glob');
const minify = require('html-minifier').minify;

const basePath = './public';
const destinationPath = '/public_html/codewars';
const htmlFilename = 'index.html';
const config = {
	host: process.env.FTP_HOST,
	password: process.env.FTP_PASSWORD,
	user: process.env.FTP_USER,
};

const ftpClient = new FtpClient();

function createDirectory(destination) {
	return ftpClient.mkdir(destination, true, error => {
		if (error) throw error;

		ftpClient.end();
	});
}

function uploadFile(file, destination) {
	ftpClient.put(file, destination, error => {
		if (error) throw error;

		console.log(`${ file } => ${ destination }`);
		ftpClient.end();
	});
}

function handlePath(path) {
	const relativeFile = path.replace(`${ basePath }/`, '');
	const destination = `${ destinationPath }/${ relativeFile }`;

	if (fs.lstatSync(path).isDirectory()) {
		return createDirectory(destination);
	}

	return uploadFile(path, destination);
}

ftpClient.on('ready', () => {
    var text = fs.readFileSync(`/src/${ htmlFilename }`, encoding='utf8')
    var result = minify(text, {});
    fs.writeFile(`${ basePath }/public/${ htmlFilename }`);
	glob.sync(`${ basePath }/**/*`).forEach(handlePath);
});

ftpClient.connect(config);