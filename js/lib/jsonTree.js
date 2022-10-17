var jsonTree = function(json) {
	function isJSON(val) {
		if (typeof val !== "object" || !val) {
			return false
		}
		try {
			val = JSON.stringify(val);
			val = JSON.parse(val);
			return true
		} catch (e) {
			return false
		}
	}

	function create(index, key, val) {
		var html = `${key?`<a class="layer-${index}-label">${key}</a>`:""}<ul class="layer-${index}-container">`;
		for (let i in val) {
			html += `<li class="layer-${index}-item">${isJSON(val[i])?create(index+1,i,val[i]):val[i]}</li>`
		}
		return html + "</ul>"
	}
	return create(0, "", json)
}
