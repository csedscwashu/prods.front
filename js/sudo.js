// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>


const login = function() {
    pswd = $('#pswd').val();

    $.ajax({
	type: 'POST',
	url: server+'sudo',
	data: JSON.stringify({'pswd': pswd}),
	dataType: 'json'
    }).done(function (data) {
	$('#info').removeClass('d-none');
	html = 'admin: ' + data.admin + '\n';
	html = html + 'faculty: ' + data.faculty + '\n';
	html = html + 'scribe: ' + data.scribe + '\n';
	$('#info').html(html);
    }).fail(function () {
	$('#info').removeClass('d-none');
	$('#info').html('Incorrect Root Password');
    });
}
