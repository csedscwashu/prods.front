var theTime=0, timer=-1;

const dispTime = function() {
    secs = theTime%60;
    mins = (theTime-secs)/60;
    fmstr = ("00" + mins).slice(-2) + ":" + ("00" + secs).slice(-2);
    $('#time').html(fmstr);
}

const countDown = function() {
    if(theTime <= 0) {timer=-1; return;}
    theTime--;
    dispTime();

    if(theTime > 0)
	timer=setTimeout(countDown,1000);
    else
	$('#bell')[0].play();
}

const stTimer = function(id) {
    if(timer != -1) clearTimeout(timer); $('#bell')[0].pause(); $('#bell')[0].currentTime=0;
    theTime = id; dispTime();
    timer=setTimeout(countDown,1000);
}
