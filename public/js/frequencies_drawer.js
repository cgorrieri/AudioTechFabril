function drawFrequencies(analyser, canvas_left, canvas_right) {

        ctx_sound_left = canvas_left.getContext("2d");
        ctx_sound_right = canvas_right.getContext("2d");

        /* A ajouter pour l"affichage des fréquences */
        var freqByteData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqByteData); 
        var nbFreq = freqByteData.length;

        // clear the current state
        ctx_sound_left.clearRect(0, 0, 500, 1000);
        ctx_sound_left.beginPath();
        ctx_sound_right.clearRect(0, 0, -500, 1000);
        ctx_sound_right.beginPath();

        // set the fill style
        ctx_sound_left.fillStyle="black";
        for ( var i = 1; i < (freqByteData.length); i+=6 ){
            var value = freqByteData[i];

            //ctx_sound_left.lineTo(value, i);
            //ctx_sound_left.fillRect(i,325-value,3,325);
            ctx_sound_left.fillRect(0,i,value,2);
            ctx_sound_right.fillRect(-value,i,value,2);
        }

        ctx_sound_left.strokeStyle = '#00FF00';
        ctx_sound_left.lineWidth = 5;
        ctx_sound_left.stroke();
}