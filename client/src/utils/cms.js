export function toText(value) {
	if (value && typeof value === 'object' && 'text' in value) {
		return value.text ?? '';
	}
	return value ?? '';
}


