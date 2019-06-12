// Handle scripts for reviewing student forms.
// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>

var pswd;
var students, advisors;

var shkey, sar, fev, prod;

const render = function() {
    html='<h5 class="my-4 sname">Student: ' + students[shkey].name + '&nbsp; <span class="bg-info my-2 my-sm-0 text-white rounded px-2 text-nowrap">Advisor: ' + advisors[students[shkey].advisor].name + '</span></h5>';

    if(prod.length > 0)
	html = html + preview(JSON.parse(prod),[],'alert-warning');
    if(fev.length > 0)
	html = html + preview(JSON.parse(fev),[],'alert-primary');
    if(sar.length > 0)
	html = html + preview(JSON.parse(sar),[],'alert-success');

    $("#thereview").html(html);$("#printpage").html(html);
    $("#thereview").scrollTop(0);
}


const review = function(wkey) {
    shkey = wkey; $("#thereview").html('Loading ...');

    postOb = JSON.stringify({'op': 'read', 'uid': 'faculty', 'pswd': pswd, 'key': [('sar_'+wkey),('fev_'+wkey),('prod_'+wkey)]});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    sar = resp.val[0];
	    fev = resp.val[1];
	    prod = resp.val[2];
	    render();
	});
}


const initMain = function() {
    $('#logindiv').addClass('d-none');
    $('#maindiv').removeClass('d-none');

    var slopts = { valueNames: ['name','advisor','wustlkey'] , item: '<li class="p-0" style="list-style-type: none;"><a class="list-group-item px-2 py-1 list-group-item-action" href="javascript:void(0);" onclick="review($(this).find(\'.wustlkey\').html());"><span class="name"></span><br /><small class="advisor"></small><span class="wustlkey d-none"></span></a></li>'

};
    var values = Object.keys(students).map(x => ({name: students[x].name, advisor: advisors[students[x].advisor].name, wustlkey: x}));
    values = values.sort(function (a,b) { if((a.advisor+a.name) < (b.advisor+b.name)) return -1; else return 1; });
    new List('students',slopts,values);

}

if(localStorage.fac_key)
    $('#fackey').val(localStorage.fac_key);

const login = function() {
    pswd = $('#fackey').val();
    localStorage.fac_key = pswd;
    
    postOb = JSON.stringify({'op': 'read', 'key': 'list', 'uid': 'faculty', 'pswd': pswd});
    $.ajax({type: 'POST', url: server, data: postOb, dataType: 'json'})
	.done(function (resp) {
	    if(resp.code < 0)
		alert("Server error.");
	    else {
		list = JSON.parse(resp.val);
		students = list.students;
		advisors = list.advisors;

		initMain();
	    }
	}).fail( function () {alert("Server error.");});
}
