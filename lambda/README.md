[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=for-the-badge)](http://commitizen.github.io/cz-cli/)
[![Liberapay contributions](https://img.shields.io/liberapay/receives/b0o.svg?logo=liberapay&style=for-the-badge)](https://liberapay.com/b0o/donate)

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
	$ cd surfingkeys-conf/lambda
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

&copy; 2018 Maddison Hellstrom

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

