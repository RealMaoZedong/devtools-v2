
window.SETTING_TYPES = {
    CHECKBOX: 'checkbox',
    NUMBER: 'number',
    TEXT: 'text'
};

window.allUseableNodes = { 
}  
    
window.NODE_CATEGORIES = {
    
};

function registerNode(category, name, nodeData) {
    allUseableNodes[name] = nodeData;
    if(NODE_CATEGORIES[category] === undefined) {
        NODE_CATEGORIES[category] = []
    }

    NODE_CATEGORIES[category].push(name)
}

function registerNodes(category, nodes) {
    for (const key in nodes) {
        if (Object.prototype.hasOwnProperty.call(nodes, key)) {
            const element = nodes[key];
            registerNode(category, key, element)
        }
    }
}

registerNodes("Internal", {
    "Input": {
        inputs: [],
        outputs: [
            {
                "name": "value"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            console.log(settings)
            const inputElement = document.getElementById('input');
            if (settings.eval.value) {
                try {
                    document.getElementById("error-box").style.display = "none"
                    return [eval(inputElement.value)];
                } catch(err) {
                    console.log(err)
                    document.getElementById("error-box").style.display = "block"
                    document.getElementById("error-box").innerText = `Eval Error: ${err}`
                    return [undefined]
                }
            } else {
                return [inputElement.value];
            }
        },
        settings: {
            "eval": {
                "value": true,
                "type": SETTING_TYPES.CHECKBOX
            }
        }
    },
    "Output": {
        inputs: [
            {
                "name": "value"
            }
        ],
        outputs: [],
        connections: [],
        eval: async function(inputs, settings) {
            const outputElement = document.getElementById('output');
            if (inputs.length === 0) {
                outputElement.value = `Output not connected`;
                return [];
            }

            const formatValue = (v) => {
                if (Array.isArray(v)) {
                    return `[${v.map((e) => formatValue(e)).join(",")}]`
                }

                if (typeof v === "string") {
                    return `"${v.replace(/\"/g, "\\\"")}"`
                }

                if (typeof v === "number") {
                    return `${v}`
                } 
                
                if (typeof v === "undefined") {
                    return `undefined`
                }

                if (typeof v === "boolean") {
                    return `${v}`
                }

                return `UNKNOWN TYPE(${typeof v} | ${v})`
            }

            outputElement.value = `${formatValue(inputs[0])}`;
            return [];
        },
        settings: []
    },

    "NumValue": {
        inputs: [],
        outputs: [
            {
                "name": "value"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [settings.value.value];
        },
        settings: {
            "value": {
                "value": 3.14,
                "type": SETTING_TYPES.NUMBER
            },
        }
    },
    "StringValue": {
        inputs: [],
        outputs: [
            {
                "name": "value"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [settings.value.value];
        },
        settings: {
            "value": {
                "value": "Hello, world!",
                "type": SETTING_TYPES.TEXT
            },
        }
    },
    "BoolValue": {
        inputs: [],
        outputs: [
            {
                "name": "value"
            }
        ],
        connections: [],
        eval: async function(inputs, settings) {
            return [settings.value.value];
        },
        settings: {
            "value": {
                "value": false,
                "type": SETTING_TYPES.CHECKBOX
            },
        }
    },
})

export default registerNodes;