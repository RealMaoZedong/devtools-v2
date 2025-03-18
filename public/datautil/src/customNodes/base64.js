import registerNodes from "../nodes/useableNodes.js"

registerNodes("Base64", {
    "Base64 Encode": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "encoded"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [btoa(inputs[0])]
        },
        settings: {}
    },
    "Base64 Decode": {
        inputs: [
            {
                "name": "in"
            }
        ],
        outputs: [
            {
                "name": "decoded"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [atob(inputs[0])]
        },
        settings: {}
    },
})