## What is Service Mocker?

Service Mocker is an API mocking framework for frontend developers. With the power of [service workers](https://w3c.github.io/ServiceWorker/), we can easily set up mocking services without any real servers. It sets developers free from intricate workflows, complex documentations and endless proxies from server to server.

## Installation

Since you are likely to run Service Mocker only during development, you will need to add `service-mocker` as a devDependency:

```
npm install service-mocker --save-dev
```

For legacy browsers, you may also need the [polyfills](https://github.com/service-mocker/service-mocker-polyfills):

```
npm install service-mocker-polyfills --save-dev
```

## Hello new world

<p class="warning">Before starting, make sure you are using a develop server (e.g. <code>webpack-dev-server</code>) to serve your static assets. Assuming we are hosting our app in <code>http://localhost:3000</code>:</p>

A typical mocker includes two parts: `client` and `server`. First, let's create a server script named `server.js`:

```js
// server.js
import { createServer } from 'service-mocker/server';

const { router } = createServer();

router.get('/greet', (req, res) => {
  res.send('Hello new world!');
});

// or you can use the shorthand method
router.get('/greet', 'Hello new world!');
```

Then, we need to write a client script to connect to the server:

```js
// app.js
import 'service-mocker-polyfills';
import { createClient } from 'service-mocker/client';

const client = createClient('path/to/server.js');

client.ready.then(async () => {
  const response = await fetch('/greet');

  console.log(await response.text());
});
```

After that, create a `.html` file and include **ONLY** the client script:

```html
<script src="app.js"></script>
```

Now navigate your browser to `http://localhost:3000`. Open the console and you will see a `Hello new world!` message lying under several connection logs:

```
> [mocker:modern] connection established
>
> Hello new world!
```

### Non-root registrations

When you are serving server script from a non-root path (e.g. `'/assets/js/server.js'`), you may need to add a `Service-Worker-Allowed` header to it. The following is an example of [webpack-dev-server](https://github.com/webpack/webpack-dev-server):

```js
const devServer = new WebpackDevServer(compiler, {
  ...
  // override service worker path restriction
  headers: {
    'Service-Worker-Allowed': '/'
  }
});
```

For more information, please check the <a href="caveats.md#path-restriction" router-link="/caveats?id=path-restriction">Path restriction</a> section.

## Integrating into current project

It's quite easy to integrate Service Mocker into your current project, all you need to do is to put the bootstrapping code into `client.ready.then()` block:

```js
client.ready.then(() => {
  // bootstrapping...
});
```

However, as long as you may only want to use Service Mocker during development, it's recommended to pack your bootstrapping code into a reusable function then split into two entry points:

```js
// app.js
export function runMyApp() {
  // bootstrapping...
}
```

```js
// entry-dev.js
import { createClient } from 'service-mocker/client';
import { runMyApp } from './app';

const client = createClient('server.js');
client.ready.then(runMyApp);
```

```js
// entry-prod.js
import { runMyApp } from './app';

runMyApp();
```

## Legacy? Modern?

Service Mocker is mainly based on the [service worker API](https://w3c.github.io/ServiceWorker/). As this is still a WIP draft, only the latest browsers can support it. When it's possible to start a service worker, Service Mocker will be bootstrapped in modern mode. When Service Mocker bootstraps in legacy mode, it means we are not able to register a service worker in current browser environment.

In modern mode, all requests are processed in service worker context, and you'll be able to inspect them in devtools. But in legacy mode, requests are captured within current window context, thus you can't see any mock requests in devtools.

If you are interested in the details, you can view [this pull request](https://github.com/idiotWu/service-mocker/pull/6).

<p class="tip">When running in modern mode, it's recommended to use the latest browsers to avoid some weird behaviors. For more information, please check the [Is ServiceWorker ready](https://jakearchibald.github.io/isserviceworkerready/) page.</p>

## Service Worker Debugging

- For Chrome users, please follow [this guide](https://developers.google.com/web/fundamentals/getting-started/codelabs/debugging-service-workers/).
- For Firefox users, please follow [this guide](https://hacks.mozilla.org/2016/03/debugging-service-workers-and-push-with-firefox-devtools/).

## What's next...

Now you are likely to understand the basic ideas of Service Mocker. For further development, you may need to check the <a router-link="/api" href="API.md">API documentations</a>.

## FAQ

### Why my mocker always runs in legacy mode?

As per [service worker spec](https://github.com/w3c/ServiceWorker/blob/master/explainer.md#getting-started):

<p class="danger">The registering page must have been served securely (HTTPS without cert errors)</p>

So if you are running on an insecure page other than `localhost`, you could only bootstrap mocker in legacy mode.

### Can I handle cookies in service mockers?

No. At least not currently. According to the security restrictions, we are not likely to add cookie support in the future.

### Do I have to use `fetch` to send requests?

No, there's no limitation here. The [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), [jQuery](https://jquery.com/), or some built-in helpers like the [$http](https://docs.angularjs.org/api/ng/service/$http) module in the old [Angular.js](https://angularjs.org/), feel free to choose the one you like!

### I got a `Module parse failed: ./~/statuses/codes.json` error from webpack.

Using the [json-loader](https://github.com/webpack/json-loader) will solve this problem, the following is an example of configuration:

```js
module.exports = {
  resolve: {
    extensions: ['', '.js', '.json'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: [
        'src',
        'test',
      ],
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};
```

<p class="danger">If you are already using the <code>json-loader</code> but still getting this error, please add <code>node_modules</code> to the <code>include</code> array.</p>
