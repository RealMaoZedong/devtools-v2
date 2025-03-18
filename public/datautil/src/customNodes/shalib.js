import registerNodes from "../nodes/useableNodes.js"

async function generateHash(message, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// ShaLib
registerNodes("Hash", {
    "sha-1": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "hashed"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [await generateHash(inputs[0], 'SHA-1')]
        },
        settings: {}
    },
    "sha-256": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "hashed"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [await generateHash(inputs[0], 'SHA-256')]
        },
        settings: {}
    },
    "sha-512": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "hashed"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [await generateHash(inputs[0], 'SHA-512')]
        },
        settings: {}
    },
    "bcrypt hash": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "hashed"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            const salt = await bcrypt.genSalt(settings.rounds.value);
            const hash = await bcrypt.hash(inputs[0], salt);
            return [hash]
        },
        settings: {
            "rounds": {
                "value": 10,
                "type": SETTING_TYPES.NUMBER
            },
        }
    },
    "bcrypt compare": {
        inputs: [
            {
                "name": "hashed"
            },
            {
                "name": "plaintext"
            }
        ],
        outputs: [
            {
                "name": "match"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            console.log(inputs)
            return [await bcrypt.compare(inputs[1], inputs[0])]
        },
        settings: {}
    }
})