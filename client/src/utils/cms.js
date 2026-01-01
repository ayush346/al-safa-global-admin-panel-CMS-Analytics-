export function toText(value) {
	// Normalize common CMS wrapper { text: "..." }
	if (value && typeof value === 'object' && 'text' in value) {
		return value.text ?? '';
	}
	// Guard: if this is a React element-like object, don't render it as text
	if (value && typeof value === 'object' && (value.$$typeof || (value.props && value._owner))) {
		return '';
	}
	return value ?? '';
}


