const request = require('request');
const restify = require('restify');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const corsMiddleware = require('restify-cors-middleware');
const cors = corsMiddleware({
	preflightMaxAge: 5,
	origins: ['*'],
});
const { chain, get, indexOf, merge, set, startCase } = require('lodash');

let defaults;
try {
	defaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), { encoding: 'utf8' }));
} catch (err) {
	console.log(err.message);
	defaults = {};
}
let environment;

try {
	environment = JSON.parse(
		fs.readFileSync(path.join(__dirname, 'config', `${process.env.NODE_ENV}.json`), { encoding: 'utf8' })
	);
} catch (err) {
	console.log(err.message);
	environment = {};
}

const config = merge(defaults, environment);
const knownEmails = get(config, 'emails');
const MAILGUN_URL = get(config, 'mailgun.url');
const MAILGUN_API_KEY = get(config, 'mailgun.key');

const FORM_FIELDS = ['_from', '_subject', '_to', '_attachment'];
const PRIVATE_FIELDS = ['_fake', '_info', '_next'];

const htmlSource = fs.readFileSync(path.join(__dirname, 'html_template.hbs'), { encoding: 'utf8' });
const textSource = fs.readFileSync(path.join(__dirname, 'text_template.hbs'), { encoding: 'utf8' });
const htmlTemplate = Handlebars.compile(htmlSource);
const textTemplate = Handlebars.compile(textSource);

var server = restify.createServer();
server.pre(cors.preflight);
server.use(cors.actual);
server.use(
	restify.plugins.bodyParser({
		mapParams: true,
	})
);

server.get('/status', (req, res, next) => {
	res.send('contact running');
	return next();
});

server.post('/:_to', (req, res, next) => {
	const { formData, fields } = parseRequest(req);

	if (indexOf(knownEmails, get(formData, 'to')) < 0) {
		return next(new Error('Unknown email address'));
	}

	const params = {
		formData,
		auth: {
			user: 'api',
			pass: MAILGUN_API_KEY,
		},
		url: MAILGUN_URL,
		method: 'post',
	};

	sendMail(fields, params)
		.then(response => {
			const redirect = get(fields, 'next');
			if (redirect) {
				res.redirect(redirect, next);
			} else {
				res.json(response);
			}

			return next();
		})
		.catch(error => {
			return next(error);
		});
});

function parseRequest(req) {
	const body = get(req, 'params');

	const formData = chain(body)
		.pick(FORM_FIELDS)
		.mapKeys((value, key) => key.replace('_', ''))
		.value();

	const fields = chain(body)
		.pick(PRIVATE_FIELDS)
		.mapKeys((value, key) => key.replace('_', ''))
		.value();

	const data = chain(body)
		.omit(PRIVATE_FIELDS)
		.omit(FORM_FIELDS)
		.mapKeys((value, key) => startCase(key))
		.map((value, key) => {
			return { key, value };
		})
		.value();

	set(fields, 'data', data);
	set(formData, 'html', htmlTemplate(fields));
	set(formData, 'text', textTemplate(fields));

	const attachment = get(req, 'files._attachment');
	if (attachment) {
		const filePath = get(attachment, 'path');
		const value = get(fields, 'fake') ? filePath : fs.createReadStream(filePath);

		set(formData, 'attachment', {
			value,
			options: {
				filename: get(attachment, 'name'),
				contentType: get(attachment, 'type'),
			},
		});
	}

	return { data, fields, formData };
}

function sendMail(fields, params) {
	const fake = get(fields, 'fake');

	if (fake) {
		return Promise.resolve(merge({ message: 'fake response' }, params));
	}

	return new Promise((resolve, reject) => {
		request(params, (error, msg, response) => {
			if (error) {
				return reject(error);
			}

			return resolve(JSON.parse(response));
		});
	});
}

server.listen(8081, () => {
	console.log(`${server.name} listening at ${server.url}`);
});
