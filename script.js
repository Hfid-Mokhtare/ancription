
document.addEventListener('DOMContentLoaded', () => {
    // --- Base Cipher Definition (like stLetters/stShifre) ---
    const baseLetterMap = {
        "A": "1#", "B": "2#-", "C": "2#.", "D": "3#--", "E": "3#-.", "F": "3#.-",
        "G": "3#..", "H": "4#---", "I": "4#--.", "J": "4#-.-", "K": "4#-..",
        "L": "4#.--", "M": "4#.-.", "N": "4#..-", "O": "4#...", "P": "5#----",
        "Q": "5#---.", "R": "5#--..", "S": "5#--.-", "T": "5#-.--", "U": "5#-.-.",
        "V": "5#-..-", "W": "5#-...", "X": "5#.---", "Y": "5#.--.", "Z": "5#.-.-",
        " ": "5#----.."
    };

    // --- State for the shuffled cipher ---
    let shuffledLetterMap = {}; // Maps letter -> shuffled code
    let shuffledShifreMap = {}; // Maps shuffled code -> letter

    // --- Get DOM Elements ---
    const messageToEncryptInput = document.getElementById('message-to-encrypt');
    const encryptButton = document.getElementById('encrypt-button');
    const encryptedOutput = document.getElementById('encrypted-output');
    const copyEncryptedButton = document.getElementById('copy-encrypted-button'); // *** GET NEW BUTTON ***

    const messageToDecryptInput = document.getElementById('message-to-decrypt');
    const decryptButton = document.getElementById('decrypt-button');
    const decryptedOutput = document.getElementById('decrypted-output');
    const cipherKeyDisplay = document.getElementById('cipher-key-display');

    // --- Helper Functions ---

    // Fisher-Yates (Knuth) Shuffle Algorithm
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Function to set up the shuffled cipher
    function setupShuffledCipher() {
        const letters = Object.keys(baseLetterMap);
        const standardCodes = Object.values(baseLetterMap);
        const shuffledCodes = shuffleArray([...standardCodes]);

        shuffledLetterMap = {};
        shuffledShifreMap = {};

        letters.forEach((letter, index) => {
            const shuffledCode = shuffledCodes[index];
            shuffledLetterMap[letter] = shuffledCode;
            shuffledShifreMap[shuffledCode] = letter;
        });

        displayCurrentCipherKey();
    }

    // Function to display the current cipher mapping
    function displayCurrentCipherKey() {
        let keyText = "Letter => Code\n";
        keyText += "--------------\n";
        for (const [letter, code] of Object.entries(shuffledLetterMap)) {
             keyText += `${letter === " " ? "' '" : letter} => ${code}\n`;
        }
        cipherKeyDisplay.textContent = keyText;
    }

    // --- Encryption Logic ---
    function encryptMessage(message) {
        const upperMessage = message.toUpperCase();
        let encrypted = "";
        for (let i = 0; i < upperMessage.length; i++) {
            const char = upperMessage[i];
            const code = shuffledLetterMap[char];
            if (code !== undefined) {
                encrypted += code;
            } else {
                 console.warn(`Character '${char}' not found in cipher map, skipping.`);
            }
        }
        return encrypted;
    }

    // --- Decryption Logic ---
    function decryptMessage(encryptedMessage) {
        let decrypted = "";
        let currentPos = 0;
        const codes = Object.keys(shuffledShifreMap);
        codes.sort((a, b) => b.length - a.length); // Sort codes by length descending

        while (currentPos < encryptedMessage.length) {
            let foundMatch = false;
            for (const code of codes) {
                if (encryptedMessage.startsWith(code, currentPos)) {
                    decrypted += shuffledShifreMap[code];
                    currentPos += code.length;
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                console.warn(`Could not decrypt sequence starting at position ${currentPos}: '${encryptedMessage.substring(currentPos, currentPos + 10)}...'`);
                decrypted += '?';
                currentPos++;
            }
        }
        return decrypted;
    }

    // --- Event Listeners ---
    encryptButton.addEventListener('click', () => {
        const message = messageToEncryptInput.value;
        encryptedOutput.value = encryptMessage(message);
    });

    decryptButton.addEventListener('click', () => {
        const message = messageToDecryptInput.value;
        decryptedOutput.value = decryptMessage(message);
    });

    // *** ADD EVENT LISTENER FOR THE NEW COPY BUTTON ***
    copyEncryptedButton.addEventListener('click', () => {
        const textToCopy = encryptedOutput.value;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Optional: Give feedback to the user
                const originalText = copyEncryptedButton.textContent;
                copyEncryptedButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyEncryptedButton.textContent = originalText;
                }, 1500); // Change back after 1.5 seconds
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // You could display an error message to the user here
                alert('Failed to copy text. Your browser might not support this feature or permission was denied.');
            });
        } else {
            // Optional: Do nothing or alert if there's nothing to copy
            // alert('Nothing to copy!');
        }
    });
    // ****************************************************

    // --- Initial Setup ---
    setupShuffledCipher(); // Initialize the cipher when the script loads

}); // End DOMContentLoaded
