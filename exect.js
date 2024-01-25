const Cerebraly = "./bin/Cerebraly"
const path = require('path');
const { exec } = require('child_process');

module.exports = () => {
    exec(`${Cerebraly}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing C++ program: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`C++ program returned an error: ${stderr}`);
            return;
        }

        // Process the output from the C++ program (stdout)
        console.log(`C++ program output: ${stdout}`);
    });
}