async function loadNodes() {
    document.getElementById("error-box").style.display = "none";
    document.getElementById("error-box").style.color = "#ff7f7f";
}

import "../customNodes/base64.js";
import "../customNodes/shalib.js";
import "../customNodes/utils.js";

export default loadNodes;