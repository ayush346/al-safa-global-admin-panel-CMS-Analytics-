const mongoose = require('mongoose');

const CmsVersionSchema = new mongoose.Schema({
	pagePath: { type: String, required: true, index: true },
	label: { type: String, required: true },
	author: { type: String },
	data: {
		htmlMain: { type: String },
		htmlFooter: { type: String },
		overrides: { type: Object }, // structured content overrides merged onto base content.json
		// Future: structured blocks can be added here
	},
	published: { type: Boolean, default: false, index: true },
	publishedAt: { type: Date },
	publishedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CmsVersion', CmsVersionSchema);


