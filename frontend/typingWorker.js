// This worker handles the timing of the typing animation

let intervalId = null;

self.onmessage = function(e) {
    if (e.data.command === 'start') {
        const { text, speed } = e.data;
        let i = 0;

        // Clear any previous interval
        if (intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(() => {
            if (i < text.length) {
                // Send one character back to the main app
                self.postMessage({ type: 'tick', char: text.charAt(i) });
                i++;
            } else {
                // Typing is done, send a 'done' message and stop
                self.postMessage({ type: 'done' });
                clearInterval(intervalId);
                intervalId = null;
            }
        }, speed);
    }
};