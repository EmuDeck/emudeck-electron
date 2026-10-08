"use strict";

(function () {
	
	function Start()
	{
		window.cr_createRuntime({
			exportType: "html5"
		});
	};
	
	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", Start);
	else
		Start();
	
})();