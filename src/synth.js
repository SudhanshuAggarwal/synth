(function Main() {

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	var audioContext;
	var bufferloader;
	var buffers = [];
	window.addEventListener('load', init, false);
	var c, sineWave, squareWave, sawtoothWave, triangleWave, powerButton;

	var lpf, lpfCutoffFreq, lpfQuality;
	var testSound1, testSound2;

	var isOn = false;

	// Nodes
	var gainNode, lpfNode, hpfNode;

	function init() {
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			audioContext = new AudioContext();
		} catch (e) {
			alert('Web Audio API not supported by this browser');
		}

		bufferloader = new BufferLoader(
			audioContext,
			[
				"audio/a4-sounds/background-loop.ogg",
				"audio/a4-sounds/gliss.ogg"
			],
			finishedLoading);

		bufferloader.load();

		c = document.getElementById("oscillator");
		powerButton = document.getElementById("buttonPower");
		volume = document.getElementById("volume");

		// Oscillator controls
		sineWave = document.getElementById("buttonSineWave");
		squareWave = document.getElementById("buttonSquareWave");
		sawtoothWave = document.getElementById("buttonSawtoothWave");
		triangleWave = document.getElementById("buttonTriangleWave");
		freqRange = document.getElementById("freqRange");

		// Low Pass Filter Controls
		lpf = document.getElementById("lpf");
		lpfCutoffFreq = document.getElementById("lpfCutoffFreq");
		lpfQuality = document.getElementById("lpfQuality");

		// High Pass Filter Controls
		hpf = document.getElementById("hpf");
		hpfCutoffFreq = document.getElementById("hpfCutoffFreq");
		hpfQuality = document.getElementById("hpfQuality");

		// A couple of test sounds
		testSound1 = document.getElementById("testSound1");
		testSound2 = document.getElementById("testSound2");

		var ctx = c.getContext('2d');
		ctx.fillStyle = "#990000";
		ctx.fillRect(0, 0, 500, 300);

	}

	function finishedLoading(bufferList)
	{
		buffers = bufferList;

		initGainNode();
		initOscillator(gainNode);
		initLPF();
		initHPF();

		initTestSounds();
	}

	function initGainNode() {
		gainNode = audioContext.createGain();
		gainNode.connect(audioContext.destination);
		
		volume.onmousemove = function(element) {
			gainNode.gain.value = volume.value/volume.max;
		}		
	}

	function initOscillator(destination) {
		Oscillator.init(destination);
		Oscillator.oscillator.connect(destination);

		sineWave.onclick = function() {
			Oscillator.setType('sine');
		}
		squareWave.onclick = function() {
			Oscillator.setType('square');
		}
		sawtoothWave.onclick = function() {
			Oscillator.setType('sawtooth');
		}
		triangleWave.onclick = function() {
			Oscillator.setType('triangle');
		}

		// Source: http://www.html5rocks.com/en/tutorials/webaudio/intro/js/filter-sample.js
		function changeFrequency(element) {
			var minValue = 40;
			var maxValue = audioContext.sampleRate/2;

			// Logarithm (base 2) to compute how many octaves fall in the range.
			var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
			// Compute a multiplier from 0 to 1 based on an exponential scale.
			var multiplier = Math.pow(2, numberOfOctaves * (element.value/element.max - 1.0));
			// Get back to the frequency value between min and max.
			return maxValue * multiplier;
		}

		freqRange.onmousemove = function() {
			Oscillator.changeFrequency(freqRange);
		}

		powerButton.onclick = function() {
			Oscillator.toggle();
		}
	}

	var Oscillator = {
		TYPE: 'sine',
		FREQ: 440,
		RUNNING: false
	};

	Oscillator.init = function (destination) {
		var oscillator = audioContext.createOscillator();
		oscillator.type = this.TYPE;
		oscillator.frequency.value = this.FREQ;
		this.oscillator = oscillator;
		this.destination = destination;
	}

	Oscillator.start = function() {
		this.oscillator.connect(this.destination);
		this.oscillator.start();
	}

	Oscillator.stop = function() {
		this.oscillator.stop();
		this.init();
	}

	Oscillator.toggle = function() {
		this.RUNNING ? this.stop() : this.start();
		this.RUNNING = !this.RUNNING;
	}

	Oscillator.setType = function(type) {
		this.oscillator.type = type;
	}

	Oscillator.changeFrequency = function(element) {
		var minValue = 40;
		var maxValue = audioContext.sampleRate/2;

		// Logarithm (base 2) to compute how many octaves fall in the range.
		var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		// Compute a multiplier from 0 to 1 based on an exponential scale.
		var multiplier = Math.pow(2, numberOfOctaves * (element.value/element.max - 1.0));
		// Get back to the frequency value between min and max.
		this.oscillator.frequency.value = maxValue * multiplier;
	}

	function initLPF() {
		lpfNode = new BiquadFilter();
		lpfNode.TYPE = 'lowpass';
		lpfNode.init(Oscillator.oscillator, gainNode);

		lpf.onclick = function() {
			if (hpf.checked)
			{
				hpf.checked = false;
				hpfNode.toggleFilter(hpf);
			}
			lpfNode.toggleFilter(lpf);
		}
		lpfCutoffFreq.onmousemove = function() {
			lpfNode.changeFrequency(lpfCutoffFreq);
		}
		lpfQuality.onmousemove = function() {
			lpfNode.changeQuality(lpfQuality);
		}
	}

	function initHPF() {
		hpfNode = new BiquadFilter();
		hpfNode.TYPE = 'highpass';
		hpfNode.init(Oscillator.oscillator, gainNode);

		hpf.onclick = function() {
			if (lpf.checked)
			{
				lpf.checked = false;
				lpfNode.toggleFilter(lpf);
			}
			hpfNode.toggleFilter(hpf);
		}
		hpfCutoffFreq.onmousemove = function() {
			hpfNode.changeFrequency(hpfCutoffFreq);
		}
		hpfQuality.onmousemove = function() {
			hpfNode.changeQuality(hpfQuality);
		}
	}

	// source: http://www.html5rocks.com/en/tutorials/webaudio/intro/js/filter-sample.js
	function BiquadFilter() {
		this.FREQ = 440;
		this.QUAL_MUL = 30;
		this.TYPE = 'lowpass';
	}

	BiquadFilter.prototype.init = function(input, output) {
		var filter = audioContext.createBiquadFilter();
		filter.type = this.TYPE;
		filter.frequency.value = this.FREQ;
		input.connect(filter);
		filter.connect(output);
		this.filter = filter;
		this.input = input;
		this.output = output;
	}

	BiquadFilter.prototype.changeFrequency = function(element) {
		var minValue = 40;
		var maxValue = audioContext.sampleRate/2;

		// Logarithm (base 2) to compute how many octaves fall in the range.
		var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
		// Compute a multiplier from 0 to 1 based on an exponential scale.
		var multiplier = Math.pow(2, numberOfOctaves * (element.value/element.max - 1.0));
		// Get back to the frequency value between min and max.
		this.filter.frequency.value = maxValue * multiplier;
	}

	BiquadFilter.prototype.changeQuality = function(element) {
		this.filter.Q.value = (element.value/element.max) * this.QUAL_MUL;
	}

	BiquadFilter.prototype.toggleFilter = function(element) {
		this.input.disconnect(0);
		this.filter.disconnect(0);
		// reconnect the inputs and outputs without the filter
		this.input.connect(this.output);
		// check if we want to enable the filter
		if (element.checked)
		{
			// this.init(this.input, this.output);
			// connect through the filter
			this.input.connect(this.filter);
			this.filter.connect(this.output);
		}
	}

	function initTestSounds()
	{
		testSound1.onclick = function() {
			playSound(0, 0);
		}
		testSound2.onclick = function() {
			playSound(1, 0);
		}
	}

	function playSound(index, time)
	{
		var source = audioContext.createBufferSource();
		source.buffer = buffers[index];
		source.connect(audioContext.destination);
		source.start(time);
	}
})();