// Turn a schema to an editable form, convert back and forth from js objects, and preview as html.
// --Ayan Chakrabarti <ayan.chakrabarti@gmail.com>


const scrollH = function(id) {
    $('html, body'). stop(). animate({
	scrollTop: ($(id).offset().top)
    }, 100);
}

const editor = function(i) {
    $('#prevtab_'+i).removeClass('active'); $('#editab_'+i).addClass('active');
    $('#prev_'+i).removeClass('d-block'); $('#prev_'+i).addClass('d-none');
    $('#resp_'+i).removeClass('d-none'); $('#resp_'+i).addClass('d-block');
}

const previewer = function(i) {
    let conv = new showdown.Converter({'emoji': true, 'openLinksInNewWindow': true, 'headerLevelStart': 3});
    $('#prev_'+i).html(filterXSS(conv.makeHtml($('#resp_'+i).val())));
    $('#editab_'+i).removeClass('active'); $('#prevtab_'+i).addClass('active');
    $('#resp_'+i).removeClass('d-block'); $('#resp_'+i).addClass('d-none');
    $('#prev_'+i).removeClass('d-none'); $('#prev_'+i).addClass('d-block');
}

const makeText = function(i,param) {
    return '<div>'
        + '<ul class="nav nav-tabs mt-3">'
	+ '<li class="nav-item"><a class="nav-link active" id="editab_'+i+'" href="javascript:void(0);" onclick="editor('+i+');">Edit</a></li>'
	+ '<li class="nav-item"><a class="nav-link" id="prevtab_'+i+'" href="javascript:void(0);" onclick="previewer('+i+');">Preview</a></li>'
	+ '</ul>'
	+ '<textarea  style="height: '+param[0]+';" class="d-block form-control" id="resp_'+i+'" onfocus="scrollH(\'#head_'+i+'\');">'
	+ param[1] + '</textarea>'
	+ '<div  style="height: '+param[0]+'; overflow-y: auto;" class="d-none pt-3" id="prev_'+i+'">HTML Preview</div>'
	+ '</div>';
}

const makeString = function(i,param) {
    if(param.length > 0)
	param = 'type="'+param+'"';
    return '<input class="form-control mt-3" '+param+' id="resp_'+i+'">';
}

const makeOpt = function(i,param) {
    id='name="resp_'+i+'"'; html = '<div class="mt-3 ml-3">';
    for(let j = 0; j < param.length; j++) {
	html = html + '<div class="form-check mt-1">';
	val = 'value="'+j+'"';
	if(j == 0) val = val + ' checked';
	html = html + '<input class="form-check-input" type="radio" ' + val + '  ' + id + '>';
	html = html + '<label class="form-check-label">'+param[j]+'</label>';
	html = html + '</div>';
    }
    return html+"</div>";
}


const formify = function(div, schema) {
    html = '';

    for(let i =0; i < schema.length; i++) {
	[title, desc, type, param] = schema[i];
	html = html + '<h4 id="head_'+i+'" class="mt-5 pb-0 mb-1 font-weight-light"> Q' + (i+1) + '. ' + title + '</h4>';

	if(desc.length > 0)
	    html = html + '<p class="my-0 py-0 text-secondary font-weight-light">' + desc + '</p>';

	if(type == "text")
	    html=html+makeText(i,param);
	else if(type == "string")
	    html=html+makeString(i,param);
	else if(type == "opt")
	    html =html+makeOpt(i,param);
    }

    $(div).html(html);
    return form2obj(schema);
}

const form2obj = function(schema) {
    resps = [];
    for(let i = 0; i < schema.length; i++) {
	if(schema[i][2] == "opt") {
	    resp = $('input[name="resp_'+i+'"]:checked').val();
	    resp = schema[i][3][resp];
	} else
	    resp = $('#resp_'+i).val() || "";

	if(schema[i][2]=="string" && schema[i][3] == "url")
	    resp = "<"+resp+">";
	
	resps = resps.concat([[schema[i][0],resp]]);
    }
    return resps;
}


const obj2form = function(schema,obj) {

    okeys = obj.map(x => x[0]);
    for(let i = 0; i < schema.length; i++) {
	if(schema[i][2]=="text")
	    editor(i);
	idx = okeys.indexOf(schema[i][0]);
	if(idx < 0) continue;
	if(schema[i][2] == "opt") {
	    val = schema[i][3].indexOf(obj[idx][1]);
	    if(val < 0) val = 0;
	    $('input[name="resp_'+i+'"][value="'+val+'"]').prop("checked",true);
	} else {
	    val = obj[idx][1];
	    if(schema[i][2]=="string" && schema[i][3] == "url")
		val = val.substr(1,val.length-2);
	    $('#resp_'+i).val(val);
	}
    }
}


const preview = function(obj, heads=[], qclass="alert-success") {
    let conv = new showdown.Converter({'emoji': true, 'openLinksInNewWindow': true, 'headerLevelStart': 3});
    md = '';

    for(let i = 0; i < heads.length; i++)
	md = md + '<div class="mb-3"><h5>' + heads[i][0] + ': ' + heads[i][1] + '</h5></div>\n\n';

    for(let i = 0; i < obj.length; i++) {
	md = md + '<div class="alert py-1 '+qclass+'"><h5 class="py-0 my-0">' + obj[i][0] + '</h5></div>\n\n';
	md = md + filterXSS(conv.makeHtml(obj[i][1]));
    }

    return md;
}
