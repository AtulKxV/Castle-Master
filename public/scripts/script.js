//modal options
function description()
{
	document.getElementById('description-section').style.display="block";
	document.getElementById('options-section').style.display="none";
	document.getElementById('advanced-section').style.display="none";
}

function option()
{
	document.getElementById('description-section').style.display="none";
	document.getElementById('advanced-section').style.display="none";
	document.getElementById('options-section').style.display="block";
}

function advanced()
{
	document.getElementById('description-section').style.display="none";
	document.getElementById('options-section').style.display="none";
	document.getElementById('advanced-section').style.display="block";
}

//enabling dropdown toggles for bootstrap
$(document).ready(function() {
    $(".dropdown-toggles").dropdown();
});

//$('.popover-dismiss').popover({
//	trigger: 'focus'
//})

//to auto copy the share link in FileSharing
function copyLinkFunction() {
	var copyText = document.getElementById("shareLinkModal"); /* Get the text field */
	copyText.select(); /* Select the text field */
	copyText.setSelectionRange(0, 99999); /*For mobile devices*/
	document.execCommand("copy"); /* Copy the text inside the text field */
	document.getElementById("copyLinkConfirmation").style.display="block";
	document.getElementById("copyLinkConfirmation").innerHTML="Link Copied!";/* Alert the copied text */
	var removeConfirmation = setTimeout(removeConf, 4000);
	function removeConf() {
		document.getElementById("copyLinkConfirmation").style.display="none";
	}
}



function toggleAccent(accentValue) {
	if (accentValue == 1) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "primaryAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	} if (accentValue == 2) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("pinkAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "warningAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	} if (accentValue == 3) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "pinkAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	} if (accentValue == 4) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "purpleAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	} if (accentValue == 5) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "fireAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}	
	} if (accentValue == 6) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "fireAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "greenAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	}
	document.cookie = "activeAccent=" + accentValue + ";expires=Thu, 18 Dec 2030 12:00:00 UTC;path=/";
}


function preselectedAccent() {
	const isWarningAccent =  document.getElementsByClassName("warningAccent")[0];
	const isPinkAccent =  document.getElementsByClassName("pinkAccent")[0];
	const isPurpleAccent =  document.getElementsByClassName("purpleAccent")[0];
	const isFireAccent =  document.getElementsByClassName("fireAccent")[0];
	const isGreenAccent =  document.getElementsByClassName("greenAccent")[0];
	if (isWarningAccent) {
		document.getElementById('warningAccent').checked = true;	
	} if (isPinkAccent) {
		document.getElementById('pinkAccent').checked = true;	
	} if (isPurpleAccent) {
		document.getElementById('purpleAccent').checked = true;	
	} if (isFireAccent) {
		document.getElementById('fireAccent').checked = true;	
	} if (isGreenAccent) {
		document.getElementById('greenAccent').checked = true;	
	}
}


function getCookie(activeAccent) {
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	var fca = decodedCookie.split('=');
	if (fca[1]==1) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "primaryAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
	}
	if (fca[1]==2) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("pinkAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "warningAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
		document.getElementById('warningAccent').checked = true;	
	}
	if (fca[1]==3) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "purpleAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "pinkAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
		document.getElementById('pinkAccent').checked = true;	
	}
	if (fca[1]==4) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "fireAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "purpleAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
		document.getElementById('purpleAccent').checked = true;	
	}
	if (fca[1]==5) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "greenAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "fireAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}	
		document.getElementById('fireAccent').checked = true;	
	}
	if (fca[1]==6) {
		var element = document.getElementsByTagName('body')[0]
		element.classList.remove("warningAccent", "pinkAccent", "purpleAccent", "fireAccent");
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "greenAccent";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
		document.getElementById('greenAccent').checked = true;	
	}
	/* for(var i = 0; i <ca.length; i++) {
	  var c = ca[i];
	  while (c.charAt(0) == ' ') {
		console.log(c.substring(1));
	  }
	  if (c.indexOf(accentValue) == 0) {
		console.log(c.substring(accentValue.length, c.length));
	  }
	} */
}









var options = {
	bottom: '64px', // default: '32px'
	right: 'unset', // default: '32px'
	left: '22px', // default: 'unset'
	time: '0.9s', // default: '0.3s'
	mixColor: '#fff', // default: '#fff'
	backgroundColor: '#fff',  // default: '#fff'
	buttonColorDark: 'transparent',  // default: '#100f2c'
	buttonColorLight: 'transparent', // default: '#fff'
	saveInCookies: true, // default: true,
	label: '', // default: ''
	autoMatchOsTheme: true, // default: true
}
const darkmode =  new Darkmode(options);
darkmode.showWidget();


function preselectedBackground() {
	const isDarkmode = document.getElementsByClassName("darkmode--activated")[0];
	//const isColormode = document.getElementsByClassName("colormode--activated")[0];
	if (isDarkmode) {
		document.getElementById('darkModeToggleButton').checked = true;
	}
}


function toggleMode (modeValue) {
	if (modeValue == 2) {
		document.getElementsByClassName('darkmode-toggle')[0].click()
	} if (modeValue == 1) {
		document.getElementsByClassName('darkmode-toggle')[0].click()
	}
}

/* function toggleMode(modeValue) {
	if (modeValue == 3) {
		const isColormodeActive = document.getElementsByClassName("colormode--activated")[0];
		if (isColormodeActive) {
			var element = document.getElementsByTagName('body')[0]
			element.classList.remove("colormode--activated");
		}
		document.getElementsByClassName('darkmode-toggle')[0].click()
	} if (modeValue == 2) {
		const isDarkmodeActive = document.getElementsByClassName("darkmode--activated")[0];
		if (isDarkmodeActive) {
			document.getElementsByClassName('darkmode-toggle')[0].click()
		}
		document.getElementById('defaultMode').click()
		var element, name, arr;
		element = document.getElementsByTagName("body")[0];
		name = "colormode--activated";
		arr = element.className.split(" ");
		if (arr.indexOf(name) == -1) {
			element.className += " " + name;
		}
		document.getElementById('colorModeButton').checked = true;
	} if (modeValue == 1) {
		const isDarkmodeActive = document.getElementsByClassName("darkmode--activated")[0];
		const isColormodeActive = document.getElementsByClassName("colormode--activated")[0];
		if (isDarkmodeActive) {
			document.getElementsByClassName('darkmode-toggle')[0].click()
		} if (isColormodeActive) {
			var element = document.getElementsByTagName('body')[0]
			element.classList.remove("colormode--activated");
		}
	} else {
		
	}
} */




















function checkEmail() {
	var email = document.getElementById('email').value;
	var checkEmailEnd = email.endsWith(".com");
	if (checkEmailEnd == false) {
		document.getElementById("jsEmailErrorMessage").innerHTML = "Please enter valid Email Address.";
	}
}


/* //to auto copy the Email Address in Help Messages Response
function copyResponseEmailFunction() {
	var copyEmail = document.getElementById("responseEmailInput"); /* Get the text field *
	copyEmail.select(); /* Select the text field *
	document.execCommand("copy"); /* Copy the text inside the text field *
	console.log('before copy Email')
	window.location.href = 'https://mail.google.com/mail/u/2/?hl=en#inbox?compose=new';
} */



function helpMessageRespond()
{
	document.getElementById('helpMessageResponseDiv').style.display="block";
	document.getElementById('helpMessageDetailsDiv').style.display="none";
}
function helpMessageResponseCancel()
{
	document.getElementById('helpMessageResponseDiv').style.display="none";
	document.getElementById('helpMessageDetailsDiv').style.display="block";
}

function showRemainingDeleteForm() {
	document.getElementById('hiddenDeleteAccountForm').style.display="block"
}