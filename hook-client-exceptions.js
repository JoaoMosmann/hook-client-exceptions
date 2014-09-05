(function (window) {
	"use strict";

	var HookExceptions = function (config) {

		var self = this,
			/*
				Keeps old onerror event. In case it exists, execute it after processing the error.
			*/
			oldOnError = window.onerror,
			api;

		/*
			Basic configuration necessary.
		*/
		if (!config || config.constructor !== Object) {
			console.warn('No valid config passed to HookExceptions.');
			return false;
		}

		if (!config.hook || config.hook.constructor !== Object) {
			console.warn('No valid Hook config passed to HookExceptions.');
			return false;
		}
		
		

		window.onerror = function (errorMsg, url, lineNumber, columnNumber, errorReference) {

			var stack = '',
				errorReport,
				ignoreError = false,
				igLength = self.ignoresOn.length,
				igVa, x, y, z;

			/*
				If there is a errorReference, try to get the stack information.
			*/
			if (!!errorReference) {

				if (!!Error && errorReference instanceof Error) {
					stack = errorReference.stack;
				} else if (errorReference.constructor === String) {
					stack = errorReference;
				} else {
					stack = errorReference.toString();
				}

			}

			
			if (!!self.logLimit && self.errorCounter > self.logLimit) {

				ignoreError = true;

			}

			/*
				Check if the current error must be ignored.
			*/
			for (z = 0; z < igLength && !ignoreError; z += 1) {

				igVa = self.ignoreOn[z] || function () { return false };

				if (igVa.constructor === RegExp) {

					ignoreError = !!(errorMsg.match(igVa) || stack.match(igVa));

				} else if (igVa.constructor === Function) {

					ignoreError = igVa.apply(window, arguments);

				}

			}
			
			if(!ignoreError) {

				errorReport = {

					message: errorMsg,
					url: url,
					line: lineNumber,
					column: columnNumber,
					stack: stack

				};
				
				/*
					Added custom information to the error log.
				*/
				if (!!config.extraInfo && config.extraInfo.constructor === Object) {

					for (x in config.extraInfo) {

						if (config.extraInfo.hasOwnProperty(x)) {

							y = config.extraInfo[x];

							if (!!y && y.constructor === Function) {
								y = y();
							}

							errorReport[x] = y;

						}

					}

				}
				
				api.collection('hook_client_exceptions').create(errorReport);

				self.errorCounter += 1;

				if (self.keepErrors) {

					self.errors.push([errorMsg, url, lineNumber, columnNumber, stack]);

				}

			}


		 	if (oldOnError) {
				return oldOnError(errorMsg, url, lineNumber, columnNumber, errorReference);				  	
		  	}
			
			return false;

		}

		this.errorCounter = 0;
		this.logLimit = config.logLimit || 0;
		this.keepErrors = config.keepErrors || false;


		this.config = config;
		this.errors = [];
		this.ignoresOn = [];

		return this;

	}

	HookExceptions.prototype.ignoreOnMatch = function(v) {

		this.ignoresOn.push(v);

		return this;
	}

	window.HookExceptions = HookExceptions;

})(window);