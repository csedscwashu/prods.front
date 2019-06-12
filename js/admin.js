// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>

var pswd, state;
var aurl=server+"admin";

if(localStorage.admin_key) {
    $('#adminkey').val(localStorage.admin_key);
    pswd = localStorage.admin_key;
}

////////////////////////////////////////// Tab Switcher
const navto = function(id) {
    $('.ntabs').removeClass('active'); $('.mtabs').addClass('d-none');
    $('#'+id).addClass('active'); $('#tab'+id).removeClass('d-none');
}

////////////////////////////////////////// Create Zero files

const zfloop = function (skeys,start,skip,callback) {

    if(start >= skeys.length) {	callback(); return; }
	
    postOb = JSON.stringify({'op': 'zerofile', 'keys': skeys.slice(start,start+skip), 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function () { zfloop(skeys, start+skip, skip, callback); })
	.fail(function () {alert("Server error."); callback(); });
}

const zfile = function (callback) {
    postOb = JSON.stringify({'op': 'getlists', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    skeys = Object.keys(data.lists.dblist.students).sort();
	    zfloop(skeys,0,20,callback);
	    
	}).fail(function () {alert("Server error."); callback(); });
}

////////////////////////////////////////// Clear Submissions
const dsingle = function () {
    skey = $('#clearwkey').val();
    postOb = JSON.stringify({'op': 'clearone', 'key': skey, 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (req) {
	    if(req.code == 0)
		alert("Success!");
	    else
		alert("Incorrect Key!");
	}).fail( function () { alert("Server Error");});
}

const delall = function () {

    if(!confirm("This step is not reversible. ARE YOU ABSOLUTELY SURE ?"))
	return;
    
    $('#delabtn').addClass('disabled');$('#delabtn').html('Deleting ...');
    restore = function () { $('#delabtn').removeClass('disabled');$('#delabtn').html('Clear All Submissions'); };
    
    postOb = JSON.stringify({'op': 'clearsub', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (req) {
	    zfile(function () {restore(); alert("Done!");});
	}).fail( function () {restore(); alert("Server Error");});
}

////////////////////////////////////////// Export to ZIP

const dloop = function(skeys,start,skip,count,pfx,callback) {
    if(start >= skeys.length) {	callback(); return; }
    
    postOb = JSON.stringify({'op': 'archive', 'keys': skeys.slice(start,start+skip), 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (req) {
	    $('#dbase64').attr('href','data:application/pdf;base64,' + req.v);
	    $('#dbase64').attr('download',pfx+'.part'+count+'.zip');
	    $('#dbase64')[0].click();

	    dloop(skeys,start+skip,skip,count+1,pfx,callback);
	})
	.fail( function () { alert("Server Error"); callback(); });

}

const doexport = function () {

    $('#expbtn').addClass('disabled').html("Downloading..."); 
    restore = function () {$('#expbtn').removeClass('disabled').html("Export Data");};

    postOb = JSON.stringify({'op': 'getlists', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    skeys = Object.keys(data.lists.dblist.students).sort();

	    pfx = "prods.cse."+(new Date().getFullYear())+'.'+Date.now();
	    
	    dloop(skeys,0,20,1,pfx,function () {restore(); alert("Done!");});
	    
	}).fail(function () {alert("Server error."); restore(); });

}

////////////////////////////////////////// Find incompletes

const makeIncomp = function (lsts) {
    if(lsts.code != 0) {alert('Server Error'); return; }
    lsts = lsts.lists;
    students = lsts.dblist.students; advisors = lsts.dblist.advisors;
    emails = lsts.emails; files = lsts.files;

    lnoSar = []; lnoFev = []; lOldFev = [];
    esSar = []; efSar = {}; eFev = {}; eoFev = {};

    skeys = Object.keys(students);
    for(i = 0; i < skeys.length; i++) {
	s=skeys[i];
	old = true;
	if(files['sar_'+s].size == 0) {
	    lnoSar.push("<li class='list-group-item'>"+students[s].name + " (Advisor: " + advisors[students[s].advisor].name + ")</li>");
	    if(typeof emails[s] != "undefined") esSar.push(emails[s]);
	    if(students[s].advisor != 'none') if(typeof emails[students[s].advisor]  != "undefined") efSar[emails[students[s].advisor]]=0;
	    old = false;
	}

	if(files['fev_'+s].size == 0 && students[s].advisor != 'none') {
	    lnoFev.push("<li class='list-group-item'>"+advisors[students[s].advisor].name + " (for " + students[s].name + ")</li>");
	    if(typeof emails[students[s].advisor]  != "undefined") eFev[emails[students[s].advisor]]=0;
	    old = false;
	}

	if(old && files['sar_'+s].ts > files['fev_'+s].ts+86400 && students[s].advisor != 'none') {
	    lOldFev.push("<li class='list-group-item'>"+advisors[students[s].advisor].name + " (for " + students[s].name + ")</li>");
	    if(typeof emails[students[s].advisor]  != "undefined") eoFev[emails[students[s].advisor]]=0;
	}
    }
    efSar = Object.keys(efSar);
    eFev = Object.keys(eFev);
    eoFev = Object.keys(eoFev);

    $('#lnoSar').html(lnoSar.sort().join("\n")); $('#cnoSar').html(lnoSar.length + "/" + skeys.length);
    $('#lnoFev').html(lnoFev.sort().join("\n")); $('#cnoFev').html(lnoFev.length + "/" + skeys.length);
    $('#lOldFev').html(lOldFev.sort().join("\n")); $('#coldFev').html(lOldFev.length + "/" + skeys.length);

    $('#esSar').val(esSar.join(', '));
    $('#efSar').val(efSar.join(', '));
    $('#eFev').val(eFev.join(', '));
    $('#eoFev').val(eoFev.join(', '));
    
    $('#incompdiv').removeClass('d-none');
}

const incomp = function() {
    postOb = JSON.stringify({'op': 'getlists', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    makeIncomp(data);
	}).fail(function () {alert("Server error.")});
}

////////////////////////////////////////// Initialize Database
const initdb = function(id) {
    sfile = $('#csvstud').get()[0].files;
    if(sfile.length == 0) { alert("Select both CSV files first."); return;  }
    sfile = sfile[0];
    
    afile = $('#csvfac').get()[0].files;
    if(afile.length == 0) { alert("Select both CSV files first."); return;  }
    afile = afile[0];

    $('#indbtn').addClass('disabled');$('#indbtn').html("Processing ...");
    restore = function () {$('#indbtn').removeClass('disabled');$('#indbtn').html("Setup Database");};
    
    postOb = JSON.stringify({'op': 'upload', 'dest': 'studcsv', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    putUrl = data.url;
	    $.ajax({type: 'PUT',url: putUrl,contentType: 'binary/octet-stream', processData: false,data: sfile})
		.done(function () {
		    postOb = JSON.stringify({'op': 'upload', 'dest': 'faccsv', 'pswd': pswd});
		    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
			.done(function (data) {
			    putUrl = data.url;
			    $.ajax({type: 'PUT',url: putUrl,contentType: 'binary/octet-stream', processData: false,data: afile})
				.done(function () {
				    
				    postOb = JSON.stringify({'op': 'initdb', 'pswd': pswd});
				    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
					.done(function (data) {
					    if(data.code != 0) { alert("Format Error in CSV files."); restore(); return; }
					    
					    zfile(function () {	restore(); alert("Done!"); });
		    
					}).fail(function () { alert("Server error."); restore(); });
		    
				}).fail(function() { alert("Server error."); restore(); });
			}).fail(function () { alert("Server error."); restore(); });
		}).fail(function() { alert("Server error."); restore(); });
	}).fail(function () { alert("Server error."); restore(); });
}

////////////////////////////////////////// Form uploader
const upform = function(id) {
    file = $('#ffile'+id).get()[0].files;
    if(file.length == 0) {
	alert("Select a file first.");
	return;
    }
    file = file[0];

    postOb = JSON.stringify({'op': 'upload', 'dest': id+'form', 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    putUrl = data.url;
	    $.ajax({type: 'PUT',url: putUrl,contentType: 'binary/octet-stream', processData: false,data: file})
		.done(function () {
		    $('#ffile'+id).val("");
		    alert("Upload Successful");
		}).fail(function() {
		    alert("Server error.")
		});
	}).fail(function () {
	    alert("Server error.")
	});
}



////////////////////////////////////////// Main Tab
const setpass = function(id) {
    postOb = JSON.stringify({'op': 'setpass', 'pid': id, 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    state.pswds[id] = data.pswd;
	    $('#pswd'+id).val(state.pswds[id]);
	    
	}).fail(function () {
	    alert("Server error.")
	});
}

const setstate = function(id) {
    if(id == state.online)
	return;
    postOb = JSON.stringify({'op': 'setstate', 'state': id, 'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function () {
	    state.online = id;
	    showState();
	}).fail(function () {
	    alert("Server error.")
	});
}

const showState = function() {
    clrs = ['danger','warning','success'];
    for(i = 0; i < 3; i++)
	if(state.online == i)
	    $('#state'+i).addClass('btn-'+clrs[i]).removeClass('btn-outline-secondary');
        else
	    $('#state'+i).removeClass('btn-'+clrs[i]).addClass('btn-outline-secondary');
}

const initMain = function() {
    $('#logindiv').addClass('d-none');
    $('#maindiv').removeClass('d-none');

    if(state.online != 0 && state.online != 1)
	state.online = 2;

    $('#pswdfaculty').val(state.pswds['faculty']);
    $('#pswdscribe').val(state.pswds['scribe']);
    showState();
}


/////////////////////////// Handle Login

const login = function() {
    pswd = $('#adminkey').val();
    localStorage.admin_key = pswd;
    
    postOb = JSON.stringify({'op': 'getstate',  'pswd': pswd});
    $.ajax({type: 'POST', url: aurl, data: postOb, dataType: 'json'})
	.done(function (data) {
	    state = data;
	    initMain();
    }).fail(function () {
	alert("Incorrect password or server error.")
    });
}


if(location.hash == "#dangerous") {$('.hashdanger').removeClass('d-none');}
