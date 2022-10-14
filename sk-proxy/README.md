sk-proxy
========

sk-proxy is a proxy server for external APIs which need more complicated
processing and/or authentication which are not feasible to implement in
client-side code alone.

External API Support
--------------------

Current API Version: `v1.0.0`

Currently, sk-proxy supports the following APIs:

- __domainr__:
	- Search by query, returning a list of domain suggestions with their
		registration statuses: `GET /v1/domainr?q=domain_query`

Hosting
-------

An instance of sk-proxy is being hosted by [b0o](https://github.com/b0o) for
free community use. It is located at:

`https://5jmgqstc3m.execute-api.us-west-1.amazonaws.com/v1/`

The proxy instance is configured with a low global monthly rate limit - please
don't abuse it or it will be made private ;)

Deploy
------

Requirements:
- a properly configured surfingkeys-conf in the parent directory (RTFM)
- node
- aws-cli
- claudia (globally installed with npm)

1. Install Node Packages
	```
	$ cd surfingkeys-conf/sk-proxy
	$ npm install
	```

2. Create Lambda function with Claudia
	```
	$ npm run create
	```

3. Deploy to Lambda with Claudia
	```
	$ npm run deploy
	```

Support
-------

__This code is offered as a courtesy.__

No support will be provided in deploying or troubleshooting AWS services.

Please, only open an issue for actual bugs relating to the code published here.

License
-------

&copy; 2018-2022 Maddison Hellstrom

MIT License
