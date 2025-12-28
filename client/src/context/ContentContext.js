import React, { createContext, useContext, useMemo } from 'react';
import contentData from '../content.json';

const ContentContext = createContext({ content: contentData });

export function ContentProvider({ children }) {
	const value = useMemo(() => ({ content: contentData }), []);
	return (
		<ContentContext.Provider value={value}>
			{children}
		</ContentContext.Provider>
	);
}

export function useContent() {
	return useContext(ContentContext).content || contentData;
}


