// Handle scripts for scribe to enter prods result.
// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>

var pswd;
var students, advisors;

var shkey, empty = 0;

const submitForm = function() {
    fdata = form2obj(schema);
    postOb = JSON.stringify({'op': 'write.exists', 'uid': 'scribe', 'pswd': pswd, 'key': ('prod_'+shkey), 'val': JSON.stringify(fdata)});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
}


const review = function(wkey) {
    shkey = wkey;
    if(empty == 0) {
	$('#stname').html('Student: ' + '&nbsp; <span class="bg-info my-2 my-sm-0 text-white rounded px-2 text-nowrap">Advisor: </span>');
	empty = formify('#theform',schema);
	$('#savebtn').removeClass('d-none');
    }
    
    postOb = JSON.stringify({'op': 'read', 'uid': 'scribe', 'pswd': pswd, 'key': ('prod_'+shkey)});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    obj2form(schema,empty);
	    if(resp.val.length > 0)
		obj2form(schema,JSON.parse(resp.val));
	    $('#stname').html('Student: ' + students[shkey].name + '&nbsp; <span class="bg-info my-2 my-sm-0 text-white rounded px-2 text-nowrap">Advisor: ' + advisors[students[shkey].advisor].name+'</span>');
	});
}


const initMain = function() {
    $('#logindiv').addClass('d-none');
    $('#maindiv').removeClass('d-none');

    var slopts = { valueNames: ['name','advisor','wustlkey','tag'] , item: '<li class="p-0" style="list-style-type: none;"><a class="list-group-item px-2 py-1 list-group-item-action" href="javascript:void(0);" onclick="review($(this).find(\'.wustlkey\').html());"><span class="name"></span><br /><small class="advisor"></small><span class="wustlkey d-none"></span></a></li>'

};
    var values = Object.keys(students).map(x => ({name: students[x].name, advisor: advisors[students[x].advisor].name, wustlkey: x, tag: (students[x].tag || '')}));
    values = values.sort(function (a,b) { if((a.advisor+a.name) < (b.advisor+b.name)) return -1; else return 1; });
    new List('students',slopts,values);

}

if(localStorage.scribe_key)
    $('#scribekey').val(localStorage.scribe_key);

const login = function() {
    pswd = $('#scribekey').val();
    localStorage.scribe_key = pswd;

    postOb = JSON.stringify({'op': 'read','key': ['list','up_scform'], 'uid': 'scribe', 'pswd': pswd});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.code < 0)
		alert("Server error.");
	    else {
		list = JSON.parse(resp.val[0]);
		students = list.students;
		advisors = list.advisors;

		$.globalEval(resp.val[1]);

		initMain();
	    }
	}).fail(function () {alert("Server error.");});
}
