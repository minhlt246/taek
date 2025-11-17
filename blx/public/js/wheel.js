// Create new wheel object specifying the parameters at creation time.
let theWheel = new Winwheel({
    // 'outerRadius'     : 140,        // Set outer radius so wheel fits inside the background.
    'innerRadius'     : 50,         // Make wheel hollow so segments don't go all way to center.
    'textFontSize'    : 16,         // Set default font size for the segments.
    'textMargin'    : 0,    // Take out default margin.
    'textFillStyle' : '#B55500',
    'fillStyle' : 'transparent',
    // 'textOrientation' : 'vertical', // Make text vertial so goes down from the outside of wheel.
    // 'textAlignment'   : 'outer',    // Align text to outside of wheel.
    'numSegments'     : 12,         // Specify number of segments.
    'segments'        :             // Define segments including colour and text.
        [                               // font size and test colour overridden on backrupt segments.
            {'text' : '300', 'textFillStyle' : '#940000', 'fillStyle' : 'transparent'},
            {'text' : '450', 'fillStyle' : 'transparent'},
            {'text' : '1200', 'textFillStyle' : '#266800', 'fillStyle' : 'transparent'},
            {'text' : '750', 'fillStyle' : 'transparent'},
            {'text' : '500', 'textFillStyle' : '#005170', 'fillStyle' : 'transparent'},
            {'text' : '1 More Turn', 'textFontSize' : 14, 'textFillStyle' : '#000000', 'fillStyle' : 'transparent'},
            {'text' : '3000', 'textFillStyle' : '#940000', 'fillStyle' : 'transparent'},
            {'text' : '600', 'fillStyle' : 'transparent'},
            {'text' : '700', 'textFillStyle' : '#266800', 'fillStyle' : 'transparent'},
            {'text' : 'Good Luck', 'textFontSize' : 14, 'fillStyle' : 'transparent'},
            {'text' : '800', 'textFillStyle' : '#005170', 'fillStyle' : 'transparent'},
            {'text' : '500', 'fillStyle' : 'transparent'},
        ],
    'animation' :           // Specify the animation to use.
        {
            'type'     : 'spinToStop',
            'duration' : 8,    // Duration in seconds.
            'spins'    : 3,     // Default number of complete spins.
            'callbackFinished' : alertPrize,
            'callbackSound'    : playSound,   // Function to call when the tick sound is to be triggered.
            'soundTrigger'     : 'pin'        // Specify pins are to trigger the sound, the other option is 'segment'.
        },
    'pins' :				// Turn pins on.
        {
            'number'     : 12,
            'outerRadius': 0,
            'margin'      : 0,
            'fillStyle'   : '#B55500'
        }
});

// Loads the tick audio sound in to an audio object.
let audio = new Audio('/client/images/tick.mp3');

// This function is called when the sound is to be played.
function playSound()
{
    // Stop and rewind the sound if it already happens to be playing.
    audio.pause();
    audio.currentTime = 0;

    // Play the sound.
    audio.play();
}

// Vars used by the code in this page to do power controls.
let wheelPower    = 0;
let wheelSpinning = false;

// -------------------------------------------------------
// Function to handle the onClick on the power buttons.
// -------------------------------------------------------
function powerSelected(powerLevel)
{
    // Ensure that power can't be changed while wheel is spinning.
    if (wheelSpinning == false) {

        wheelPower = powerLevel;

        // Light up the spin button by changing it's source image and adding a clickable class to it.
        document.getElementById('spin_button').src = "/client/images/spin.png";
        document.getElementById('spin_button').className = "";
    }
}

// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin()
{
    // Ensure that spinning can't be clicked again while already running.
    if (wheelSpinning == false) {
        // Based on the power level selected adjust the number of spins for the wheel, the more times is has
        // to rotate with the duration of the animation the quicker the wheel spins.
        theWheel.animation.spins = 3;

        // Disable the spin button so can't click again while wheel is spinning.
        document.getElementById('spin_button').src       = "/client/images/spin.png";
        document.getElementById('spin_button').className = "";

        // Begin the spin animation by calling startAnimation on the wheel object.
        theWheel.startAnimation();

        // Set to true so that power can't be changed and spin button re-enabled during
        // the current animation. The user will have to reset before spinning again.
        wheelSpinning = true;
    }
}

// -------------------------------------------------------
// Function for reset button.
// -------------------------------------------------------
function resetWheel()
{
    theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    theWheel.draw();                // Call draw to render changes to the wheel.
    wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}

// -------------------------------------------------------
// Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters.
// -------------------------------------------------------
function alertPrize(indicatedSegment)
{
    // Just alert to the user what happened.
    // In a real project probably want to do something more interesting than this with the result.
    if (indicatedSegment.text == 'Good Luck') {
        const myModalAlternative = new bootstrap.Modal('#lose')
        myModalAlternative.show()
    } else if (indicatedSegment.text == '1 More Turn') {
        const myModalAlternative = new bootstrap.Modal('#more-turn')
        myModalAlternative.show()
    } else {
        const myModalAlternative = new bootstrap.Modal('#win')
        myModalAlternative.show()
        // alert("You have won " + indicatedSegment.text);
    }
    resetWheel();
}
