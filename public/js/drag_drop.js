function dragLeaveHandler(event) {
	// Set style of drop zone to default
	event.target.classList.remove('draggedOver'); 
}

function dragEnterHandler(event) {
	// Show some visual feedback
	event.target.classList.add('draggedOver'); 
}

function dragOverHandler(event) {
	 //console.log("Drag over a droppable zone");
	 // Do not propagate the event
	 event.stopPropagation();
	 // Prevent default behavior, in particular when we drop images or links
	 event.preventDefault(); 
}

function dropHandler(event) {
	// Do not propagate the event
	event.stopPropagation();
	
	// Prevent default behavior, in particular when we drop images or links
	event.preventDefault();

	// reset the visual look of the drop zone to default
	event.target.classList.remove('draggedOver'); 

	// get the files from the clipboard
	var files = event.dataTransfer.files;
	var filesLen = files.length; 
	var filenames = "";

	// iterate on the files, get details using the file API
	// Display file names in a list.
	for(var i = 0 ; i < filesLen ; i++) {
		filenames += '\n' + files[i].name;

		var tracks2 = new Array();
		tracks2.push(files[0].name);

		bufferLoader2 = new BufferLoader(
			context,
			tracks2,
			finishedLoadingAdd
			);
		bufferLoader2.load();
	}
}