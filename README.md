# hook-client-exceptions

A very simple helper to log errors using [hook] plataform. 

**ToDo List:**

  - A Observer/Route helper to customizing errors in the server-side.
  - A User Interface to better viewing/filtering errors in a timeline-like graph.



## How to use it ?

Here some examples of how use all it's functionalities.

### Instantiating and some configurations

This helper should be loaded after hook-javascript. The exceptions will be at the ```hook.Client``` instance.

```js
var hook = new Hook.Client( [...] );

// Setting configuration to the helper.
hook.exceptions.setConfig( [...] );
```

### Putting limits

Use the config property ``logLimit`` to limit the amount of errors sent to the server per pageview. By default, it is **unlimited**.

Also, you can set to the helper using the config property ``keepErrors`` to save all errors in an **Array** located at ``HookInstance.errors``. By default it is **false**.


```js
hook.exceptions.setConfig({
    hook: [...],
    // Limits error logs sent to the server up to 30
    logLimit: 30,
    // Tells the helper to keeps all errors in an array inside the HookExceptions instance.
    keepErrors: true
);
```

### Ignoring some errors

Here you have freedom to tell who is the guys that you don't want to log to your server.
Using the method ``ignoreOnMatch`` you can use either a **RegEx** or a **Function** for that.

The difference between using a **RegEx** and the **Function** parameters is that a **RegEx** only matches to the error message and to the stack information. But passing a **Function** you have access to all information the the event **onerror** provides, making it better for complex decisions.

```js
// This will ignore all errors of the kind "Cannot read property 'x' of undefined"
hook.exceptions.ignoreOnMatch(/undefined/);

// This one ignores all errors that come from the file my-safe-script.js
hook.exceptions.ignoreOnMatch(function (errorMsg, url, lineNumber, columnNumber, errorReference) {
    
    if (url.search('my-safe-script.js')) {
        return true;
    }
    
});

```

### Adding extra information

You may want to log some extra information to be logged with your error, as a session token, UserAgent or a commithash. 
```js
 hook.exceptions.setConfig({
    hook: [...],
    extraInfo: {
        // This adds a commitHash to all errors log.
		commitHash: '788df27b84c445bcf60ac5bf01326e03d36697b9',
		
		// This add a variant value to the error log. Taking its value at the error moment.
		currentScore: function () {
			return Game.score;
		}

	}
);


```

License
----

MIT


[hook]:https://github.com/doubleleft/hook
[hook-javascript]:https://github.com/doubleleft/hook-javascript