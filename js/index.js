// Handle scripts for student form editing and submission
// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>

var empty;

const fixwkey = function(inp) {
    val = $(inp).val().split('@')[0];
    $(inp).val(val); return val;
}

const wkeyup = function(inp) {
    wkey = fixwkey(inp);
}

const resetForm = function() {
    $("#wustlkey").val("");obj2form(schema,empty);
    $('.svdmsg').html('');
    delete localStorage.sarData;
}

const saveForm = function() {
    wkey = fixwkey('#wustlkey');
    fdata = form2obj(schema);
    localStorage.sarData = JSON.stringify({'wkey': wkey, 'fdata': fdata});
    $('#printpage').html(preview(fdata,[['WUSTL Key',wkey]]));
    $('.svdmsg').removeClass('text-danger').addClass('text-secondary').html('All changes saved in browser.');
}
      
const submitForm = function() {

    if(!confirm("Are you sure you want to submit ? You will not be able to edit this form after submission."))
	return;
    
    wkey = fixwkey('#wustlkey');
    fdata = form2obj(schema);
    
    postOb = JSON.stringify({'op': 'write.empty', 'key': ('sar_'+wkey), 'val': JSON.stringify(fdata)});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.code == -3)
		alert("Either your wustl key is incorrect or we have already received a submission from you.");
	    else if(resp.code < 0)
		alert("Server error.");
	    else {
		html = '<p class="mb-4 h6">Your form has been submitted. Print this page to keep a copy for your records.</p>';
		html = html + preview(fdata,[['WUSTL Key',wkey]]);
		$('#formpage').html(html); $('#printpage').html(html);
		delete localStorage.sarData;
	    }
	}).fail( function () {alert("Server error."); });
}

const unsaved = function () {
    $('.svdmsg').removeClass('text-secondary').addClass('text-danger').html('Form has unsaved changes.');
}


postOb = JSON.stringify({'op': 'read', 'key': 'up_stform'});
$.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
    .done(function (resp) {
	if(resp.code != 0 || resp.val == '') {
	    $('#maindiv').html('<p class="alert alert-primary">PRODS Form Submissions are now closed. You will be informed by e-mail when submissions are due next year.</p>');
	    return;
	}
	$.globalEval(resp.val);

	empty = formify("#theform",schema);
	sarData = localStorage.sarData;
	$('.svdmsg').html('');
	if(sarData) {
	    sarData = JSON.parse(sarData);
	    $("#wustlkey").val(sarData['wkey']);
	    obj2form(schema,sarData['fdata']);
	    $('#printpage').html(preview(sarData['fdata'],[['WUSTL Key',sarData['wkey']]]));
	    $('.svdmsg').removeClass('text-danger').addClass('text-secondary').html('All changes saved in browser.');
	} else
	    $('#printpage').html(preview(empty,[['WUSTL Key',' ']]));

	$('#theform input').change(unsaved); $('#theform textarea').change(unsaved);
	$('#theform input').on('input',unsaved); $('#theform textarea').on('input',unsaved);
    }).fail(function () {$('body').html(''); window.location.replace("https://cse.wustl.edu/");});

