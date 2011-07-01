/**
 * ASSIGNMENT REQUIREMENTS
 * Create an html page that has a numbered list of items.
 * A user must be able to add an item to the list, and remove one or more items from the list.
 * 	There must be a way to retrieve the current state of the list as a JSON string, and a way to
	restore state from a JSON string.
	It should work in IE6-8, Firefox, and WebKit. Do not use any external libraries, with one
	exception: you can use JSON2 (http://www.json.org/json2.js) to handle JSON parse/stringify.
	You may not use inline event listeners. The interface should be intuitive and attractive (flex your
	css skills).
 * @author adrian lopez
 */

//IE doesn't have indexOf for their Array's
if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i = 0; i < this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
};
/**
 * Helper methods
 * @return (Obj) the object that contains all of the helper functions
 */
$ = function(){
	
	return {
		/**
		 * Check the type of a variable against Javascript's native types
		 * @param (mixed) variable to check the type of
		 * @param (mixed) a native Javascript type to check the variable against
		 * @return (bool) is the variable the type we were checking against?
		 */
		checkType:function( variable, type ) {
			return Object.prototype.toString.call(variable).split(" ")[1].toLowerCase().indexOf(type) > -1
		},
		
		/**
		 * Check to see if an element has a class
		 * @param (DOMElm) the DOM Element who's classes we want to check
		 * @param (String) the class we want to check on the element
		 * @return (bool) did the element have that class?
		 */
		hasClass: function( elm, classNameToCheck ){
			if( typeof elm.className == "undefined" ) {
				return false;
			} else {
				if( elm.className.indexOf( classNameToCheck ) > -1 ) {
					return true;
				}
			}
			return false;
		},
		
		/**
		 * Given an element, traverse up the DOM till we find (or not)
		 * an element that has a specified class
		 * @param (DOMElm) the DOM Element that is the starting point
		 * 					for the traversal
		 * @param (String) the class we want to check on the element
		 * 					we are looking for
		 * @return (mixed) did we find the element up the tree, if so
		 * 					return the element, else return false
		 */
		findParentByClass:function( elm, classNameToCheck ){
			var start = true;
			while( start ) {
				if( $.hasClass( elm, classNameToCheck ) ) {
					return elm;
				} else {
					if( !elm.parentNode ) {
						return false;
					} else {
						elm = elm.parentNode;
					}
				}
			}
			return false;
		},
		
		/**
		 * Remove a class from an element
		 * @param (DOMElm) the DOM Element that will have a class removed
		 * @param (String) the class we want to remove on the element
		 * @return (bool) did the element have that class?
		 */
		removeClass: function( elm, classNameToRemove ){
			if( elm.className.indexOf(classNameToRemove) > -1 ) {
				elm.className = ( elm.className ).replace( new RegExp( classNameToRemove, "g" ), "" );
				return true;
			}
			return false;
		},
		
		/**
		 * Add a class from an element
		 * @param (DOMElm) the DOM Element that we want to add a class onto
		 * @param (String) the class we want to add to the element
		 * @return VOID
		 */
		addClass:function( elm, classNameToAdd ){
			this.removeClass( elm, classNameToAdd );
			elm.className = this.trim(elm.className + " " +classNameToAdd);
		},
		
		/**
		 * Trim a string's whitespace
		 * @param (String) a string that will be trimmed
		 * @return (bool) a trimmed string
		 */
		trim:function( strToTrim ) {
			
			// use the browser's default trim method if it exists, if not, we 
			// make our own
			var trimFunc = (typeof String.prototype.trim == "function" 
					?
					String.prototype.trim 
					: 
					function(){
						return this.replace(/(^\s?|\s?$)/,"");
					});
			return trimFunc.call( strToTrim );
		},
		
		/**
		 * Initialize the app when the DOM is ready
		 * @param (Function) the function to call when the DOM is ready
		 * @return VOID
		 */
		startApp: function( func ) {
			
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", func, false);
			} else {
				window.onload = func;
			}
		},
		/**
		 * Stop an event from propagating
		 * @param (Event) the event to stop progpagation on
		 * @return (Event) the event passed in
		 */
		stopEvent:function( e ) {
			if (e.stopPropagation) e.stopPropagation();
			else e.cancelBubble = true;

			if (e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			return e;
		},
		/**
		 * Get the target element of the event
		 * @param (Event) the event to get the target of
		 * @return (DOMElm) the element that is the target of the event
		 */
		getEventTarget:function( e ){
			return ( typeof( e.srcElement ) == "undefined" ) ? e.target : e.srcElement;
		}
	}
}();

/**
 * An Object that represents the internal state of the array
 * @return VOID
 */
function StateManager() {
	this.state = {contents:[]};
}

StateManager.prototype = {
	
	/**
	 * Add a new member to the internal array
	 * @param (String) the new string to add
	 * @return (Mixed) if there is a valid string passed in, add it to the internal array
	 * 					otherwise throw an error
	 */
	add:function( str ){
		var position = this.state.contents.indexOf( str );
		if( position == -1 ) {
			if( $.checkType( str, "string" ) ) {
				this.state.contents.push( str );
			} else {
				throw "trying to insert something into the statemanager that is not a string";
			}
		} else {
			throw "This seems to have already been added to the list"
		}
	},
	
	/**
	 * Remove a member of the internal Array at a specified position
	 * @param (String) the string to remove
	 * @param (int) the position of the string in the internal array
	 * @return (bool) was the removal successful?
	 */
	remove:function( str, listPosition ){
		var position = this.state.contents.indexOf( str );
		if( position > -1 && listPosition == position ) {
			this.state.contents.splice(position,1);
			return true;
		}
		return false;
	},
	
	/**
	 * Replace a member of the internal array at the specified position
	 * @param (int) the index of the internal array we want to replace
	 * @param (String) the string we want to replace at the specified positon
	 * @return (Mixed) return true if a valid string is passed in and a correct position
	 * 					is passed in, other wise it might throw an error or return false
	 */
	replace:function( listPosition, newStr ){
		if( typeof this.state.contents[listPosition] !== "undefined" ) {
			if( $.checkType( newStr, "string" ) ) {
				this.state.contents[listPosition] = newStr;
				return true;
			} else {
				throw "trying to insert something into the statemanager that is not a string";
			}
			
		}
		return false;
	},
	
	/**
	 * Return a string version of the app's internal state
	 * @return (String) a JSON string representing the app's internal state
	 */
	output:function(){
		return JSON.stringify( this.state );
	},
	
	/**
	 * Replace the internal state with a JSON obj
	 * @param (Obj) a new object that will replace the internal state
	 * @return VOID
	 */
	newStateFromObj:function( newState ){
		this.state = newState;
	},
	
	/**
	 * Return a COPY of the internal array
	 * @return (bool) a copy of the internal array
	 */
	getContents: function(){
		return this.state.contents.slice();
	},
	
	/**
	 * Get an item by its index in the internal array
	 * @param (int) the index of the string we want in the internal array
	 * @return (Mixed) if that is a valid index, return the string at 
	 * 					that position, else return false.
	 */
	getByIndex:function( i ){
		if( $.checkType( this.state.contents[i], "string" ) ) {
			return this.state.contents[i];
		}
		return false;
	},
	
	/**
	 * Get the number of items
	 * @return (Int) the number of items in the list
	 */
	len:function(){
		return this.stateManger.contents.length;
	},
	
	/**
	 * Validate a JSON object that will eventually replace the app's internal state
	 * @param (Obj) a new object we want to validate
	 * @return (Mixed) will return an error if there the object being passed in doesn't
	 * 					meet the internal states requirements, will return true otherwise
	 */
	validateInternalObj:function( newJSON ){
		if( !$.checkType(newJSON,"object") ) {
			return "input must be a JSON object";
		}
		if( !("contents" in newJSON) ) {
			return "the object must have a member called contents that is an array of list elements e.g. {contents:['one']}"; 
		}
		if( !$.checkType( newJSON.contents, "array" ) ) {
			 return "the object must hold an array of list elements e.g. {contents:['one']}"; 
		}
		if( newJSON.contents.length === 0 ) {
			return "though the JSON object is formatted correctly, there was no list elements detected in the object"; 
		}
		if( !$.checkType( newJSON.contents[0], "string" ) ) {
			 return "members of the objects array must be strings for each of the list elements contents e.g.['list element 1']";
		}
		return true;
	}
		
}
/**
 * The list builder App
 * @return VOID
 */
function ListBuilder() {
	
	// the outer form that contains all of the elements
	this.form		= document.forms['mainForm'];
	// a raw template string we will use for adding new items to the list
	this.template	= document.getElementById("fauxListElm").innerHTML;
	// the entire list element
	this.listElm	= document.getElementsByTagName("ol")[0];
	// the indentifier that is in the template that serves as a placeholder for
	// the items title
	this.strInterpolationId = "%s"
	// is the browser internet explorer
	this.isIE = $.hasClass( document.getElementById("html"), "ie" );
	var self = this;
	// determine if the browser supports the place holder
	this.supportsPlaceHolder = function(){
	  var i = document.createElement('input')
	  	, supportsPlaceHolder = 'placeholder' in i;
	  return supportsPlaceHolder;
	}();
	
	// make the placeholder text for the browsers that don't support it
	if( !this.supportsPlaceHolder ){
		var names = ['mainTextInput','jsonTextInput']
		  , current;
		for( var i = 0; i < names.length; i++ ){
			current = this.form[names[i]];
			current.value = current.getAttribute('placeholder');
		}
		
	}
}

// build the prototype as an object for speed
ListBuilder.prototype = {
	
	/**
	 * A secondary constructor that binds events and add's
	 * the default list items to the app's internal state
	 * @return VOID
	 */
	init: function(){
		
		this.bindEvent("submit",this.form, this.eventRouter);
		this.bindEvent("click",this.form, this.eventRouter);
		this.bindEvent("blur",this.form, this.eventRouter);
		this.bindEvent("focus",this.form, this.eventRouter);
		
		this.state = new StateManager();
		this.addInitialElements();
	},
	
	/**
	 * Add the items that are in the list on page load to the 
	 * app's internal state
	 * @return VOID
	 */
	addInitialElements:function(){
		var current;
		for( var i = 0; i < this.listElm.children.length; i++ ) {
			current = this.listElm.children[i];
			this.state.add( current.children[0].value );
		}
	},
	
	/**
	 * Bind functions to elements and change the scope to this object
	 * ( basically "attachEvent" || "addEventListener")
	 * @param (string) the name of the event we are binding
	 * @param (DOMElm) the element to bind the function for
	 * @param (string) the function we are binding to the elemnt
	 */
	bindEvent:function( eventName, elm, func ){
		
		var self			= this
			// start building an argument list so you can alter the first parameter
			// if nessecary
		 	,args 			= [ eventName ];
		
		// attach the event listener as well as change
		// the scope that the function is called in to
		// the listbuilder object	      			    
		args.push(function( e ){
			var ev = typeof( e ) == "undefined" ? window.event : e;
			func.call(self,ev);
		});
		// set the correct event registration handler
		var attachEventFunc = function( eName, nFunc, bubbling, attachEventDirectly ){
			if( !attachEventDirectly ){
				if( $.checkType( elm.addEventListener, "function" ) ){
					elm.addEventListener( eName, nFunc, bubbling );
				} else if( $.checkType( elm.attachEvent,"function" ) ){
					elm.attachEvent( "on" + eName, nFunc );
				} else {
					elm["on" + eName] = nFunc;
				}
			} else {
				elm["on" + eName] = nFunc;
			}
		};
		// catch event on the bubbling phase so we can delegate
		// the blur || focus events
		if( (eventName == "blur" || eventName == "focus") ) {
			args.push(true);
			// we have to attach event listeners for focusout || focusin
			// so that event delegation will work.
			var alsoAttach		= ( eventName == "blur" ? "focusout" : "focusin" )
				,alsoAttachArgs = args.slice();
			alsoAttachArgs[0] = alsoAttach;
			attachEventFunc(alsoAttachArgs[0],alsoAttachArgs[1],alsoAttachArgs[2],true);
		}
		attachEventFunc(args[0],args[1],args[2],false);
	},
	
	/**
	 * All of the delegated event are routed through this function
	 * @param (Event) the native delegated event
	 * @return VOID
	 */
	eventRouter:function( e ){
		var target = $.getEventTarget(e)
		  , id = (target.getAttribute("id") || false);

		if( target.getAttribute("type") == "text") {
			if( (e.type == "focus"|| e.type == "focusin") ) {
				this.focusedElm = target;
			}
			if( (e.type == "blur" || e.type == "focusout") ) {
				this.focusedElm = false;
			}
		}
			
		if( id == "addListElm" ) {
			
			$.stopEvent(e);
			if( this.focusedElm && $.hasClass( this.focusedElm, "editInput") ) {
				
				this.editListElement( target );
				
			} else if( e.type == "click" ) {
				
				this.addListElement();
				
			}
			
		} else if( id == "removeListElm" ) {
			
			$.stopEvent(e);
			this.removeListElements();
			
		} else if( id == "addListElm" ) {
			
			$.stopEvent(e);
			this.addListElement();
			
		} else if( id == "outputJSON" ) {
			
			$.stopEvent(e);
			this.outputJSON();
			
		} else if( id == "inputJSON" ) {
			
			$.stopEvent(e);
			this.inputJSON();
			
		} else if( (e.type == "focus" || e.type == "focusin")) {
			
			if ( $.hasClass( target, "textBox") ){
				var placeHolder = target.getAttribute('placeholder')
				if( !this.supportsPlaceHolder && target.value == placeHolder ){
					target.value = "";
				}
				
			}
			
		} else if( (e.type == "blur" || e.type == "focusout") ){
			
			if( $.hasClass( target, "editInput") ){
				
				$.stopEvent(e);
				this.editListElement( target );
				
			} else if ( $.hasClass( target, "textBox") ){
				var placeHolder = target.getAttribute('placeholder')
				if( !this.supportsPlaceHolder && target.value == "" ){
					target.value = placeHolder;
				}
				
			}
			
		}
	},
	
	/** 
	 * Output the state of the app into a JSON string in
	 * a text field.
	 * @return VOID
	 */
	outputJSON:function(){
		this.form['jsonTextInput'].value = this.state.output();
	},
	
	/** 
	 * take in a string representing a JSON object, check its
	 * validity (alert user if not valid), and then rebuild the 
	 * list if it is a valid string
	 * @return VOID
	 */
	inputJSON:function(){
		
		var value = this.form['jsonTextInput'].value;
		if( value.length === 0 ){
			alert("please put something in the textbox");
			return;
		}
		
		var possibleJSON	= JSON.parse(value)
			// validate the JSON, a string that holds an error message will
			// be returned if it isnt a valid JSON obj, or doesnt work for
			// this list. it returns true if valid.
		  , isValidJSON		= this.state.validateInternalObj(possibleJSON);
		
		if( $.checkType(isValidJSON,"boolean") && isValidJSON ) {
			
			// set the app's internal state to the new state
			this.state.newStateFromObj( possibleJSON );
			// remove old elements and build the new ones
			this.listElm.innerHTML = "";
			var contents = this.state.getContents();
			for( var i = 0; i < contents.length; i++ ) {
				this.createNewListElement( contents[i], true );
			}
			
		} else {
			alert(isValidJSON);
		}
	},
	
	/**
	 * Remove all of the checked items in the list
	 * @return VOID
	 */
	removeListElements:function(){
		
		var checkboxes = this.form['checkboxes']
		  , hasChecked = false;
		 
		//turn html collection into an array if needed
		checkboxes = checkboxes.length ? Array.prototype.slice.call(checkboxes) : [checkboxes];

		for( var i = 0; i < checkboxes.length; i++ ){
			if( checkboxes[i].checked ){
				hasChecked = true;
				this.removeSingleListElement( $.findParentByClass( checkboxes[i], "listElm" ) );
			}
		}
		
		if( hasChecked )
			document.getElementById("removeListElm").removeAttribute("disabled");
	},
	
	/**
	 * Remove a single item from the list
	 * @Param (DOM Elm) the list element you want removed from the DOM
	 * @return (bool) was the removal a success?
	 */
	removeSingleListElement:function( elm ){
		
		// find the position (that will act as the pointer in the internal states array
		// of items)
		var position = Array.prototype.indexOf.call(this.listElm.children, elm );
		this.state.remove( elm.children[0].value, position );
		elm.parentNode.removeChild(elm);
		return true;
	},
	
	/**
	 * Create a new item in the list
	 * @param (string)  the items title
	 * @param (bool)    true = do not add the string into the internal states
	 * 					list of items
	 */
	createNewListElement: function( str, suppressStateAdd ){
		
		suppressStateAdd = (suppressStateAdd || false);
		// create a DOM node to insert the "template's" HTML string into
		var elm = document.createElement( this.listElm.nodeName )
		// create the "template" string
		  , tmpl= this.template.replace( new RegExp(this.strInterpolationId,"g") , str );
		
		elm.innerHTML = tmpl;
		
		if(!suppressStateAdd) {
			try{
				this.state.add( str );
			} catch( e ){
				alert( e );
				return false;
			}
		}
		
		// append the new item to the DOM
		this.listElm.appendChild(  elm.children[0] );
	},
	
	/**
	 * Edit an existing list item
	 * @param (DOMElm) the item (textbox) that we are trying to edit
	 * @return VOID
	 */
	editListElement:function( elm ){
		
		var listElm		= $.findParentByClass( elm, "listElm" )
		// find the position of the list element in the lists HTMLCollection,
		// this collection should correspond to the position of this items
		// title in the internal state.
		  , position	= Array.prototype.indexOf.call(this.listElm.children, listElm )
		  , sanitizedStr= this.santitizeStr( elm.value )
		  , oldStr		= this.state.getByIndex(position);
		 
		//only alter the item if the title has changed
		if( position > -1 && sanitizedStr && oldStr !== sanitizedStr ) {
			this.state.replace( position, sanitizedStr )
		} else {
			elm.value = elm.defaultValue;
		}
	},
	
	/**
	 * Sanitize an items string to prevent XSS
	 * @param (string) the string we want to be the title of the item
	 * @return (string) the sanitized string 
	 */
	santitizeStr:function( str ){
		return str.replace(/[^0-9A-Za-z\s]/g,"");
	},
	
	/** 
	 * Add a new list item to the list
	 * @return void
	 */
	addListElement:function(){
		
		var textInput		= this.form['mainTextInput']
		  , initialTextStr	= textInput.value
		  , sanitizedTextStr= this.santitizeStr( initialTextStr );
		
		if( initialTextStr.length === 0 ) {
			$.addClass( textInput, "error" );
		} else if( sanitizedTextStr.length === 0 ) {
			$.addClass( textInput, "error" )
		} else {
			$.removeClass( textInput, "error" );
			this.createNewListElement( sanitizedTextStr );
		}
	}
};

$.startApp(function(){
	// quit if this function has already been called
	if (arguments.callee.done) return;

	// flag this function so we don't do the same thing twice
	arguments.callee.done = true;
	  
	(new ListBuilder()).init();
});