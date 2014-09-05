(function (window) {
	"use strict";

	var HookExceptions = function (client) {
		var self = this,
			/*
				Keeps old onerror event. In case it exists, execute it after processing the error.
			*/
			oldOnError = window.onerror;

		// Keep hook client reference
		this.client = client;
		
		// Default config values
		this.setConfig({
			logLimit: 0,
			keepErrors: false,
			ignoresOn: []
		});

		window.onerror = function (errorMsg, url, lineNumber, columnNumber, errorReference) {

			var stack = '',
				errorReport,
				ignoreError = false,
				igLength = self.config.ignoresOn.length,
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


			if (!!self.config.logLimit && self.errorCounter > self.config.logLimit) {

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

				self.client.collection('hook_client_exceptions').create(errorReport);

				self.errorCounter += 1;

				if (self.config.keepErrors) {

					self.errors.push([errorMsg, url, lineNumber, columnNumber, stack]);

				}

			}


		 	if (oldOnError) {
				return oldOnError(errorMsg, url, lineNumber, columnNumber, errorReference);
		  	}

			return false;

		}

		this.errorCounter = 0;
		this.errors = [];

		return this;

	}
	
	/**
	 * Set exceptions config.
	 * 
	 * options:
	 *   - logLimit (int)
	 *   - keepErrors (bool)
	 *   - extraInfo (object)
	 *   - ignoresOn (array)
	 * 
	 * @method setConfig
	 */
	HookExceptions.prototype.setConfig = function(config) {
		this.config = config;
		return this;
	}

	HookExceptions.prototype.ignoreOnMatch = function(v) {

		this.config.ignoresOn.push(v);

		return this;
	}

	// Register 'exceptions' plugin.
	Hook.Plugin.Manager.register('exceptions', HookExceptions);

})(window);
