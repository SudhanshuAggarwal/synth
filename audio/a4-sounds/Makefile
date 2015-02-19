.PHONY: all

all: encoded.js

encoded.js : background-loop.ogg chime-quarter-[234].ogg gliss.ogg
	echo '/* automatically generated */' > $@
	echo 'var encoded = {}; //filename -> base64-encoded data URI' >> $@
	( echo -n 'encoded["background-loop.ogg"] = "data:audio/ogg;base64,'; base64 -w0 background-loop.ogg; echo '";' ) >> $@
	( echo -n 'encoded["chime-quarter-2.ogg"] = "data:audio/ogg;base64,'; base64 -w0 chime-quarter-2.ogg; echo '";' ) >> $@
	( echo -n 'encoded["chime-quarter-3.ogg"] = "data:audio/ogg;base64,'; base64 -w0 chime-quarter-3.ogg; echo '";' ) >> $@
	( echo -n 'encoded["chime-quarter-4.ogg"] = "data:audio/ogg;base64,'; base64 -w0 chime-quarter-4.ogg; echo '";' ) >> $@
	( echo -n 'encoded["gliss.ogg"] = "data:audio/ogg;base64,'; base64 -w0 gliss.ogg; echo '";' ) >> $@
