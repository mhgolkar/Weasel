// jshint esversion:6
// jshint -W069

var DEFAULT_THEME = 'dark';
var MIN_ADJACENT_SLOTS_HUE_DIFF = 25;
var FORMAT_BY_MAGIC_NUMBERS = {
	'89504E47':'png', '47494638':'gif', '25504446':'pdf', 'FFD8FFDB': 'jpg', 'FFD8FFEE':'jpg', '4F676753':'ogg', '38425053':'psd',
	'FFD8FFE0':'jpg', 'FFD8FFE1':'jpg', '49492A00':'tif', '4D4D002A':'tif', '53445058':'dpx', '58504453':'dpx', '7B5C7274':'rtf',
	'504B0304':'zip', '52617221':'rar', 'EDABEEDB':'rpm', '54444624':'tdf', '54444546':'tdef', '762F3101':'exr', '425047FB':'bpg',
	'57415645':'wav', '41564920':'avi', '664C6143':'flac', '4D546864':'midi', '75737461':'tar', '377ABCAF':'7z', 'FD377A58':'xz',
	'464C4946':'flif', '1A45DFA3':'mkv', '41542654':'djv', '774F4646':'woff', '774F4632':'woff2', '3C3F786D':'xml', '0061736D':'asm',
	'213C6172':'deb', '000001BA':'mpg', '000001B3':'mpg', '1B4C7561':'luac'
};
var WS;
var root, terminal, url, protocol, message, memory;
var _ArrayBuffers = [], _Blobs = [], _JSONs = [], _Memory = {}, _Memory_order = [];
var last_used_memory_slot_color, last_remembered_slot;
var TIME_MACHINE_CAPACITY = 75, time_machine = [], time_machine_index = 0;
var auto_scroll = true, auto_scroll_marker;
var file_selector_display;
function createSocket() {
	if (WS && 'readyState' in WS && WS.readyState === 1 ){
		WS.onclose = function(ev) { onClose(ev); createSocket(); };
		writeToScreen('Overriding Existing Connection...', 'error');
		WS.close();
	} else {
		var supports = 'WebSocket' in window || 'MozWebSocket' in window;
		var protocols;
		if ( supports ){
			if ( url.value.length > 0 ) {
				try {
					if( protocol.value.length > 0 ) {
						protocols = protocol.value.trim().replace(/\s/g, '');
						protocols =	( protocols.indexOf(',') > 0 ? protocols.split(',') : protocols);
						WS = window['MozWebSocket'] ? new MozWebSocket(url.value, protocols) : new WebSocket(url.value, protocols);
					} else {
						WS = window['MozWebSocket'] ? new MozWebSocket(url.value) : new WebSocket(url.value);
					}
					WS.onopen = function(ev) { onOpen(ev); };
					WS.onclose = function(ev) { onClose(ev); };
					WS.onmessage = function(ev) { onMessage(ev); };
					WS.onerror = function(ev) { onError(ev); };
					protocols = protocols ? ( typeof protocols === 'string' ? protocols : protocols.join(' , ') ) : '';
						if ( protocols.length > 0 ) protocols = `[ ${protocols} ]`;
					writeToScreen(`CONNECTING:   ${ url.value.toUpperCase() } ${protocols}`, 'url');
				} catch(err){
					writeToScreen('Unable to Create Socket! ' + err.message, 'error');
				}
			} else {
				writeToScreen('We Need a URL to Connect!', 'error');
			}
			// also save the last configs to the storage
			localStorage._weasel_last_used_protocol = protocol.value;
			localStorage._weasel_last_used_url = url.value;
		} else {
			writeToScreen("This Browser Doesn't Support WebSocket!", 'error');
		}
	}
}
function onOpen(ev){
	writeToScreen('CONNECTION READY', 'opening');
}
function onClose(ev){
	writeToScreen('CONNECTION CLOSED!', 'closing');
}
function onMessage(ev){
	var msg, bin_group, bin_position;
	if ( ev.data instanceof ArrayBuffer ){
		bin_group = '_ArrayBuffers';
		bin_position = _ArrayBuffers.length;
		_ArrayBuffers.push(ev.data);
		msg = `${ev.data.byteLength} byte ArrayBuffer!`;
	} else if ( ev.data instanceof Blob ){
		bin_group = '_Blobs';
		bin_position = _Blobs.length;
		_Blobs.push(ev.data);
		msg = `${ev.data.size} byte Blob!`;
	} else {
		msg = (typeof ev.data === 'object') ? JSON.stringify(ev.data) : ev.data;
	}
	writeToScreen( msg, 'incoming');
	if (bin_position !== undefined) makeBinaryLink(bin_group, bin_position);
}
function onError(ev){
	console.log(ev);
	var error_ = (ev && ev.data) ? ev.data : "The Connection is Abruptly Closed or Couldn't be Opened !";
	writeToScreen(error_, 'error');
}
function doSend(){
	if ( message.value.length > 0 ){
		if (WS && WS.readyState === 1 ) {
			writeToScreen(message.value, 'outgoing');
			WS.send(message.value);
			keepHistory(message.value);
		} else {
			writeToScreen('SOCKET IS NOT OPEN/READY', 'error');
		}
	}
}
function doSendBinary(send_as_blob){
	var file = document.querySelector('input[type="file"]').files[0];
	if (WS && WS.readyState === 1 ){
		if ( typeof file === 'object' ){
			if( send_as_blob ){
				WS.binaryType = 'blob';
				WS.send(file);
				writeToScreen(`♣ Blob Buffer Sent: ${file.name} [${file.size} B]`, 'outgoing');
			} else {
				var fileReader = new FileReader();
				fileReader.onerror = writeToScreen.bind(null, 'Unable to Read File As Array Buffer', 'error');
				fileReader.readAsArrayBuffer(file);
				fileReader.onload = function (ev) {
					if (ev.target.readyState === FileReader.DONE){
						WS.binaryType = 'arraybuffer';
						WS.send(fileReader.result);
						writeToScreen(`♠ Array Buffer Sent: ${file.name} [${file.size} B]`, 'outgoing');
					}
				};
			}
		} else {
			writeToScreen('No File Selected!', 'error');
		}
	} else {
		writeToScreen('SOCKET IS NOT OPEN/READY', 'error');
	}
}
var DOM_Parser = new DOMParser();
function writeToScreen(message, class_name){
	var is_json, pretty_print;
	if ( typeof message === 'string' && '{['.indexOf(message.trim()[0]) !== -1 ){
		try {
			var object = JSON.parse(message);
			pretty_print = JSON.stringify(object, undefined, 3);
			if (class_name === 'incoming') _JSONs.push(object);
			is_json = true;
		} catch(err){
			is_json = false;
		}
	}
	var p = document.createElement('p');
	if ( is_json === true ) {
		p.className = `${class_name} json`;
		var parsed_syntax_highlighted = DOM_Parser.parseFromString(`<pre>\t${ syntaxHighlight(pretty_print) }\t</pre>`, "text/html");
		var pre_contents = parsed_syntax_highlighted.getElementsByTagName('pre');
		for (var tag of pre_contents) {
			p.appendChild(tag);
		}
	} else {
		p.className = class_name;
		p.innerText = (typeof message === 'object') ? JSON.stringify(message) : message;
	}
	terminal.appendChild(p);
	if(auto_scroll) terminal.scrollTop = terminal.scrollHeight;
}
function switchAutoScroll(){
	auto_scroll = !auto_scroll;
	auto_scroll_marker.innerText = auto_scroll ? '⚫' : '⚪';
}
function syntaxHighlight(json) {
	var syntax_highlighted_json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return syntax_highlighted_json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var type = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				type = 'key';
			} else {
				type = 'string';
			}
		} else if (/true|false/.test(match)) {
			type = 'boolean';
		} else if (/null/.test(match)) {
			type = 'null';
		}
		return `<span class="${type}">${match}</span>`;
	});
}
function magicallyFindType(magic_slice, bin){
	var uint = new Uint8Array(magic_slice);
	var bytes = [];
	uint.forEach( function(byte){
		bytes.push( byte.toString(16) );
	});
	var hex = bytes.join('').toUpperCase();
	bin.magic_number = hex;
	return ( FORMAT_BY_MAGIC_NUMBERS.hasOwnProperty(hex) ) ? FORMAT_BY_MAGIC_NUMBERS[hex] : 'bin';
}
function makeBinaryLink(bin_group, bin_position){
	var blob;
	var bin = window[bin_group][bin_position];
	if ( bin instanceof Blob ){
		blob = bin;
	} else if ( bin instanceof ArrayBuffer ) {
		blob = new Blob( [bin] );
	}
	var link = window.URL.createObjectURL(blob);
	var extension;
	if ( typeof blob.type === 'string' && blob.type.length > 0 ){
		extension = blob.type;
	} else {
		if ( bin instanceof Blob ){
			var filereader = new FileReader();
			filereader.onloadend = function(ev) {
				if (ev.target.readyState === FileReader.DONE) {
					extension = magicallyFindType(ev.target.result, bin);
					writeBinaryLinks(link, bin_group, bin_position, extension);
				}
			};
			var magic_part = bin.slice(0, 4);
			filereader.readAsArrayBuffer(magic_part);
		} else if ( bin instanceof ArrayBuffer ){
			var magic_slice = bin.slice(0, 4);
			extension = magicallyFindType(magic_slice, bin);
			writeBinaryLinks(link, bin_group, bin_position, extension);
		} else {
			writeBinaryLinks(link, bin_group, bin_position, extension);
		}
	}
}
function writeBinaryLinks(link, bin_group, bin_position, extension){
	var bin_title = `${bin_group}[${bin_position}]`;
	var links = document.createElement('p');
	links.innerText = `${bin_title} :: ${extension.toUpperCase()} `;
	var download = document.createElement('a');
		download.setAttribute('download', `${bin_title}.${extension}`);
		download.href = link;
		download.innerText = 'SAVE ⮟';
		links.appendChild(download);
	var open = document.createElement('a');
		open.target = '_blank';
		open.href = link;
		open.innerText = 'OPEN ⯁';
		links.appendChild(open);
	var print = document.createElement('span');
		print.innerText = 'LOG ☷';
		print.addEventListener('click', function(){
			console.log(bin_title, window[bin_group][bin_position]);
		});
		links.appendChild(print);
	links.className = 'binary-links';
	terminal.appendChild(links);
}
function colorIsNotClear(usedColor){
	return (
		_Memory.hasOwnProperty(usedColor) ||
		( last_used_memory_slot_color != undefined &&
			Math.abs(last_used_memory_slot_color - usedColor) < MIN_ADJACENT_SLOTS_HUE_DIFF
		)
	);
}
function appendMemorySlot(slotColor){
	var memory_slot = document.createElement('li');
	memory_slot.style.backgroundColor = `hsl(${slotColor},50%,50%)`;
	memory_slot.id = `m-${slotColor}`;
	memory_slot.addEventListener('click', remember.bind(null, slotColor));
	memory_slot.addEventListener('dblclick', remember.bind(null, slotColor, undefined, true));
	memory_slot.addEventListener('contextmenu', forget.bind(null, slotColor));
	memory.appendChild(memory_slot);
}
function memorize(){
	if ( message.value.length > 0 ){
		var randomHueID;
		do { // make a unique color/id for the _Memory
			randomHueID = Math.floor(Math.random() * 360) + 1;
		} while ( colorIsNotClear(randomHueID) );
		last_used_memory_slot_color = randomHueID;
		_Memory[randomHueID] = message.value;
		last_remembered_slot = _Memory_order.length;
		_Memory_order.push(randomHueID);
		appendMemorySlot(randomHueID);
	}
}
function remember(memorySlotID, remembered_index, also_send){
	if ( _Memory.hasOwnProperty(memorySlotID) ){
		message.value = _Memory[memorySlotID];
		if( remembered_index == undefined || remembered_index >= _Memory_order.length ) last_remembered_slot = _Memory_order.indexOf(memorySlotID);
		if (also_send === true) doSend();
	}
}
function rememberRoll(){
	var slots_count = _Memory_order.length;
	if ( slots_count > 0 ){
		if (typeof last_remembered_slot !== 'number' || last_remembered_slot >= (slots_count - 1)){
			last_remembered_slot = 0;
		} else {
			last_remembered_slot++;
		}
		remember(_Memory_order[last_remembered_slot], last_remembered_slot);
	} else {
		writeToScreen('No Memory Slot to Rotate!', 'error');
	}
}
function keepHistory(sent_message){
	time_machine_index = 0;
	time_machine.unshift(sent_message);
	if (time_machine.length > TIME_MACHINE_CAPACITY) time_machine.pop();
}
function timeMachine( direction ){
	if ( time_machine.length > 0 ){
		// time_machine_index[0] is the last recent record
		if (direction === true && time_machine_index < (time_machine.length - 1)){ // backward
			time_machine_index++;
		}
		if (direction === false && time_machine_index > 0) { // forward
			time_machine_index--;
		}
		message.value = time_machine[time_machine_index];
	}
}
function forget(memorySlotID, event){
	if (event) event.preventDefault();
	if ( _Memory.hasOwnProperty(memorySlotID) ){
		delete _Memory[memorySlotID];
		var slot_index = _Memory_order.indexOf(memorySlotID);
		if (last_remembered_slot == slot_index) last_remembered_slot = undefined;
		_Memory_order.splice(slot_index, 1);
		document.getElementById(`m-${memorySlotID}`).remove();
	}
}
function storeMemorySlots(){
	var memory_slots_to_store = {
		order: _Memory_order,
		slots: _Memory
	};
	localStorage._weasel_stored_memory_slots = JSON.stringify(memory_slots_to_store);
	writeToScreen('Memory Slots Stored', 'opening');
}
function clearStorage(){
	var current_theme = localStorage._weasel_theme;
	localStorage.clear(); // but keep the theme ...
	localStorage._weasel_theme = current_theme;
	writeToScreen('Storage Cleared', 'error');
}
document.addEventListener("DOMContentLoaded", function() {
	root = document.getRootNode().documentElement;
	terminal = document.getElementById('terminal');
	message = document.getElementById('message');
	url = document.getElementById('url');
	protocol = document.getElementById('protocol');
	memory = document.getElementById('memory');
	auto_scroll_marker = document.querySelector('#switch-auto-scroll span');
	file_selector_display = document.querySelector('#file-selector span#file-name');
	message.value = ''; // clear text area
	document.getElementById('dark-switcher').addEventListener('click', function(ev){
		ev.preventDefault();
		var is_dark = ( root.getAttribute('data-theme').indexOf('dark') === 0 ) ? true : false;
		var theme_ = ( is_dark ? 'normal' : 'dark' );
		root.setAttribute('data-theme', theme_);
		localStorage._weasel_theme = theme_;
	});
	document.getElementById('store-memory').addEventListener('click', storeMemorySlots);
	document.getElementById('clear-storage').addEventListener('click', clearStorage);
	document.getElementById('switch-auto-scroll').addEventListener('click', switchAutoScroll);
	document.querySelector('#ws-construction').addEventListener('submit', function(ev){ ev.preventDefault(); message.focus(); });
	document.querySelector('input[type="submit"][value="OPEN"]').addEventListener('click', createSocket);
	document.querySelector('input[type="button"][value="CLOSE"]').addEventListener('click', function(){ if (WS) WS.close(); });
	document.querySelector('input[type="button"][value="SEND"]').addEventListener('click', doSend);
	document.querySelector('input[type="button"][value="R"]').addEventListener('click', function(){ message.value = ''; });
	document.querySelector('input[type="button"][value="C"]').addEventListener('click', function(){ terminal.innerText = ''; });
	document.querySelector('input[type="button"][value="M+"]').addEventListener('click', memorize);
	document.querySelector('input[type="button"][value="<"]').addEventListener('click', timeMachine.bind(null, true));
	document.querySelector('input[type="button"][value=">"]').addEventListener('click', timeMachine.bind(null, false));
	document.querySelector('input[type="button"][value="blob"]').addEventListener('click', doSendBinary.bind(null, true));
	document.querySelector('input[type="button"][value="array"]').addEventListener('click', doSendBinary.bind(null, false));
	document.querySelector('input[type="file"]').addEventListener('change', function(ev){ file_selector_display.innerText = ( 'files' in ev.srcElement &&  ev.srcElement.files.length > 0) ? ev.srcElement.files[0].name : 'No File Selected.'; });
	document.querySelector('input[type="file"]').value = ''; // reset the file input
	// reload stored settings, memory, etc.
	if( localStorage.hasOwnProperty('_weasel_theme') && typeof localStorage._weasel_theme === 'string' && localStorage._weasel_theme.length > 0 ) {
		root.setAttribute('data-theme', localStorage._weasel_theme);
	} else {
		root.setAttribute('data-theme', DEFAULT_THEME);
		localStorage._weasel_theme = DEFAULT_THEME;
	}
	if( localStorage.hasOwnProperty('_weasel_last_used_url') && typeof localStorage._weasel_last_used_url === 'string' && localStorage._weasel_last_used_url.length > 0 ) url.value = localStorage._weasel_last_used_url;
	if( localStorage.hasOwnProperty('_weasel_last_used_protocol') && typeof localStorage._weasel_last_used_url === 'string' && localStorage._weasel_last_used_protocol.length > 0 ) protocol.value =  localStorage._weasel_last_used_protocol;
	if( localStorage.hasOwnProperty('_weasel_stored_memory_slots') && typeof localStorage._weasel_stored_memory_slots === 'string' && localStorage._weasel_stored_memory_slots.length > 0 ){
		var parsed_memory_slots_storage =  JSON.parse(localStorage._weasel_stored_memory_slots);
		_Memory =  parsed_memory_slots_storage.slots;
		_Memory_order = parsed_memory_slots_storage.order;
		for (var color = 0; color < _Memory_order.length; color++) {
			appendMemorySlot( _Memory_order[color] );
		}
	}
	// shortcuts
	window.onkeyup = function(event) {
		// console.log('Key Up: ', event.keyCode, event);
		if( event.ctrlKey ) { // ctrl ...
			event.preventDefault();
			// if numeral key (also numpad) ...
			if ( ( event.keyCode >= 48 /* 0 */ && event.keyCode <= 57 /* 9*/ ) || ( event.keyCode >= 96 /* num-0 */ && event.keyCode <= 105 /* num-9*/ ) ){
				let number = (event.keyCode <= 57 ? Math.abs(48 - event.keyCode) : Math.abs(96 - event.keyCode) );
				if ( number <= 9 ){ // 0 - 9 (it's always >= 0 because of .abs func )
					// console.log('Recall Memory Slot: ', number);
					if ( _Memory_order.length > number ){ // ... remember by index
						remember( _Memory_order[number] );
					}
				}
			} else { // other keys
				switch (event.keyCode) {
					case 13: // Enter
						if (event.altKey) { // + alt + Enter
							createSocket(); // open a connection
						} else {
							doSend(); // -> send text message
						}
						break;
					case 77:
						if (event.altKey) { // + alt + m
							rememberRoll();
						} else { // m
							memorize();
						}
						break;
					case 90:
						if (event.altKey) { // + alt + z
							timeMachine(true); // backward
						}
						break;
					case 88:
						if (event.altKey) { // + alt + x
							timeMachine(false); // forward
						}
						break;
					case 66:
						if (event.altKey) { // + alt + b
							doSendBinary(true);
						}
						break;
					case 83:
						if (event.altKey) { // + alt + s
							switchAutoScroll();
						}
						break;
				}
			}
		}
	};
});
