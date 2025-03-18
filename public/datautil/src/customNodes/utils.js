import registerNodes from "../nodes/useableNodes.js"

registerNodes("Array/String Utils", {
    // utils
    "split": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "data"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [inputs[0].split(settings.toSplit.value)]
        },
        settings: {
            "toSplit": {
                "value": ",",
                "type": SETTING_TYPES.TEXT
            },
        }
    },    
    "length": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "result"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [inputs[0].length]
        },
        settings: {}
    },
    "index": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "out"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [inputs[0][settings.index.value]]
        },
        settings: {
            "index": {
                "value": 0,
                "type": SETTING_TYPES.NUMBER
            },
        }
    },
    "join": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "out"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [inputs[0].join(settings.str.value)]
        },
        settings: {
            "str": {
                "value": ", ",
                "type": SETTING_TYPES.TEXT
            },
        }
    },
    "splice": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "out"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            let inar = [...inputs[0]]
            return [inar.splice(settings.start.value, settings.count.value)]
        },
        settings: {
            "start": {
                "value": 0,
                "type": SETTING_TYPES.NUMBER
            },
            "count": {
                "value": 0,
                "type": SETTING_TYPES.NUMBER
            },
        }
    },
    "concat": {
        inputs: [
            {
                "name": "a"
            },
            {
                "name": "b"
            }
        ],
        outputs: [
            {
                "name": "out"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [inputs[0].concat(inputs[1])]
        },
        settings: {
        }
    },

    "grabKey": {
        inputs: [
            {
                "name": "input"
            }
        ],
        outputs: [
            {
                "name": "out"
            }
        ],
        connections: [],
        eval: async function (inputs, settings) {
            return [inputs[0][settings.key.value]]
        },
        settings: {
            "key": {
                "value": "key",
                "type": SETTING_TYPES.TEXT
            },
        }
    },
    
})