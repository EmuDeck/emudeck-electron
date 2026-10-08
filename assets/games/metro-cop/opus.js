(function () {
	'use strict';

	var ENABLE_LOG = false;
	var ENABLE_CONCURRENCY = true;
	var MAX_CONCURRENCY = 4;
	var DEFAULT_CONCURRENCY = 2;
	var STATE_INIT = 0;
	var STATE_LOADING = 1;
	var STATE_READY = 2;
	var IDLE_TIMEOUT = 500;
	var HARDWARE_CONCURRANCY = Math.min(MAX_CONCURRENCY, (navigator["hardwareConcurrency"] || DEFAULT_CONCURRENCY));
	var USE_WASM = window["WebAssembly"] && TestSafariWASM();		// test for iOS broken WebAssembly bug
	// Note in Remote Preview (which assumes WebAssembly is supported), the WebAssembly files must be loaded from blob URLs sent over
	// the DataChannel, since the relative URLs will not work on preview.construct.net.
	var LIBRARY_URL = USE_WASM ? (window["cr_opusWasmScriptUrl"] || "opus.wasm.js") : (window["cr_opusAsmScriptUrl"] || "opus.asm.js");
	//var DEPENDENCY_URL = (window["WebAssembly"] ? (window["cr_opusWasmBinaryUrl"] || "opus.wasm.wasm") : "opus.asm.js.mem");		// not currently used

	var _state = STATE_INIT;
	var _queue = [];
	var _pending = [];
	var _counter = 0;
	var _workers = [];
	var _isConcurrent = true;
	var _idleTimer = null;
	var _hotLoad = false;
	var _workerURL = null;

	if (_isConcurrent)
	{
		window.OpusDecoder = function (buffer, callback)
		{
			_queue.unshift([_counter++, buffer, callback]);

			if (_state == STATE_READY)
				ProcessNext();
			else if (_state == STATE_INIT)
				Initialise();
		};
		window.OpusDecoder["Initialise"] = function (n)
		{
			// NOTE this method is specifically called when we want to hot load
			// audio files during gameplay, so we should avoid auto killing the
			// decoder if this has been called
			_hotLoad = true;
			Initialise(n);
		};
		window.OpusDecoder["Destroy"] = function ()
		{
			Destroy();
		};
		window.OpusDecoder["type"] = "concurrent";
	}

	// logging functions, not normally enabled

	function log ()
	{
		if (ENABLE_LOG)
			console.log.apply(console, arguments);
	}

	function startProfile ()
	{
		if (ENABLE_LOG)
			console.profile("audio");
	}

	function snapshotProfile (n)
	{
		if (ENABLE_LOG)
			console.takeHeapSnapshot(n);
	}

	function delayedSnapshotProfile (n, t)
	{
		if (ENABLE_LOG)
			setTimeout(snapshotProfile, t, n);
	}

	function delayedEndProfile (t)
	{
		if (ENABLE_LOG)
			setTimeout(endProfile, t);
	}

	function endProfile ()
	{
		if (ENABLE_LOG)
			console.profileEnd("audio");
	}

	// loader functions
	
	function TestSafariWASM() {
  		var binary = new Uint8Array([
			0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1,
			0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1,
			14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11
		]);
		
		try {
	  		var module = new WebAssembly.Module(binary);
	  		var instance = new WebAssembly.Instance(module, {});
	  		// test storing to and loading from a non-zero location via a parameter.
	  		// Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
	  		return instance.exports.test(4) !== 0;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	function IsWKWebView ()
	{
		var isIOS = /(iphone|ipod|ipad)/i.test(navigator.userAgent);
		var isCordova = !!window["cordova"];

		return isIOS && isCordova;
	}

	function Initialise (n)
	{
		if (_state != STATE_INIT)
			return;

		_state = STATE_LOADING;

		if (_isConcurrent)
		{
			log("Initialising multi-worker opus decoder");
			startProfile();
			snapshotProfile("init")
			GetWorkerURL(function (err, url) {
				if (err)
					throw new Error(err);

				var count = n || HARDWARE_CONCURRANCY;
				while (count--)
					CreateWorker(url);
				_state = STATE_READY;
				ProcessNext();
			});
		}
	}

	function Destroy ()
	{
		if (_state != STATE_READY)
			return;

		log("Destroying opus decoder");
		CancelIdleTimer();

		for (var i = 0, l = _workers.length; i < l; i++)
			_workers[i].terminate();

		_state = STATE_INIT;
		_queue.length = 0;
		_pending.length = 0;
		_counter = 0;
		_workers.length = 0;

		snapshotProfile("destroy");
		delayedEndProfile(5000);
		delayedSnapshotProfile("after completion", 5000);
	}

	function ProcessNext ()
	{
		var job;
		var buffer;
		var callback;
		var id;
		var worker;

		if (_isConcurrent)
		{
			// jobs are dispatched round robin to workers, so this is isn't 100%
			// efficient ( some workers could recieve short files and others long ones )
			var L = _workers.length;

			if (_queue.length)
			{
				CancelIdleTimer();

				while (_queue.length)
				{
					job = _queue.pop();
					id = job[0];
					buffer = job[1];
					callback = job[2];
					worker = _workers[id % L];

					worker.postMessage({
						"id": id,
						"buffer": buffer
					}, [ buffer ]);

					_pending.push([id, callback]);
				}
			}
		}
	}

	function ReadLocalFile (url, cb)
	{
		var path = window["cordova"]["file"]["applicationDirectory"] + "www/" + url;

		window["resolveLocalFileSystemURL"](path, function (entry)
		{
			entry["file"](function (file)
			{
				var reader = new FileReader();
				reader.onload = function ()
				{
					cb(null, reader.result);
				};
				reader.onerror = function ()
				{
					cb("Failed to read " + path);
				};
				reader.readAsArrayBuffer(file);
			})
		});
	}

	function GetWorkerURL (cb)
	{
		// WKWebView mode: read the worker script as a local file, prefix it with a flag, and load the worker from a blob URL
		if (IsWKWebView())
		{
			if (_workerURL)
			{
				cb(null, _workerURL);
			}
			else
			{
				ReadLocalFile(LIBRARY_URL, function (err, workContent)
				{
					if (err)
						cb(err);
					else
					{
						_workerURL = URL.createObjectURL(new Blob([ "self[\"IS_WKWEBVIEW\"] = true;\n", workContent ]));
						cb(null, _workerURL);
					}
				});
			}
		}
		// Preview/Remote Preview mode: fetch the worker script as text, prefix it with the wasm binary URL to load, and load the worker from a blob URL
		else if (window["cr_opusWasmBinaryUrl"] || window["cr_opusAsmBinaryUrl"])
		{
			if (_workerURL)
			{
				cb(null, _workerURL);
			}
			else
			{
				fetch(LIBRARY_URL)
				.then(function (response)
				{
					return response.text();
				}).then(function (text)
				{
					var prefixLine = "";
					
					if (USE_WASM)
						prefixLine = "self[\"cr_opusWasmBinaryUrl\"] = \"" + window["cr_opusWasmBinaryUrl"] + "\";\n"
					else
						prefixLine = "self[\"cr_opusAsmBinaryUrl\"] = \"" + window["cr_opusAsmBinaryUrl"] + "\";\n"
					
					_workerURL = URL.createObjectURL(new Blob([ prefixLine, text ]));
					cb(null, _workerURL);
				}).catch (function (err)
				{
					cb(err);
				});
			}
		}
		// Any other mode: just load the worker directly from the URL
		else
		{
			cb(null, LIBRARY_URL);
		}
	}

	function CreateWorker (url)
	{
		var worker = new Worker(url);
		_workers.push(worker);
		worker.onmessage = OnWorkerMessage;
	}

	function RequestFile (url, worker, id)
	{
		ReadLocalFile(url, function (err, data) {
			if (err)
			{
				worker.postMessage({
					"type": "request",
					"id": id,
					"error": err
				});
			}
			else
			{
				worker.postMessage({
					"type": "request",
					"id": id,
					"buffer": data
				}, [ data ]);
			}
		});
	}

	function CompleteJobWithID (id, err, buffer, time)
	{
		var job;

		for (var i = 0, l = _pending.length; i < l; i++)
		{
			if (_pending[i][0] == id)
			{
				job = _pending[i];
				_pending.splice(i, 1);
				break;
			}
		}

		if (!job)
			throw new Error("No job with ID " + id);

		job[1](err, buffer, time);

		if (_pending.length == 0)
		{
			StartIdleTimer();
		}
	}

	var OnWorkerMessage = function OnWorkerMessage (e)
	{
		var data = e.data;
		var id = data["id"];
		var worker = this;

		switch (data["type"])
		{
			case "request":
				RequestFile(data["url"], worker, id);
				break;
				
			case "error":
				CompleteJobWithID(id, data["value"], null);
				break;

			case "complete":
				CompleteJobWithID(id, null, data["value"], data["time"]);
				break;
		}
	}

	function StartIdleTimer ()
	{
		// NOTE hotload requires the decoder to be called at various points
		// during gameplay, not just during initialisation, so we should avoid
		// destroying the workers after the initial batch
		if (_hotLoad)
			return;
			
		if (_idleTimer)
		{
			CancelIdleTimer();
		}
		log("Starting idle timer");
		snapshotProfile("idle");
		_idleTimer = setTimeout(TriggerIdle, IDLE_TIMEOUT);
	}

	function CancelIdleTimer ()
	{
		if (_idleTimer)
		{
			log("Cancelling idle timer");
			clearTimeout(_idleTimer);
			_idleTimer = null;
		}
	}

	var TriggerIdle = function TriggerIdle ()
	{
		if (_idleTimer)
		{
			log("Completing idle timer");
			_idleTimer = null;
			Destroy();
		}
	}
})();
