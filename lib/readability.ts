export function analyzeReadability(text: string) {
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const words = text.trim().split(/\s+/).length;
    const syllables = countSyllables(text);

    const fleschKincaidGrade = parseFloat(
        ((0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59).toFixed(2)
    );

    return {
        grade: fleschKincaidGrade,
        sentences,
        words,
        syllables,
    };
}

function countSyllables(text: string): number {
    return text
        .toLowerCase()
        .split(/\s+/)
        .map(word => word
            .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
            .replace(/^y/, '')
            .match(/[aeiouy]{1,2}/g)?.length || 1)
        .reduce((acc, syllables) => acc + syllables, 0);
}
