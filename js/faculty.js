// Handle scripts for faculty form editing
// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>

var list;
var pswd;
var akey;
var empty;

const printPrev = function() {
    wkey = $('#wustlkey').val();
    nhtm = '<h4 class="mb-3">Student: '+list.students[wkey].name+'</h4>';
    $("#printpage").html(nhtm
			 + preview(form2obj(schema),[],'alert-primary')
			 + '<p>&nbsp;</p>' + $('#sarprev').html());
}

const submitForm = function() {
    wkey = $('#wustlkey').val();
    fdata = form2obj(schema);
    postOb = JSON.stringify({'op': 'write.exists', 'uid': 'faculty', 'pswd': pswd, 'key': ('fev_'+wkey), 'val': JSON.stringify(fdata)});

    // Send data
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.code < 0)
		alert("Server error.");
	    else
		$('.svdmsg').removeClass('text-danger').addClass('text-secondary').html('All changes saved on server.');
	}).fail( function () {alert("Server error.");});
    printPrev();
}

const loadSar = function(wkey) { 
    postOb = JSON.stringify({'op': 'read', 'uid': 'faculty', 'pswd': pswd, 'key': ('sar_'+wkey)});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.val.length == 0)
		html = "<h4>This student has not yet submitted their activity report.</h4>"
	    else
		html = "<h4>Student Activity Report</h4>"+preview(JSON.parse(resp.val));

	    $('#sarprev').html(html); printPrev(); $('#studsel').removeClass('d-none'); $('#loading').addClass('d-none');

	});
}

const loadForm = function() {
    wkey = $('#wustlkey').val();
    $('#studsel').addClass('d-none'); $("#printpage").html("");
    if(wkey == "") {
	return;
    }
    $('#loading').removeClass('d-none');

    postOb = JSON.stringify({'op': 'read', 'uid': 'faculty', 'pswd': pswd, 'key': ('fev_'+wkey)});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    obj2form(schema,empty);
	    if(resp.val.length == 0) {
		$('.svdmsg').html('');
	    } else {
		fobj = JSON.parse(resp.val);
		$('.svdmsg').removeClass('text-danger').addClass('text-secondary').html('All changes saved on server.');
		obj2form(schema,fobj);
	    }
	    loadSar(wkey);
	});
}

const unsaved = function () {
    $('.svdmsg').removeClass('text-secondary').addClass('text-danger').html('Form has unsaved changes.');
}

const initMain = function(students) {
    oplist = '<option value="">Select a student first</option>';
    for(let i = 0; i < students.length; i++)
	oplist = oplist + '<option value="'+students[i][0]+'">'+students[i][1]+'</option>';
    $('#wustlkey').html(oplist);
    empty = formify('#theform',schema);
    loadForm();

    $('#theform input').change(unsaved); $('#theform textarea').change(unsaved);
    $('#theform input').on('input',unsaved); $('#theform textarea').on('input',unsaved);
    
    $('#logindiv').addClass('d-none');
    $('#maindiv').removeClass('d-none');
}

if(localStorage.fac_wkey)
    $('#facid').val(localStorage.fac_wkey);
if(localStorage.fac_key)
    $('#fackey').val(localStorage.fac_key);

const login = function() {
    pswd = $('#fackey').val();
    akey = $('#facid').val().split('@')[0];

    localStorage.fac_wkey = akey; localStorage.fac_key = pswd;

    postOb = JSON.stringify({'op': 'read', 'key': 'list', 'uid': 'faculty', 'pswd': pswd});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.code < 0)
		alert("Server error.");
	    else {
		list = JSON.parse(resp.val);
		students = list.students;
		students = Object.keys(students).filter(x => students[x].advisor==akey).map(x => [x,students[x].name]);
		if(students.length == 0)
		    alert("No students found for your wustl key.");
		else
		    initMain(students);
	    }
	}).fail(function () {alert("Server error.");});
}

postOb = JSON.stringify({'op': 'read', 'key': 'up_fcform'});
$.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
    .done(function (resp) {
	if(resp.code != 0 || resp.val == '') {
	    //$('body').html(''); window.location.replace("https://cse.wustl.edu/");
	    $('#logindiv').html('<p class="alert alert-primary">PRODS Form Submissions are now closed. You will be informed by e-mail when submissions are due next year.</p>');
	    return;
	}
	$.globalEval(resp.val);
    }).fail(function () {$('body').html(''); window.location.replace("https://cse.wustl.edu/");});
